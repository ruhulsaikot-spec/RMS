"""
RMS Backend - Application Configuration

Enterprise-grade configuration management using Pydantic Settings v2.
Supports environment variables, .env files, and nested configuration groups.
All settings are validated at application startup with type safety.
"""

from __future__ import annotations

import secrets
from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import (
    field_validator,
    model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict


# ── Environment Enum ─────────────────────────────────────────
class AppEnvironment(str, Enum):
    """Application environment types."""

    DEVELOPMENT = "development"
    STAGING = "staging"
    TESTING = "testing"
    PRODUCTION = "production"


# ── Database Settings ────────────────────────────────────────
class DatabaseSettings(BaseSettings):
    """PostgreSQL database configuration with connection pooling."""

    model_config = SettingsConfigDict(env_prefix="POSTGRES_")

    host: str = "localhost"
    port: int = 5432
    user: str = "rms_admin"
    password: str = "change_me_in_production"
    db: str = "rms_database"
    schema: str = "public"
    pool_size: int = 20
    max_overflow: int = 10
    pool_recycle: int = 3600
    pool_pre_ping: bool = True
    echo: bool = False
    connect_timeout: int = 30

    @property
    def dsn(self) -> str:
        """Full PostgreSQL DSN for asyncpg driver."""
        return (
            f"postgresql+asyncpg://{self.user}:{self.password}"
            f"@{self.host}:{self.port}/{self.db}"
        )

    @property
    def dsn_sync(self) -> str:
        """Synchronous DSN for Alembic migrations (psycopg2)."""
        return (
            f"postgresql+psycopg2://{self.user}:{self.password}"
            f"@{self.host}:{self.port}/{self.db}"
        )

    @property
    def dsn_async_no_driver(self) -> str:
        """Raw PostgreSQL URI without driver specification."""
        return (
            f"postgresql://{self.user}:{self.password}"
            f"@{self.host}:{self.port}/{self.db}"
        )


# ── Redis Settings ───────────────────────────────────────────
class RedisSettings(BaseSettings):
    """Redis configuration for caching, sessions, and rate limiting."""

    model_config = SettingsConfigDict(env_prefix="REDIS_")

    host: str = "localhost"
    port: int = 6379
    password: str = ""
    db: int = 0
    decode_responses: bool = True
    max_connections: int = 50
    socket_timeout: int = 5
    socket_connect_timeout: int = 5

    @property
    def dsn(self) -> str:
        """Redis connection URL."""
        if self.password:
            return f"redis://:{self.password}@{self.host}:{self.port}/{self.db}"
        return f"redis://{self.host}:{self.port}/{self.db}"


# ── JWT Settings ─────────────────────────────────────────────
class JWTSettings(BaseSettings):
    """JWT authentication configuration."""

    model_config = SettingsConfigDict(env_prefix="JWT_")

    secret_key: str = "change-me-to-a-very-long-random-secret-key-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    issuer: str = "rms-enterprise"
    audience: str = "rms-users"


# ── CORS Settings ────────────────────────────────────────────
class CORSSettings(BaseSettings):
    """Cross-Origin Resource Sharing configuration."""

    model_config = SettingsConfigDict(env_prefix="CORS_")

    allowed_origins: str = "http://localhost:3000,http://localhost:8000"
    allow_credentials: bool = True
    allowed_methods: str = "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    allowed_headers: str = "*"

    @property
    def origins_list(self) -> list[str]:
        """Parse comma-separated origins into a list."""
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def methods_list(self) -> list[str]:
        """Parse comma-separated methods into a list."""
        return [method.strip() for method in self.allowed_methods.split(",") if method.strip()]

    @property
    def headers_list(self) -> list[str]:
        """Parse comma-separated headers into a list."""
        if self.allowed_headers.strip() == "*":
            return ["*"]
        return [header.strip() for header in self.allowed_headers.split(",") if header.strip()]


# ── Logging Settings ─────────────────────────────────────────
class LoggingSettings(BaseSettings):
    """Application logging configuration with structured output."""

    model_config = SettingsConfigDict(env_prefix="LOG_")

    level: str = "DEBUG"
    format: Literal["json", "console"] = "json"
    file_enabled: bool = False
    file_path: str = "logs/rms-backend.log"
    file_max_size_mb: int = 50
    file_backup_count: int = 10


# ── Rate Limit Settings ──────────────────────────────────────
class RateLimitSettings(BaseSettings):
    """API rate limiting configuration."""

    model_config = SettingsConfigDict(env_prefix="RATE_LIMIT_")

    enabled: bool = True
    per_minute: int = 60
    per_hour: int = 1000


# ── Upload Settings ──────────────────────────────────────────
class UploadSettings(BaseSettings):
    """File upload configuration."""

    model_config = SettingsConfigDict(env_prefix="UPLOAD_")

    max_size_mb: int = 10
    allowed_extensions: str = ".pdf,.jpg,.jpeg,.png,.xlsx,.docx"
    storage_path: str = "uploads"

    @property
    def extensions_list(self) -> list[str]:
        """Parse comma-separated extensions into a list."""
        return [ext.strip() for ext in self.allowed_extensions.split(",") if ext.strip()]

    @property
    def max_size_bytes(self) -> int:
        """Convert max size from MB to bytes."""
        return self.max_size_mb * 1024 * 1024


# ── SMTP Settings ────────────────────────────────────────────
class SMTPSettings(BaseSettings):
    """Email/SMTP configuration for notifications."""

    model_config = SettingsConfigDict(env_prefix="SMTP_")

    host: str = ""
    port: int = 587
    user: str = ""
    password: str = ""
    from_email: str = "noreply@rms-enterprise.com"
    from_name: str = "RMS System"

    @property
    def is_configured(self) -> bool:
        """Check if SMTP is properly configured."""
        return bool(self.host and self.user and self.password)


# ── Main Application Settings ────────────────────────────────
class Settings(BaseSettings):
    """
    Root application settings aggregating all configuration groups.

    Reads from environment variables and .env file.
    Validates all settings on instantiation for fail-fast behavior.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_nested_delimiter="__",
        case_sensitive=False,
        extra="ignore",
    )

    # Application core
    app_name: str = "RMS Backend"
    app_env: AppEnvironment = AppEnvironment.DEVELOPMENT
    app_debug: bool = True
    app_version: str = "1.0.0"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    app_api_prefix: str = "/api"
    app_docs_url: str = "/docs"
    app_redoc_url: str = "/redoc"

    # Nested configuration groups
    db: DatabaseSettings = DatabaseSettings()
    redis: RedisSettings = RedisSettings()
    jwt: JWTSettings = JWTSettings()
    cors: CORSSettings = CORSSettings()
    logging: LoggingSettings = LoggingSettings()
    rate_limit: RateLimitSettings = RateLimitSettings()
    upload: UploadSettings = UploadSettings()
    smtp: SMTPSettings = SMTPSettings()

    # Project paths
    base_dir: Path = Path(__file__).resolve().parent.parent.parent

    @model_validator(mode="after")
    def validate_production_settings(self) -> Settings:
        """Enforce security requirements in production environment."""
        if self.app_env == AppEnvironment.PRODUCTION:
            if self.app_debug:
                raise ValueError("APP_DEBUG must be False in production")
            if "change" in self.jwt.secret_key.lower():
                raise ValueError("JWT_SECRET_KEY must be changed in production")
            if "change" in self.db.password.lower():
                raise ValueError("POSTGRES_PASSWORD must be changed in production")
        return self

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.app_env == AppEnvironment.DEVELOPMENT

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.app_env == AppEnvironment.PRODUCTION

    @property
    def is_testing(self) -> bool:
        """Check if running in test environment."""
        return self.app_env == AppEnvironment.TESTING


# ── Cached Settings Instance ─────────────────────────────────
@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Return cached application settings instance.

    Uses lru_cache to ensure settings are loaded only once per process.
    Call get_settings.cache_clear() to force reload (e.g., in tests).
    """
    return Settings()


# Module-level convenience accessor
settings = get_settings()
