"""add_finance_review_audit_fields

Revision ID: bcb7d574ab2e
Revises: 54836460f80d
Create Date: 2026-06-03 09:38:30.860436+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bcb7d574ab2e'
down_revision: Union[str, None] = '54836460f80d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        "reimbursement_applications",
        sa.Column(
            "reviewed_by",
            sa.String(length=36),
            nullable=True,
        ),
    )

    op.add_column(
        "reimbursement_applications",
        sa.Column(
            "reviewed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_reimbursement_applications_reviewed_by",
        "reimbursement_applications",
        "users",
        ["reviewed_by"],
        ["id"],
    )


def downgrade() -> None:

    op.drop_constraint(
        "fk_reimbursement_applications_reviewed_by",
        "reimbursement_applications",
        type_="foreignkey",
    )

    op.drop_column(
        "reimbursement_applications",
        "reviewed_at",
    )

    op.drop_column(
        "reimbursement_applications",
        "reviewed_by",
    )