"""create_reimbursement_module

Revision ID: c01331abd8e3
Revises: 4511bccf7f03
Create Date: 2026-06-01 08:08:33.829641+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c01331abd8e3'
down_revision: Union[str, None] = '4511bccf7f03'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # =====================================================
    # reimbursement_applications
    # =====================================================

    op.create_table(
        "reimbursement_applications",

        sa.Column("id", sa.String(36), primary_key=True),

        sa.Column(
            "application_no",
            sa.String(50),
            nullable=False,
            unique=True,
        ),

        sa.Column(
            "employee_id",
            sa.String(36),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),

        sa.Column(
            "reimbursement_type_id",
            sa.String(36),
            sa.ForeignKey("reimbursement_types.id"),
            nullable=False,
        ),

        sa.Column(
            "workflow_definition_id",
            sa.String(36),
            sa.ForeignKey("workflow_definitions.id"),
            nullable=False,
        ),

        sa.Column(
            "status",
            sa.String(30),
            nullable=False,
            server_default="DRAFT",
        ),

        sa.Column(
            "requested_amount",
            sa.Numeric(18, 2),
            nullable=False,
        ),

        sa.Column(
            "verified_amount",
            sa.Numeric(18, 2),
            nullable=True,
        ),

        sa.Column(
            "finance_adjustment_reason",
            sa.String(1000),
            nullable=True,
        ),

        sa.Column(
            "submitted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),

        sa.Column(
            "approved_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),

        sa.Column(
            "paid_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )

    # =====================================================
    # reimbursement_application_data
    # =====================================================

    op.create_table(
        "reimbursement_application_data",

        sa.Column("id", sa.String(36), primary_key=True),

        sa.Column(
            "application_id",
            sa.String(36),
            sa.ForeignKey(
                "reimbursement_applications.id",
                ondelete="CASCADE",
            ),
            nullable=False,
        ),

        sa.Column(
            "application_type",
            sa.String(100),
            nullable=True,
        ),

        sa.Column(
            "full_name",
            sa.String(255),
            nullable=True,
        ),

        sa.Column(
            "email",
            sa.String(255),
            nullable=True,
        ),

        sa.Column(
            "department",
            sa.String(255),
            nullable=True,
        ),

        sa.Column(
            "designation",
            sa.String(255),
            nullable=True,
        ),

        sa.Column(
            "journey_date",
            sa.Date(),
            nullable=True,
        ),

        sa.Column(
            "purpose",
            sa.String(1000),
            nullable=True,
        ),

        sa.Column(
            "attend_person",
            sa.String(500),
            nullable=True,
        ),

        sa.Column(
            "transportmode_name",
            sa.String(100),
            nullable=True,
        ),

        sa.Column(
            "from_location",
            sa.String(500),
            nullable=True,
        ),

        sa.Column(
            "to_location",
            sa.String(500),
            nullable=True,
        ),

        sa.Column(
            "transport_mode_id",
            sa.String(36),
            nullable=True,
        ),

        sa.Column(
            "distance",
            sa.Numeric(18,2),
            nullable=True,
        ),
    )

    # =====================================================
    # reimbursement_attachments
    # =====================================================

    op.create_table(
        "reimbursement_attachments",

        sa.Column("id", sa.String(36), primary_key=True),

        sa.Column(
            "application_id",
            sa.String(36),
            sa.ForeignKey(
                "reimbursement_applications.id",
                ondelete="CASCADE",
            ),
            nullable=False,
        ),

        sa.Column(
            "file_name",
            sa.String(255),
            nullable=False,
        ),

        sa.Column(
            "file_path",
            sa.String(1000),
            nullable=False,
        ),

        sa.Column(
            "file_size",
            sa.BigInteger(),
            nullable=True,
        ),

        sa.Column(
            "uploaded_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )

    # =====================================================
    # reimbursement_approvals
    # =====================================================

    op.create_table(
        "reimbursement_approvals",

        sa.Column("id", sa.String(36), primary_key=True),

        sa.Column(
            "application_id",
            sa.String(36),
            sa.ForeignKey(
                "reimbursement_applications.id",
                ondelete="CASCADE",
            ),
            nullable=False,
        ),

        sa.Column(
            "workflow_step_id",
            sa.String(36),
            sa.ForeignKey("workflow_steps.id"),
            nullable=False,
        ),

        sa.Column(
            "action_by",
            sa.String(36),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),

        sa.Column(
            "action",
            sa.String(30),
            nullable=False,
        ),

        sa.Column(
            "remarks",
            sa.String(1000),
            nullable=True,
        ),

        sa.Column(
            "action_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )

    # =====================================================
    # reimbursement_payment_logs
    # =====================================================

    op.create_table(
        "reimbursement_payment_logs",

        sa.Column("id", sa.String(36), primary_key=True),

        sa.Column(
            "application_id",
            sa.String(36),
            sa.ForeignKey(
                "reimbursement_applications.id",
                ondelete="CASCADE",
            ),
            nullable=False,
        ),

        sa.Column(
            "payment_reference",
            sa.String(100),
            nullable=True,
        ),

        sa.Column(
            "payment_amount",
            sa.Numeric(18,2),
            nullable=False,
        ),

        sa.Column(
            "paid_by",
            sa.String(36),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),

        sa.Column(
            "remarks",
            sa.String(1000),
            nullable=True,
        ),

        sa.Column(
            "paid_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )


def downgrade() -> None:

    op.drop_table("reimbursement_payment_logs")
    op.drop_table("reimbursement_approvals")
    op.drop_table("reimbursement_attachments")
    op.drop_table("reimbursement_application_data")
    op.drop_table("reimbursement_applications")
