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
    reimbursement_type_ids: list[str]
    module_name: str
    min_amount: float
    max_amount: float
    is_active: bool = True


class WorkflowDefinitionUpdate(BaseModel):
    name: str | None = None

    reimbursement_type_ids: list[str] | None = None

    module_name: str | None = None

    min_amount: float | None = None
    max_amount: float | None = None

    is_active: bool | None = None


class WorkflowDefinitionResponse(BaseModel):
    id: str
    name: str
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

    model_config = ConfigDict(
        from_attributes=True,
    )    

