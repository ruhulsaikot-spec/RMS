"""add reimbursement expense items

Revision ID: b2cfe7b04887
Revises: 16451e2dc84f
Create Date: 2026-06-21 10:38:52.763506+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b2cfe7b04887'
down_revision: Union[str, None] = '16451e2dc84f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:

    op.create_table(
        "reimbursement_expense_items",

        sa.Column(
            "application_id",
            sa.String(length=36),
            nullable=False,
        ),

        sa.Column(
            "expense_date",
            sa.Date(),
            nullable=True,
        ),

        sa.Column(
            "claim_type",
            sa.String(length=100),
            nullable=True,
        ),

        sa.Column(
            "purpose",
            sa.String(length=500),
            nullable=True,
        ),

        sa.Column(
            "mode",
            sa.String(length=100),
            nullable=True,
        ),

        sa.Column(
            "project",
            sa.String(length=255),
            nullable=True,
        ),

        sa.Column(
            "from_location",
            sa.String(length=255),
            nullable=True,
        ),

        sa.Column(
            "to_location",
            sa.String(length=255),
            nullable=True,
        ),

        sa.Column(
            "amount",
            sa.Numeric(18, 2),
            nullable=False,
        ),

        sa.Column(
            "id",
            sa.String(length=36),
            server_default=sa.text(
                "gen_random_uuid()"
            ),
            nullable=False,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),

        sa.Column(
            "created_by",
            sa.String(length=36),
            nullable=True,
        ),

        sa.Column(
            "updated_by",
            sa.String(length=36),
            nullable=True,
        ),

        sa.Column(
            "is_deleted",
            sa.Boolean(),
            server_default="false",
            nullable=False,
        ),

        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),

        sa.Column(
            "deleted_by",
            sa.String(length=36),
            nullable=True,
        ),

        sa.ForeignKeyConstraint(
            ["application_id"],
            ["reimbursement_applications.id"],
            ondelete="CASCADE",
        ),

        sa.PrimaryKeyConstraint("id"),
    )

    # ### end Alembic commands ###


def downgrade() -> None:

    op.drop_table(
        "reimbursement_expense_items"
    )    # ### end Alembic commands ###
