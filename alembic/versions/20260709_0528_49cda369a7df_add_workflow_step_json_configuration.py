"""add_workflow_step_json_configuration

Revision ID: 49cda369a7df
Revises: 9c964db8c7d9
Create Date: 2026-07-09 05:28:02.924013+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '49cda369a7df'
down_revision: Union[str, None] = '9c964db8c7d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        "workflow_steps",
        sa.Column(
            "allowed_actions",
            sa.JSON(),
            nullable=True,
        ),
    )

    op.add_column(
        "workflow_steps",
        sa.Column(
            "remarks_required",
            sa.JSON(),
            nullable=True,
        ),
    )

    op.add_column(
        "workflow_steps",
        sa.Column(
            "applicant_notification",
            sa.JSON(),
            nullable=True,
        ),
    )


def downgrade() -> None:

    op.drop_column(
        "workflow_steps",
        "applicant_notification",
    )

    op.drop_column(
        "workflow_steps",
        "remarks_required",
    )

    op.drop_column(
        "workflow_steps",
        "allowed_actions",
    )
