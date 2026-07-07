from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.user.repositories.user_repository import (
    UserRepository,
)

from app.modules.workflow.repositories.workflow_repository import (
    WorkflowRepository,
)
from app.modules.workflow.repositories.approval_group_repository import (
    ApprovalGroupRepository,
)

from app.modules.reimbursement.models.reimbursement import (
    ReimbursementApproval,
)

from app.modules.reimbursement.repositories.reimbursement_repository import (
    ReimbursementRepository,
)

from datetime import UTC, datetime

from app.modules.workflow.models.workflow import (
    WorkflowStep,
)


class WorkflowEngine:

    @staticmethod
    async def resolve_step_assignee(
        db: AsyncSession,
        step,
        application,
    ):

        if step.approver_type == "LINE_MANAGER":

            employee = await UserRepository.get_by_id(
                db,
                application.employee_id,
            )

            if not employee.manager_id:
                raise ValueError(
                    "Employee manager is not configured"
                )

            return employee.manager_id

        elif step.approver_type == "ROLE":

            role_user = await UserRepository.get_user_by_role(
                db,
                step.role_id,
            )

            if not role_user:
                raise ValueError(
                    "No user found for workflow role"
                )

            return role_user.id

        elif step.approver_type == "USER":

            if not step.user_id:
                raise ValueError(
                    "Workflow user is not configured"
                )

            return step.user_id

        elif step.approver_type == "GROUP":

            primary_member = (
                await WorkflowRepository.get_primary_group_member(
                    db,
                    step.approval_group_id,
                )
            )

            if not primary_member:
                raise ValueError(
                    "Primary approver not configured"
                )

            return primary_member.user_id

        raise ValueError(
            f"Unsupported approver type: {step.approver_type}"
        )

    @staticmethod
    async def resolve_group(
        db: AsyncSession,
        approval_group_id: str,
    ):

        group = (
            await ApprovalGroupRepository.get_approval_group_by_id(
                db,
                approval_group_id,
            )
        )

        if not group:
            raise ValueError(
                "Approval group not found"
            )

        members = (
            await ApprovalGroupRepository.get_members_by_group(
                db,
                approval_group_id,
            )
        )

        primary = next(
            (
                member
                for member in members
                if member.is_primary
            ),
            None,
        )

        return {
            "group": group,
            "members": members,
            "primary": primary,
        }

    @staticmethod
    async def create_pending_approval(
        db: AsyncSession,
        application,
        workflow_step,
    ):

        print(
            "DEBUG =>",
            workflow_step.step_order,
            workflow_step.approver_type,
        )

        assigned_user_id = (
            await WorkflowEngine.resolve_step_assignee(
                db,
                workflow_step,
                application,
            )
        )

        group_context = await WorkflowEngine.get_group_context(
            db,
            workflow_step,
        )

        if (
            workflow_step.approver_type == "GROUP"
            and group_context
        ):

            print(
                "DEBUG GROUP =>",
                group_context["approval_method"],
                len(group_context["members"]),
            )

            if (
                group_context["approval_method"]
                == "ANY_ONE"
            ):

                approvals = []

                for member in group_context["members"]:

                    print(
                        "Creating approval for",
                        member.user_id,
                    )

                    approval = ReimbursementApproval(
                        application_id=application.id,
                        workflow_step_id=workflow_step.id,
                        action_by=member.user_id,
                        action="PENDING",
                    )

                    await ReimbursementRepository.create_approval(
                        db,
                        approval,
                    )

                    approvals.append(
                        approval
                    )

                return approvals

        approval = ReimbursementApproval(
            application_id=application.id,
            workflow_step_id=workflow_step.id,
            action_by=assigned_user_id,
            action="PENDING",
        )

        await ReimbursementRepository.create_approval(
            db,
            approval,
        )

        return approval

    @staticmethod
    async def get_first_step(
        db: AsyncSession,
        workflow_definition_id: str,
    ):
        return await WorkflowRepository.get_first_workflow_step(
            db,
            workflow_definition_id,
        )

    @staticmethod
    async def get_next_step(
        db: AsyncSession,
        workflow_id: str,
        current_step_order: int,
    ):
        return await WorkflowRepository.get_next_workflow_step(
            db,
            workflow_id,
            current_step_order,
        )

    @staticmethod
    async def advance_workflow(
        db: AsyncSession,
        application,
        current_step,
    ):

        next_step = await WorkflowEngine.get_next_step(
            db,
            current_step.workflow_id,
            current_step.step_order,
        )

        if next_step:

            await WorkflowEngine.create_pending_approval(
                db,
                application,
                next_step,
            )

            return

        await WorkflowEngine.complete_workflow(
            db,
            application,
            current_step,
        )

    @staticmethod
    async def get_group_context(
        db: AsyncSession,
        workflow_step,
    ):

        if workflow_step.approver_type != "GROUP":
            return None

        group = await ApprovalGroupRepository.get_approval_group_by_id(
            db,
            workflow_step.approval_group_id,
        )

        members = await ApprovalGroupRepository.get_members_by_group(
            db,
            workflow_step.approval_group_id,
        )

        return {
            "group": group,
            "members": members,
            "approval_method": group.approval_method,
            "member_count": len(members),
        }

    @staticmethod
    async def complete_workflow(
        db: AsyncSession,
        application,
        current_step,
    ):

        if current_step.is_payment_step:

            application.status = "PAYMENT_PENDING"

        else:

            application.status = "APPROVED"

            application.approved_at = datetime.now(
                UTC
            )

        await ReimbursementRepository.update_application(
            db,
            application,
        )