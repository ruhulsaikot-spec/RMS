"""add_workflow_step_enhancements

Revision ID: 4511bccf7f03
Revises: 67e9995e7b3f
Create Date: 2026-06-01 06:41:17.811533+00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4511bccf7f03"
down_revision: Union[str, None] = "67e9995e7b3f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        "workflow_steps",
        sa.Column(
            "user_id",
            sa.String(length=36),
            nullable=True,
        ),
    )

    op.add_column(
        "workflow_steps",
        sa.Column(
            "can_edit_amount",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
    )

    op.add_column(
        "workflow_steps",
        sa.Column(
            "is_finance_step",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
    )

    op.create_foreign_key(
        "fk_workflow_steps_user_id_users",
        "workflow_steps",
        "users",
        ["user_id"],
        ["id"],
    )


def downgrade() -> None:

    op.drop_constraint(
        "fk_workflow_steps_user_id_users",
        "workflow_steps",
        type_="foreignkey",
    )

    op.drop_column(
        "workflow_steps",
        "is_finance_step",
    )

    op.drop_column(
        "workflow_steps",
        "can_edit_amount",
    )

    op.drop_column(
        "workflow_steps",
        "user_id",
    )