from dotenv import load_dotenv

load_dotenv()

from db import ensure_database_schema  # noqa: E402


def main() -> None:
    ensure_database_schema()
    print("DB ready (extensions ensured, tables created if missing).")


if __name__ == "__main__":
    main()
