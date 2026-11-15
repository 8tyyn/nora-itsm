## NORA Python Services (Flask + Postgres)

### What you get
- Approval-based account auth (register/login) with JWT
- NORA PostgreSQL schema with users, admins, incidents, conversations, messages, knowledge documents, and audit logs
- `/api/chat` now persists messages and returns a `conversation_id`
- Simple RAG pipeline: upload docs, chunk them, create embeddings, store in ChromaDB, retrieve relevant chunks, and inject them into chat prompts
- Administrator-managed assignment rules stored in the `assignment_rules` table and injected into chat prompts

### Environment
- Create a PostgreSQL database named `NORA`, then copy `.env.example` to `.env` and fill values (`OLLAMA_MODEL`, `JWT_SECRET`, DB settings).
- The default provider is local Ollama. Chat messages and RAG context are sent to the Ollama process configured by `OLLAMA_BASE_URL`; no Groq or OpenAI API is required.
- Set `AI_PROVIDER=groq` only if you intentionally want to use the legacy cloud integration and configure its credentials.
- Chat requests are bounded before they are sent to the model. The system instructions are preserved; older conversation history and excess RAG context are omitted first. `CHAT_CONTEXT_CHAR_LIMIT` defaults to `24000` and is capped at `30000`; `CHAT_HISTORY_MESSAGE_CHAR_LIMIT` defaults to `4000`. `CHAT_MAX_OUTPUT_TOKENS` defaults to `500` and is capped at `800`. Lower these values in `.env` if your selected model has a smaller context window.
- Restart the Flask service after changing `.env` values.

### Local Ollama setup
Install Ollama from [ollama.com](https://ollama.com), then download the model:

```powershell
ollama pull llama3.1:8b
ollama serve
```

Keep Ollama and Flask on the same private machine or private server. A local model
reduces data exposure, but it does not automatically protect data from local
admins, compromised hosts, backups, logs, or an accidentally public Ollama port.

### DB setup
To create the `pgcrypto` extension and all missing NORA tables:

```powershell
cd "./Python Services"
python init_db.py
```

The Flask app also verifies the extension and creates missing tables on startup.

To create or reset an administrator account, set `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
and optionally `ADMIN_NAME` in `.env`, then run:

```powershell
python create_admin.py
```

New registrations are stored in `pending_accounts` and cannot log in until an administrator
approves them from the admin page. A registration with account type `User` is moved to `users`;
an `Employee` registration is moved to `clients`. Rejected registrations are removed without
granting access.

Assignment rules are available to administrators at `/admin/assignment-rules`. The initial
rules for PUR disabled accounts, Arbza damaged items, and printer redirection are seeded
automatically on first startup. Administrators can add, edit, deactivate, or delete rules;
only active rules are supplied to NORA.

### Run
```powershell
cd "./Python Services"
python app.py
```

### RAG upload
Upload a document after login using `POST /api/rag/upload` with multipart form-data:
- `file`: `.txt`, `.md`, or `.pdf`
- `source` (optional): label shown in retrieval context

The vector store is persisted under `Python Services/rag_data/chroma` and uploaded files are copied to `Python Services/rag_data/documents`.

### RAG status
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Method Get -Uri http://localhost:5000/api/rag/status -Headers $headers
```

### API quick test
1) Register
```powershell
$body = @{ email = "test@example.com"; password = "pass1234"; name = "Test" } | ConvertTo-Json
$r = Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/auth/register -ContentType application/json -Body $body
$token = $r.token
```

2) Send chat (creates a conversation)
```powershell
$headers = @{ Authorization = "Bearer $token" }
$body = @{ message = "Bonjour Astra" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/chat -Headers $headers -ContentType application/json -Body $body
```

4) Upload a document for RAG
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/rag/upload -Headers $headers -Form @{ file = Get-Item .\sample.txt; source = "sample notes" }
```

3) List conversations + fetch messages
```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:5000/api/conversations -Headers $headers
# Then:
# Invoke-RestMethod -Method Get -Uri http://localhost:5000/api/conversations/<conversation_id>/messages -Headers $headers
```
