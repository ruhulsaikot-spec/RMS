from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.modules.workflow.services.workflow_service import (
    WorkflowService,
)
from app.modules.workflow.schemas.workflow_schema import (
    ReimbursementTypeCreate,
    ReimbursementTypeUpdate,
    ReimbursementTypeResponse,
    WorkflowDefinitionCreate,
    WorkflowDefinitionResponse,
    WorkflowStepCreate,
    WorkflowStepResponse,
)

from app.modules.workflow.schemas.workflow_schema import (
    WorkflowDefinitionUpdate,
    WorkflowStepUpdate,
)

router = APIRouter(
    prefix="/workflow",
    tags=["Workflow"],
)


@router.post(
    "/reimbursement-types",
    response_model=ReimbursementTypeResponse,
)
async def create_reimbursement_type(
    payload: ReimbursementTypeCreate,
    db: AsyncSession = Depends(get_db),
):
    return await WorkflowService.create_reimbursement_type(
        db,
        payload,
    )


@router.get(
    "/reimbursement-types",
    response_model=list[ReimbursementTypeResponse],
)
async def get_reimbursement_types(
    db: AsyncSession = Depends(get_db),
):
    return await WorkflowService.get_reimbursement_types(
        db,
    )
@router.put(
    "/reimbursement-types/{reimbursement_type_id}",
    response_model=ReimbursementTypeResponse,
)
async def update_reimbursement_type(
    reimbursement_type_id: str,
    payload: ReimbursementTypeUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await WorkflowService.update_reimbursement_type(
        db,
        reimbursement_type_id,
        payload,
    )


@router.delete(
    "/reimbursement-types/{reimbursement_type_id}",
)
async def delete_reimbursement_type(
    reimbursement_type_id: str,
    db: AsyncSession = Depends(get_db),
):
    await WorkflowService.delete_reimbursement_type(
        db,
        reimbursement_type_id,
    )

    return {
        "message": "Reimbursement Type deleted successfully"
    } 
@router.post(
    "/definitions",
)
async def create_workflow_definition(
    payload: WorkflowDefinitionCreate,
    db: AsyncSession = Depends(get_db),
):

    print("========== WORKFLOW PAYLOAD ==========")
    print(payload.model_dump())
    print("======================================")

    return await WorkflowService.create_workflow_definition(
        db,
        payload,
    )


@router.get(
    "/definitions",
)
async def get_workflow_definitions(
    db: AsyncSession = Depends(get_db),
):
    return await WorkflowService.get_workflow_definitions(
        db,
    )

@router.get(
    "/definitions/{workflow_definition_id}",
)
async def get_workflow_definition(
    workflow_definition_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await WorkflowService.get_workflow_definition(
        db,
        workflow_definition_id,
    )  
@router.post(
    "/steps",
    response_model=WorkflowStepResponse,
)
async def create_workflow_step(
    payload: WorkflowStepCreate,
    db: AsyncSession = Depends(get_db),
):
    return await WorkflowService.create_workflow_step(
        db,
        payload,
    )


@router.get(
    "/definitions/{workflow_id}/steps",
    response_model=list[WorkflowStepResponse],
)
async def get_workflow_steps(
    workflow_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await WorkflowService.get_workflow_steps(
        db,
        workflow_id,
    )

@router.put(
    "/definitions/{workflow_definition_id}",
)
async def update_workflow_definition(
    workflow_definition_id: str,
    payload: WorkflowDefinitionUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await WorkflowService.update_workflow_definition(
        db,
        workflow_definition_id,
        payload,
    )


@router.delete(
    "/definitions/{workflow_definition_id}",
)
async def delete_workflow_definition(
    workflow_definition_id: str,
    db: AsyncSession = Depends(get_db),
):
    await WorkflowService.delete_workflow_definition(
        db,
        workflow_definition_id,
    )

    return {
        "message": "Workflow Definition deleted successfully"
    }

@router.put(
    "/steps/{workflow_step_id}",
    response_model=WorkflowStepResponse,
)
async def update_workflow_step(
    workflow_step_id: str,
    payload: WorkflowStepUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await WorkflowService.update_workflow_step(
        db,
        workflow_step_id,
        payload,
    )


@router.delete(
    "/steps/{workflow_step_id}",
)
async def delete_workflow_step(
    workflow_step_id: str,
    db: AsyncSession = Depends(get_db),
):
    await WorkflowService.delete_workflow_step(
        db,
        workflow_step_id,
    )

    return {
        "message": "Workflow Step deleted successfully"
    } 