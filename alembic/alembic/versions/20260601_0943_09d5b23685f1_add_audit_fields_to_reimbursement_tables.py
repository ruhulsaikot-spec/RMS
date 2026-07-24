"""add_audit_fields_to_reimbursement_tables

Revision ID: 09d5b23685f1
Revises: c01331abd8e3
Create Date: 2026-06-01 09:43:54.515435+00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '09d5b23685f1'
down_revision: Union[str, None] = 'c01331abd8e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # ==========================================
    # reimbursement_applications
    # ==========================================

    op.add_column(
        "reimbursement_applications",
        sa.Column("created_by", sa.String(36), nullable=True),
    )

    op.add_column(
        "reimbursement_applications",
        sa.Column("updated_by", sa.String(36), nullable=True),
    )

    op.add_column(
        "reimbursement_applications",
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
    )

    op.add_column(
        "reimbursement_applications",
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.add_column(
        "reimbursement_applications",
        sa.Column(
            "deleted_by",
            sa.String(36),
            nullable=True,
        ),
    )

    # ==========================================
    # reimbursement_application_data
    # ==========================================

    op.add_column(
        "reimbursement_application_data",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )

    op.add_column(
        "reimbursement_application_data",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )

    op.add_column(
        "reimbursement_application_data",
        sa.Column("created_by", sa.String(36)),
    )

    op.add_column(
        "reimbursement_application_data",
        sa.Column("updated_by", sa.String(36)),
    )

    op.add_column(
        "reimbursement_application_data",
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
    )

    op.add_column(
        "reimbursement_application_data",
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
        ),
    )

    op.add_column(
        "reimbursement_application_data",
        sa.Column(
            "deleted_by",
            sa.String(36),
        ),
    )

    # ==========================================
    # reimbursement_attachments
    # ==========================================

    op.add_column(
        "reimbursement_attachments",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )

    op.add_column(
        "reimbursement_attachments",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )

    op.add_column(
        "reimbursement_attachments",
        sa.Column("created_by", sa.String(36)),
    )

    op.add_column(
        "reimbursement_attachments",
        sa.Column("updated_by", sa.String(36)),
    )

    op.add_column(
        "reimbursement_attachments",
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
    )

    op.add_column(
        "reimbursement_attachments",
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
        ),
    )

    op.add_column(
        "reimbursement_attachments",
        sa.Column(
            "deleted_by",
            sa.String(36),
        ),
    )

    # ==========================================
    # reimbursement_approvals
    # ==========================================

    op.add_column(
        "reimbursement_approvals",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )

    op.add_column(
        "reimbursement_approvals",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )

    op.add_column(
        "reimbursement_approvals",
        sa.Column("created_by", sa.String(36)),
    )

    op.add_column(
        "reimbursement_approvals",
        sa.Column("updated_by", sa.String(36)),
    )

    op.add_column(
        "reimbursement_approvals",
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
    )

    op.add_column(
        "reimbursement_approvals",
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
        ),
    )

    op.add_column(
        "reimbursement_approvals",
        sa.Column(
            "deleted_by",
            sa.String(36),
        ),
    )

    # ==========================================
    # reimbursement_payment_logs
    # ==========================================

    op.add_column(
        "reimbursement_payment_logs",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )

    op.add_column(
        "reimbursement_payment_logs",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
        ),
    )

    op.add_column(
        "reimbursement_payment_logs",
        sa.Column("created_by", sa.String(36)),
    )

    op.add_column(
        "reimbursement_payment_logs",
        sa.Column("updated_by", sa.String(36)),
    )

    op.add_column(
        "reimbursement_payment_logs",
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
    )

    op.add_column(
        "reimbursement_payment_logs",
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
        ),
    )

    op.add_column(
        "reimbursement_payment_logs",
        sa.Column(
            "deleted_by",
            sa.String(36),
        ),
    )
