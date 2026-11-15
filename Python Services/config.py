import os


def _get_env(name: str, default: str | None = None) -> str:
    value = os.getenv(name)
    if value is None or value.strip() == "":
        if default is None:
            raise RuntimeError(f"Missing required environment variable: {name}")
        return default
    return value


def get_database_url() -> str:
    url = os.getenv("DATABASE_URL")
    if url and url.strip():
        return url

    host = _get_env("DB_HOST", "localhost")
    port = _get_env("DB_PORT", "5432")
    name = _get_env("DB_NAME", "NORA")
    user = _get_env("DB_USER", "postgres")
    password = _get_env("DB_PASSWORD", "")

    # SQLAlchemy URL
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{name}"


def get_jwt_secret() -> str:
    return _get_env("JWT_SECRET")


def get_jwt_exp_minutes() -> int:
    raw = os.getenv("JWT_EXP_MINUTES", "43200")  # 30 days
    try:
        return int(raw)
    except ValueError:
        return 43200


def get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "*").strip()
    if raw == "*":
        return ["*"]
    return [part.strip() for part in raw.split(",") if part.strip()]
