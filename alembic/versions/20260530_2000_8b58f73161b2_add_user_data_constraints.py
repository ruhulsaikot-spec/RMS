"""add_user_data_constraints

Revision ID: 8b58f73161b2
Revises: c85ab03995de
Create Date: 2026-05-30 20:00:43.252535+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8b58f73161b2'
down_revision: Union[str, None] = 'c85ab03995de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_check_constraint(
        "chk_users_full_name_not_empty",
        "users",
        "length(trim(full_name)) > 0",
    )

    op.create_check_constraint(
        "chk_users_employee_id_not_empty",
        "users",
        "length(trim(employee_id)) > 0",
    )

    op.create_check_constraint(
        "chk_users_email_not_empty",
        "users",
        "length(trim(email)) > 0",
    )


def downgrade() -> None:
    op.drop_constraint(
        "chk_users_full_name_not_empty",
        "users",
        type_="check",
    )

    op.drop_constraint(
        "chk_users_employee_id_not_empty",
        "users",
        type_="check",
    )

    op.drop_constraint(
        "chk_users_email_not_empty",
        "users",
        type_="check",
    )
