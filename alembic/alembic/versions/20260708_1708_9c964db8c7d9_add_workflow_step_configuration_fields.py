"""add_workflow_step_configuration_fields

Revision ID: 9c964db8c7d9
Revises: a60bf9de4341
Create Date: 2026-07-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9c964db8c7d9"
down_revision: Union[str, None] = "a60bf9de4341"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        "workflow_steps",
        sa.Column(
            "email_notification",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
    )

    op.add_column(
        "workflow_steps",
        sa.Column(
            "in_app_notification",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
    )

    op.add_column(
        "workflow_steps",
        sa.Column(
            "sla_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )

    op.add_column(
        "workflow_steps",
        sa.Column(
            "sla_hours",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "workflow_steps",
        sa.Column(
            "escalation_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )

    op.add_column(
        "workflow_steps",
        sa.Column(
            "escalation_hours",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "workflow_steps",
        sa.Column(
            "escalation_group",
            sa.String(length=200),
            nullable=True,
        ),
    )


def downgrade() -> None:

    op.drop_column(
        "workflow_steps",
        "escalation_group",
    )

    op.drop_column(
        "workflow_steps",
        "escalation_hours",
    )

    op.drop_column(
        "workflow_steps",
        "escalation_enabled",
    )

    op.drop_column(
        "workflow_steps",
        "sla_hours",
    )

    op.drop_column(
        "workflow_steps",
        "sla_enabled",
    )

    op.drop_column(
        "workflow_steps",
        "in_app_notification",
    )

    op.drop_column(
        "workflow_steps",
        "email_notification",
    )