"""Application settings loaded from backend/.env via pydantic-settings."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


_BACKEND_DIR = Path(__file__).resolve().parents[2]
_ENV_FILE = _BACKEND_DIR / ".env"


class Settings(BaseSettings):
    """Runtime configuration for the Consolidated MAF Agent service."""

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Application
    server_name: str = Field(default="Consolidated MAF Agent", alias="SERVER_NAME")
    server_version: str = Field(default="0.1.0", alias="SERVER_VERSION")
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=9098, alias="PORT")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # CORS
    cors_allow_origins: str = Field(default="*", alias="CORS_ALLOW_ORIGINS")

    # HTTPS
    https_enabled: bool = Field(default=False, alias="HTTPS_ENABLED")
    ssl_certfile: str = Field(default="", alias="SSL_CERTFILE")
    ssl_keyfile: str = Field(default="", alias="SSL_KEYFILE")

    # Rate limiting
    rate_limit_enabled: bool = Field(default=False, alias="RATE_LIMIT_ENABLED")
    rate_limit_default: str = Field(default="60/minute", alias="RATE_LIMIT_DEFAULT")

    # Azure / Foundry
    azure_ai_project_endpoint: str = Field(default="", alias="AZURE_AI_PROJECT_ENDPOINT")
    azure_openai_responses_deployment_name: str = Field(
        default="gpt-4o", alias="AZURE_OPENAI_RESPONSES_DEPLOYMENT_NAME"
    )

    # Hosted travel agent (used as a tool)
    travel_agent_name: str = Field(default="travel-support-agent", alias="TRAVEL_AGENT_NAME")
    travel_agent_version: str = Field(default="2", alias="TRAVEL_AGENT_VERSION")

    # MCP servers
    ms_learn_mcp_url: str = Field(
        default="https://learn.microsoft.com/api/mcp", alias="MS_LEARN_MCP_URL"
    )
    magic_v22_mcp_url: str = Field(default="http://localhost:9898/mcp", alias="MAGIC_V22_MCP_URL")
    api_key: str = Field(default="", alias="API_KEY")

    # Paths (relative resolved against backend/ at runtime)
    logs_dir: str = Field(default="../logs", alias="LOGS_DIR")
    blacklist_path: str = Field(default="../db/blacklist.txt", alias="BLACKLIST_PATH")

    # Databases
    chat_history_database_url: str = Field(
        default="sqlite:///../db/chat_history.db", alias="CHAT_HISTORY_DATABASE_URL"
    )
    database_url: str = Field(default="sqlite:///../db/tickets.db", alias="DATABASE_URL")

    @field_validator("port")
    @classmethod
    def _port_in_range(cls, v: int) -> int:
        if not (1 <= v <= 65535):
            raise ValueError(f"PORT must be between 1 and 65535 (got {v})")
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        raw = (self.cors_allow_origins or "").strip()
        if not raw or raw == "*":
            return ["*"]
        return [o.strip() for o in raw.split(",") if o.strip()]

    @property
    def scheme(self) -> str:
        return "https" if self.https_enabled and self.ssl_certfile and self.ssl_keyfile else "http"

    @property
    def backend_dir(self) -> Path:
        return _BACKEND_DIR

    def resolve_path(self, value: str) -> Path:
        p = Path(value)
        if not p.is_absolute():
            p = (self.backend_dir / p).resolve()
        return p


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
