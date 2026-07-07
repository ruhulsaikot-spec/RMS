from sqlalchemy import Boolean
from sqlalchemy import ForeignKey
from sqlalchemy import String

from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from app.models.base import BaseModel
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlalchemy import Integer
from typing import TYPE_CHECKING


class User(BaseModel):
    __tablename__ = "users"

    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    if TYPE_CHECKING:
        from app.auth.models.auth import Role
        from app.auth.models.auth import AuthEvent

    employee_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
    String(255),
    nullable=False,
    )

    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    department_id: Mapped[str] = mapped_column(
        ForeignKey("departments.id"),
        nullable=False,
    )

    designation_id: Mapped[str] = mapped_column(
        ForeignKey("designations.id"),
        nullable=False,
    )

    manager_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    is_superuser: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    account_status: Mapped[str] = mapped_column(
        String(50),
        default="active",
    )

    failed_login_attempts: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    must_change_password: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    locked_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    last_login_ip: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    manager = relationship(
        "User",
        remote_side="User.id",
        foreign_keys=[manager_id],
        back_populates="subordinates",
    )

    subordinates = relationship(
        "User",
        back_populates="manager",
    )


    department = relationship(
        "Department",
        back_populates="users",
        lazy="selectin",
    )

    designation = relationship(
        "Designation",
        back_populates="users",
        lazy="selectin",
    )

    roles = relationship(
        "Role",
        secondary="user_roles",
        back_populates="users",
        lazy="selectin",
    )

    auth_events = relationship(
        "AuthEvent",
        back_populates="user",
    )

    @property
    def role_names(self) -> list[str]:
        return [role.name for role in self.roles]


    @property
    def permission_codes(self) -> list[str]:
        permissions = set()

        for role in self.roles:
            for permission in role.permissions:
                permissions.add(permission.code)

        return list(permissions)

    @property
    def is_locked(self) -> bool:
        if self.account_status != "locked":
            return False

        if self.locked_until:
            return self.locked_until > datetime.now(timezone.utc)

        return True    