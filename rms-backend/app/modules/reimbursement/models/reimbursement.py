from sqlalchemy import (
    String,
    Date,
    DateTime,
    Numeric,
    ForeignKey,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.modules.user.models.user import User
from app.modules.expense_type.models.expense_type import ExpenseType

from app.models.base import BaseModel


class ReimbursementApplication(BaseModel):
    __tablename__ = "reimbursement_applications"

    application_no: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    employee_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    reimbursement_type_id: Mapped[str] = mapped_column(
        ForeignKey("expense_types.id"),
        nullable=False,
    )

    expense_type = relationship(
        ExpenseType,
    )

    workflow_definition_id: Mapped[str] = mapped_column(
        ForeignKey("workflow_definitions.id"),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="DRAFT",
    )

    requested_amount: Mapped[float] = mapped_column(
        Numeric(18, 2),
        nullable=False,
    )

    verified_amount: Mapped[float | None] = mapped_column(
        Numeric(18, 2),
        nullable=True,
    )

    paid_amount: Mapped[float] = mapped_column(
        Numeric(18, 2),
        default=0,
    )

    finance_adjustment_reason: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    submitted_at: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    reviewed_by: Mapped[str | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    reviewed_at: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    approved_at: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    paid_at: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    data = relationship(
    "ReimbursementApplicationData",
    uselist=False,
    cascade="all, delete-orphan",
    back_populates="application",
    )

    expense_items = relationship(
        "ReimbursementExpenseItem",
        cascade="all, delete-orphan",
    )

    attachments = relationship(
        "ReimbursementAttachment",
        cascade="all, delete-orphan",
    )

    approvals = relationship(
        "ReimbursementApproval",
        cascade="all, delete-orphan",
    )

    payment_logs = relationship(
        "ReimbursementPaymentLog",
        cascade="all, delete-orphan",
    )

    employee = relationship(
        "User",
        foreign_keys=[employee_id],
    )

    reviewer = relationship(
        "User",
        foreign_keys=[reviewed_by],
    )


class ReimbursementApplicationData(BaseModel):
    __tablename__ = "reimbursement_application_data"

    application_id: Mapped[str] = mapped_column(
        ForeignKey(
            "reimbursement_applications.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    application_type: Mapped[str | None] = mapped_column(
        String(100),
    )

    full_name: Mapped[str | None] = mapped_column(
        String(255),
    )

    email: Mapped[str | None] = mapped_column(
        String(255),
    )

    department: Mapped[str | None] = mapped_column(
        String(255),
    )

    designation: Mapped[str | None] = mapped_column(
        String(255),
    )

    journey_date: Mapped[Date | None] = mapped_column(
        Date,
    )

    purpose: Mapped[str | None] = mapped_column(
        String(1000),
    )

    attend_person: Mapped[str | None] = mapped_column(
        String(500),
    )

    transportmode_name: Mapped[str | None] = mapped_column(
        String(100),
    )

    from_location: Mapped[str | None] = mapped_column(
        String(500),
    )

    to_location: Mapped[str | None] = mapped_column(
        String(500),
    )

    transport_mode_id: Mapped[str | None] = mapped_column(
        String(36),
    )

    distance: Mapped[float | None] = mapped_column(
    Numeric(18, 2),
    )

    project_id: Mapped[str | None] = mapped_column(
        String(36),
    )

    project_name: Mapped[str | None] = mapped_column(
        String(255),
    )

    claim_date: Mapped[Date | None] = mapped_column(
        Date,
    )

    remarks: Mapped[str | None] = mapped_column(
        String(1000),
    )
    
    application = relationship(
        "ReimbursementApplication",
        back_populates="data",
    )

class ReimbursementExpenseItem(BaseModel):
    __tablename__ = "reimbursement_expense_items"

    application_id: Mapped[str] = mapped_column(
        ForeignKey(
            "reimbursement_applications.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    expense_date: Mapped[Date | None] = mapped_column(
        Date
    )

    claim_type: Mapped[str | None] = mapped_column(
        String(100)
    )

    purpose: Mapped[str | None] = mapped_column(
        String(500)
    )

    mode: Mapped[str | None] = mapped_column(
        String(100)
    )

    project: Mapped[str | None] = mapped_column(
        String(255)
    )

    from_location: Mapped[str | None] = mapped_column(
        String(255)
    )

    to_location: Mapped[str | None] = mapped_column(
        String(255)
    )

    amount: Mapped[float] = mapped_column(
        Numeric(18,2),
        default=0
    )


class ReimbursementAttachment(BaseModel):
    __tablename__ = "reimbursement_attachments"

    application_id: Mapped[str] = mapped_column(
        ForeignKey(
            "reimbursement_applications.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    file_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    file_path: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
    )


class ReimbursementApproval(BaseModel):
    __tablename__ = "reimbursement_approvals"

    application_id: Mapped[str] = mapped_column(
        ForeignKey(
            "reimbursement_applications.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    workflow_step_id: Mapped[str] = mapped_column(
        ForeignKey("workflow_steps.id"),
        nullable=False,
    )

    action_by: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    approved_by: Mapped[str | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    action_at: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    action: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    remarks: Mapped[str | None] = mapped_column(
        String(1000),
    )

    application = relationship(
        "ReimbursementApplication",
    )

    workflow_step = relationship(
        "WorkflowStep",
    )


class ReimbursementPaymentLog(BaseModel):
    __tablename__ = "reimbursement_payment_logs"

    application_id: Mapped[str] = mapped_column(
        ForeignKey(
            "reimbursement_applications.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    payment_method_id: Mapped[str] = mapped_column(
        ForeignKey(
            "payment_methods.id",
        ),
        nullable=False,
    )

    payment_method = relationship(
        "PaymentMethod",
    )

    transaction_reference: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    payment_account: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    payment_amount: Mapped[float] = mapped_column(
        Numeric(18, 2),
        nullable=False,
    )

    paid_by: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    remarks: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )