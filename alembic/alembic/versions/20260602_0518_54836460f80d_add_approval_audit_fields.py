"""add_approval_audit_fields

Revision ID: 54836460f80d
Revises: 29aefd696ebd
Create Date: 2026-06-02 05:18:55.419121+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '54836460f80d'
down_revision: Union[str, None] = '29aefd696ebd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Apply the migration."""
    pass


def downgrade() -> None:
    """Revert the migration."""
    pass
