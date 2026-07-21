from sqlalchemy import (
    String,
    Boolean,
    ForeignKey,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.models.base import BaseModel


class ApprovalGroup(BaseModel):
    __tablename__ = "approval_groups"

    group_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    group_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    approval_method: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ANY_ONE",
    )

    description: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    members = relationship(
        "ApprovalGroupMember",
        back_populates="approval_group",
        cascade="all, delete-orphan",
    )


class ApprovalGroupMember(BaseModel):
    __tablename__ = "approval_group_members"

    approval_group_id: Mapped[str] = mapped_column(
        ForeignKey("approval_groups.id"),
        nullable=False,
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    backup_user_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    approval_group = relationship(
        "ApprovalGroup",
        back_populates="members",
    )

    user = relationship(
        "User",
        foreign_keys=[user_id],
        lazy="selectin",
    )

    backup_user = relationship(
        "User",
        foreign_keys=[backup_user_id],
        lazy="selectin",
    )