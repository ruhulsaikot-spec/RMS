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
        # Collect email data BEFORE commit
        email_data = None
        try:
            from app.core.config import settings
            if settings.smtp.is_configured and first_step and first_step.email_notification:
                from app.modules.user.models.user import User
                from sqlalchemy import select as sa_select2
                approver_emails = []
                approver_names = []
                if first_step.approval_group_id:
                    from app.modules.workflow.models.approval_group import ApprovalGroupMember
                    members_result = await db.execute(
                        sa_select2(User).join(
                            ApprovalGroupMember, ApprovalGroupMember.user_id == User.id
                        ).where(ApprovalGroupMember.approval_group_id == first_step.approval_group_id)
                    )
                    members = members_result.scalars().all()
                    approver_emails = [m.email for m in members if m.email]
                    approver_names = [m.full_name for m in members]
                elif first_step.user_id:
                    approver_result = await db.execute(sa_select2(User).where(User.id == first_step.user_id))
                    approver = approver_result.scalar_one_or_none()
                    if approver:
                        approver_emails = [approver.email]
                        approver_names = [approver.full_name]
                elif first_step.approver_type == "LINE_MANAGER":
                    # Get employee's line manager
                    emp_result = await db.execute(sa_select2(User).where(User.id == application.employee_id))
                    emp = emp_result.scalar_one_or_none()
                    if emp and emp.manager_id:
                        manager_result = await db.execute(sa_select2(User).where(User.id == emp.manager_id))
                        manager = manager_result.scalar_one_or_none()
                        if manager and manager.email:
                            approver_emails = [manager.email]
                            approver_names = [manager.full_name]

                claim_type = application.expense_type.name if application.expense_type else "Reimbursement"
                total_amount = sum(item.amount for item in application.expense_items) if application.expense_items else 0
                # Get department and designation
                dept_name = ""
                desig_name = ""
                if submitter:
                    if hasattr(submitter, 'department') and submitter.department:
                        dept_name = submitter.department.name
                    elif submitter.department_id:
                        from app.modules.organization.models.department import Department
                        dept_result = await db.execute(sa_select2(Department).where(Department.id == submitter.department_id))
                        dept = dept_result.scalar_one_or_none()
                        dept_name = dept.name if dept else ""
                    if hasattr(submitter, 'designation') and submitter.designation:
                        desig_name = submitter.designation.name
                    elif submitter.designation_id:
                        from app.modules.organization.models.designation import Designation
                        desig_result = await db.execute(sa_select2(Designation).where(Designation.id == submitter.designation_id))
                        desig = desig_result.scalar_one_or_none()
                        desig_name = desig.name if desig else ""

                from datetime import datetime as dt
                claim_date = dt.now().strftime("%d %b %Y")

                # Build expense items
                items = []
                # Build lookup maps for expense types and projects
                from app.modules.expense_type.models.expense_type import ExpenseType as ExpType
                from app.modules.project.models.project import Project as ProjectModel
                
                # Get all expense type IDs from items
                exp_type_ids = list(set(item.claim_type for item in (application.expense_items or []) if item.claim_type))
                proj_ids = list(set(item.project for item in (application.expense_items or []) if item.project))
                
                exp_type_map = {}
                proj_map = {}
                
                if exp_type_ids:
                    from sqlalchemy import select as sa_sel_et
                    et_result = await db.execute(sa_sel_et(ExpType).where(ExpType.id.in_(exp_type_ids)))
                    for et in et_result.scalars().all():
                        exp_type_map[et.id] = et.name

                if proj_ids:
                    from sqlalchemy import select as sa_sel_pr
                    pr_result = await db.execute(sa_sel_pr(ProjectModel).where(ProjectModel.id.in_(proj_ids)))
                    for pr in pr_result.scalars().all():
                        proj_map[pr.id] = pr.name

                for item in (application.expense_items or []):
                    ct = getattr(item, 'claim_type', "") or ""
                    pj = getattr(item, 'project', "") or ""
                    items.append({
                        "date": item.expense_date.strftime("%d %b %Y") if hasattr(item, 'expense_date') and item.expense_date else "",
                        "claim_type": exp_type_map.get(ct, ct) if ct else claim_type,
                        "purpose": getattr(item, 'purpose', "") or "",
                        "mode": getattr(item, 'mode', "") or "",
                        "project": proj_map.get(pj, pj) if pj else "",
                        "from_location": getattr(item, 'from_location', "") or "",
                        "to_location": getattr(item, 'to_location', "") or "",
                        "amount": float(item.amount) if item.amount else 0,
                    })

                email_data = {
                    "approver_emails": approver_emails,
                    "approver_names": approver_names,
                    "applicant_name": submitter.full_name if submitter else "Employee",
                    "application_no": application.application_no,
                    "application_id": str(application.id),
                    "claim_type": claim_type,
                    "total_amount": total_amount,
                    "department": dept_name,
                    "designation": desig_name,
                    "claim_date": claim_date,
                    "remarks": application.data.remarks if application.data else "",
                    "expense_items": items,
                }
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to collect email data: {e}")

        db.add(activity)
        await db.commit()

        # Send in-app notifications AFTER commit
        if email_data:
            try:
                from app.modules.notification.services.notification_service import NotificationService as NS
                for approver_email, approver_name in zip(email_data["approver_emails"], email_data["approver_names"]):
                    # Find approver user_id by email
                    from app.modules.user.models.user import User as _UserNotif
                    from sqlalchemy import select as _selNotif
                    _u_res = await db.execute(_selNotif(_UserNotif).where(_UserNotif.email == approver_email))
                    _u = _u_res.scalar_one_or_none()
                    if _u:
                        await NS.notify_claim_event(
                            db=db,
                            user_id=str(_u.id),
                            event="submitted",
                            application_no=email_data["application_no"],
                            application_id=email_data["application_id"],
                            applicant_name=email_data["applicant_name"],
                        )
                await db.commit()
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to send in-app notification: {e}")

        # Send email AFTER commit
        if email_data:
            try:
                from app.core.email import send_claim_submitted_email
                for email, name in zip(email_data["approver_emails"], email_data["approver_names"]):
                    await send_claim_submitted_email(
                        to_email=email,
                        approver_name=name,
                        applicant_name=email_data["applicant_name"],
                        application_no=email_data["application_no"],
                        claim_type=email_data["claim_type"],
                        amount=email_data["total_amount"],
                        department=email_data["department"],
                        designation=email_data["designation"],
                        claim_date=email_data["claim_date"],
                        remarks=email_data["remarks"],
                        expense_items=email_data["expense_items"],
                        application_id=email_data["application_id"],
                    )
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to send submit notification: {e}")

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
            # Send email to next stage approver
            try:
                from app.core.email import send_claim_submitted_email
                from app.core.config import settings
                if settings.smtp.is_configured and next_step.email_notification:
                    from app.modules.user.models.user import User as _UserN
                    from sqlalchemy import select as _selN
                    next_approver_emails = []
                    next_approver_names = []
                    if next_step.approval_group_id:
                        from app.modules.workflow.models.approval_group import ApprovalGroupMember
                        mem_res = await db.execute(
                            _selN(_UserN).join(
                                ApprovalGroupMember, ApprovalGroupMember.user_id == _UserN.id
                            ).where(ApprovalGroupMember.approval_group_id == next_step.approval_group_id)
                        )
                        for m in mem_res.scalars().all():
                            if m.email:
                                next_approver_emails.append(m.email)
                                next_approver_names.append(m.full_name)
                    elif next_step.user_id:
                        apr_res = await db.execute(_selN(_UserN).where(_UserN.id == next_step.user_id))
                        apr = apr_res.scalar_one_or_none()
                        if apr:
                            next_approver_emails = [apr.email]
                            next_approver_names = [apr.full_name]
                    elif next_step.approver_type == "LINE_MANAGER":
                        emp_res = await db.execute(_selN(_UserN).where(_UserN.id == application.employee_id))
                        emp_obj = emp_res.scalar_one_or_none()
                        if emp_obj and emp_obj.manager_id:
                            mgr_res = await db.execute(_selN(_UserN).where(_UserN.id == emp_obj.manager_id))
                            mgr = mgr_res.scalar_one_or_none()
                            if mgr and mgr.email:
                                next_approver_emails = [mgr.email]
                                next_approver_names = [mgr.full_name]

                    if next_approver_emails:
                        from app.modules.expense_type.models.expense_type import ExpenseType as _ETN
                        from app.modules.project.models.project import Project as _PRN
                        from datetime import datetime as _dtN
                        emp = application.employee
                        claim_type_n = application.expense_type.name if application.expense_type else "Reimbursement"
                        total_amount_n = sum(item.amount for item in application.expense_items) if application.expense_items else 0
                        dept_n = emp.department.name if emp and hasattr(emp, 'department') and emp.department else ""
                        desig_n = emp.designation.name if emp and hasattr(emp, 'designation') and emp.designation else ""
                        _et_idsN = list(set(ei.claim_type for ei in (application.expense_items or []) if ei.claim_type))
                        _pr_idsN = list(set(ei.project for ei in (application.expense_items or []) if ei.project))
                        _et_mapN = {}
                        _pr_mapN = {}
                        if _et_idsN:
                            _et_resN = await db.execute(_selN(_ETN).where(_ETN.id.in_(_et_idsN)))
                            for _et in _et_resN.scalars().all():
                                _et_mapN[_et.id] = _et.name
                        if _pr_idsN:
                            _pr_resN = await db.execute(_selN(_PRN).where(_PRN.id.in_(_pr_idsN)))
                            for _pr in _pr_resN.scalars().all():
                                _pr_mapN[_pr.id] = _pr.name
                        exp_items_n = []
                        for ei in (application.expense_items or []):
                            _ct = getattr(ei, 'claim_type', "") or ""
                            _pj = getattr(ei, 'project', "") or ""
                            exp_items_n.append({
                                "date": ei.expense_date.strftime("%d %b %Y") if hasattr(ei, 'expense_date') and ei.expense_date else "",
                                "claim_type": _et_mapN.get(_ct, _ct) if _ct else claim_type_n,
                                "purpose": getattr(ei, 'purpose', "") or "",
                                "mode": getattr(ei, 'mode', "") or "",
                                "project": _pr_mapN.get(_pj, _pj) if _pj else "",
                                "from_location": getattr(ei, 'from_location', "") or "",
                                "to_location": getattr(ei, 'to_location', "") or "",
                                "amount": float(ei.amount) if ei.amount else 0,
                            })
                        from app.modules.notification.services.notification_service import NotificationService as NSN
                        for email, name in zip(next_approver_emails, next_approver_names):
                            await send_claim_submitted_email(
                                to_email=email,
                                approver_name=name,
                                applicant_name=emp.full_name if emp else "",
                                application_no=application.application_no,
                                claim_type=claim_type_n,
                                amount=float(total_amount_n),
                                department=dept_n,
                                designation=desig_n,
                                claim_date=_dtN.now().strftime("%d %b %Y"),
                                expense_items=exp_items_n,
                                application_id=str(application.id),
                                email_type="next_stage",
                            )
                            # In-app notification for next stage approver
                            from app.modules.user.models.user import User as _UserNN
                            from sqlalchemy import select as _selNN
                            _u_res = await db.execute(_selNN(_UserNN).where(_UserNN.email == email))
                            _u = _u_res.scalar_one_or_none()
                            if _u:
                                await NSN.notify_claim_event(
                                    db=db,
                                    user_id=str(_u.id),
                                    event="next_stage",
                                    application_no=application.application_no,
                                    application_id=str(application.id),
                                    applicant_name=emp.full_name if emp else "",
                                )
                        await db.commit()
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to send next stage notification: {e}")
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

        # Send email to applicant
        try:
            from app.core.email import send_claim_status_email
            from app.core.config import settings
            if settings.smtp.is_configured:
                from app.modules.user.models.user import User as _User
                from sqlalchemy import select as _sel
                emp_result = await db.execute(_sel(_User).where(_User.id == application.employee_id))
                emp = emp_result.scalar_one_or_none()
                if emp and emp.email:
                    claim_type = application.expense_type.name if application.expense_type else "Reimbursement"
                    total_amount = sum(item.amount for item in application.expense_items) if application.expense_items else 0
                    from datetime import datetime as _dt
                    dept_n = emp.department.name if hasattr(emp, 'department') and emp.department else ""
                    desig_n = emp.designation.name if hasattr(emp, 'designation') and emp.designation else ""
                    # Lookup expense type and project names
                    from app.modules.expense_type.models.expense_type import ExpenseType as _ET2
                    from app.modules.project.models.project import Project as _PR2
                    from sqlalchemy import select as _sel_et2
                    _et_ids2 = list(set(ei.claim_type for ei in (application.expense_items or []) if ei.claim_type))
                    _pr_ids2 = list(set(ei.project for ei in (application.expense_items or []) if ei.project))
                    _et_map2 = {}
                    _pr_map2 = {}
                    if _et_ids2:
                        _et_res2 = await db.execute(_sel_et2(_ET2).where(_ET2.id.in_(_et_ids2)))
                        for _et in _et_res2.scalars().all():
                            _et_map2[_et.id] = _et.name
                    if _pr_ids2:
                        _pr_res2 = await db.execute(_sel_et2(_PR2).where(_PR2.id.in_(_pr_ids2)))
                        for _pr in _pr_res2.scalars().all():
                            _pr_map2[_pr.id] = _pr.name
                    exp_items = []
                    for ei in (application.expense_items or []):
                        _ct = getattr(ei, 'claim_type', "") or ""
                        _pj = getattr(ei, 'project', "") or ""
                        exp_items.append({
                            "date": ei.expense_date.strftime("%d %b %Y") if hasattr(ei, 'expense_date') and ei.expense_date else "",
                            "claim_type": _et_map2.get(_ct, _ct) if _ct else claim_type,
                            "purpose": getattr(ei, 'purpose', "") or "",
                            "mode": getattr(ei, 'mode', "") or "",
                            "project": _pr_map2.get(_pj, _pj) if _pj else "",
                            "from_location": getattr(ei, 'from_location', "") or "",
                            "to_location": getattr(ei, 'to_location', "") or "",
                            "amount": float(ei.amount) if ei.amount else 0,
                        })
                    await send_claim_status_email(
                    to_email=emp.email,
                    applicant_name=emp.full_name,
                    application_no=application.application_no,
                    claim_type=claim_type,
                    amount=total_amount,
                    status="APPROVED",
                    remarks=payload.remarks or "",
                    department=dept_n,
                    designation=desig_n,
                    claim_date=_dt.now().strftime("%d %b %Y"),
                    expense_items=exp_items,
                    application_id=str(application.id),
                )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send approve notification: {e}")

        # In-app notification
        try:
            from app.modules.notification.services.notification_service import NotificationService as NS
            await NS.notify_claim_event(
                db=db,
                user_id=str(application.employee_id),
                event="approved",
                application_no=application.application_no,
                application_id=str(application.id),
            )
            await db.commit()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send approve in-app notification: {e}")

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

        # Send email to applicant
        try:
            from app.core.email import send_claim_status_email
            from app.core.config import settings
            if settings.smtp.is_configured:
                from app.modules.user.models.user import User as _User2
                from sqlalchemy import select as _sel2
                emp_result2 = await db.execute(_sel2(_User2).where(_User2.id == application.employee_id))
                emp2 = emp_result2.scalar_one_or_none()
                if emp2 and emp2.email:
                    claim_type = application.expense_type.name if application.expense_type else "Reimbursement"
                    total_amount = sum(item.amount for item in application.expense_items) if application.expense_items else 0
                    from datetime import datetime as _dt
                    dept_n = emp2.department.name if hasattr(emp2, 'department') and emp2.department else ""
                    desig_n = emp2.designation.name if hasattr(emp2, 'designation') and emp2.designation else ""
                    # Lookup expense type and project names
                    from app.modules.expense_type.models.expense_type import ExpenseType as _ET2
                    from app.modules.project.models.project import Project as _PR2
                    from sqlalchemy import select as _sel_et2
                    _et_ids2 = list(set(ei.claim_type for ei in (application.expense_items or []) if ei.claim_type))
                    _pr_ids2 = list(set(ei.project for ei in (application.expense_items or []) if ei.project))
                    _et_map2 = {}
                    _pr_map2 = {}
                    if _et_ids2:
                        _et_res2 = await db.execute(_sel_et2(_ET2).where(_ET2.id.in_(_et_ids2)))
                        for _et in _et_res2.scalars().all():
                            _et_map2[_et.id] = _et.name
                    if _pr_ids2:
                        _pr_res2 = await db.execute(_sel_et2(_PR2).where(_PR2.id.in_(_pr_ids2)))
                        for _pr in _pr_res2.scalars().all():
                            _pr_map2[_pr.id] = _pr.name
                    exp_items = []
                    for ei in (application.expense_items or []):
                        _ct = getattr(ei, 'claim_type', "") or ""
                        _pj = getattr(ei, 'project', "") or ""
                        exp_items.append({
                            "date": ei.expense_date.strftime("%d %b %Y") if hasattr(ei, 'expense_date') and ei.expense_date else "",
                            "claim_type": _et_map2.get(_ct, _ct) if _ct else claim_type,
                            "purpose": getattr(ei, 'purpose', "") or "",
                            "mode": getattr(ei, 'mode', "") or "",
                            "project": _pr_map2.get(_pj, _pj) if _pj else "",
                            "from_location": getattr(ei, 'from_location', "") or "",
                            "to_location": getattr(ei, 'to_location', "") or "",
                            "amount": float(ei.amount) if ei.amount else 0,
                        })
                    await send_claim_status_email(
                        to_email=emp2.email,
                        applicant_name=emp2.full_name,
                        application_no=application.application_no,
                        claim_type=claim_type,
                        amount=total_amount,
                        status="REJECTED",
                        remarks=payload.remarks or "",
                        department=dept_n,
                        designation=desig_n,
                        claim_date=_dt.now().strftime("%d %b %Y"),
                        expense_items=exp_items,
                        application_id=str(application.id),
                    )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send reject notification: {e}")

        try:
            from app.modules.notification.services.notification_service import NotificationService as NS
            await NS.notify_claim_event(
                db=db,
                user_id=str(application.employee_id),
                event="rejected",
                application_no=application.application_no,
                application_id=str(application.id),
            )
            await db.commit()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send reject in-app notification: {e}")

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
        prev_step = None
        from app.modules.workflow.repositories.workflow_repository import WorkflowRepository
        application = await ReimbursementRepository.get_application_by_id(db, application_id)
        if current_step_order > 1:
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

        # Send email to previous stage approvers
        try:
            from app.core.email import send_claim_submitted_email
            from app.core.config import settings
            if settings.smtp.is_configured and prev_step and prev_step.email_notification:
                from app.modules.user.models.user import User as _UserB
                from sqlalchemy import select as _selB
                approver_emails = []
                approver_names = []
                if prev_step.approval_group_id:
                    from app.modules.workflow.models.approval_group import ApprovalGroupMember
                    mem_res = await db.execute(
                        _selB(_UserB).join(
                            ApprovalGroupMember, ApprovalGroupMember.user_id == _UserB.id
                        ).where(ApprovalGroupMember.approval_group_id == prev_step.approval_group_id)
                    )
                    for m in mem_res.scalars().all():
                        if m.email:
                            approver_emails.append(m.email)
                            approver_names.append(m.full_name)
                elif prev_step.user_id:
                    apr_res = await db.execute(_selB(_UserB).where(_UserB.id == prev_step.user_id))
                    apr = apr_res.scalar_one_or_none()
                    if apr:
                        approver_emails = [apr.email]
                        approver_names = [apr.full_name]
                elif prev_step.approver_type == "LINE_MANAGER":
                    emp_res = await db.execute(_selB(_UserB).where(_UserB.id == application.employee_id))
                    emp_obj = emp_res.scalar_one_or_none()
                    if emp_obj and emp_obj.manager_id:
                        mgr_res = await db.execute(_selB(_UserB).where(_UserB.id == emp_obj.manager_id))
                        mgr = mgr_res.scalar_one_or_none()
                        if mgr and mgr.email:
                            approver_emails = [mgr.email]
                            approver_names = [mgr.full_name]

                if approver_emails and application:
                    from datetime import datetime as _dtB
                    from app.modules.expense_type.models.expense_type import ExpenseType as _ETB
                    from app.modules.project.models.project import Project as _PRB
                    from sqlalchemy import select as _selB2
                    emp = application.employee
                    claim_type = application.expense_type.name if application.expense_type else "Reimbursement"
                    total_amount = sum(item.amount for item in application.expense_items) if application.expense_items else 0
                    dept_n = emp.department.name if emp and hasattr(emp, 'department') and emp.department else ""
                    desig_n = emp.designation.name if emp and hasattr(emp, 'designation') and emp.designation else ""
                    _et_idsB = list(set(ei.claim_type for ei in (application.expense_items or []) if ei.claim_type))
                    _pr_idsB = list(set(ei.project for ei in (application.expense_items or []) if ei.project))
                    _et_mapB = {}
                    _pr_mapB = {}
                    if _et_idsB:
                        _et_resB = await db.execute(_selB2(_ETB).where(_ETB.id.in_(_et_idsB)))
                        for _et in _et_resB.scalars().all():
                            _et_mapB[_et.id] = _et.name
                    if _pr_idsB:
                        _pr_resB = await db.execute(_selB2(_PRB).where(_PRB.id.in_(_pr_idsB)))
                        for _pr in _pr_resB.scalars().all():
                            _pr_mapB[_pr.id] = _pr.name
                    exp_items = []
                    for ei in (application.expense_items or []):
                        _ct = getattr(ei, 'claim_type', "") or ""
                        _pj = getattr(ei, 'project', "") or ""
                        exp_items.append({
                            "date": ei.expense_date.strftime("%d %b %Y") if hasattr(ei, 'expense_date') and ei.expense_date else "",
                            "claim_type": _et_mapB.get(_ct, _ct) if _ct else claim_type,
                            "purpose": getattr(ei, 'purpose', "") or "",
                            "mode": getattr(ei, 'mode', "") or "",
                            "project": _pr_mapB.get(_pj, _pj) if _pj else "",
                            "from_location": getattr(ei, 'from_location', "") or "",
                            "to_location": getattr(ei, 'to_location', "") or "",
                            "amount": float(ei.amount) if ei.amount else 0,
                        })
                    for email, name in zip(approver_emails, approver_names):
                            await send_claim_submitted_email(
                                to_email=email,
                                approver_name=name,
                                applicant_name=emp.full_name if emp else "",
                                application_no=application.application_no,
                                claim_type=claim_type,
                                amount=total_amount,
                                department=dept_n,
                                designation=desig_n,
                                claim_date=_dtB.now().strftime("%d %b %Y"),
                                expense_items=exp_items,
                                application_id=str(application.id),
                                email_type="backed",
                            )
                            # In-app notification
                            from app.modules.notification.services.notification_service import NotificationService as NSB
                            from app.modules.user.models.user import User as _UserB2
                            from sqlalchemy import select as _selB3
                            _u_res = await db.execute(_selB3(_UserB2).where(_UserB2.email == email))
                            _u = _u_res.scalar_one_or_none()
                            if _u:
                                await NSB.notify_claim_event(
                                    db=db,
                                    user_id=str(_u.id),
                                    event="backed",
                                    application_no=application.application_no,
                                    application_id=str(application.id),
                                    applicant_name=emp.full_name if emp else "",
                                )
                    await db.commit()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send back-to-previous notification: {e}")
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

        # Send email to applicant
        try:
            from app.core.email import send_claim_status_email
            from app.core.config import settings
            if settings.smtp.is_configured and application.employee:
                claim_type = application.expense_type.name if application.expense_type else "Reimbursement"
                total_amount = sum(item.amount for item in application.expense_items) if application.expense_items else 0
                from datetime import datetime as _dt
                emp = application.employee
                dept_n = emp.department.name if emp and hasattr(emp, 'department') and emp.department else ""
                desig_n = emp.designation.name if emp and hasattr(emp, 'designation') and emp.designation else ""
                # Lookup expense type and project names
                from app.modules.expense_type.models.expense_type import ExpenseType as _ET2
                from app.modules.project.models.project import Project as _PR2
                from sqlalchemy import select as _sel_et2
                _et_ids2 = list(set(ei.claim_type for ei in (application.expense_items or []) if ei.claim_type))
                _pr_ids2 = list(set(ei.project for ei in (application.expense_items or []) if ei.project))
                _et_map2 = {}
                _pr_map2 = {}
                if _et_ids2:
                    _et_res2 = await db.execute(_sel_et2(_ET2).where(_ET2.id.in_(_et_ids2)))
                    for _et in _et_res2.scalars().all():
                        _et_map2[_et.id] = _et.name
                if _pr_ids2:
                    _pr_res2 = await db.execute(_sel_et2(_PR2).where(_PR2.id.in_(_pr_ids2)))
                    for _pr in _pr_res2.scalars().all():
                        _pr_map2[_pr.id] = _pr.name
                exp_items = []
                for ei in (application.expense_items or []):
                    _ct = getattr(ei, "claim_type", "") or ""
                    _pj = getattr(ei, "project", "") or ""
                    exp_items.append({
                        "date": ei.expense_date.strftime("%d %b %Y") if hasattr(ei, "expense_date") and ei.expense_date else "",
                        "claim_type": _et_map2.get(_ct, _ct) if _ct else claim_type,
                        "purpose": getattr(ei, "purpose", "") or "",
                        "mode": getattr(ei, "mode", "") or "",
                        "project": _pr_map2.get(_pj, _pj) if _pj else "",
                        "from_location": getattr(ei, "from_location", "") or "",
                        "to_location": getattr(ei, "to_location", "") or "",
                        "amount": float(ei.amount) if ei.amount else 0,
                    })
                await send_claim_status_email(
                to_email=emp.email if emp else "",
                    applicant_name=emp.full_name if emp else "",
                    application_no=application.application_no,
                    claim_type=claim_type,
                    amount=total_amount,
                    status="RETURNED",
                    remarks=payload.remarks or "",
                    department=dept_n,
                    designation=desig_n,
                    claim_date=_dt.now().strftime("%d %b %Y"),
                    expense_items=exp_items,
                    application_id=str(application.id),
                )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send return notification: {e}")

        try:
            from app.modules.notification.services.notification_service import NotificationService as NS
            await NS.notify_claim_event(
                db=db,
                user_id=str(application.employee_id),
                event="returned",
                application_no=application.application_no,
                application_id=str(application.id),
            )
            await db.commit()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send return in-app notification: {e}")

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
            # Notify next stage approvers
            try:
                from app.core.email import send_claim_submitted_email
                from app.core.config import settings
                from app.modules.notification.services.notification_service import NotificationService as NSV
                from app.modules.user.models.user import User as _UserV
                from sqlalchemy import select as _selV2
                _next_emails = []
                _next_names = []
                if next_step.approval_group_id:
                    from app.modules.workflow.models.approval_group import ApprovalGroupMember
                    _mem_res = await db.execute(
                        _selV2(_UserV).join(
                            ApprovalGroupMember, ApprovalGroupMember.user_id == _UserV.id
                        ).where(ApprovalGroupMember.approval_group_id == next_step.approval_group_id)
                    )
                    for _m in _mem_res.scalars().all():
                        if _m.email:
                            _next_emails.append(_m.email)
                            _next_names.append(_m.full_name)
                elif next_step.user_id:
                    _apr_res = await db.execute(_selV2(_UserV).where(_UserV.id == next_step.user_id))
                    _apr = _apr_res.scalar_one_or_none()
                    if _apr:
                        _next_emails = [_apr.email]
                        _next_names = [_apr.full_name]
                elif next_step.approver_type == "LINE_MANAGER":
                    _emp_res = await db.execute(_selV2(_UserV).where(_UserV.id == application.employee_id))
                    _emp_obj = _emp_res.scalar_one_or_none()
                    if _emp_obj and _emp_obj.manager_id:
                        _mgr_res = await db.execute(_selV2(_UserV).where(_UserV.id == _emp_obj.manager_id))
                        _mgr = _mgr_res.scalar_one_or_none()
                        if _mgr:
                            _next_emails = [_mgr.email]
                            _next_names = [_mgr.full_name]

                _emp = application.employee
                _claim_type = application.expense_type.name if application.expense_type else "Reimbursement"
                _total = sum(item.amount for item in application.expense_items) if application.expense_items else 0

                for _email, _name in zip(_next_emails, _next_names):
                    if settings.smtp.is_configured and next_step.email_notification:
                        await send_claim_submitted_email(
                            to_email=_email,
                            approver_name=_name,
                            applicant_name=_emp.full_name if _emp else "",
                            application_no=application.application_no,
                            claim_type=_claim_type,
                            amount=float(_total),
                            application_id=str(application.id),
                            email_type="next_stage",
                        )
                    _u_res = await db.execute(_selV2(_UserV).where(_UserV.email == _email))
                    _u = _u_res.scalar_one_or_none()
                    if _u:
                        await NSV.notify_claim_event(
                            db=db,
                            user_id=str(_u.id),
                            event="next_stage",
                            application_no=application.application_no,
                            application_id=str(application.id),
                            applicant_name=_emp.full_name if _emp else "",
                        )
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to send verify next stage notification: {e}")

        from app.modules.reimbursement.models.reimbursement import ReimbursementActivityLog
        from app.modules.user.models.user import User as UserModel
        from sqlalchemy import select as sa_select_vr
        verifier_result = await db.execute(sa_select_vr(UserModel).where(UserModel.id == current_user["id"]))
        verifier = verifier_result.scalar_one_or_none()
        db.add(ReimbursementActivityLog(
            application_id=application_id,
            action="VERIFIED",
            action_by=current_user["id"],
            actor_name=verifier.full_name if verifier else None,
            remarks=payload.remarks,
            action_at=datetime.now(UTC),
        ))
        await db.commit()

        # Send email to applicant
        try:
            from app.core.email import send_claim_status_email
            from app.core.config import settings
            if settings.smtp.is_configured and application.employee:
                from app.modules.expense_type.models.expense_type import ExpenseType as _ETV
                from app.modules.project.models.project import Project as _PRV
                from sqlalchemy import select as _selV
                emp = application.employee
                claim_type = application.expense_type.name if application.expense_type else "Reimbursement"
                total_amount = float(application.verified_amount or application.requested_amount or 0)
                dept_n = emp.department.name if emp and hasattr(emp, 'department') and emp.department else ""
                desig_n = emp.designation.name if emp and hasattr(emp, 'designation') and emp.designation else ""
                from datetime import datetime as _dtV
                _et_idsV = list(set(ei.claim_type for ei in (application.expense_items or []) if ei.claim_type))
                _pr_idsV = list(set(ei.project for ei in (application.expense_items or []) if ei.project))
                _et_mapV = {}
                _pr_mapV = {}
                if _et_idsV:
                    _et_resV = await db.execute(_selV(_ETV).where(_ETV.id.in_(_et_idsV)))
                    for _et in _et_resV.scalars().all():
                        _et_mapV[_et.id] = _et.name
                if _pr_idsV:
                    _pr_resV = await db.execute(_selV(_PRV).where(_PRV.id.in_(_pr_idsV)))
                    for _pr in _pr_resV.scalars().all():
                        _pr_mapV[_pr.id] = _pr.name
                exp_items = []
                for ei in (application.expense_items or []):
                    _ct = getattr(ei, 'claim_type', "") or ""
                    _pj = getattr(ei, 'project', "") or ""
                    exp_items.append({
                        "date": ei.expense_date.strftime("%d %b %Y") if hasattr(ei, 'expense_date') and ei.expense_date else "",
                        "claim_type": _et_mapV.get(_ct, _ct) if _ct else claim_type,
                        "purpose": getattr(ei, 'purpose', "") or "",
                        "mode": getattr(ei, 'mode', "") or "",
                        "project": _pr_mapV.get(_pj, _pj) if _pj else "",
                        "from_location": getattr(ei, 'from_location', "") or "",
                        "to_location": getattr(ei, 'to_location', "") or "",
                        "amount": float(ei.amount) if ei.amount else 0,
                    })
                await send_claim_status_email(
                    to_email=emp.email,
                    applicant_name=emp.full_name,
                    application_no=application.application_no,
                    claim_type=claim_type,
                    amount=total_amount,
                    status="VERIFIED",
                    remarks=payload.remarks or "",
                    department=dept_n,
                    designation=desig_n,
                    claim_date=_dtV.now().strftime("%d %b %Y"),
                    expense_items=exp_items,
                    application_id=str(application.id),
                )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send verify notification: {e}")

        try:
            from app.modules.notification.services.notification_service import NotificationService as NS
            await NS.notify_claim_event(
                db=db,
                user_id=str(application.employee_id),
                event="verified",
                application_no=application.application_no,
                application_id=str(application.id),
            )
            await db.commit()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send verify in-app notification: {e}")

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

        from sqlalchemy import select as sa_select_pm
        from app.modules.payment_method.models.payment_method import PaymentMethod
        payment_method = None
        if payload.payment_method_id and payload.payment_method_id != "default":
            payment_method = await PaymentMethodRepository.get_by_id(
                db, payload.payment_method_id,
            )
        if not payment_method:
            # Use first available payment method
            pm_result = await db.execute(sa_select_pm(PaymentMethod).limit(1))
            payment_method = pm_result.scalar_one_or_none()

        if application.status not in ["VERIFIED", "IN_APPROVAL"]:
            raise ValueError(
                "Application is not in a payable state"
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
            payment_method_id=payment_method.id if payment_method else None,
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

        from app.modules.reimbursement.models.reimbursement import ReimbursementActivityLog
        from app.modules.user.models.user import User as UserModel
        from sqlalchemy import select as sa_select_pay
        payer_result = await db.execute(sa_select_pay(UserModel).where(UserModel.id == current_user["id"]))
        payer = payer_result.scalar_one_or_none()
        db.add(ReimbursementActivityLog(
            application_id=application_id,
            action="PAID",
            action_by=current_user["id"],
            actor_name=payer.full_name if payer else None,
            remarks=payload.remarks,
            action_at=datetime.now(UTC),
        ))
        await db.commit()

        # Send email to applicant
        try:
            from app.core.email import send_claim_status_email
            from app.core.config import settings
            if settings.smtp.is_configured and application.employee:
                claim_type = application.expense_type.name if application.expense_type else "Reimbursement"
                claim_type = application.expense_type.name if application.expense_type else "Reimbursement"
                from datetime import datetime as _dt
                emp = application.employee
                dept_n = emp.department.name if emp and hasattr(emp, 'department') and emp.department else ""
                desig_n = emp.designation.name if emp and hasattr(emp, 'designation') and emp.designation else ""
                # Lookup expense type and project names
                from app.modules.expense_type.models.expense_type import ExpenseType as _ET2
                from app.modules.project.models.project import Project as _PR2
                from sqlalchemy import select as _sel_et2
                _et_ids2 = list(set(ei.claim_type for ei in (application.expense_items or []) if ei.claim_type))
                _pr_ids2 = list(set(ei.project for ei in (application.expense_items or []) if ei.project))
                _et_map2 = {}
                _pr_map2 = {}
                if _et_ids2:
                    _et_res2 = await db.execute(_sel_et2(_ET2).where(_ET2.id.in_(_et_ids2)))
                    for _et in _et_res2.scalars().all():
                        _et_map2[_et.id] = _et.name
                if _pr_ids2:
                    _pr_res2 = await db.execute(_sel_et2(_PR2).where(_PR2.id.in_(_pr_ids2)))
                    for _pr in _pr_res2.scalars().all():
                        _pr_map2[_pr.id] = _pr.name
                exp_items = []
                for ei in (application.expense_items or []):
                    _ct = getattr(ei, "claim_type", "") or ""
                    _pj = getattr(ei, "project", "") or ""
                    exp_items.append({
                        "date": ei.expense_date.strftime("%d %b %Y") if hasattr(ei, "expense_date") and ei.expense_date else "",
                        "claim_type": _et_map2.get(_ct, _ct) if _ct else claim_type,
                        "purpose": getattr(ei, "purpose", "") or "",
                        "mode": getattr(ei, "mode", "") or "",
                        "project": _pr_map2.get(_pj, _pj) if _pj else "",
                        "from_location": getattr(ei, "from_location", "") or "",
                        "to_location": getattr(ei, "to_location", "") or "",
                        "amount": float(ei.amount) if ei.amount else 0,
                    })
                await send_claim_status_email(
                    to_email=emp.email if emp else "",
                    applicant_name=emp.full_name if emp else "",
                    application_no=application.application_no,
                    claim_type=claim_type,
                    amount=float(payment_amount),
                    status="PAID",
                    remarks=payload.remarks or "",
                    department=dept_n,
                    designation=desig_n,
                    claim_date=_dt.now().strftime("%d %b %Y"),
                    expense_items=exp_items,
                    application_id=str(application.id),
                )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send payment notification: {e}")

        try:
            from app.modules.notification.services.notification_service import NotificationService as NS
            await NS.notify_claim_event(
                db=db,
                user_id=str(application.employee_id),
                event="paid",
                application_no=application.application_no,
                application_id=str(application.id),
            )
            await db.commit()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send pay in-app notification: {e}")

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
                ReimbursementActivityLog.action.in_(["APPROVED", "REJECTED", "RETURNED", "BACKED", "VERIFIED", "PAID"]),
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