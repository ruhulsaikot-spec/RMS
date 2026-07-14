from pydantic import BaseModel
from pydantic import ConfigDict


class ReimbursementTypeCreate(BaseModel):
    name: str
    description: str | None = None
    is_active: bool = True


class ReimbursementTypeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None


class ReimbursementTypeResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True,
    )
class WorkflowDefinitionCreate(BaseModel):
    name: str
    company_id: str
    reimbursement_type_ids: list[str]
    module_name: str
    min_amount: float
    max_amount: float
    is_active: bool = True


class WorkflowDefinitionUpdate(BaseModel):
    name: str | None = None

    company_id: str | None = None

    reimbursement_type_ids: list[str] | None = None

    module_name: str | None = None

    min_amount: float | None = None
    max_amount: float | None = None

    is_active: bool | None = None


class WorkflowDefinitionResponse(BaseModel):
    id: str
    name: str
    company_id: str | None = None
    reimbursement_type_ids: list[str]
    module_name: str
    min_amount: float
    max_amount: float
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True,
    )
class WorkflowStepCreate(BaseModel):
    workflow_id: str

    step_order: int

    stage_name: str

    action_type: str

    # ROLE
    # USER
    # LINE_MANAGER
    approver_type: str

    role_id: str | None = None
    user_id: str | None = None

    approval_group_id: str | None = None

    min_approver_count: int = 1

    can_edit_amount: bool = False

    is_finance_step: bool = False

    is_payment_step: bool = False

    email_notification: bool = True

    in_app_notification: bool = True

    sla_enabled: bool = False

    sla_hours: int | None = None

    escalation_enabled: bool = False

    escalation_hours: int | None = None

    escalation_group: str | None = None

    allowed_actions: list[str] | None = None

    remarks_required: dict | None = None

    applicant_notification: dict | None = None


class WorkflowStepUpdate(BaseModel):
    step_order: int | None = None

    stage_name: str | None = None

    action_type: str | None = None

    approver_type: str | None = None

    role_id: str | None = None
    user_id: str | None = None

    approval_group_id: str | None = None

    min_approver_count: int | None = None

    can_edit_amount: bool | None = None

    is_finance_step: bool | None = None

    is_payment_step: bool | None = None

    email_notification: bool | None = None

    in_app_notification: bool | None = None

    sla_enabled: bool | None = None

    sla_hours: int | None = None

    escalation_enabled: bool | None = None

    escalation_hours: int | None = None

    escalation_group: str | None = None

    allowed_actions: list[str] | None = None

    remarks_required: dict | None = None

    applicant_notification: dict | None = None


class WorkflowStepResponse(BaseModel):
    id: str

    workflow_id: str

    step_order: int

    stage_name: str

    action_type: str

    approver_type: str

    role_id: str | None = None

    user_id: str | None = None

    approval_group_id: str | None = None

    min_approver_count: int | None = None

    can_edit_amount: bool

    is_finance_step: bool

    is_payment_step: bool

    email_notification: bool

    in_app_notification: bool

    sla_enabled: bool

    sla_hours: int | None = None

    escalation_enabled: bool

    escalation_hours: int | None = None

    escalation_group: str | None = None

    allowed_actions: list[str] | None = None

    remarks_required: dict | None = None

    applicant_notification: dict | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )    

