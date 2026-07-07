"""workflow approval group support

Revision ID: a1e2e38d38d8
Revises: 214755b4d361
Create Date: 2026-06-23 23:43:25.681122+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a1e2e38d38d8'
down_revision: Union[str, None] = '214755b4d361'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply the migration."""

    op.add_column(
        "workflow_steps",
        sa.Column(
            "approval_group_id",
            sa.String(length=36),
            nullable=True,
        ),
    )

    op.add_column(
        "workflow_steps",
        sa.Column(
            "min_approver_count",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_workflow_steps_approval_group",
        "workflow_steps",
        "approval_groups",
        ["approval_group_id"],
        ["id"],
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Revert the migration."""

    op.drop_constraint(
        "fk_workflow_steps_approval_group",
        "workflow_steps",
        type_="foreignkey",
    )

    op.drop_column(
        "workflow_steps",
        "min_approver_count",
    )

    op.drop_column(
        "workflow_steps",
        "approval_group_id",
    )
    # ### end Alembic commands ###
