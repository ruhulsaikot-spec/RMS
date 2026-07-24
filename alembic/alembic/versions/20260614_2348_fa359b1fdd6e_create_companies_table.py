"""create_companies_table

Revision ID: fa359b1fdd6e
Revises: 39b825c5ae0f
Create Date: 2026-06-14 23:48:55.586064+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "fa359b1fdd6e"
down_revision: Union[str, None] = "39b825c5ae0f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table(
        "companies",

        sa.Column(
            "id",
            sa.String(length=36),
            nullable=False,
        ),

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
            "contact_person",
            sa.String(length=255),
            nullable=False,
        ),

        sa.Column(
            "mobile",
            sa.String(length=30),
            nullable=True,
        ),

        sa.Column(
            "email",
            sa.String(length=255),
            nullable=False,
        ),

        sa.Column(
            "website",
            sa.String(length=255),
            nullable=True,
        ),

        sa.Column(
            "country",
            sa.String(length=100),
            nullable=False,
        ),

        sa.Column(
            "city",
            sa.String(length=100),
            nullable=True,
        ),

        sa.Column(
            "logo",
            sa.String(length=500),
            nullable=True,
        ),

        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
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
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),

        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
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
        sa.UniqueConstraint("email"),
    )


def downgrade() -> None:

    op.drop_table("companies")