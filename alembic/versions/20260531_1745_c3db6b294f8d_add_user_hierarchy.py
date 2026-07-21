"""add_user_hierarchy

Revision ID: c3db6b294f8d
Revises: 8b58f73161b2
Create Date: 2026-05-31 17:45:56.368889+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3db6b294f8d'
down_revision: Union[str, None] = '8b58f73161b2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        "users",
        sa.Column(
            "manager_id",
            sa.String(length=36),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_users_manager",
        "users",
        "users",
        ["manager_id"],
        ["id"],
    )


def downgrade() -> None:

    op.drop_constraint(
        "fk_users_manager",
        "users",
        type_="foreignkey",
    )

    op.drop_column(
        "users",
        "manager_id",
    )
