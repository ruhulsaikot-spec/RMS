from datetime import date

from pydantic import BaseModel
from pydantic import ConfigDict

class ExpenseItemCreate(BaseModel):

    expense_date: date | None = None

    claim_type: str | None = None

    purpose: str | None = None

    mode: str | None = None

    project: str | None = None

    from_location: str | None = None

    to_location: str | None = None

    amount: float = 0

class ReimbursementApplicationCreate(BaseModel):

    reimbursement_type_id: str
    requested_amount: float

    application_type: str | None = None

    full_name: str | None = None

    email: str | None = None

    department: str | None = None

    designation: str | None = None

    journey_date: date | None = None

    purpose: str | None = None

    attend_person: str | None = None

    transportmode_name: str | None = None

    from_location: str | None = None

    to_location: str | None = None

    transport_mode_id: str | None = None

    distance: float | None = None

    project_id: str | None = None

    project_name: str | None = None

    claim_date: date | None = None

    remarks: str | None = None

    invoice_attachment: str | None = None

    full_name: str | None = None

    email: str | None = None

    department: str | None = None

    designation: str | None = None

    invoice_attachment: str | None = None

    expense_items: list[ExpenseItemCreate] = []

    attachment_ids: list[str] = []


class ReimbursementApplicationResponse(BaseModel):

    id: str

    application_no: str

    employee_id: str

    reimbursement_type_id: str

    workflow_definition_id: str

    status: str

    requested_amount: float

    verified_amount: float | None = None

    paid_amount: float | None = None

    finance_adjustment_reason: str | None = None

    employee_name: str | None = None

    department_name: str | None = None

    designation_name: str | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )

class ReimbursementApplicationDataResponse(BaseModel):

    application_type: str | None = None

    full_name: str | None = None

    email: str | None = None

    department: str | None = None

    designation: str | None = None

    journey_date: date | None = None

    purpose: str | None = None

    attend_person: str | None = None

    transportmode_name: str | None = None

    from_location: str | None = None

    to_location: str | None = None

    transport_mode_id: str | None = None

    distance: float | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )


class AttachmentResponse(BaseModel):

    id: str | None = None

    file_name: str | None = None

    file_url: str | None = None

    file_size: str | None = None


class WorkflowActionResponse(BaseModel):

    action_code: str

    action_name: str


class ApprovalHistoryResponse(BaseModel):

    stage_name: str | None = None

    action: str | None = None

    user_name: str | None = None

    comments: str | None = None

    action_date: str | None = None


class ReimbursementApplicationDetailResponse(
    ReimbursementApplicationResponse
):

    employee_name: str | None = None

    department_name: str | None = None

    designation_name: str | None = None

    data: ReimbursementApplicationDataResponse | None = None

    attachments: list[AttachmentResponse] = []

    workflow_actions: list[
        WorkflowActionResponse
    ] = []

    approval_history: list[
        ApprovalHistoryResponse
    ] = []

    model_config = ConfigDict(
        from_attributes=True,
    )
class ApprovalActionRequest(BaseModel):

    remarks: str | None = None

class FinanceReviewRequest(BaseModel):

    verified_amount: float

    finance_adjustment_reason: str | None = None

class ApprovalActionRequest(BaseModel):

    remarks: str | None = None

class PendingApprovalResponse(BaseModel):

    application_id: str

    application_no: str

    employee_id: str

    requested_amount: float

    status: str

    model_config = ConfigDict(
        from_attributes=True,
    )

class FinancePaymentRequest(BaseModel):

    payment_method_id: str

    transaction_reference: str | None = None

    payment_account: str | None = None

    payment_amount: float

    remarks: str | None = None