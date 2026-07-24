"""create_projects_table

Revision ID: a411e904f37b
Revises: 427f794307dd
Create Date: 2026-06-15 13:17:02.876017+00:00
"""

from typing import Sequence
from typing import Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a411e904f37b"
down_revision: Union[str, None] = "427f794307dd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply the migration."""

    op.create_table(
        "projects",

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
            server_default=sa.text(
                "gen_random_uuid()"
            ),
            nullable=False,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text(
                "now()"
            ),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text(
                "now()"
            ),
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

        sa.PrimaryKeyConstraint(
            "id"
        ),

        sa.UniqueConstraint(
            "code"
        ),

        sa.UniqueConstraint(
            "name"
        ),
    )


def downgrade() -> None:
    """Revert the migration."""

    op.drop_table(
        "projects"
    )