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
    async def _generate_application_no(db: AsyncSession) -> str:
        from sqlalchemy import text
        now = datetime.now(UTC)
        prefix = f"CLM-{now.strftime('%y%m')}"
        result = await db.execute(
            text(
                "SELECT COUNT(*) FROM reimbursement_applications "
                "WHERE application_no LIKE :prefix"
            ),
            {"prefix": f"{prefix}%"},
        )
        count = result.scalar() or 0
        serial = str(count + 1).zfill(4)
        return f"{prefix}{serial}"

    @staticmethod
    async def create_application(
        db: AsyncSession,
        payload: ReimbursementApplicationCreate,
        employee_id: str,
    ):

        expense_type_ids = list(set([
            item.claim_type
            for item in payload.expense_items
            if item.claim_type
        ]))

        workflow = await WorkflowRepository.get_matching_workflow_definition(
            db,
            payload.requested_amount,
            expense_type_ids,
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
            application_no=await ReimbursementService._generate_application_no(db),
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

                finance_applications = (
                    await ReimbursementRepository.get_finance_applications(
                        db,
                    )
                )

                own_applications = (
                    await ReimbursementRepository.get_applications_by_employee(
                        db,
                        current_user["id"],
                    )
                )

                seen_ids = set()
                applications = []
                for app in finance_applications + own_applications:
                    if app.id not in seen_ids:
                        seen_ids.add(app.id)
                        applications.append(app)

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
                    "created_at": app.created_at.isoformat() if app.created_at else None,
                    "claim_types": list(set([
                        item.claim_type
                        for item in (getattr(app, 'expense_items', None) or [])
                        if item.claim_type
                    ])),
                    "claim_types_debug": str([(item.claim_type, item.id) for item in (getattr(app, 'expense_items', None) or [])]),
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
            applications = await ReimbursementRepository.get_all_applications(
                db,
            )

        else:

            roles = current_user.get(
                "roles",
                [],
            )

            if "finance" in roles:

                finance_applications = await ReimbursementRepository.get_finance_applications(
                    db,
                )

                own_applications = await ReimbursementRepository.get_applications_by_employee(
                    db,
                    current_user["id"],
                )

                seen_ids = set()
                applications = []
                for app in finance_applications + own_applications:
                    if app.id not in seen_ids:
                        seen_ids.add(app.id)
                        applications.append(app)

            else:

                applications = await ReimbursementRepository.get_applications_by_employee(
                    db,
                    current_user["id"],
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
                    "requested_amount": float(app.requested_amount or 0),
                    "verified_amount": float(app.verified_amount) if app.verified_amount else None,
                    "finance_adjustment_reason": app.finance_adjustment_reason,
                    "created_at": app.created_at.isoformat() if app.created_at else None,
                    "claim_types": list(set([
                        item.claim_type
                        for item in (getattr(app, 'expense_items', None) or [])
                        if item.claim_type
                    ])) if getattr(app, 'expense_items', None) else [],
                    "employee_name": app.employee.full_name if app.employee else None,
                    "department_name": app.employee.department.name if app.employee and app.employee.department else None,
                    "designation_name": app.employee.designation.name if app.employee and app.employee.designation else None,
                }
            )

        return response

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
        action_name_map = {
            "APPROVE": "Approve",
            "REJECT": "Reject",
            "FINAL_REJECT": "Reject",
            "BACK_TO_PREVIOUS_STAGE": "Back To Previous Stage",
            "RETURN_TO_APPLICANT": "Back To Applicant",
            "VERIFY": "Verify Amount",
            "PAY": "Payment",
        }

        action_code_map = {
            "APPROVE": "APPROVE",
            "REJECT": "REJECT",
            "FINAL_REJECT": "REJECT",
            "BACK_TO_PREVIOUS_STAGE": "BACK",
            "RETURN_TO_APPLICANT": "RETURN",
            "VERIFY": "VERIFY",
            "PAY": "PAY",
        }

        # Get allowed actions from current pending approval step
        from sqlalchemy import select as sa_select_wa
        from app.modules.reimbursement.models.reimbursement import ReimbursementApproval as RA
        pending_result = await db.execute(
            sa_select_wa(RA)
            .options(
                __import__('sqlalchemy.orm', fromlist=['selectinload']).selectinload(RA.workflow_step)
            )
            .where(
                RA.application_id == application_id,
                RA.action == "PENDING",
            )
        )
        pending = pending_result.scalar_one_or_none()

        if pending and pending.workflow_step and pending.workflow_step.allowed_actions:
            allowed = pending.workflow_step.allowed_actions
            workflow_actions = [
                {
                    "action_code": action_code_map.get(a, a),
                    "action_name": action_name_map.get(a, a),
                }
                for a in allowed
                if a in action_name_map
            ]

        else:
            workflow_actions = []

        approval_history = []
        for log in (application.activity_logs or []):
            approval_history.append(
                {
                    "stage_name": log.action,
                    "action": log.action,
                    "user_name": log.actor_name or "-",
                    "comments": log.remarks,
                    "action_date": log.action_at.isoformat() if log.action_at else "",
                }
            )

        data_obj = application.data
        return {
            "id": application.id,
            "application_no": application.application_no,
            "employee_id": application.employee_id,
            "reimbursement_type_id": application.reimbursement_type_id,
            "workflow_definition_id": application.workflow_definition_id,
            "status": application.status,
            "requested_amount": float(application.requested_amount or 0),
            "verified_amount": float(application.verified_amount) if application.verified_amount else None,
            "paid_amount": float(application.paid_amount or 0),
            "finance_adjustment_reason": application.finance_adjustment_reason,
            "created_at": application.created_at.isoformat() if application.created_at else None,
            "data": {
                "application_type": data_obj.application_type if data_obj else None,
                "full_name": data_obj.full_name if data_obj else None,
                "email": data_obj.email if data_obj else None,
                "department": data_obj.department if data_obj else None,
                "designation": data_obj.designation if data_obj else None,
                "purpose": data_obj.purpose if data_obj else None,
                "remarks": data_obj.remarks if data_obj else None,
            } if data_obj else None,
            "employee_name": (
                application.employee.full_name
                if application.employee
                else application.data.full_name
                if application.data
                else None
            ),
            "employee_email": (
                application.employee.email
                if application.employee
                else application.data.email
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
            "paid_amount": float(application.paid_amount or 0),
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
        

    @staticmethod
    async def delete_application(
        db: AsyncSession,
        application_id: str,
        employee_id: str,
    ):
        application = await ReimbursementRepository.get_application_by_id(
            db, application_id
        )

        if not application:
            raise ValueError("Application not found")

        if application.employee_id != employee_id:
            raise ValueError("You are not authorized to delete this application")

        if application.status != "DRAFT":
            raise ValueError("Only DRAFT applications can be deleted")

        application.is_deleted = True

        await db.commit()

        return {"message": "Application deleted successfully"}

    @staticmethod
    async def update_application(
        db: AsyncSession,
        application_id: str,
        payload: any,
        employee_id: str,
    ):
        from sqlalchemy import delete as sa_delete
        from app.modules.reimbursement.models.reimbursement import ReimbursementExpenseItem, ReimbursementAttachment
        from app.modules.file.models.file import UploadedFile

        application = await ReimbursementRepository.get_application_by_id(
            db, application_id
        )

        print(f"UPDATE: application found={application is not None}, employee_id={employee_id}")
        if not application:
            raise ValueError("Application not found")
        print(f"UPDATE: app.employee_id={application.employee_id}, employee_id={employee_id}, match={application.employee_id == employee_id}")
        if application.employee_id != employee_id:
            raise ValueError("You are not authorized to update this application")
        print(f"UPDATE: status={application.status}")
        if application.status != "DRAFT":
            raise ValueError("Only DRAFT applications can be updated")
        print(f"UPDATE PAYLOAD: attachment_ids={payload.attachment_ids}, expense_items count={len(payload.expense_items)}")

        if payload.requested_amount is not None:
            application.requested_amount = payload.requested_amount

        if payload.remarks is not None:
            if application.data:
                application.data.remarks = payload.remarks

        # Delete existing expense items
        await db.execute(
            sa_delete(ReimbursementExpenseItem).where(
                ReimbursementExpenseItem.application_id == application_id
            )
        )

        if payload.existing_attachment_paths or payload.attachment_ids:
            await db.execute(
                sa_delete(ReimbursementAttachment).where(
                    ReimbursementAttachment.application_id == application_id
                )
            )

        # Only update attachments if there are changes
        if payload.existing_attachment_paths or payload.attachment_ids:
            # Re-add existing attachments that were not deleted
            for existing_att in payload.existing_attachment_paths:
                attachment = ReimbursementAttachment(
                    application_id=application_id,
                    file_name=existing_att.get("file_name", ""),
                    file_path=existing_att.get("file_path", ""),
                )
                db.add(attachment)

            # Add new uploaded files
            for file_id in payload.attachment_ids:
                uploaded_file = await db.get(UploadedFile, str(file_id))
                if uploaded_file:
                    attachment = ReimbursementAttachment(
                        application_id=application_id,
                        file_name=uploaded_file.original_name,
                        file_path=uploaded_file.storage_path,
                    )
                    db.add(attachment)

        # Add new expense items
        total_amount = 0
        for item in payload.expense_items:
            expense_item = ReimbursementExpenseItem(
                application_id=application_id,
                expense_date=item.expense_date,
                claim_type=item.claim_type,
                purpose=item.purpose,
                mode=item.mode,
                project=item.project,
                from_location=item.from_location,
                to_location=item.to_location,
                amount=item.amount,
            )
            db.add(expense_item)
            total_amount += float(item.amount or 0)

        application.requested_amount = total_amount

        await db.commit()

        return {"message": "Application updated successfully", "id": application_id}

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

        from app.modules.reimbursement.models.reimbursement import ReimbursementActivityLog
        from app.modules.user.models.user import User
        from sqlalchemy import select as sa_select
        submitter_result = await db.execute(sa_select(User).where(User.id == current_user["id"]))
        submitter = submitter_result.scalar_one_or_none()
        activity = ReimbursementActivityLog(
            application_id=application.id,
            action="SUBMITTED",
            action_by=current_user["id"],
            actor_name=submitter.full_name if submitter else None,
            remarks=None,
            action_at=datetime.now(UTC),
        )
        db.add(activity)
        await db.commit()

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

        if pending_approval.workflow_step:
            remarks_required = pending_approval.workflow_step.remarks_required or {}
            if remarks_required.get("APPROVE") and not payload.remarks:
                raise ValueError("Remarks are required for Approve action.")

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

        from app.modules.reimbursement.models.reimbursement import ReimbursementActivityLog
        from app.modules.user.models.user import User as UserModel
        from sqlalchemy import select as sa_select_app
        approver_result = await db.execute(sa_select_app(UserModel).where(UserModel.id == current_user["id"]))
        approver = approver_result.scalar_one_or_none()
        db.add(ReimbursementActivityLog(
            application_id=application_id,
            action="APPROVED",
            action_by=current_user["id"],
            actor_name=approver.full_name if approver else None,
            remarks=payload.remarks,
            action_at=datetime.now(UTC),
        ))
        await db.commit()
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

        if pending_approval.workflow_step:
            remarks_required = pending_approval.workflow_step.remarks_required or {}
            if remarks_required.get("FINAL_REJECT") and not payload.remarks:
                raise ValueError("Remarks are required for Reject action.")

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
        from app.modules.reimbursement.models.reimbursement import ReimbursementActivityLog
        from app.modules.user.models.user import User as UserModel
        from sqlalchemy import select as sa_select_rej
        rejecter_result = await db.execute(sa_select_rej(UserModel).where(UserModel.id == current_user["id"]))
        rejecter = rejecter_result.scalar_one_or_none()
        db.add(ReimbursementActivityLog(
            application_id=application_id,
            action="REJECTED",
            action_by=current_user["id"],
            actor_name=rejecter.full_name if rejecter else None,
            remarks=payload.remarks,
            action_at=datetime.now(UTC),
        ))
        await db.commit()
        return {
            "message": "Application rejected successfully"
        }
    @staticmethod
    async def back_to_previous_stage(
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
            raise ValueError("No pending approval found")

        if pending_approval.action_by != current_user["id"]:
            raise ValueError("You are not authorized to perform this action")

        if pending_approval.workflow_step:
            remarks_required = pending_approval.workflow_step.remarks_required or {}
            if remarks_required.get("BACK_TO_PREVIOUS_STAGE") and not payload.remarks:
                raise ValueError("Remarks are required for Back To Previous Stage action.")

        current_step_order = pending_approval.workflow_step.step_order if pending_approval.workflow_step else 1

        # Mark current approval as BACKED
        pending_approval.action = "BACKED"
        pending_approval.approved_by = current_user["id"]
        pending_approval.action_at = datetime.now(UTC)
        pending_approval.remarks = payload.remarks
        await ReimbursementRepository.update_approval(db, pending_approval)

        # Activity log
        from app.modules.reimbursement.models.reimbursement import ReimbursementActivityLog
        from app.modules.user.models.user import User as UserModel
        from sqlalchemy import select as sa_select_back
        backer_result = await db.execute(sa_select_back(UserModel).where(UserModel.id == current_user["id"]))
        backer = backer_result.scalar_one_or_none()
        db.add(ReimbursementActivityLog(
            application_id=application_id,
            action="BACKED",
            action_by=current_user["id"],
            actor_name=backer.full_name if backer else None,
            remarks=payload.remarks,
            action_at=datetime.now(UTC),
        ))

        # Find previous step
        if current_step_order > 1:
            from app.modules.workflow.repositories.workflow_repository import WorkflowRepository
            application = await ReimbursementRepository.get_application_by_id(db, application_id)
            prev_steps = await WorkflowRepository.get_workflow_steps_by_workflow_id(db, application.workflow_definition_id)
            prev_step = next((s for s in prev_steps if s.step_order == current_step_order - 1), None)

            if prev_step:
                # Create new pending approval for previous step
                await WorkflowEngine.create_pending_approval(
                    db=db,
                    application=application,
                    workflow_step=prev_step,
                )
                application.status = "IN_APPROVAL"
                await ReimbursementRepository.update_application(db, application)
        await db.commit()

        return {"message": "Application sent back to previous stage"}

    @staticmethod
    async def return_to_applicant(
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
            raise ValueError("No pending approval found")

        if pending_approval.action_by != current_user["id"]:
            raise ValueError("You are not authorized to perform this action")

        if pending_approval.workflow_step:
            remarks_required = pending_approval.workflow_step.remarks_required or {}
            if remarks_required.get("RETURN_TO_APPLICANT") and not payload.remarks:
                raise ValueError("Remarks are required for Return To Applicant action.")

        pending_approval.action = "RETURNED"
        pending_approval.approved_by = current_user["id"]
        pending_approval.action_at = datetime.now(UTC)
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

        application.status = "DRAFT"
        await ReimbursementRepository.update_application(
            db,
            application,
        )

        from app.modules.reimbursement.models.reimbursement import ReimbursementActivityLog
        from app.modules.user.models.user import User
        from sqlalchemy import select as sa_select
        returner_result = await db.execute(sa_select(User).where(User.id == current_user["id"]))
        returner = returner_result.scalar_one_or_none()
        activity = ReimbursementActivityLog(
            application_id=application_id,
            action="RETURNED",
            action_by=current_user["id"],
            actor_name=returner.full_name if returner else None,
            remarks=payload.remarks,
            action_at=datetime.now(UTC),
        )
        db.add(activity)
        await db.commit()

        return {
            "message": "Application returned to applicant successfully"
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

        if current_step.action_type != "Amount Verification":
            raise ValueError(
                "Finance review is only allowed during Amount Verification step"
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
    async def get_my_actions(
        db: AsyncSession,
        user_id: str,
    ):
        from sqlalchemy import select as sa_select
        from app.modules.reimbursement.models.reimbursement import ReimbursementActivityLog
        from app.modules.reimbursement.models.reimbursement import ReimbursementApplication

        result = await db.execute(
            sa_select(ReimbursementActivityLog)
            .where(
                ReimbursementActivityLog.action_by == user_id,
                ReimbursementActivityLog.action.in_(["APPROVED", "REJECTED", "RETURNED", "BACKED"]),
            )
            .order_by(ReimbursementActivityLog.action_at.desc())
        )
        logs = result.scalars().all()

        # Keep only latest action per application
        seen_apps = set()
        unique_logs = []
        for log in logs:
            if log.application_id not in seen_apps:
                seen_apps.add(log.application_id)
                unique_logs.append(log)
        logs = unique_logs

        response = []
        for log in logs:
            app_result = await db.execute(
                sa_select(ReimbursementApplication)
                .options(
                    __import__('sqlalchemy.orm', fromlist=['selectinload']).selectinload(
                        ReimbursementApplication.employee
                    )
                )
                .where(ReimbursementApplication.id == log.application_id)
            )
            application = app_result.scalar_one_or_none()
            if application:
                response.append({
                    "application_id": application.id,
                    "application_no": application.application_no,
                    "employee_name": application.employee.full_name if application.employee else None,
                    "requested_amount": float(application.requested_amount or 0),
                    "status": application.status,
                    "action": log.action,
                    "remarks": log.remarks,
                    "action_date": log.action_at.isoformat() if log.action_at else None,
                })
        return response

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
                    "employee_name": application.employee.full_name if application.employee else None,
                    "requested_amount": float(
                        application.requested_amount
                    ),
                    "status": application.status,
                    "created_at": application.created_at.isoformat() if application.created_at else None,
                    "action_type": approval.workflow_step.action_type if approval.workflow_step else None,
                }
            )
            
        return response