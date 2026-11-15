from __future__ import annotations

import hashlib
import io
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from pypdf import PdfReader


BASE_DIR = Path(__file__).resolve().parent
RAG_DATA_DIR = BASE_DIR / "rag_data"
RAG_DOCUMENTS_DIR = RAG_DATA_DIR / "documents"
RAG_CHROMA_DIR = RAG_DATA_DIR / "chroma"

COLLECTION_NAME = os.getenv("RAG_COLLECTION_NAME", "nora_rag_docs")
EMBEDDING_MODEL = os.getenv("RAG_EMBEDDING_MODEL", "all-MiniLM-L6-v2")
CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "900"))
CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "150"))


@dataclass
class RetrievedChunk:
    text: str
    source: str
    chunk_index: int
    score: float | None = None
    metadata: dict[str, Any] | None = None


def _ensure_dirs() -> None:
    RAG_DATA_DIR.mkdir(parents=True, exist_ok=True)
    RAG_DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    RAG_CHROMA_DIR.mkdir(parents=True, exist_ok=True)


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    cleaned = re.sub(r"\r\n", "\n", text).strip()
    if not cleaned:
        return []

    paragraphs = [part.strip() for part in re.split(r"\n{2,}", cleaned) if part.strip()]
    chunks: list[str] = []
    current = ""

    def push_chunk(value: str) -> None:
        value = value.strip()
        if value:
            chunks.append(value)

    for paragraph in paragraphs:
        if len(paragraph) > chunk_size:
            if current:
                push_chunk(current)
                current = ""

            start = 0
            while start < len(paragraph):
                end = start + chunk_size
                push_chunk(paragraph[start:end])
                start = max(end - overlap, start + 1)
            continue

        candidate = f"{current}\n\n{paragraph}".strip() if current else paragraph
        if len(candidate) <= chunk_size:
            current = candidate
        else:
            push_chunk(current)
            current = paragraph

    if current:
        push_chunk(current)

    return chunks


def _read_text_from_bytes(filename: str, data: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix in {".txt", ".md", ".csv", ".json", ".log"}:
        return data.decode("utf-8", errors="ignore")

    if suffix == ".pdf":
        reader = PdfReader(io.BytesIO(data))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n\n".join(pages)

    raise ValueError(f"Unsupported file type: {suffix}")


class RAGService:
    def __init__(self) -> None:
        _ensure_dirs()
        self._client = chromadb.PersistentClient(path=str(RAG_CHROMA_DIR))
        self._embedding_function = SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL)
        self._collection = self._client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=self._embedding_function,
            metadata={"hnsw:space": "cosine"},
        )

    def ingest_document(
        self,
        *,
        filename: str,
        content: bytes,
        owner_user_id: str | None = None,
        source_label: str | None = None,
    ) -> dict[str, Any]:
        text = _read_text_from_bytes(filename, content)
        chunks = chunk_text(text)
        if not chunks:
            raise ValueError("Document is empty after extraction")

        safe_source = source_label or filename
        digest = hashlib.sha1(content).hexdigest()[:12]
        saved_name = f"{digest}_{Path(filename).name}"
        (RAG_DOCUMENTS_DIR / saved_name).write_bytes(content)

        ids: list[str] = []
        metadatas: list[dict[str, Any]] = []
        documents: list[str] = []

        for index, chunk in enumerate(chunks):
            owner_key = owner_user_id or "global"
            ids.append(f"{owner_key}:{digest}:{index}")
            documents.append(chunk)
            metadatas.append(
                {
                    "source": safe_source,
                    "stored_file": saved_name,
                    "chunk_index": index,
                    "owner_user_id": owner_user_id or "global",
                }
            )

        self._collection.upsert(ids=ids, documents=documents, metadatas=metadatas)

        return {
            "document": saved_name,
            "chunks": len(chunks),
            "source": safe_source,
        }

    def retrieve(self, query: str, *, top_k: int = 4, owner_user_id: str | None = None) -> list[RetrievedChunk]:
        where: dict[str, Any] | None = None
        if owner_user_id:
            where = {"owner_user_id": owner_user_id}

        result = self._collection.query(
            query_texts=[query],
            n_results=top_k,
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        docs = result.get("documents", [[]])[0] or []
        metas = result.get("metadatas", [[]])[0] or []
        distances = result.get("distances", [[]])[0] or []

        retrieved: list[RetrievedChunk] = []
        for index, text in enumerate(docs):
            meta = metas[index] if index < len(metas) else {}
            retrieved.append(
                RetrievedChunk(
                    text=text,
                    source=str(meta.get("source", "unknown")),
                    chunk_index=int(meta.get("chunk_index", index)),
                    score=float(distances[index]) if index < len(distances) else None,
                    metadata=meta,
                )
            )
        return retrieved

    def document_count(self, *, owner_user_id: str | None = None) -> int:
        if owner_user_id:
            result = self._collection.get(
                where={"owner_user_id": owner_user_id},
                include=["metadatas"],
            )
            return len(result.get("ids", []))
        count = self._collection.count()
        return int(count)


def build_rag_context(chunks: list[RetrievedChunk]) -> str:
    if not chunks:
        return ""

    formatted = []
    for chunk in chunks:
        formatted.append(
            f"[Source: {chunk.source} | Chunk #{chunk.chunk_index + 1}]\n{chunk.text.strip()}"
        )

    return (
        "\n\nCONTEXTE DOCUMENTAIRE (RAG) :\n"
        "Utilise ces extraits de documents comme source principale pour répondre.\n"
        "Si l'information n'est pas présente dans ces extraits, dis-le clairement.\n\n"
        + "\n\n---\n\n".join(formatted)
    )
