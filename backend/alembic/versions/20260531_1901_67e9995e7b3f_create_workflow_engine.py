"""create_workflow_engine

Revision ID: 67e9995e7b3f
Revises: c3db6b294f8d
"""

from alembic import op
import sqlalchemy as sa


revision = "67e9995e7b3f"
down_revision = "c3db6b294f8d"
branch_labels = None
depends_on = None


def upgrade():

    op.create_table(
        "reimbursement_types",

        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column("description", sa.String(500)),
        sa.Column("is_active", sa.Boolean(), nullable=False),

        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
        sa.Column("created_by", sa.String(36)),
        sa.Column("updated_by", sa.String(36)),
        sa.Column("is_deleted", sa.Boolean()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("deleted_by", sa.String(36)),
    )

    op.create_table(
        "workflow_definitions",

        sa.Column("id", sa.String(36), primary_key=True),

        sa.Column(
            "reimbursement_type_id",
            sa.String(36),
            sa.ForeignKey("reimbursement_types.id"),
            nullable=False,
        ),

        sa.Column("name", sa.String(200), nullable=False),

        sa.Column("module_name", sa.String(50), nullable=False),

        sa.Column("min_amount", sa.Numeric(18, 2), nullable=False),

        sa.Column("max_amount", sa.Numeric(18, 2), nullable=False),

        sa.Column("is_active", sa.Boolean(), nullable=False),

        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
        sa.Column("created_by", sa.String(36)),
        sa.Column("updated_by", sa.String(36)),
        sa.Column("is_deleted", sa.Boolean()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("deleted_by", sa.String(36)),
    )

    op.create_table(
        "workflow_steps",

        sa.Column("id", sa.String(36), primary_key=True),

        sa.Column(
            "workflow_id",
            sa.String(36),
            sa.ForeignKey("workflow_definitions.id"),
            nullable=False,
        ),

        sa.Column("step_order", sa.Integer(), nullable=False),

        sa.Column(
            "approver_type",
            sa.String(50),
            nullable=False,
        ),

        sa.Column(
            "role_id",
            sa.String(36),
            sa.ForeignKey("roles.id"),
            nullable=True,
        ),

        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
        sa.Column("created_by", sa.String(36)),
        sa.Column("updated_by", sa.String(36)),
        sa.Column("is_deleted", sa.Boolean()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("deleted_by", sa.String(36)),
    )


def downgrade():

    op.drop_table("workflow_steps")
    op.drop_table("workflow_definitions")
    op.drop_table("reimbursement_types")