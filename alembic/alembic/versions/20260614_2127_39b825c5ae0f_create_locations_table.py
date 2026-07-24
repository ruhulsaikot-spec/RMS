"""create_locations_table

Revision ID: 39b825c5ae0f
Revises: bcb7d574ab2e
Create Date: 2026-06-14 21:27:16.552439+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '39b825c5ae0f'
down_revision: Union[str, None] = 'bcb7d574ab2e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply the migration."""

    op.create_table(
        "locations",

        sa.Column(
            "id",
            sa.String(length=36),
            nullable=False,
        ),

        sa.Column(
            "name",
            sa.String(length=255),
            nullable=False,
        ),

        sa.Column(
            "code",
            sa.String(length=50),
            nullable=False,
        ),

        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default="true",
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
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
    )


def downgrade() -> None:
    """Revert the migration."""

    op.drop_table("locations")
