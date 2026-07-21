"""add_approval_audit_fields

Revision ID: 29aefd696ebd
Revises: 2e00dd1fda20
Create Date: 2026-06-02 05:14:46.853002+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '29aefd696ebd'
down_revision: Union[str, None] = '2e00dd1fda20'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        "reimbursement_approvals",
        sa.Column(
            "approved_by",
            sa.String(length=36),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_reimbursement_approvals_approved_by",
        "reimbursement_approvals",
        "users",
        ["approved_by"],
        ["id"],
    )


def downgrade() -> None:

    op.drop_constraint(
        "fk_reimbursement_approvals_approved_by",
        "reimbursement_approvals",
        type_="foreignkey",
    )

    op.drop_column(
        "reimbursement_approvals",
        "approved_by",
    )
