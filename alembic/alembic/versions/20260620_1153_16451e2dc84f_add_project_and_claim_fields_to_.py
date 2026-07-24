"""add project and claim fields to reimbursement application data

Revision ID: 16451e2dc84f
Revises: 80b6e0e778be
Create Date: 2026-06-20 11:53:07.426100+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '16451e2dc84f'
down_revision: Union[str, None] = '80b6e0e778be'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():

    op.add_column(
        "reimbursement_application_data",
        sa.Column(
            "project_id",
            sa.String(length=36),
            nullable=True,
        ),
    )

    op.add_column(
        "reimbursement_application_data",
        sa.Column(
            "project_name",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "reimbursement_application_data",
        sa.Column(
            "claim_date",
            sa.Date(),
            nullable=True,
        ),
    )

    op.add_column(
        "reimbursement_application_data",
        sa.Column(
            "remarks",
            sa.String(length=1000),
            nullable=True,
        ),
    )

    # ### end Alembic commands ###


def downgrade():

    op.drop_column(
        "reimbursement_application_data",
        "remarks",
    )

    op.drop_column(
        "reimbursement_application_data",
        "claim_date",
    )

    op.drop_column(
        "reimbursement_application_data",
        "project_name",
    )

    op.drop_column(
        "reimbursement_application_data",
        "project_id",
    )
    # ### end Alembic commands ###
