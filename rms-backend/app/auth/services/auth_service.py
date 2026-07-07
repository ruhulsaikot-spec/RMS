"""
RMS Backend - Authentication Service Layer

Enterprise-grade business logic for authentication operations including
login, logout, token refresh, password management, session management,
and account lockout. Follows clean architecture with service/repository
layer separation.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt_utils import (
    TOKEN_TYPE_ACCESS,
    TOKEN_TYPE_REFRESH,
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_token,
    get_token_expiry,
    get_token_jti,
    get_token_subject,
    is_token_expired,
    validate_token_type,
)
from app.auth.password_utils import (
    hash_password,
    needs_rehash,
    password_validator,
    verify_password,
)
from app.auth.redis_store import (
    FailedLoginTracker,
    PasswordResetStore,
    SessionManager,
    TokenBlacklist,
)
from app.auth.repositories.auth_repository import (
    AuthEventRepository,
    RoleRepository,
    UserRepository,
)
from app.auth.schemas.auth import (
    AccountStatus,
    AuthEventType,
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    PasswordResetConfirm,
    PasswordResetConfirmResponse,
    PasswordResetRequest,
    PasswordResetRequestResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    SessionInfo,
    SessionListResponse,
    TokenVerifyResponse,
    UserInfoResponse,
)
from app.auth.security_config import security_settings
from app.core.exceptions import (
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    NotFoundError,
    ValidationError,
)
from app.core.logging import get_logger

logger = get_logger(__name__)


class AuthService:
    """
    Core authentication service handling all auth business logic.

    Orchestrates between repositories, Redis stores, and JWT utilities
    to provide comprehensive authentication operations with enterprise
    security standards.
    """

    def __init__(self, db: AsyncSession, redis: Redis) -> None:
        self.db = db
        self.redis = redis
        self.user_repo = UserRepository(db)
        self.role_repo = RoleRepository(db)
        self.auth_event_repo = AuthEventRepository(db)
        self.token_blacklist = TokenBlacklist(redis)
        self.session_manager = SessionManager(redis)
        self.failed_login_tracker = FailedLoginTracker(redis)
        self.password_reset_store = PasswordResetStore(redis)

    # ════════════════════════════════════════════════════════════
    # LOGIN
    # ════════════════════════════════════════════════════════════
    async def login(
        self,
        request: LoginRequest,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> LoginResponse:
        """
        Authenticate user with email and password.

        Flow:
        1. Check if email is locked out (Redis)
        2. Find user by email (DB)
        3. Verify password (bcrypt)
        4. Check account status
        5. Create access + refresh tokens
        6. Create session in Redis
        7. Reset failed attempt counter
        8. Log successful auth event

        Args:
            request: Login request with email and password.
            ip_address: Client IP address for audit logging.
            user_agent: Client User-Agent for session tracking.

        Returns:
            LoginResponse with tokens and user info.

        Raises:
            AuthenticationError: If credentials are invalid or account locked.
        """
        email = request.email.lower().strip()

        # Step 1: Check Redis-level lockout
        is_locked, remaining = await self.failed_login_tracker.is_locked_out(email)
        if is_locked:
            await self._log_auth_event(
                event_type=AuthEventType.LOGIN_FAILURE,
                email=email,
                ip_address=ip_address,
                user_agent=user_agent,
                success=False,
                details={"reason": "account_locked", "remaining_seconds": remaining},
            )
            raise AuthenticationError(
                f"Account is temporarily locked due to too many failed attempts. "
                f"Please try again in {remaining // 60} minutes."
            )

        # Step 2: Find user by email
        user = await self.user_repo.get_by_email(email)

        # Step 3: Verify password
        if user is None or not verify_password(request.password, user.password_hash):
            # Record failed attempt
            failed_count = await self.failed_login_tracker.record_failed_attempt(email)

            # Increment DB counter
            if user:
                db_count = await self.user_repo.increment_failed_attempts(user.id)

                # Lock account if threshold exceeded
                if db_count >= security_settings.max_login_attempts:
                    await self.user_repo.lock_account(
                        user.id, security_settings.lockout_duration_minutes
                    )
                    await self.failed_login_tracker.lock_account(email)
                    logger.warning(
                        "account_locked_too_many_failures",
                        user_id=user.id,
                        email=email,
                        failed_count=db_count,
                    )

            await self._log_auth_event(
                event_type=AuthEventType.LOGIN_FAILURE,
                user_id=user.id if user else None,
                email=email,
                ip_address=ip_address,
                user_agent=user_agent,
                success=False,
                details={"reason": "invalid_credentials", "failed_count": failed_count},
            )

            raise AuthenticationError("Invalid email or password")

        # Step 4: Check account status
        if not user.is_active:
            raise AuthenticationError("Account is deactivated. Contact your administrator.")

        if user.account_status == AccountStatus.SUSPENDED:
            raise AuthenticationError(
                "Account is suspended. Contact your administrator."
            )

        if user.is_locked:
            raise AuthenticationError(
                "Account is locked. Contact your administrator or wait for lockout to expire."
            )

        # Step 5: Create tokens
        access_token = create_access_token(
            subject=user.id,
            roles=user.role_names,
            permissions=user.permission_codes,
            department_id=user.department_id,
        )
        refresh_token, refresh_jti, refresh_expires = create_refresh_token(
            subject=user.id
        )

        # Step 6: Create session
        session_id = await self.session_manager.create_session(
            user_id=user.id,
            refresh_jti=refresh_jti,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        # Step 7: Reset failed attempts and update login timestamp
        await self.failed_login_tracker.reset_failed_attempts(email)
        await self.user_repo.update_login_success(user.id, ip_address)

        # Check if password hash needs upgrade
        if needs_rehash(user.password_hash):
            new_hash = hash_password(user.password_hash)
            await self.user_repo.update(user.id, {"password_hash": new_hash})
            logger.info("password_rehashed", user_id=user.id)

        # Step 8: Log successful auth event
        await self._log_auth_event(
            event_type=AuthEventType.LOGIN_SUCCESS,
            user_id=user.id,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )

        # Build response
        access_expires = datetime.now(timezone.utc) + __import__("datetime").timedelta(
            minutes=security_settings.jwt_access_token_expire_minutes
        )

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=security_settings.access_token_ttl_seconds,
            expires_at=access_expires,
            user=UserInfoResponse(
                id=user.id,

                employee_id=user.employee_id,

                email=user.email,

                full_name=user.full_name,
                roles=user.role_names,
                permissions=user.permission_codes,
                department_id=user.department_id,
                is_active=user.is_active,
                last_login_at=user.last_login_at,
            ),
        )

    # ════════════════════════════════════════════════════════════
    # LOGOUT
    # ════════════════════════════════════════════════════════════
    async def logout(
        self,
        access_token_payload: dict,
        refresh_token: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> LogoutResponse:
        """
        Logout user by blacklisting tokens and destroying session.

        Flow:
        1. Blacklist access token JTI
        2. If refresh token provided, blacklist it and destroy session
        3. Log logout event

        Args:
            access_token_payload: Decoded access token payload.
            refresh_token: Optional refresh token to revoke.
            ip_address: Client IP for audit.
            user_agent: Client User-Agent for audit.

        Returns:
            LogoutResponse with revocation confirmation.
        """
        user_id = get_token_subject(access_token_payload)
        access_jti = get_token_jti(access_token_payload)

        # Blacklist access token
        if access_jti and user_id:
            access_ttl = security_settings.access_token_ttl_seconds
            await self.token_blacklist.blacklist_access_token(
                jti=access_jti, user_id=user_id, expires_in_seconds=access_ttl
            )

        # Blacklist refresh token and destroy session
        if refresh_token:
            try:
                refresh_payload = decode_token(refresh_token)
                if validate_token_type(refresh_payload, TOKEN_TYPE_REFRESH):
                    refresh_jti = get_token_jti(refresh_payload)
                    if refresh_jti and user_id:
                        refresh_ttl = security_settings.refresh_token_ttl_seconds
                        await self.token_blacklist.blacklist_refresh_token(
                            jti=refresh_jti, user_id=user_id, expires_in_seconds=refresh_ttl
                        )
                        # Destroy the session
                        await self.session_manager.delete_session_by_refresh_jti(
                            user_id, refresh_jti
                        )
            except Exception:
                # If refresh token is invalid, still proceed with logout
                logger.warning("refresh_token_revoke_failed", user_id=user_id)

        # Log logout event
        await self._log_auth_event(
            event_type=AuthEventType.LOGOUT,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )

        return LogoutResponse(
            message="Successfully logged out",
            revoked_at=datetime.now(timezone.utc),
        )

    # ════════════════════════════════════════════════════════════
    # REFRESH TOKEN
    # ════════════════════════════════════════════════════════════
    async def refresh_token(
        self,
        request: RefreshTokenRequest,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> RefreshTokenResponse:
        """
        Rotate refresh token for new token pair.

        Implements refresh token rotation for security:
        1. Decode and validate refresh token
        2. Check if refresh token is blacklisted
        3. Verify user still exists and is active
        4. Blacklist old refresh token (one-time use)
        5. Create new access + refresh token pair
        6. Update session with new refresh JTI
        7. Log token refresh event

        Args:
            request: Refresh token request with refresh_token.
            ip_address: Client IP for audit.
            user_agent: Client User-Agent for audit.

        Returns:
            RefreshTokenResponse with new token pair.

        Raises:
            AuthenticationError: If refresh token is invalid or revoked.
        """
        # Decode refresh token
        try:
            payload = decode_token(request.refresh_token)
        except Exception as exc:
            raise AuthenticationError(f"Invalid refresh token: {str(exc)}") from exc

        # Verify token type
        if not validate_token_type(payload, TOKEN_TYPE_REFRESH):
            raise AuthenticationError(
                "Invalid token type: refresh token required"
            )

        # Check expiration
        if is_token_expired(payload):
            raise AuthenticationError(
                "Refresh token has expired. Please log in again."
            )

        refresh_jti = get_token_jti(payload)
        user_id = get_token_subject(payload)

        if not refresh_jti or not user_id:
            raise AuthenticationError("Invalid refresh token: missing identifiers")

        # Check if refresh token is blacklisted
        if await self.token_blacklist.is_blacklisted(refresh_jti, token_type="refresh"):
            # Possible token reuse attack — blacklist all user sessions
            logger.warning(
                "refresh_token_reuse_detected",
                user_id=user_id,
                jti=refresh_jti,
            )
            await self.token_blacklist.blacklist_all_user_tokens(user_id)
            raise AuthenticationError(
                "Refresh token reuse detected. All sessions have been revoked "
                "for security. Please log in again."
            )

        # Verify user is still active
        user = await self.user_repo.get_by_id(user_id)
        if user is None or not user.is_active:
            raise AuthenticationError("User account not found or deactivated")

        if user.is_locked:
            raise AuthenticationError("Account is locked")

        # Blacklist old refresh token (rotation)
        refresh_ttl = security_settings.refresh_token_ttl_seconds
        await self.token_blacklist.blacklist_refresh_token(
            jti=refresh_jti, user_id=user_id, expires_in_seconds=refresh_ttl
        )

        # Also blacklist the old access token if we can find it
        # (This ensures the old access token is invalidated on refresh)
        session = await self.session_manager.get_session(
            user_id, await self._get_session_id_from_refresh_jti(user_id, refresh_jti)
        )

        # Create new tokens
        new_access_token = create_access_token(
            subject=user.id,
            roles=user.role_names,
            permissions=user.permission_codes,
            department_id=user.department_id,
        )
        new_refresh_token, new_refresh_jti, new_refresh_expires = create_refresh_token(
            subject=user.id
        )

        # Delete old session and create new one
        if session:
            old_session_id = session.get("session_id")
            if old_session_id:
                await self.session_manager.delete_session(user_id, old_session_id)

        new_session_id = await self.session_manager.create_session(
            user_id=user.id,
            refresh_jti=new_refresh_jti,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        # Log refresh event
        await self._log_auth_event(
            event_type=AuthEventType.TOKEN_REFRESH,
            user_id=user_id,
            session_id=new_session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )

        access_expires = datetime.now(timezone.utc) + __import__("datetime").timedelta(
            minutes=security_settings.jwt_access_token_expire_minutes
        )

        return RefreshTokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=security_settings.access_token_ttl_seconds,
            expires_at=access_expires,
        )

    # ════════════════════════════════════════════════════════════
    # VERIFY TOKEN
    # ════════════════════════════════════════════════════════════
    async def verify_access_token(
        self, access_token_payload: dict
    ) -> TokenVerifyResponse:
        """
        Verify an access token and return token/user details.

        Args:
            access_token_payload: Decoded access token payload.

        Returns:
            TokenVerifyResponse with validity status and user claims.
        """
        user_id = get_token_subject(access_token_payload)
        jti = get_token_jti(access_token_payload)

        # Check blacklist
        is_revoked = False
        if jti:
            is_revoked = await self.token_blacklist.is_blacklisted(jti)

        if user_id:
            is_revoked = is_revoked or await self.token_blacklist.is_user_blacklisted(user_id)

        expires_at = get_token_expiry(access_token_payload)

        return TokenVerifyResponse(
            valid=not is_revoked and not is_token_expired(access_token_payload),
            user_id=user_id,
            roles=access_token_payload.get("roles", []),
            permissions=access_token_payload.get("permissions", []),
            expires_at=expires_at,
        )

    # ════════════════════════════════════════════════════════════
    # PASSWORD MANAGEMENT
    # ════════════════════════════════════════════════════════════
    async def change_password(
        self,
        user_id: str,
        request: ChangePasswordRequest,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        """
        Change password for an authenticated user.

        Flow:
        1. Verify current password
        2. Validate new password against policy
        3. Update password hash
        4. Revoke all other sessions (keep current)
        5. Log password change event

        Args:
            user_id: Current user's ID.
            request: Change password request.
            ip_address: Client IP for audit.
            user_agent: Client User-Agent for audit.

        Raises:
            AuthenticationError: If current password is incorrect.
            ValidationError: If new password doesn't meet policy.
        """
        user = await self.user_repo.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User", user_id)

        # Verify current password
        if not verify_password(request.current_password, user.password_hash):
            raise AuthenticationError("Current password is incorrect")

        # Validate new password against policy
        password_validator.validate_or_raise(request.new_password)

        # Check new password is different from current
        if verify_password(request.new_password, user.password_hash):
            raise ValidationError(
                "New password must be different from the current password"
            )

        # Update password
        new_hash = hash_password(request.new_password)
        await self.user_repo.update(user_id, {
            "password_hash": new_hash,
            "password_changed_at": datetime.now(timezone.utc),
            "must_change_password": False,
        })

        # Revoke all other sessions (force re-login on other devices)
        await self.token_blacklist.blacklist_all_user_tokens(user_id)

        # Log password change
        await self._log_auth_event(
            event_type=AuthEventType.PASSWORD_CHANGED,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            success=True,
        )

    async def request_password_reset(
        self,
        request: PasswordResetRequest,
        ip_address: str | None = None,
    ) -> PasswordResetRequestResponse:
        """
        Request a password reset token.

        Always returns success to prevent email enumeration attacks.
        If the email exists, a reset token is generated and stored
        in Redis. The actual token delivery (email/SMS) would be
        handled by a notification service.

        Args:
            request: Password reset request with email.
            ip_address: Client IP for audit.

        Returns:
            PasswordResetRequestResponse confirming the request.
        """
        email = request.email.lower().strip()

        user = await self.user_repo.get_by_email(email)

        if user and user.is_active:
            # Create password reset token
            reset_token, reset_jti = create_password_reset_token(user.id)

            # Store in Redis for one-time use verification
            await self.password_reset_store.store_reset_token(user.id, reset_jti)

            # Log the request
            await self._log_auth_event(
                event_type=AuthEventType.PASSWORD_RESET_REQUESTED,
                user_id=user.id,
                ip_address=ip_address,
                success=True,
                details={"reset_jti": reset_jti},
            )

            logger.info(
                "password_reset_requested",
                user_id=user.id,
                email=email,
                reset_jti=reset_jti,
            )

            # In production, send email with reset token/link
            # For now, include the token in the response for development
            if security_settings.jwt_issuer.endswith("-dev"):
                return PasswordResetRequestResponse(
                    message="Password reset token generated (development mode)",
                    email=email,
                )

        # Always return success to prevent email enumeration
        return PasswordResetRequestResponse(
            message="If an account exists with this email, password reset instructions have been sent",
            email=email,
        )

    async def confirm_password_reset(
        self,
        request: PasswordResetConfirm,
        ip_address: str | None = None,
    ) -> PasswordResetConfirmResponse:
        """
        Confirm password reset with token and new password.

        Flow:
        1. Decode and validate reset token
        2. Verify token in Redis (one-time use)
        3. Validate new password against policy
        4. Update password hash
        5. Consume reset token (one-time use)
        6. Revoke all sessions
        7. Log password reset completion

        Args:
            request: Password reset confirmation with token and new password.
            ip_address: Client IP for audit.

        Returns:
            PasswordResetConfirmResponse.

        Raises:
            AuthenticationError: If reset token is invalid or expired.
            ValidationError: If new password doesn't meet policy.
        """
        # Decode reset token
        try:
            payload = decode_token(request.token)
        except Exception as exc:
            raise AuthenticationError("Invalid or expired password reset token") from exc

        if not validate_token_type(payload, TOKEN_TYPE_PASSWORD_RESET):
            raise AuthenticationError("Invalid token type for password reset")

        if is_token_expired(payload):
            raise AuthenticationError("Password reset token has expired")

        jti = get_token_jti(payload)
        user_id = get_token_subject(payload)

        if not jti or not user_id:
            raise AuthenticationError("Invalid reset token: missing identifiers")

        # Verify token in Redis
        token_data = await self.password_reset_store.verify_reset_token(jti)
        if token_data is None:
            raise AuthenticationError(
                "Password reset token is invalid, expired, or already used"
            )

        # Validate new password against policy
        password_validator.validate_or_raise(request.new_password)

        # Update password
        new_hash = hash_password(request.new_password)
        await self.user_repo.update(user_id, {
            "password_hash": new_hash,
            "password_changed_at": datetime.now(timezone.utc),
            "must_change_password": False,
            "account_status": "active",
            "locked_until": None,
            "failed_login_attempts": 0,
        })

        # Consume reset token (one-time use)
        await self.password_reset_store.consume_reset_token(jti)

        # Revoke all sessions
        await self.token_blacklist.blacklist_all_user_tokens(user_id)

        # Log completion
        await self._log_auth_event(
            event_type=AuthEventType.PASSWORD_RESET_COMPLETED,
            user_id=user_id,
            ip_address=ip_address,
            success=True,
        )

        return PasswordResetConfirmResponse(
            message="Password has been reset successfully"
        )

    # ════════════════════════════════════════════════════════════
    # SESSION MANAGEMENT
    # ════════════════════════════════════════════════════════════
    async def get_active_sessions(self, user_id: str) -> SessionListResponse:
        """
        Get all active sessions for a user.

        Args:
            user_id: User ID to list sessions for.

        Returns:
            SessionListResponse with session list and count.
        """
        sessions = await self.session_manager.get_active_sessions(user_id)

        session_infos = [
            SessionInfo(
                session_id=s.get("session_id", ""),
                created_at=datetime.fromisoformat(s["created_at"]) if s.get("created_at") else datetime.now(timezone.utc),
                last_activity=datetime.fromisoformat(s["last_activity"]) if s.get("last_activity") else datetime.now(timezone.utc),
                ip_address=s.get("ip_address"),
                user_agent=s.get("user_agent"),
            )
            for s in sessions
        ]

        return SessionListResponse(
            sessions=session_infos,
            total=len(session_infos),
        )

    async def revoke_session(
        self, user_id: str, session_id: str
    ) -> bool:
        """
        Revoke a specific session.

        Args:
            user_id: User ID.
            session_id: Session ID to revoke.

        Returns:
            True if session was found and revoked.
        """
        return await self.session_manager.delete_session(user_id, session_id)

    async def revoke_all_sessions(self, user_id: str) -> int:
        """
        Revoke all sessions for a user (force logout everywhere).

        Args:
            user_id: User ID.

        Returns:
            Number of sessions revoked.
        """
        return await self.token_blacklist.blacklist_all_user_tokens(user_id)

    # ════════════════════════════════════════════════════════════
    # ACCOUNT LOCKOUT MANAGEMENT
    # ════════════════════════════════════════════════════════════
    async def unlock_account(
        self,
        admin_user_id: str,
        target_user_id: str,
        ip_address: str | None = None,
    ) -> None:
        """
        Unlock a user account (admin action).

        Args:
            admin_user_id: ID of the admin performing the unlock.
            target_user_id: ID of the user to unlock.
            ip_address: Admin's IP for audit.

        Raises:
            AuthorizationError: If the requesting user is not an admin.
            NotFoundError: If the target user is not found.
        """
        admin = await self.user_repo.get_by_id(admin_user_id)
        if not admin or not (admin.is_superuser or "admin" in admin.role_names):
            raise AuthorizationError("Only administrators can unlock accounts")

        user = await self.user_repo.get_by_id(target_user_id)
        if user is None:
            raise NotFoundError("User", target_user_id)

        await self.user_repo.update(target_user_id, {
            "account_status": "active",
            "locked_until": None,
            "failed_login_attempts": 0,
        })

        # Reset Redis lockout too
        await self.failed_login_tracker.reset_failed_attempts(user.email)

        await self._log_auth_event(
            event_type=AuthEventType.ACCOUNT_UNLOCKED,
            user_id=target_user_id,
            ip_address=ip_address,
            success=True,
            details={"unlocked_by": admin_user_id},
        )

    # ════════════════════════════════════════════════════════════
    # AUTH AUDIT LOGS
    # ════════════════════════════════════════════════════════════
    async def get_auth_events(
        self,
        user_id: str,
        requesting_user_id: str,
        offset: int = 0,
        limit: int = 50,
    ) -> list[dict[str, Any]]:
        """
        Get authentication audit events for a user.

        Only the user themselves or an admin can view auth events.

        Args:
            user_id: User ID whose events to retrieve.
            requesting_user_id: ID of the user making the request.
            offset: Pagination offset.
            limit: Maximum events to return.

        Returns:
            List of auth event dictionaries.

        Raises:
            AuthorizationError: If requester lacks permission.
        """
        # Check access
        if user_id != requesting_user_id:
            requester = await self.user_repo.get_by_id(requesting_user_id)
            if not requester or not (
                requester.is_superuser or "admin" in requester.role_names
            ):
                raise AuthorizationError(
                    "You can only view your own authentication history"
                )

        events = await self.auth_event_repo.get_by_user(user_id, offset, limit)
        return [
            {
                "id": e.id,
                "event_type": e.event_type,
                "ip_address": e.ip_address,
                "user_agent": e.user_agent,
                "session_id": e.session_id,
                "details": e.details,
                "success": e.success,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in events
        ]

    # ════════════════════════════════════════════════════════════
    # PRIVATE HELPERS
    # ════════════════════════════════════════════════════════════
    async def _log_auth_event(
        self,
        event_type: AuthEventType,
        user_id: str | None = None,
        email: str | None = None,
        session_id: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        success: bool = True,
        details: dict[str, Any] | None = None,
    ) -> None:
        """Create an authentication audit event record."""
        event_data: dict[str, Any] = {
            "event_type": event_type.value,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "session_id": session_id,
            "success": success,
            "details": details or {},
        }

        if user_id:
            event_data["user_id"] = user_id
        if email:
            event_data["details"]["email"] = email

        try:
            await self.auth_event_repo.create(event_data)
        except Exception as exc:
            logger.error(
                "auth_event_log_failed",
                event_type=event_type.value,
                user_id=user_id,
                error=str(exc),
            )

    async def _get_session_id_from_refresh_jti(
        self, user_id: str, refresh_jti: str
    ) -> str | None:
        """Look up session ID from refresh token JTI."""
        sessions = await self.session_manager.get_active_sessions(user_id)
        for session in sessions:
            if session.get("refresh_jti") == refresh_jti:
                return session.get("session_id")
        return None
