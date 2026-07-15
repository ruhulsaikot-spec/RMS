from fastapi import APIRouter
from fastapi import Depends
from app.auth.dependencies import (
    CurrentUser,
    get_current_user,
)

from app.auth.permissions import (
    can_process_payment,
)
from app.auth.dependencies import (
    require_permission,
)

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.modules.reimbursement.services.reimbursement_service import (
    ReimbursementService,
)

from app.modules.reimbursement.schemas.reimbursement_schema import (
    ReimbursementApplicationCreate,
    ReimbursementApplicationResponse,
    ReimbursementApplicationDetailResponse,
    ReimbursementApplicationUpdate,
    ApprovalActionRequest,
    PendingApprovalResponse,
    FinanceReviewRequest,
    FinancePaymentRequest,
)

router = APIRouter(
    prefix="/reimbursements",
    tags=["Reimbursements"],
)


@router.post(
    "",
    response_model=ReimbursementApplicationResponse,
)
async def create_reimbursement_application(
    payload: ReimbursementApplicationCreate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.create_application(
        db=db,
        payload=payload,
        employee_id=current_user["id"],
    )

@router.get(
    "",
    response_model=list[ReimbursementApplicationResponse],
)
async def get_reimbursement_applications(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.get_applications(
        db,
        current_user,
    )

@router.get(
    "/my-actions",
)
async def get_my_actions(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.get_my_actions(
        db=db,
        user_id=current_user["id"],
    )

@router.get(
    "/pending-approvals",
    response_model=list[
        PendingApprovalResponse
    ],
)
async def get_pending_approvals(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.get_pending_approvals(
        db,
        user_id=current_user["id"],
    )

@router.get(
    "/{application_id}",
    response_model=ReimbursementApplicationDetailResponse,
)
async def get_reimbursement_application_by_id(
    application_id: str,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.get_application_by_id(
        db,
        application_id,
        current_user,
    )

@router.delete(
    "/{application_id}",
)
async def delete_reimbursement_application(
    application_id: str,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.delete_application(
        db=db,
        application_id=application_id,
        employee_id=current_user["id"],
    )

@router.put(
    "/{application_id}",
)
async def update_reimbursement_application(
    application_id: str,
    payload: ReimbursementApplicationUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.update_application(
        db=db,
        application_id=application_id,
        payload=payload,
        employee_id=current_user["id"],
    )

@router.post(
    "/{application_id}/back-to-previous-stage",
)
async def back_to_previous_stage(
    application_id: str,
    payload: ApprovalActionRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.back_to_previous_stage(
        db=db,
        application_id=application_id,
        payload=payload,
        current_user=current_user,
    )

@router.post(
    "/{application_id}/return-to-applicant",
)
async def return_to_applicant(
    application_id: str,
    payload: ApprovalActionRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.return_to_applicant(
        db=db,
        application_id=application_id,
        payload=payload,
        current_user=current_user,
    )

@router.post(
    "/{application_id}/submit",
)
async def submit_reimbursement_application(
    application_id: str,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.submit_application(
        db,
        application_id,
        current_user,
    )

@router.post(
    "/{application_id}/approve",
)
async def approve_reimbursement_application(
    application_id: str,
    payload: ApprovalActionRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.approve_application(
        db,
        application_id,
        payload,
        current_user,
    )

@router.post(
    "/{application_id}/finance-review",
)
async def finance_review(
    application_id: str,
    payload: FinanceReviewRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.finance_review(
        db,
        application_id,
        payload,
        current_user,
    )

@router.post(
    "/{application_id}/pay",
    dependencies=[
        Depends(
            require_permission(
                "reimbursement:pay"
            )
        )
    ],
)
async def process_payment(
    application_id: str,
    payload: FinancePaymentRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.process_payment(
        db,
        application_id,
        payload,
        current_user,
    )

@router.post(
    "/{application_id}/reject",
)
async def reject_reimbursement_application(
    application_id: str,
    payload: ApprovalActionRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    return await ReimbursementService.reject_application(
        db,
        application_id,
        payload,
        current_user,
    )