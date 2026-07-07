"""
RMS Backend - Authentication Pydantic Schemas

Request/response schemas for all authentication endpoints including
login, logout, token refresh, password management, and user registration.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Enums ─────────────────────────────────────────────────────
class UserRole(str, Enum):
    """System roles for RBAC."""
    ADMIN = "admin"
    EMPLOYEE = "employee"
    APPROVER = "approver"
    FINANCE = "finance"


class AccountStatus(str, Enum):
    """User account status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    LOCKED = "locked"
    SUSPENDED = "suspended"


class AuthEventType(str, Enum):
    """Authentication audit event types."""
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    LOGOUT = "logout"
    TOKEN_REFRESH = "token_refresh"
    TOKEN_REVOKED = "token_revoked"
    PASSWORD_CHANGED = "password_changed"
    PASSWORD_RESET_REQUESTED = "password_reset_requested"
    PASSWORD_RESET_COMPLETED = "password_reset_completed"
    ACCOUNT_LOCKED = "account_locked"
    ACCOUNT_UNLOCKED = "account_unlocked"
    SESSION_EXPIRED = "session_expired"


# ── Request Schemas ───────────────────────────────────────────
class LoginRequest(BaseModel):
    """Login request with email and password."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, max_length=128, description="User password")

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Password cannot be empty")
        return v


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str = Field(..., description="Valid refresh token")


class ChangePasswordRequest(BaseModel):
    """Change password request for authenticated users."""
    current_password: str = Field(..., min_length=1, description="Current password")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password")
    confirm_password: str = Field(..., min_length=8, max_length=128, description="Confirm new password")

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info: Any) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v


class PasswordResetRequest(BaseModel):
    """Request a password reset token."""
    email: EmailStr = Field(..., description="Email address for password reset")


class PasswordResetConfirm(BaseModel):
    """Confirm password reset with token and new password."""
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password")
    confirm_password: str = Field(..., min_length=8, max_length=128, description="Confirm new password")

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info: Any) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v


class LogoutRequest(BaseModel):
    """Logout request to blacklist the current token."""
    refresh_token: str | None = Field(None, description="Optional refresh token to revoke")


# ── Response Schemas ──────────────────────────────────────────
class TokenResponse(BaseModel):
    """JWT token pair response."""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Access token expiry in seconds")
    expires_at: datetime = Field(..., description="Access token expiry timestamp")


class UserInfoResponse(BaseModel):
    """Authenticated user information."""
    id: uuid.UUID

    employee_id: str | None = None

    email: str

    full_name: str
    roles: list[str] = []
    permissions: list[str] = []
    department_id: uuid.UUID | None = None
    is_active: bool = True
    last_login_at: datetime | None = None

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    """Successful login response with tokens and user info."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    expires_at: datetime
    user: UserInfoResponse


class RefreshTokenResponse(BaseModel):
    """Refresh token response with new token pair."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    expires_at: datetime


class LogoutResponse(BaseModel):
    """Logout confirmation response."""
    message: str = "Successfully logged out"
    revoked_at: datetime


class TokenVerifyResponse(BaseModel):
    """Token verification response."""
    valid: bool
    user_id: str | None = None
    roles: list[str] = []
    permissions: list[str] = []
    expires_at: datetime | None = None


class PasswordResetRequestResponse(BaseModel):
    """Password reset request confirmation."""
    message: str = "Password reset instructions sent"
    email: str


class PasswordResetConfirmResponse(BaseModel):
    """Password reset confirmation."""
    message: str = "Password has been reset successfully"


class ChangePasswordResponse(BaseModel):
    """Password change confirmation."""
    message: str = "Password changed successfully"


class SessionInfo(BaseModel):
    """Active session information."""
    session_id: str
    created_at: datetime
    last_activity: datetime
    ip_address: str | None = None
    user_agent: str | None = None

    model_config = {"from_attributes": True}


class SessionListResponse(BaseModel):
    """List of active sessions for a user."""
    sessions: list[SessionInfo]
    total: int


class AuthEventResponse(BaseModel):
    """Authentication audit event."""
    id: uuid.UUID
    event_type: str
    user_id: uuid.UUID | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    details: dict[str, Any] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class APIResponse(BaseModel):
    success: bool = True
    message: str
    data: Any | None = None
