from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.reimbursement.models.reimbursement import (
    ReimbursementApplication,
    ReimbursementApplicationData,
    ReimbursementApproval,
    ReimbursementPaymentLog,
)

from app.modules.user.models.user import User


class ReimbursementRepository:

    @staticmethod
    async def create_application(
        db: AsyncSession,
        application: ReimbursementApplication,
    ):
        db.add(application)

        await db.commit()
        await db.refresh(application)

        return application

    @staticmethod
    async def get_applications(
        db: AsyncSession,
    ):
        result = await db.execute(
            select(ReimbursementApplication)
        )

        return result.scalars().all()

    @staticmethod
    async def get_application_by_id(
        db: AsyncSession,
        application_id: str,
    ):
        result = await db.execute(
            select(ReimbursementApplication)
            .options(
                selectinload(
                    ReimbursementApplication.data
                ),

                selectinload(
                    ReimbursementApplication.expense_items
                ),

                selectinload(
                    ReimbursementApplication.attachments
                ),

                selectinload(
                    ReimbursementApplication.approvals
                ).selectinload(
                    ReimbursementApproval.workflow_step
                ),

                selectinload(
                    ReimbursementApplication.payment_logs
                ),
                selectinload(
                    ReimbursementApplication.activity_logs
                ),

                selectinload(
                    ReimbursementApplication.employee
                ).selectinload(
                    User.department
                ),

                selectinload(
                    ReimbursementApplication.employee
                ).selectinload(
                    User.designation
                ),
                selectinload(
                    ReimbursementApplication.expense_type
                )
            )
            .where(
                ReimbursementApplication.id == application_id,
                ReimbursementApplication.is_deleted
                == False,
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def update_application(
        db: AsyncSession,
        application: ReimbursementApplication,
    ):
        await db.flush()

        # await db.refresh(application)

        return application

    @staticmethod
    async def update_approval(
        db: AsyncSession,
        approval,
    ):
        await db.commit()
        await db.refresh(
            approval
        )
        return approval

    @staticmethod
    async def create_application_data(
        db: AsyncSession,
        application_data: ReimbursementApplicationData,
    ):
        db.add(application_data)

        await db.flush()

        await db.refresh(application_data)

        return application_data

    @staticmethod
    async def create_approval(
        db: AsyncSession,
        approval: ReimbursementApproval,
    ):
        db.add(
            approval
        )

        await db.flush()

        await db.refresh(
            approval
        )

        return approval

    @staticmethod
    async def get_pending_approval(
        db: AsyncSession,
        application_id: str,
        user_id: str,
    ):
        result = await db.execute(
            select(
                ReimbursementApproval
            )
            .options(
                selectinload(
                    ReimbursementApproval.workflow_step
                )
            )
            .where(
                ReimbursementApproval.application_id == application_id,
                ReimbursementApproval.action == "PENDING",
                ReimbursementApproval.action_by == user_id,
            )
        )

        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_pending_approvals_by_user(
        db: AsyncSession,
        user_id: str,
    ):
        result = await db.execute(
            select(
                ReimbursementApproval
            )
            .options(
                selectinload(
                    ReimbursementApproval.application
                ).selectinload(
                    ReimbursementApplication.employee
                ),
                selectinload(
                    ReimbursementApproval.workflow_step
                ),
            )
            .where(
                ReimbursementApproval.action_by
                == user_id,

                ReimbursementApproval.action
                == "PENDING",
            )
        )
        
        return result.scalars().all()

    @staticmethod
    async def get_approvals_by_user(
        db: AsyncSession,
        user_id: str,
    ):
        result = await db.execute(
            select(
                ReimbursementApproval
            )
            .where(
                ReimbursementApproval.action_by
                == user_id
            )
        )

        return result.scalars().all()

    @staticmethod
    async def create_payment_log(
        db: AsyncSession,
        payment_log: ReimbursementPaymentLog,
    ):
        db.add(
            payment_log
        )

        await db.flush()

        await db.refresh(
            payment_log
        )

        return payment_log

    @staticmethod
    async def get_applications_by_employee(
        db: AsyncSession,
        employee_id: str,
    ):
        result = await db.execute(
            select(
                ReimbursementApplication
            )
            .options(
                selectinload(
                    ReimbursementApplication.employee
                ).selectinload(
                    User.department
                ),

                selectinload(
                    ReimbursementApplication.employee
                ).selectinload(
                    User.designation
                ),

                selectinload(
                    ReimbursementApplication.expense_items
                ),
            )
            .where(
                ReimbursementApplication.employee_id
                == employee_id,
                ReimbursementApplication.is_deleted
                == False,
            )
        )

        return result.scalars().all()

    @staticmethod
    async def get_all_applications(
        db: AsyncSession,
    ):
        result = await db.execute(
            select(
                ReimbursementApplication
            )
            .options(
                selectinload(
                    ReimbursementApplication.employee
                ).selectinload(
                    User.department
                ),

                selectinload(
                    ReimbursementApplication.employee
                ).selectinload(
                    User.designation
                ),
            )
            .where(
                ReimbursementApplication.is_deleted
                == False
            )
        )

        return result.scalars().all()

    @staticmethod
    async def get_finance_applications(
        db: AsyncSession,
    ):
        result = await db.execute(
            select(
                ReimbursementApplication
            )
            .options(
                selectinload(
                    ReimbursementApplication.employee
                ).selectinload(
                    User.department
                ),
                selectinload(
                    ReimbursementApplication.employee
                ).selectinload(
                    User.designation
                ),
                selectinload(
                    ReimbursementApplication.expense_items
                ),
            )
            .where(
                ReimbursementApplication.is_deleted
                == False,
                ReimbursementApplication.status.in_(
                    [
                        "APPROVED",
                        "PARTIALLY_PAID",
                        "PAID",
                    ]
                )
            )
        )

        return result.scalars().all()

    @staticmethod
    async def get_pending_approvals_by_step(
        db: AsyncSession,
        application_id: str,
        workflow_step_id: str,
    ):
        result = await db.execute(
            select(ReimbursementApproval)
            .where(
                ReimbursementApproval.application_id == application_id,
                ReimbursementApproval.workflow_step_id == workflow_step_id,
                ReimbursementApproval.action == "PENDING",
            )
        )

        return result.scalars().all()