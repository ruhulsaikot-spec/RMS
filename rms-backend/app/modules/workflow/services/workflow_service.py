from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.workflow.repositories.workflow_repository import (
    WorkflowRepository,
)
from app.modules.workflow.schemas.workflow_schema import (
    ReimbursementTypeCreate,
)
from app.core.exceptions.http_exceptions import (
    NotFoundException,
)
from app.modules.expense_type.models.expense_type import ExpenseType

from app.modules.workflow.models.workflow import (
    WorkflowDefinition,
    WorkflowStep,
)
from app.modules.workflow.schemas.workflow_schema import (
    WorkflowDefinitionCreate,
    WorkflowDefinitionUpdate,
    WorkflowStepCreate,
    WorkflowStepUpdate,
)

from app.modules.workflow.schemas.workflow_schema import (
    WorkflowDefinitionUpdate,
    WorkflowStepUpdate,
)

class WorkflowService:

    @staticmethod
    async def create_reimbursement_type(
        db: AsyncSession,
        payload: ReimbursementTypeCreate,
    ):
        reimbursement_type = ExpenseType(
            code="",
            name=payload.name,
            is_active=payload.is_active,
        )

        return await WorkflowRepository.create_reimbursement_type(
            db,
            reimbursement_type,
        )

    @staticmethod
    async def get_reimbursement_types(
        db: AsyncSession,
    ):
        return await WorkflowRepository.get_reimbursement_types(
            db,
        )

    @staticmethod
    async def update_reimbursement_type(
        db: AsyncSession,
        reimbursement_type_id: str,
        payload,
    ):
        reimbursement_type = await WorkflowRepository.get_reimbursement_type_by_id(
            db,
            reimbursement_type_id,
        )

        if not reimbursement_type:
            raise NotFoundException(
                "Reimbursement Type not found"
            )

        update_data = payload.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(
                reimbursement_type,
                field,
                value,
            )

        return await WorkflowRepository.update_reimbursement_type(
            db,
            reimbursement_type,
        )

    @staticmethod
    async def delete_reimbursement_type(
        db: AsyncSession,
        reimbursement_type_id: str,
    ):
        reimbursement_type = await WorkflowRepository.get_reimbursement_type_by_id(
            db,
            reimbursement_type_id,
        )

        if not reimbursement_type:
            raise NotFoundException(
                "Reimbursement Type not found"
            )

        return await WorkflowRepository.soft_delete_reimbursement_type(
            db,
            reimbursement_type,
        )    

    @staticmethod
    async def create_workflow_definition(
        db: AsyncSession,
        payload: WorkflowDefinitionCreate,
    ):
        # 1. CREATE MAIN WORKFLOW
        workflow_definition = WorkflowDefinition(
            name=payload.name,
            module_name=payload.module_name,
            min_amount=payload.min_amount,
            max_amount=payload.max_amount,
            is_active=payload.is_active,
        )

        workflow_definition = await WorkflowRepository.create_workflow_definition(
            db,
            workflow_definition,
        )

        # 2. GET VALID REIMBURSEMENT TYPES
        existing_types = await WorkflowRepository.get_reimbursement_types(db)

        print("PAYLOAD IDS =", payload.reimbursement_type_ids)

        print("DB IDS =", [t.id for t in existing_types])

        valid_ids = {t.id for t in existing_types}

        # 3. INSERT MAPPING ONLY VALID IDS
        for reimbursement_type_id in payload.reimbursement_type_ids:

            print("CHECK =", reimbursement_type_id)

            if reimbursement_type_id not in valid_ids:
                print("INVALID =", reimbursement_type_id)
                continue

            print("INSERT =", reimbursement_type_id)

            await WorkflowRepository.create_workflow_expense_type_mapping(
                db,
                workflow_definition.id,
                reimbursement_type_id,
            )

        # 4. RELOAD FULL OBJECT (IMPORTANT FOR RESPONSE)
        workflow_definition = await WorkflowRepository.get_workflow_definition_by_id(
            db,
            workflow_definition.id,
        )

        # 5. FINAL RETURN
        return workflow_definition

    @staticmethod
    async def update_workflow_definition(
        db: AsyncSession,
        workflow_definition_id: str,
        payload: WorkflowDefinitionUpdate,
    ):
        workflow_definition = (
            await WorkflowRepository.get_workflow_definition_by_id(
                db,
                workflow_definition_id,
            )
        )

        if not workflow_definition:
            raise NotFoundException(
                "Workflow Definition not found"
            )

        update_data = payload.model_dump(
            exclude_unset=True
        )

        reimbursement_type_ids = update_data.pop(
            "reimbursement_type_ids",
            None,
        )

        for field, value in update_data.items():
            setattr(
                workflow_definition,
                field,
                value,
            )

        if reimbursement_type_ids is not None:

            await WorkflowRepository.delete_workflow_expense_type_mappings(
                db,
                workflow_definition.id,
            )

            for reimbursement_type_id in reimbursement_type_ids:

                await WorkflowRepository.create_workflow_expense_type_mapping(
                    db,
                    workflow_definition.id,
                    reimbursement_type_id,
                )

        return await WorkflowRepository.update_workflow_definition(
            db,
            workflow_definition,
        )


    @staticmethod
    async def delete_workflow_definition(
        db: AsyncSession,
        workflow_definition_id: str,
    ):
        workflow_definition = (
            await WorkflowRepository.get_workflow_definition_by_id(
                db,
                workflow_definition_id,
            )
        )

        if not workflow_definition:
            raise NotFoundException(
                "Workflow Definition not found"
            )

        return await WorkflowRepository.delete_workflow_definition(
            db,
            workflow_definition,
        )


    @staticmethod
    async def get_workflow_definitions(
        db: AsyncSession,
    ):
        workflows = (
            await WorkflowRepository.get_workflow_definitions(
                db,
            )
        )

        result = []

        for workflow in workflows:

            result.append(
                {
                    "id": workflow.id,

                    "workflowCode": workflow.id[:8].upper(),

                    "workflowName": workflow.name,

                    "claimTypes": [
                        expense.reimbursement_type.name
                        for expense in workflow.expense_types
                        if expense.reimbursement_type
                    ],

                    "workflowType": "Default",

                    "status":
                        "Active"
                        if workflow.is_active
                        else "Inactive",

                    "moduleName":
                        workflow.module_name,

                    "minAmount":
                        float(workflow.min_amount),

                    "maxAmount":
                        float(workflow.max_amount),

                    "stages": [
                        {
                            "id": step.id,
                            "workflow_id": step.workflow_id,
                            "step_order": step.step_order,

                            "stage_name": step.stage_name,

                            "approver_type": step.approver_type,

                            "approval_group_id": step.approval_group_id,

                            "approval_group_name": (
                                step.approval_group.group_name
                                if step.approval_group
                                else ""
                            ),

                            "role_id": step.role_id,
                            "user_id": step.user_id,

                            "min_approver_count": step.min_approver_count,

                            "action_type":
                                step.action_type,

                            "can_edit_amount":
                                step.can_edit_amount,

                            "is_finance_step":
                                step.is_finance_step,

                            "is_payment_step":
                                step.is_payment_step,
                        }
                        for step in workflow.steps or []
                    ],
                }
            )

        return result    
    
    @staticmethod
    async def update_workflow_step(
        db: AsyncSession,
        workflow_step_id: str,
        payload: WorkflowStepUpdate,
    ):
        workflow_step = (
            await WorkflowRepository.get_workflow_step_by_id(
                db,
                workflow_step_id,
            )
        )

        if not workflow_step:
            raise NotFoundException(
                "Workflow Step not found"
            )

        update_data = payload.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(
                workflow_step,
                field,
                value,
            )

        return await WorkflowRepository.update_workflow_step(
            db,
            workflow_step,
        )


    @staticmethod
    async def delete_workflow_step(
        db: AsyncSession,
        workflow_step_id: str,
    ):
        workflow_step = (
            await WorkflowRepository.get_workflow_step_by_id(
                db,
                workflow_step_id,
            )
        )

        if not workflow_step:
            raise NotFoundException(
                "Workflow Step not found"
            )

        return await WorkflowRepository.delete_workflow_step(
            db,
            workflow_step,
        )

    @staticmethod
    async def create_workflow_step(
        db: AsyncSession,
        payload: WorkflowStepCreate,
    ):
        workflow_step = WorkflowStep(
            workflow_id=payload.workflow_id,
            step_order=payload.step_order,

            stage_name=payload.stage_name,
            action_type=payload.action_type,

            approver_type=payload.approver_type,

            role_id=payload.role_id,
            user_id=payload.user_id,
            approval_group_id=payload.approval_group_id,

            min_approver_count=payload.min_approver_count,

            can_edit_amount=payload.can_edit_amount,
            is_finance_step=payload.is_finance_step,
            is_payment_step=payload.is_payment_step,
        )

        workflow_step = await WorkflowRepository.create_workflow_step(
            db,
            workflow_step,
        )

        return workflow_step
    
    @staticmethod
    async def get_workflow_definition(
        db: AsyncSession,
        workflow_definition_id: str,
    ):
        workflow = (
            await WorkflowRepository.get_workflow_definition_by_id(
                db,
                workflow_definition_id,
            )
        )

        if not workflow:
            raise NotFoundException(
                "Workflow Definition not found"
            )

        return {
            "id": workflow.id,

            "workflowCode": workflow.id[:8].upper(),

            "workflowName": workflow.name,

            "claimTypes": [
                expense.reimbursement_type.name
                for expense in workflow.expense_types
                if expense.reimbursement_type
            ],

            "reimbursement_type_ids": [
                expense.reimbursement_type_id
                for expense in workflow.expense_types
            ],

            "workflowType": "Default",

            "status":
                "Active"
                if workflow.is_active
                else "Inactive",

            "moduleName":
                workflow.module_name,

            "minAmount":
                float(workflow.min_amount),

            "maxAmount":
                float(workflow.max_amount),

            "stages": [
                {
                    "id": step.id,
                    "workflow_id": step.workflow_id,
                    "step_order": step.step_order,

                    "stage_name": step.stage_name,

                    "approver_type": step.approver_type,

                    "approval_group_id": step.approval_group_id,

                    "approval_group_name": (
                        step.approval_group.group_name
                        if step.approval_group
                        else ""
                    ),

                    "role_id": step.role_id,
                    "user_id": step.user_id,

                    "min_approver_count": step.min_approver_count,

                    "action_type":
                        step.action_type,

                    "can_edit_amount":
                        step.can_edit_amount,

                    "is_finance_step":
                        step.is_finance_step,

                    "is_payment_step":
                        step.is_payment_step,
                }
                for step in workflow.steps or []
            ],
        }

    @staticmethod
    async def get_workflow_steps(
        db: AsyncSession,
        workflow_id: str,
    ):
        return await WorkflowRepository.get_workflow_steps(
            db,
            workflow_id,
        )    