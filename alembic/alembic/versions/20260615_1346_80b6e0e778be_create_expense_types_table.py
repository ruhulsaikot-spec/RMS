"""create_expense_types_table

Revision ID: 80b6e0e778be
Revises: a411e904f37b
Create Date: 2026-06-15 13:46:29.081944+00:00
"""

from typing import Sequence
from typing import Union

from alembic import op
import sqlalchemy as sa


revision: str = "80b6e0e778be"
down_revision: Union[str, None] = "a411e904f37b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply migration."""

    op.create_table(
        "expense_types",

        sa.Column(
            "code",
            sa.String(length=50),
            nullable=False,
        ),

        sa.Column(
            "name",
            sa.String(length=255),
            nullable=False,
        ),

        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default="true",
        ),

        sa.Column(
            "id",
            sa.String(length=36),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.Column(
            "created_by",
            sa.String(length=36),
            nullable=True,
        ),

        sa.Column(
            "updated_by",
            sa.String(length=36),
            nullable=True,
        ),

        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),

        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),

        sa.Column(
            "deleted_by",
            sa.String(length=36),
            nullable=True,
        ),

        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
        sa.UniqueConstraint("name"),
    )


def downgrade() -> None:
    """Rollback migration."""

    op.drop_table("expense_types")