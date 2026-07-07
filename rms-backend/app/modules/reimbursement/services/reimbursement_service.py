import uuid
from datetime import datetime
from datetime import UTC

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.reimbursement.models.reimbursement import (
    ReimbursementApplication,
    ReimbursementApplicationData,
    ReimbursementApproval,
    ReimbursementPaymentLog,
    ReimbursementExpenseItem,
    ReimbursementAttachment,
)
from app.modules.file.models.file import UploadedFile

from app.modules.reimbursement.repositories.reimbursement_repository import (
    ReimbursementRepository,
)

from app.modules.workflow.repositories.workflow_repository import (
    WorkflowRepository,
)
from app.modules.workflow.engine import (
    WorkflowEngine,
)
from app.modules.user.repositories.user_repository import (
    UserRepository,
)
from app.modules.payment_method.repositories.payment_method_repository import (
    PaymentMethodRepository,
)
from app.modules.reimbursement.schemas.reimbursement_schema import (
    ReimbursementApplicationCreate,
    ApprovalActionRequest,
    FinanceReviewRequest,
    FinancePaymentRequest,
)


class ReimbursementService:

    @staticmethod
    async def create_application(
        db: AsyncSession,
        payload: ReimbursementApplicationCreate,
        employee_id: str,
    ):

        workflow = await WorkflowRepository.get_matching_workflow_definition(
            db,
            payload.requested_amount,
        )

        if not workflow:
            raise ValueError(
                f"No workflow configured for amount {payload.requested_amount}"
            )

        employee = await UserRepository.get_user_with_profile(
            db,
            employee_id,
        )

        if not employee:
            raise ValueError(
                "Employee not found"
            )

        application = ReimbursementApplication(
            application_no=f"RMS-{uuid.uuid4().hex[:8].upper()}",
            employee_id=employee_id,
            reimbursement_type_id=payload.reimbursement_type_id,
            workflow_definition_id=workflow.id,
            requested_amount=payload.requested_amount,
            status="DRAFT",
            
        )

        application.data = ReimbursementApplicationData(
            application_type=payload.application_type,

            full_name=employee.full_name,

            email=employee.email,

            department=(
                employee.department.name
                if employee.department
                else None
            ),

            designation=(
                employee.designation.name
                if employee.designation
                else None
            ),

            journey_date=payload.journey_date,

            purpose=payload.purpose,

            attend_person=payload.attend_person,

            transportmode_name=payload.transportmode_name,

            from_location=payload.from_location,

            to_location=payload.to_location,

            transport_mode_id=payload.transport_mode_id,

            distance=payload.distance,

            project_id=payload.project_id,

            claim_date=payload.claim_date,

            remarks=payload.remarks,
            )

        for item in payload.expense_items:

            application.expense_items.append(

                ReimbursementExpenseItem(

                    expense_date=item.expense_date,

                    claim_type=item.claim_type,

                    purpose=item.purpose,

                    mode=item.mode,

                    project=item.project,

                    from_location=item.from_location,

                    to_location=item.to_location,

                    amount=item.amount,
                )
            )

        for file_id in payload.attachment_ids:

            uploaded_file = await db.get(
                UploadedFile,
                file_id,
            )

            if uploaded_file:

                application.attachments.append(

                    ReimbursementAttachment(

                        file_name=
                            uploaded_file.original_name,

                        file_path=
                            uploaded_file.storage_path,
                    )
                )
        return await ReimbursementRepository.create_application(
            db,
            application,
        )

    @staticmethod
    async def get_applications(
        db: AsyncSession,
        current_user: dict,
    ):

        if current_user.get(
            "is_superuser"
        ):
            applications = (
                await ReimbursementRepository.get_all_applications(
                    db,
                )
            )

        else:

            roles = current_user.get(
                "roles",
                [],
            )

            if "finance" in roles:

                applications = (
                    await ReimbursementRepository.get_finance_applications(
                        db,
                    )
                )

            else:

                applications = (
                    await ReimbursementRepository.get_applications_by_employee(
                        db,
                        current_user["id"],
                    )
                )

        response = []

        for app in applications:

            response.append(
                {
                    "id": app.id,
                    "application_no": app.application_no,
                    "employee_id": app.employee_id,
                    "reimbursement_type_id": app.reimbursement_type_id,
                    "workflow_definition_id": app.workflow_definition_id,
                    "status": app.status,
                    "requested_amount": float(
                        app.requested_amount or 0
                    ),
                    "verified_amount": (
                        float(app.verified_amount)
                        if app.verified_amount
                        else None
                    ),
                    "finance_adjustment_reason": app.finance_adjustment_reason,

                    "employee_name": (
                        app.employee.full_name
                        if app.employee
                        else None
                    ),

                    "department_name": (
                        app.employee.department.name
                        if app.employee
                        and app.employee.department
                        else None
                    ),

                    "designation_name": (
                        app.employee.designation.name
                        if app.employee
                        and app.employee.designation
                        else None
                    ),
                }
            )

        return response
        if current_user.get(
            "is_superuser"
        ):
            return await ReimbursementRepository.get_all_applications(
                db,
            )

        roles = current_user.get(
            "roles",
            [],
        )

        if "finance" in roles:
            return await ReimbursementRepository.get_finance_applications(
                db,
            )

        return await ReimbursementRepository.get_applications_by_employee(
            db,
            current_user["id"],
        )

    @staticmethod    
    async def get_application_by_id(
        db: AsyncSession,
        application_id: str,
        current_user: dict,
    ):
        application = (
            await ReimbursementRepository.get_application_by_id(
                db,
                application_id,
            )
        )

        if not application:
            raise ValueError(
                "Application not found"
            )

        roles = current_user.get(
            "roles",
            [],
        )

        print("CURRENT USER =>", current_user)
        print("ROLES =>", roles)

        authorized = False

        if current_user.get("is_superuser"):
            authorized = True

        elif "finance" in [
            role.lower()
            for role in roles
        ]:
            authorized = True

        elif application.employee_id == current_user["id"]:
            authorized = True

        else:

            approvals = (
                await ReimbursementRepository.get_approvals_by_user(
                    db,
                    current_user["id"],
                )
            )

            for approval in approvals:

                if approval.application_id == application_id:

                    authorized = True
                    break

            print("CURRENT USER =>", current_user)
            print("ROLES =>", roles)
            print("APPLICATION EMPLOYEE =>", application.employee_id)
            print("CURRENT USER ID =>", current_user["id"])
            print("AUTHORIZED =>", authorized)

        if not authorized:

            raise ValueError(
                "You are not authorized to view this application"
            )
                
        approvals = (
            await ReimbursementRepository.get_approvals_by_user(
                db,
                current_user["id"],
            )
        )

        for approval in approvals:
            if approval.application_id == application_id:
                attachments = []

                for item in application.attachments:

                    attachments.append(
                        {
                            "id": item.id,
                            "file_name": item.file_name,
                            "file_url": item.file_path,
                            "file_size": "",
                        }
                    )
                workflow_actions = [
                    {
                        "action_code": "APPROVE",
                        "action_name": "Approve",
                    },
                    {
                        "action_code": "REJECT",
                        "action_name": "Reject",
                    },
                    {
                        "action_code": "BACK",
                        "action_name": "Back To Previous Stage",
                    },
                    {
                        "action_code": "RETURN",
                        "action_name": "Back To Applicant",
                    },
                    {
                        "action_code": "VERIFY",
                        "action_name": "Verification",
                    },
                    {
                        "action_code": "PAY",
                        "action_name": "Payment",
                    },
                ]

                approval_history = []

                for item in application.approvals:

                    approval_history.append(
                        {
                            "stage_name": (
                                f"Step {item.workflow_step.step_order}"
                                if item.workflow_step
                                else "-"
                            ),

                            "action": item.action,

                            "user_name": (
                                application.data.full_name
                                if application.data
                                else "-"
                            ),

                            "comments": item.remarks,

                            "action_date": (
                                str(item.action_at)
                                if item.action_at
                                else ""
                            ),
                        }
                    )

                return {
                    **application.__dict__,

                    "employee_name": (
                        application.employee.full_name
                        if application.employee
                        else application.data.full_name
                        if application.data
                        else None
                    ),

                    "department_name": (
                        application.data.department
                        if application.data
                        else None
                    ),

                    "designation_name": (
                        application.data.designation
                        if application.data
                        else None
                    ),

                    "paid_amount": float(
                        application.paid_amount or 0
                    ),

                    "expense_items": [

                        {
                            "expense_date": item.expense_date,
                            "claim_type": item.claim_type,
                            "purpose": item.purpose,
                            "mode": item.mode,
                            "project": item.project,
                            "from_location": item.from_location,
                            "to_location": item.to_location,
                            "amount": float(item.amount or 0),
                        }

                        for item in application.expense_items
                    ],

                    "attachments": attachments,

                    "workflow_actions": workflow_actions,

                    "approval_history": approval_history,
                }

        raise ValueError(
            "You are not authorized to view this application"
        )
    @staticmethod
    async def submit_application(
        db: AsyncSession,
        application_id: str,
        current_user: dict,
    ):
        application = (
            await ReimbursementRepository.get_application_by_id(
                db,
                application_id,
            )
        )

        if not application:
            raise ValueError(
                "Application not found"
            )

        if application.employee_id != current_user["id"]:
            raise ValueError(
                "You are not authorized to submit this application"
            )

        if application.status != "DRAFT":
            raise ValueError(
                "Only DRAFT application can be submitted"
            )

        application.status = "SUBMITTED"

        application.submitted_at = datetime.now(
            UTC
        )

        await ReimbursementRepository.update_application(
            db,
            application,
        )

        first_step = await WorkflowEngine.get_first_step(
            db,
            application.workflow_definition_id,
        )

        if not first_step:
            raise ValueError(
                "Workflow configuration not found"
            )
        
        await WorkflowEngine.create_pending_approval(
            db,
            application,
            first_step,
        )        

        return {
            "message": "Application submitted successfully",
            "application_id": application.id,
            "status": application.status,
        }    

    @staticmethod
    async def approve_application(
        db: AsyncSession,
        application_id: str,
        payload: ApprovalActionRequest,
        current_user: dict,
    ):
        pending_approval = (
            await ReimbursementRepository.get_pending_approval(
                db,
                application_id,
                current_user["id"],
            )
        )

        if not pending_approval:
            raise ValueError(
                "No pending approval found"
            )

        if pending_approval.action_by != current_user["id"]:
            raise ValueError(
                "You are not authorized to approve this application"
            )

        application = (
            await ReimbursementRepository.get_application_by_id(
                db,
                application_id,
            )
        )

        if application.employee_id == current_user["id"]:
            raise ValueError(
                "You cannot approve your own application"
            )

        pending_approval.action = "APPROVED"

        pending_approval.approved_by = current_user["id"]

        pending_approval.action_at = datetime.now(
            UTC
        )

        pending_approval.remarks = payload.remarks

        await ReimbursementRepository.update_approval(
            db,
            pending_approval,
        )

        current_step = await WorkflowRepository.get_workflow_step_by_id(
            db,
            pending_approval.workflow_step_id,
        )

        group_context = await WorkflowEngine.get_group_context(
            db,
            current_step,
        )

        if (
            group_context
            and group_context["approval_method"] == "ANY_ONE"
        ):

            approvals = (
                await ReimbursementRepository.get_pending_approvals_by_step(
                    db,
                    application_id,
                    current_step.id,
                )
            )

            for approval in approvals:

                if (
                    approval.id != pending_approval.id
                    and approval.action == "PENDING"
                ):

                    approval.action = "SKIPPED"

                    approval.action_at = datetime.now(
                        UTC
                    )

                    approval.approved_by = current_user["id"]

                    await ReimbursementRepository.update_approval(
                        db,
                        approval,
                    )

        current_step = await WorkflowRepository.get_workflow_step_by_id(
            db,
            pending_approval.workflow_step_id,
        )

        next_step = await WorkflowEngine.get_next_step(
            db,
            current_step.workflow_id,
            current_step.step_order,
        )

        if next_step:

            print("=== ENTERED NEXT STEP BLOCK ===")
            print("Application Status Before:", application.status)

            application.status = "IN_APPROVAL"

            print("Application Status After:", application.status)

            await ReimbursementRepository.update_application(
                db,
                application,
            )

            print("=== APPLICATION UPDATED ===")

            application.status = "IN_APPROVAL"

            await ReimbursementRepository.update_application(
                db,
                application,
            )

            await WorkflowEngine.create_pending_approval(
                db,
                application,
                next_step,
            )

        else:

            await WorkflowEngine.complete_workflow(
                db,
                application,
                current_step,
            )

        return {
            "message": "Application approved successfully"
        }

    @staticmethod
    async def reject_application(
        db: AsyncSession,
        application_id: str,
        payload: ApprovalActionRequest,
        current_user: dict,
    ):
        pending_approval = (
            await ReimbursementRepository.get_pending_approval(
                db,
                application_id,
                current_user["id"],
            )
        )

        if not pending_approval:
            raise ValueError(
                "No pending approval found"
            )

        if pending_approval.action_by != current_user["id"]:
            raise ValueError(
                "You are not authorized to reject this application"
            )

        pending_approval.action = "REJECTED"

        pending_approval.approved_by = current_user["id"]

        pending_approval.action_at = datetime.now(
            UTC
        )

        pending_approval.remarks = payload.remarks

        await ReimbursementRepository.update_approval(
            db,
            pending_approval,
        )

        application = (
            await ReimbursementRepository.get_application_by_id(
                db,
                application_id,
            )
        )

        application.status = "REJECTED"

        await ReimbursementRepository.update_application(
            db,
            application,
        )

        return {
            "message": "Application rejected successfully"
        }

    @staticmethod
    async def finance_review(
        db: AsyncSession,
        application_id: str,
        payload: FinanceReviewRequest,
        current_user: dict,
    ):
        application = (
            await ReimbursementRepository.get_application_by_id(
                db,
                application_id,
            )
        )

        if not application:
            raise ValueError(
                "Application not found"
            )

        pending_approval = (
            await ReimbursementRepository.get_pending_approval(
                db,
                application_id,
                current_user["id"],
            )
        )

        if not pending_approval:
            raise ValueError(
                "No pending approval found"
            )
        
        if pending_approval.action_by != current_user["id"]:
            raise ValueError(
                "This finance review task is not assigned to you"
            )

        current_step = (
            await WorkflowRepository.get_workflow_step_by_id(
                db,
                pending_approval.workflow_step_id,
            )
        )

        if not current_step.is_finance_step:
            raise ValueError(
                "Finance review is only allowed during finance workflow step"
            )

        if application.employee_id == current_user["id"]:
            raise ValueError(
                "You cannot review your own application"
            )

        if (
            payload.verified_amount
            > application.requested_amount
        ):
            raise ValueError(
                "Verified amount cannot exceed requested amount"
            )

        pending_approval.action = "APPROVED"

        pending_approval.approved_by = current_user["id"]

        pending_approval.action_at = datetime.now(
            UTC
        )

        await ReimbursementRepository.update_approval(
            db,
            pending_approval,
        ) 

        group_context = await WorkflowEngine.get_group_context(
            db,
            current_step,
        )

        if (
            group_context
            and group_context["approval_method"] == "ANY_ONE"
        ):

            approvals = (
                await ReimbursementRepository.get_pending_approvals_by_step(
                    db,
                    application_id,
                    current_step.id,
                )
            )

            for approval in approvals:

                if (
                    approval.id != pending_approval.id
                    and approval.action == "PENDING"
                ):

                    approval.action = "SKIPPED"

                    approval.action_at = datetime.now(
                        UTC
                    )

                    approval.approved_by = current_user["id"]

                    await ReimbursementRepository.update_approval(
                        db,
                        approval,
                    )       

        application.verified_amount = (
            payload.verified_amount
        )

        application.finance_adjustment_reason = (
            payload.finance_adjustment_reason
        )

        application.reviewed_by = current_user["id"]

        application.reviewed_at = datetime.now(
            UTC
        )

        application.status = "VERIFIED"

        await ReimbursementRepository.update_application(
            db,
            application,
        )

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

        await db.commit()

        return {
            "message": "Finance review completed",
            "requested_amount": float(
                application.requested_amount
            ),
            "verified_amount": float(
                application.verified_amount
            ),
        }
 
    @staticmethod
    async def process_payment(
        db: AsyncSession,
        application_id: str,
        payload: FinancePaymentRequest,
        current_user: dict,
    ):
        application = (
            await ReimbursementRepository.get_application_by_id(
                db,
                application_id,
            )
        )

        if not application:
            raise ValueError(
                "Application not found"
            )

        payment_method = (
            await PaymentMethodRepository.get_by_id(
                db,
                payload.payment_method_id,
            )
        )

        if not payment_method:
            raise ValueError(
                "Invalid payment method"
            )

        if application.status != "VERIFIED":
            raise ValueError(
                "Only VERIFIED applications can be paid"
            )

        if application.reviewed_by is None:
            raise ValueError(
                "Finance review must be completed before payment"
            )

        pending_approval = (
            await ReimbursementRepository.get_pending_approval(
                db,
                application_id,
                current_user["id"],
            )
        )

        if not pending_approval:
            raise ValueError(
                "No pending payment approval found"
            )

        if pending_approval.action_by != current_user["id"]:
            raise ValueError(
                "This payment task is not assigned to you"
            )

        if application.employee_id == current_user["id"]:
            raise ValueError(
                "You cannot process payment for your own application"
            )
        
        payment_amount = float(
            application.verified_amount
        )

        pending_approval.action = "APPROVED"

        pending_approval.approved_by = current_user["id"]

        pending_approval.action_at = datetime.now(
            UTC
        )

        await ReimbursementRepository.update_approval(
            db,
            pending_approval,
        )

        current_step = await WorkflowRepository.get_workflow_step_by_id(
            db,
            pending_approval.workflow_step_id,
        )

        group_context = await WorkflowEngine.get_group_context(
            db,
            current_step,
        )

        if (
            group_context
            and group_context["approval_method"] == "ANY_ONE"
        ):

            approvals = (
                await ReimbursementRepository.get_pending_approvals_by_step(
                    db,
                    application_id,
                    current_step.id,
                )
            )

            for approval in approvals:

                if (
                    approval.id != pending_approval.id
                    and approval.action == "PENDING"
                ):

                    approval.action = "SKIPPED"

                    approval.action_at = datetime.now(
                        UTC
                    )

                    approval.approved_by = current_user["id"]

                    await ReimbursementRepository.update_approval(
                        db,
                        approval,
                    )

        payment_log = ReimbursementPaymentLog(
            application_id=application.id,
            payment_method_id=payment_method.id,
            transaction_reference=payload.transaction_reference,
            payment_account=payload.payment_account,
            payment_amount=payment_amount,
            paid_by=current_user["id"],
            remarks=payload.remarks,
        )

        await ReimbursementRepository.create_payment_log(
            db,
            payment_log,
        )
        application.paid_amount = payment_amount

        application.status = "PAID"

        if application.approved_at is None:

            application.approved_at = datetime.now(
                UTC
            )

        application.paid_at = datetime.now(
            UTC
        )      

        await ReimbursementRepository.update_application(
            db,
            application,
        )

        await db.commit()

        print(
            "DEBUG DETAIL =>",
            {
                "employee_name":
                    (
                        application.employee.full_name
                        if application.employee
                        else (
                            application.data.full_name
                            if application.data
                            else None
                        )
                    ),

                "department_name":
                    (
                        application.data.department
                        if application.data
                        else None
                    ),

                "designation_name":
                    (
                        application.data.designation
                        if application.data
                        else None
                    ),
            }
        )

        return {
            "message": "Payment processed successfully",
            "payment_amount": float(payment_amount),
        }

    @staticmethod
    async def get_pending_approvals(
        db: AsyncSession,
        user_id: str,
    ):
        approvals = (
            await ReimbursementRepository.get_pending_approvals_by_user(
                db,
                user_id,
            )
        )
        
        response = []

        for approval in approvals:

            application = approval.application

            response.append(
                {
                    "application_id": application.id,
                    "application_no": application.application_no,
                    "employee_id": application.employee_id,
                    "requested_amount": float(
                        application.requested_amount
                    ),
                    "status": application.status,
                }
            )

        return response