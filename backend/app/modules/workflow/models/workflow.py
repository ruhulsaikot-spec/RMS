from sqlalchemy import (
    String,
    Boolean,
    Integer,
    Numeric,
    ForeignKey,
    JSON,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.modules.expense_type.models.expense_type import ExpenseType

from app.models.base import BaseModel


__all__ = [
    "WorkflowDefinition",
    "WorkflowDefinitionExpenseType",
    "WorkflowStep",
]

class WorkflowDefinition(BaseModel):
    __tablename__ = "workflow_definitions"

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    module_name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    company_id: Mapped[str | None] = mapped_column(
        ForeignKey("companies.id"),
        nullable=True,
    )

    company = relationship(
        "Company",
    )

    min_amount: Mapped[float] = mapped_column(
        Numeric(18, 2),
        default=0,
    )

    max_amount: Mapped[float] = mapped_column(
        Numeric(18, 2),
        default=999999999,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    expense_types = relationship(
        "WorkflowDefinitionExpenseType",
        back_populates="workflow",
        cascade="all, delete-orphan",
    )

    steps = relationship(
        "WorkflowStep",
        back_populates="workflow",
        cascade="all, delete-orphan",
        order_by="WorkflowStep.step_order",
    )

class WorkflowDefinitionExpenseType(BaseModel):
    __tablename__ = "workflow_definition_expense_types"

    workflow_id: Mapped[str] = mapped_column(
        ForeignKey("workflow_definitions.id"),
        nullable=False,
    )

    reimbursement_type_id: Mapped[str] = mapped_column(
        ForeignKey("expense_types.id"),
        nullable=False,
    )

    workflow = relationship(
        "WorkflowDefinition",
        back_populates="expense_types",
    )

    reimbursement_type = relationship(
        ExpenseType,
    )


class WorkflowStep(BaseModel):
    __tablename__ = "workflow_steps"

    workflow_id: Mapped[str] = mapped_column(
        ForeignKey("workflow_definitions.id"),
        nullable=False,
    )

    step_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    stage_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    action_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Approval",
    )

    # MANAGER / ROLE / USER / GROUP / FINANCE
    approver_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    approval_group_id: Mapped[str | None] = mapped_column(
        ForeignKey("approval_groups.id"),
        nullable=True,
    )

    approval_group = relationship(
        "ApprovalGroup"
    )

    min_approver_count: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    role_id: Mapped[str | None] = mapped_column(
        ForeignKey("roles.id"),
        nullable=True,
    )

    user_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    can_edit_amount: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    is_finance_step: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    is_payment_step: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    email_notification: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    in_app_notification: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    sla_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    sla_hours: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    escalation_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    escalation_hours: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    escalation_group: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    allowed_actions: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    remarks_required: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    applicant_notification: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    role = relationship(
        "Role",
    )
    approval_group = relationship(
        "ApprovalGroup",
    )

    workflow = relationship(
        "WorkflowDefinition",
        back_populates="steps",
    )