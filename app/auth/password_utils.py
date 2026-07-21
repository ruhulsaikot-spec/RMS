"""
RMS Backend - Password Hashing Utilities

Secure password hashing and verification using bcrypt with
configurable work factor and password policy validation.
"""

from __future__ import annotations

import re
import secrets
import string

from passlib.context import CryptContext

from app.auth.security_config import security_settings
from app.core.exceptions import ValidationError


# ── Bcrypt Context ────────────────────────────────────────────
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=security_settings.password_hash_rounds,
)


# ── Hashing Functions ─────────────────────────────────────────
def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.

    Args:
        password: Plaintext password string.

    Returns:
        Bcrypt-hashed password string.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a bcrypt hash.

    Uses constant-time comparison to prevent timing attacks.

    Args:
        plain_password: The password to verify.
        hashed_password: The stored bcrypt hash.

    Returns:
        True if the password matches the hash.
    """
    return pwd_context.verify(plain_password, hashed_password)


def needs_rehash(hashed_password: str) -> bool:
    """
    Check if a password hash needs to be regenerated.

    Returns True if the hash was created with an outdated
    bcrypt work factor or deprecated scheme.
    """
    return pwd_context.needs_update(hashed_password)


# ── Password Policy Validation ────────────────────────────────
class PasswordPolicyValidator:
    """
    Validate passwords against enterprise security policy.

    Enforces minimum length, character class requirements,
    and common password patterns. All checks are configurable
    via SecuritySettings environment variables.
    """

    def __init__(self) -> None:
        self.min_length = security_settings.password_min_length
        self.max_length = security_settings.password_max_length
        self.require_uppercase = security_settings.password_require_uppercase
        self.require_lowercase = security_settings.password_require_lowercase
        self.require_digit = security_settings.password_require_digit
        self.require_special = security_settings.password_require_special

    def validate(self, password: str) -> tuple[bool, list[str]]:
        """
        Validate a password against all policy requirements.

        Args:
            password: The password to validate.

        Returns:
            Tuple of (is_valid, list_of_error_messages).
        """
        errors: list[str] = []

        if len(password) < self.min_length:
            errors.append(f"Password must be at least {self.min_length} characters long")

        if len(password) > self.max_length:
            errors.append(f"Password must not exceed {self.max_length} characters")

        if self.require_uppercase and not re.search(r"[A-Z]", password):
            errors.append("Password must contain at least one uppercase letter")

        if self.require_lowercase and not re.search(r"[a-z]", password):
            errors.append("Password must contain at least one lowercase letter")

        if self.require_digit and not re.search(r"\d", password):
            errors.append("Password must contain at least one digit")

        if self.require_special and not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", password):
            errors.append("Password must contain at least one special character")

        # Check for common patterns
        if self._is_common_password(password):
            errors.append("Password is too common or easily guessable")

        return len(errors) == 0, errors

    def validate_or_raise(self, password: str) -> None:
        """
        Validate password and raise ValidationError if invalid.

        Args:
            password: The password to validate.

        Raises:
            ValidationError: If the password does not meet policy requirements.
        """
        is_valid, errors = self.validate(password)
        if not is_valid:
            raise ValidationError(
                message="Password must be at least 8 characters and include uppercase, lowercase, and special characters.",
            )

    @staticmethod
    def _is_common_password(password: str) -> bool:
        """Check against a list of commonly used weak passwords."""
        common = {
            "password", "123456", "12345678", "qwerty", "abc123",
            "monkey", "master", "dragon", "login", "princess",
            "football", "shadow", "sunshine", "trustno1", "iloveyou",
            "batman", "access", "hello", "charlie", "donald",
            "password1", "qwerty123", "letmein", "welcome", "admin",
        }
        return password.lower() in common


# ── Token Generation ──────────────────────────────────────────
def generate_password_reset_code(length: int = 6) -> str:
    """
    Generate a numeric password reset code.

    Args:
        length: Number of digits in the code.

    Returns:
        Numeric reset code string.
    """
    return "".join(secrets.choice(string.digits) for _ in range(length))


def generate_temporary_password(length: int = 16) -> str:
    """
    Generate a cryptographically secure temporary password.

    Args:
        length: Length of the generated password.

    Returns:
        Temporary password string meeting all policy requirements.
    """
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    while True:
        password = "".join(secrets.choice(alphabet) for _ in range(length))
        is_valid, _ = PasswordPolicyValidator().validate(password)
        if is_valid:
            return password


# Singleton validator instance
password_validator = PasswordPolicyValidator()
