"""add workflow expense type mapping

Revision ID: 11ff40da95f8
Revises: 9fc677c6c27a
Create Date: 2026-07-04 13:44:07.842926+00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "11ff40da95f8"
down_revision: Union[str, None] = "9fc677c6c27a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.drop_constraint(
        "workflow_definitions_reimbursement_type_id_fkey",
        "workflow_definitions",
        type_="foreignkey",
    )

    op.drop_column(
        "workflow_definitions",
        "reimbursement_type_id",
    )

    op.create_table(
        "workflow_definition_expense_types",
        sa.Column(
            "workflow_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "reimbursement_type_id",
            sa.String(length=36),
            nullable=False,
        ),
        sa.Column(
            "id",
            sa.String(length=36),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["workflow_id"],
            ["workflow_definitions.id"],
        ),
        sa.ForeignKeyConstraint(
            ["reimbursement_type_id"],
            ["reimbursement_types.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:

    op.drop_table(
        "workflow_definition_expense_types"
    )

    op.add_column(
        "workflow_definitions",
        sa.Column(
            "reimbursement_type_id",
            sa.String(length=36),
            nullable=False,
        ),
    )

    op.create_foreign_key(
        "workflow_definitions_reimbursement_type_id_fkey",
        "workflow_definitions",
        "reimbursement_types",
        ["reimbursement_type_id"],
        ["id"],
    )