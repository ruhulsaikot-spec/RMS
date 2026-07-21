"""
RMS Backend - Security Configuration

Centralized security settings for JWT authentication, password policies,
account lockout, session management, and RBAC configuration.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class SecuritySettings(BaseSettings):
    """
    Security-specific configuration for authentication and authorization.

    Separated from the main config to keep security parameters together
    and allow independent overrides via environment variables.
    """

    model_config = SettingsConfigDict(env_prefix="SECURITY_")

    # ── JWT Configuration ──────────────────────────────────────
    jwt_secret_key: str = "change-me-to-a-very-long-random-secret-key-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7
    jwt_issuer: str = "rms-enterprise"
    jwt_audience: str = "rms-users"

    # ── Password Policy ────────────────────────────────────────
    password_min_length: int = 8
    password_max_length: int = 128
    password_require_uppercase: bool = True
    password_require_lowercase: bool = True
    password_require_digit: bool = True
    password_require_special: bool = True
    password_hash_rounds: int = 12  # bcrypt rounds

    # ── Account Lockout ────────────────────────────────────────
    max_login_attempts: int = 5
    lockout_duration_minutes: int = 30
    failed_attempt_window_minutes: int = 15

    # ── Session Management ─────────────────────────────────────
    max_concurrent_sessions: int = 5
    session_idle_timeout_minutes: int = 60

    # ── Token Blacklist (Redis) ────────────────────────────────
    blacklist_key_prefix: str = "rms:token_blacklist:"
    blacklist_access_token_ttl_seconds: int = 1800  # Matches access token expiry
    refresh_token_key_prefix: str = "rms:refresh_tokens:"
    session_key_prefix: str = "rms:sessions:"
    failed_attempts_key_prefix: str = "rms:failed_attempts:"

    # ── Password Reset ─────────────────────────────────────────
    password_reset_token_expire_minutes: int = 15
    password_reset_key_prefix: str = "rms:password_reset:"

    @property
    def access_token_ttl_seconds(self) -> int:
        return self.jwt_access_token_expire_minutes * 60

    @property
    def refresh_token_ttl_seconds(self) -> int:
        return self.jwt_refresh_token_expire_days * 24 * 60 * 60

    @property
    def lockout_ttl_seconds(self) -> int:
        return self.lockout_duration_minutes * 60

    @property
    def failed_attempt_window_seconds(self) -> int:
        return self.failed_attempt_window_minutes * 60


# Singleton instance
security_settings = SecuritySettings()
