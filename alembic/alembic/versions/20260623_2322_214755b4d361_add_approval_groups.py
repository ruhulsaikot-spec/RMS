"""add approval groups

Revision ID: 214755b4d361
Revises: 9136d0e56251
Create Date: 2026-06-23 23:22:20.274067+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '214755b4d361'
down_revision: Union[str, None] = '9136d0e56251'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:

    op.create_table(
        'approval_groups',
        sa.Column('group_code', sa.String(length=50), nullable=False),
        sa.Column('group_name', sa.String(length=200), nullable=False),
        sa.Column('approval_method', sa.String(length=20), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),

        sa.Column('id', sa.String(length=36),
                  server_default=sa.text('gen_random_uuid()'),
                  nullable=False),

        sa.Column('created_at',
                  sa.DateTime(timezone=True),
                  server_default=sa.text('now()'),
                  nullable=False),

        sa.Column('updated_at',
                  sa.DateTime(timezone=True),
                  server_default=sa.text('now()'),
                  nullable=False),

        sa.Column('created_by', sa.String(length=36), nullable=True),
        sa.Column('updated_by', sa.String(length=36), nullable=True),
        sa.Column('is_deleted',
                  sa.Boolean(),
                  server_default='false',
                  nullable=False),

        sa.Column('deleted_at',
                  sa.DateTime(timezone=True),
                  nullable=True),

        sa.Column('deleted_by',
                  sa.String(length=36),
                  nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('group_code')
    )

    op.create_table(
        'approval_group_members',
        sa.Column('approval_group_id',
                  sa.String(length=36),
                  nullable=False),

        sa.Column('user_id',
                  sa.String(length=36),
                  nullable=False),

        sa.Column('is_primary',
                  sa.Boolean(),
                  nullable=False),

        sa.Column('backup_user_id',
                  sa.String(length=36),
                  nullable=True),

        sa.Column('id',
                  sa.String(length=36),
                  server_default=sa.text('gen_random_uuid()'),
                  nullable=False),

        sa.Column('created_at',
                  sa.DateTime(timezone=True),
                  server_default=sa.text('now()'),
                  nullable=False),

        sa.Column('updated_at',
                  sa.DateTime(timezone=True),
                  server_default=sa.text('now()'),
                  nullable=False),

        sa.Column('created_by', sa.String(length=36), nullable=True),
        sa.Column('updated_by', sa.String(length=36), nullable=True),
        sa.Column('is_deleted',
                  sa.Boolean(),
                  server_default='false',
                  nullable=False),

        sa.Column('deleted_at',
                  sa.DateTime(timezone=True),
                  nullable=True),

        sa.Column('deleted_by',
                  sa.String(length=36),
                  nullable=True),

        sa.ForeignKeyConstraint(
            ['approval_group_id'],
            ['approval_groups.id']
        ),

        sa.ForeignKeyConstraint(
            ['user_id'],
            ['users.id']
        ),

        sa.ForeignKeyConstraint(
            ['backup_user_id'],
            ['users.id']
        ),

        sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###

def downgrade() -> None:

    op.drop_table('approval_group_members')
    op.drop_table('approval_groups')
    # ### end Alembic commands ###
