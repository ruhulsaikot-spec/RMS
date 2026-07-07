from sqlalchemy import select
from sqlalchemy import and_

from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.orm import (
    selectinload,
)

from app.modules.expense_type.models.expense_type import ExpenseType

from app.modules.workflow.models.workflow import (
    WorkflowDefinition,
    WorkflowDefinitionExpenseType,
    WorkflowStep,
)

from app.modules.workflow.models.approval_group import (
    ApprovalGroupMember,
)


class WorkflowRepository:

    @staticmethod
    async def get_approval_group_members(
        db: AsyncSession,
        approval_group_id: str,
    ):
        result = await db.execute(
            select(ApprovalGroupMember)
            .where(
                ApprovalGroupMember.approval_group_id
                == approval_group_id,

                ApprovalGroupMember.is_deleted
                == False,
            )
        )

        return result.scalars().all()

    @staticmethod
    async def get_primary_group_member(
        db: AsyncSession,
        approval_group_id: str,
    ):
        result = await db.execute(
            select(ApprovalGroupMember)
            .where(
                ApprovalGroupMember.approval_group_id
                == approval_group_id,

                ApprovalGroupMember.is_primary
                == True,

                ApprovalGroupMember.is_deleted
                == False,
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def create_reimbursement_type(
        db: AsyncSession,
        reimbursement_type: ExpenseType,
    ):
        db.add(reimbursement_type)

        await db.commit()
        await db.refresh(reimbursement_type)

        return reimbursement_type

    @staticmethod
    async def get_reimbursement_types(
        db: AsyncSession,
    ):
        result = await db.execute(
            select(ExpenseType).where(
                ExpenseType.is_deleted == False,
            )
        )

        return result.scalars().all()

    @staticmethod
    async def get_reimbursement_type_by_id(
        db: AsyncSession,
        reimbursement_type_id: str,
    ):
        result = await db.execute(
            select(ExpenseType).where(
                ExpenseType.id == reimbursement_type_id,
                ExpenseType.is_deleted == False,
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def update_reimbursement_type(
        db: AsyncSession,
        reimbursement_type,
    ):
        await db.commit()
        await db.refresh(reimbursement_type)

        return reimbursement_type

    @staticmethod
    async def soft_delete_reimbursement_type(
        db: AsyncSession,
        reimbursement_type,
    ):
        reimbursement_type.is_deleted = True

        await db.commit()

        return reimbursement_type    
    @staticmethod
    async def create_workflow_definition(
        db: AsyncSession,
        workflow_definition: WorkflowDefinition,
    ):
        db.add(workflow_definition)

        await db.commit()
        await db.refresh(workflow_definition)

        return workflow_definition

    @staticmethod
    async def create_workflow_expense_type_mapping(
        db: AsyncSession,
        workflow_id: str,
        reimbursement_type_id: str,
    ):
        mapping = WorkflowDefinitionExpenseType(
            workflow_id=workflow_id,
            reimbursement_type_id=reimbursement_type_id,
        )

        db.add(mapping)

        await db.commit()

        await db.refresh(mapping)

        return mapping

    @staticmethod
    async def get_workflow_definitions(
        db: AsyncSession,
    ):
        result = await db.execute(

            select(WorkflowDefinition)

            .options(

                selectinload(
                    WorkflowDefinition.expense_types
                ).selectinload(
                    WorkflowDefinitionExpenseType.reimbursement_type
                ),

                selectinload(
                    WorkflowDefinition.steps
                ).selectinload(
                    WorkflowStep.approval_group
                ),

            )

            .where(

                WorkflowDefinition.is_deleted == False,

            )

        )

        return result.scalars().unique().all()

    @staticmethod
    async def get_workflow_definition_by_id(
        db: AsyncSession,
        workflow_definition_id: str,
    ):
        result = await db.execute(

            select(WorkflowDefinition)

            .options(

                selectinload(
                    WorkflowDefinition.expense_types
                ).selectinload(
                    WorkflowDefinitionExpenseType.reimbursement_type
                ),

                selectinload(
                    WorkflowDefinition.steps
                ).selectinload(
                    WorkflowStep.approval_group
                ),
            )

            .where(

                WorkflowDefinition.id
                == workflow_definition_id,

                WorkflowDefinition.is_deleted == False,

            )

        )

        return result.scalar_one_or_none()


    @staticmethod
    async def update_workflow_definition(
        db: AsyncSession,
        workflow_definition,
    ):
        await db.commit()

        await db.refresh(
            workflow_definition
        )

        return workflow_definition


    @staticmethod
    async def delete_workflow_expense_type_mappings(
        db: AsyncSession,
        workflow_id: str,
    ):
        result = await db.execute(
            select(WorkflowDefinitionExpenseType).where(
                WorkflowDefinitionExpenseType.workflow_id == workflow_id,
            )
        )

        mappings = result.scalars().all()

        for mapping in mappings:
            await db.delete(mapping)

        await db.commit()

    @staticmethod
    async def delete_workflow_definition(
        db: AsyncSession,
        workflow_definition,
    ):
        workflow_definition.is_deleted = True

        await db.commit()

        return workflow_definition

    @staticmethod
    async def create_workflow_step(
        db: AsyncSession,
        workflow_step: WorkflowStep,
    ):
        db.add(workflow_step)

        await db.commit()
        await db.refresh(workflow_step)

        return workflow_step

    @staticmethod
    async def get_workflow_steps(
        db: AsyncSession,
        workflow_id: str,
    ):
        result = await db.execute(
            select(WorkflowStep).where(
                WorkflowStep.workflow_id == workflow_id,
                WorkflowStep.is_deleted == False,
            )
        )

        return result.scalars().all()


    @staticmethod
    async def get_workflow_step_by_id(
        db: AsyncSession,
        workflow_step_id: str,
    ):
        result = await db.execute(
            select(WorkflowStep).where(
                WorkflowStep.id == workflow_step_id,
                WorkflowStep.is_deleted == False,
            )
        )

        return result.scalar_one_or_none()


    @staticmethod
    async def update_workflow_step(
        db: AsyncSession,
        workflow_step,
    ):
        await db.commit()

        await db.refresh(
            workflow_step
        )

        return workflow_step


    @staticmethod
    async def delete_workflow_step(
        db: AsyncSession,
        workflow_step,
    ):
        workflow_step.is_deleted = True

        await db.commit()

        return workflow_step    
    @staticmethod
    async def get_matching_workflow_definition(
        db: AsyncSession,
        amount: float,
    ):
        result = await db.execute(
            select(WorkflowDefinition).where(
                WorkflowDefinition.min_amount
                <= amount,

                WorkflowDefinition.max_amount
                >= amount,

                WorkflowDefinition.is_active == True,

                WorkflowDefinition.is_deleted == False,
            )
        )

        return result.scalar_one_or_none()  

    @staticmethod
    async def get_first_workflow_step(
        db: AsyncSession,
        workflow_id: str,
    ):
        result = await db.execute(
            select(WorkflowStep)
            .where(
                WorkflowStep.workflow_id == workflow_id,
                WorkflowStep.is_deleted == False,
            )
            .order_by(
                WorkflowStep.step_order.asc()
            )
        )

        return result.scalars().first()  

    @staticmethod
    async def get_workflow_steps_by_workflow_id(
        db: AsyncSession,
        workflow_id: str,
    ):
        result = await db.execute(
            select(WorkflowStep)
            .where(
                WorkflowStep.workflow_id == workflow_id,
                WorkflowStep.is_deleted == False,
            )
            .order_by(
                WorkflowStep.step_order
            )
        )

        return result.scalars().all()

    @staticmethod
    async def get_next_workflow_step(
        db: AsyncSession,
        workflow_id: str,
        current_step_order: int,
    ):
        result = await db.execute(
            select(WorkflowStep)
            .where(
                WorkflowStep.workflow_id == workflow_id,
                WorkflowStep.step_order
                > current_step_order,
                WorkflowStep.is_deleted == False,
            )
            .order_by(
                WorkflowStep.step_order.asc()
            )
        )

        return result.scalars().first()
    