"""add_stage_name_action_type_to_workflow_step

Revision ID: cbdade386984
Revises: 11ff40da95f8
Create Date: 2026-07-05 20:20:13.990196+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'cbdade386984'
down_revision: Union[str, None] = '11ff40da95f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "workflow_steps",
        sa.Column(
            "stage_name",
            sa.String(length=200),
            nullable=False,
            server_default="Stage",
        ),
    )

    op.add_column(
        "workflow_steps",
        sa.Column(
            "action_type",
            sa.String(length=100),
            nullable=False,
            server_default="Approval",
        ),
    )

    op.alter_column(
        "workflow_steps",
        "stage_name",
        server_default=None,
    )

    op.alter_column(
        "workflow_steps",
        "action_type",
        server_default=None,
    )

def downgrade():
    op.drop_column("workflow_steps", "action_type")
    op.drop_column("workflow_steps", "stage_name")