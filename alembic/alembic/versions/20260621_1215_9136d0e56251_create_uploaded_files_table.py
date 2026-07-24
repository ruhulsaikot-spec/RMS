"""create uploaded files table

Revision ID: 9136d0e56251
Revises: b2cfe7b04887
Create Date: 2026-06-21 12:15:25.254327+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9136d0e56251'
down_revision: Union[str, None] = 'b2cfe7b04887'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():

    op.create_table(
        "uploaded_files",

        sa.Column(
            "original_name",
            sa.String(255),
            nullable=False,
        ),

        sa.Column(
            "stored_name",
            sa.String(255),
            nullable=False,
        ),

        sa.Column(
            "file_extension",
            sa.String(20),
            nullable=False,
        ),

        sa.Column(
            "mime_type",
            sa.String(255),
            nullable=False,
        ),

        sa.Column(
            "file_size",
            sa.BigInteger(),
            nullable=False,
        ),

        sa.Column(
            "storage_path",
            sa.String(1000),
            nullable=False,
        ),

        sa.Column(
            "uploaded_by",
            sa.String(36),
            nullable=True,
        ),

        sa.Column(
            "id",
            sa.String(36),
            primary_key=True,
            server_default=sa.text(
                "gen_random_uuid()"
            ),
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
            sa.String(36),
            nullable=True,
        ),

        sa.Column(
            "updated_by",
            sa.String(36),
            nullable=True,
        ),

        sa.Column(
            "is_deleted",
            sa.Boolean(),
            server_default="false",
            nullable=False,
        ),

        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),

        sa.Column(
            "deleted_by",
            sa.String(36),
            nullable=True,
        ),
    )

def downgrade():

    op.drop_table(
        "uploaded_files"
    )