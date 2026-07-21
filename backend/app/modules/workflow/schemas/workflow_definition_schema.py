from pydantic import BaseModel


class WorkflowStepCreate(BaseModel):
    step_order: int
    approver_type: str
    role_id: str | None = None


class WorkflowDefinitionCreate(BaseModel):
    name: str
    module_name: str
    reimbursement_type_id: str
    min_amount: float
    max_amount: float
    is_active: bool = True

    steps: list[WorkflowStepCreate]


class WorkflowDefinitionResponse(BaseModel):
    id: str
    name: str
    module_name: str
    reimbursement_type_id: str
    min_amount: float
    max_amount: float
    is_active: bool

    class Config:
        from_attributes = True