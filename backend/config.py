from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


# Always use the .env file located inside the backend folder
ENV_FILE = Path(__file__).resolve().parent / ".env"


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str | None = None

    cors_origins: str = "https://campus-plus-zeta.vercel.app,http://localhost:5173,http://127.0.0.1:5173"
    attendance_required: float = 75.0
    rate_limit_per_minute: int = 60

    ai_provider: str = "poe"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    poe_api_key: str | None = None
    poe_model: str = "assistant"
    poe_timeout_seconds: float = Field(default=30.0, ge=1.0, le=120.0)

    vapid_public_key: str | None = None
    vapid_private_key: str | None = None
    vapid_subject: str = "mailto:admin@nexcampus.app"
    resend_api_key: str | None = None
    email_from: str | None = None
    email_app_url: str | None = None
    email_poll_interval_seconds: float = 3.0

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def allowed_origins(self) -> list[str]:
        origins = []
        for value in self.cors_origins.split(","):
            origin = value.strip().rstrip("/")
            if not origin:
                continue
            if "://" not in origin:
                scheme = "http" if origin.startswith(("localhost", "127.0.0.1")) else "https"
                origin = f"{scheme}://{origin}"
            origins.append(origin)
        return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
