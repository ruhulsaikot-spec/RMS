"""add_payment_method_fk

Revision ID: 2e00dd1fda20
Revises: 330c50e69143
Create Date: 2026-06-02 04:02:07.107879+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2e00dd1fda20'
down_revision: Union[str, None] = '330c50e69143'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply the migration."""

    # 1. Add nullable column first
    op.add_column(
        "reimbursement_payment_logs",
        sa.Column(
            "payment_method_id",
            sa.String(length=36),
            nullable=True,
        ),
    )

    # 2. No existing payment_method column in the initial schema.
    # Skip data migration.
    pass

    # 3. Create FK
    op.create_foreign_key(
        "fk_reimbursement_payment_logs_payment_method",
        "reimbursement_payment_logs",
        "payment_methods",
        ["payment_method_id"],
        ["id"],
    )

    # 4. Make required
    op.alter_column(
        "reimbursement_payment_logs",
        "payment_method_id",
        nullable=False,
    )

    # 5. Initial schema has no payment_method column.
    # Nothing to drop.
    pass


def downgrade() -> None:
    """Revert the migration."""

    # 1. Restore old column
    op.add_column(
        "reimbursement_payment_logs",
        sa.Column(
            "payment_method",
            sa.String(length=50),
            nullable=True,
        ),
    )

    # 2. Copy data back
    op.execute(
        """
        UPDATE reimbursement_payment_logs rpl
        SET payment_method = pm.code
        FROM payment_methods pm
        WHERE rpl.payment_method_id = pm.id
        """
    )

    # 3. Make required
    op.alter_column(
        "reimbursement_payment_logs",
        "payment_method",
        nullable=False,
    )

    # 4. Drop FK
    op.drop_constraint(
        "fk_reimbursement_payment_logs_payment_method",
        "reimbursement_payment_logs",
        type_="foreignkey",
    )

    # 5. Drop new column
    op.drop_column(
        "reimbursement_payment_logs",
        "payment_method_id",
    )