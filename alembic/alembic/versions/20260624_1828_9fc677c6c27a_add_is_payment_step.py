"""add_is_payment_step

Revision ID: 9fc677c6c27a
Revises: a1e2e38d38d8
Create Date: 2026-06-24 18:28:26.299350+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '9fc677c6c27a'
down_revision: Union[str, None] = 'a1e2e38d38d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():

    op.add_column(
        "workflow_steps",
        sa.Column(
            "is_payment_step",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
    )


def downgrade():

    op.drop_column(
        "workflow_steps",
        "is_payment_step",
    )