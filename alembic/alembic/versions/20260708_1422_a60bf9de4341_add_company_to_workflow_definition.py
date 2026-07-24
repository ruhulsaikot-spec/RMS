"""add_company_to_workflow_definition

Revision ID: a60bf9de4341
Revises: cbdade386984
Create Date: 2026-07-08 14:22:31.575576+00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a60bf9de4341"
down_revision: Union[str, None] = "cbdade386984"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        "workflow_definitions",
        sa.Column(
            "company_id",
            sa.String(length=36),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_workflow_definition_company",
        "workflow_definitions",
        "companies",
        ["company_id"],
        ["id"],
    )


def downgrade() -> None:

    op.drop_constraint(
        "fk_workflow_definition_company",
        "workflow_definitions",
        type_="foreignkey",
    )

    op.drop_column(
        "workflow_definitions",
        "company_id",
    )