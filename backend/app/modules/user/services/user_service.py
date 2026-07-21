from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.user.models.user import User
from app.auth.password_utils import (
    hash_password,
)

from app.modules.user.repositories.user_repository import (
    UserRepository,
)
from app.modules.role.repositories.role_repository import (
    RoleRepository,
)
from app.core.exceptions import (
    ConflictError,
)

from app.modules.user.schemas.user_schema import (
    UserCreate,
    UserUpdate,
    AssignRoleRequest,
    ResetPasswordRequest,
)

from app.core.exceptions.http_exceptions import (
    NotFoundException,
)


class UserService:

    @staticmethod
    async def create_user(
        db: AsyncSession,
        payload: UserCreate,
        current_user_id: str,
    ) -> User:

        existing_user = await UserRepository.get_by_email(
            db,
            payload.email,
        )

        if payload.manager_id:

            manager = await UserRepository.get_by_id(
                db,
                payload.manager_id,
            )

            if not manager:
                raise NotFoundException(
                    "Manager not found"
                )

            if not manager.is_active:
                raise ConflictError(
                    "Selected manager is inactive"
                )

        if existing_user:
            raise ConflictError(
                "Email already exists"
            )

        existing_employee = await UserRepository.get_by_employee_id(
            db,
            payload.employee_id,
        )

        if existing_employee:
            raise ConflictError(
                "Employee ID already exists"
            )

        user = User(
            full_name=payload.full_name,
            employee_id=payload.employee_id,
            email=payload.email,
            password_hash=hash_password(payload.password),
            phone=payload.phone,
            department_id=payload.department_id,
            designation_id=payload.designation_id,
            manager_id=payload.manager_id,
            is_active=payload.is_active,
            created_by=current_user_id,

        )

        return await UserRepository.create(
            db,
            user,
        )
  
            
    @staticmethod
    async def get_user(
        db: AsyncSession,
        user_id: str,
    ):
        return await UserRepository.get_by_id(
            db,
            user_id,
        )
    
    @staticmethod
    async def get_user_by_id(
        db: AsyncSession,
        user_id: str,
    ):
        user = await UserRepository.get_by_id(
            db,
            user_id,
        )

        if not user:
            raise NotFoundException(
                "User not found"
            )

        return user

    @staticmethod
    async def update_user(
        db: AsyncSession,
        user_id: str,
        payload: UserUpdate,
        current_user_id: str,
    ):
        user = await UserRepository.get_by_id(
            db,
            user_id,
        )

        if not user:
            raise NotFoundException(
                "User not found"
            )

        update_data = payload.model_dump(
            exclude_unset=True
        )

        if "email" in update_data:

            existing_email = await UserRepository.get_by_email_excluding_user(
                db,
                update_data["email"],
                user_id,
            )

            if existing_email:
                raise ConflictError(
                    "Email already exists"
                )

        if "employee_id" in update_data:

            existing_employee = await UserRepository.get_by_employee_id_excluding_user(
                db,
                update_data["employee_id"],
                user_id,
            )

            if existing_employee:
                raise ConflictError(
                    "Employee ID already exists"
                )

        if (
            "manager_id" in update_data
            and update_data["manager_id"]
        ):

            if update_data["manager_id"] == user_id:
                raise ConflictError(
                    "User cannot be their own manager"
                )

            manager = await UserRepository.get_by_id(
                db,
                update_data["manager_id"],
            )

            if not manager:
                raise NotFoundException(
                    "Manager not found"
                )

            if not manager.is_active:
                raise ConflictError(
                    "Selected manager is inactive"
                )

        for field, value in update_data.items():
            setattr(user, field, value)

        user.updated_by = current_user_id

        return await UserRepository.update(
            db,
            user,
        )

    @staticmethod
    async def delete_user(
        db: AsyncSession,
        user_id: str,
        current_user_id: str,
    ):
        user = await UserRepository.get_by_id(
            db,
            user_id,
        )

        if not user:
            raise NotFoundException(
                "User not found"
            )

        if user.id == current_user_id:
            raise ConflictError(
                "You cannot delete your own account"
            )

        if user.is_superuser:
            raise ConflictError(
                "Super Admin cannot be deleted"
            )

        # Check if user has linked data
        from sqlalchemy import select as _sel_del, func
        from app.modules.reimbursement.models.reimbursement import ReimbursementApplication, ReimbursementApproval

        # Check claims
        claim_count = await db.execute(
            _sel_del(func.count()).select_from(ReimbursementApplication).where(
                ReimbursementApplication.employee_id == user_id,
                ReimbursementApplication.is_deleted == False
            )
        )
        if claim_count.scalar() > 0:
            raise ConflictError(
                "Cannot delete user. This user has existing claim applications."
            )

        # Check approvals
        approval_count = await db.execute(
            _sel_del(func.count()).select_from(ReimbursementApproval).where(
                ReimbursementApproval.action_by == user_id
            )
        )
        if approval_count.scalar() > 0:
            raise ConflictError(
                "Cannot delete user. This user has existing approval records."
            )

        # Hard delete
        await db.delete(user)
        await db.commit()
        return {"message": "User deleted successfully"}

      

    @staticmethod
    async def get_users(
        db: AsyncSession,
        page: int = 1,
        size: int = 10,
        search: str | None = None,
        is_active: bool | None = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ):
        return await UserRepository.get_all(
            db,
            page,
            size,
            search,
            is_active,
            sort_by,
            sort_order,
        )

    @staticmethod
    async def assign_roles(
        db: AsyncSession,
        user_id: str,
        role_ids: list[str],
    ):
        user = await UserRepository.get_by_id(
            db,
            user_id,
        )

        if not user:
            raise NotFoundException(
                "User not found"
            )

        if not role_ids:
            raise ConflictError(
                "At least one role is required"
            )

        role_repo = RoleRepository(db)

        unique_role_ids = list(set(role_ids))

        for role_id in unique_role_ids:

            role = await role_repo.get_by_id(role_id)

            if not role:
                raise NotFoundException(
                    f"Role not found: {role_id}"
                )

        return await UserRepository.assign_roles(
            db,
            user_id,
            unique_role_ids,
        )

    @staticmethod
    async def reset_password(
        db: AsyncSession,
        user_id: str,
        password: str,
        current_user_id: str,
    ):
        user = await UserRepository.get_by_id(
            db,
            user_id,
        )

        if not user:
            raise NotFoundException(
                "User not found"
            )

        user.password_hash = hash_password(
            password
        )

        user.updated_by = current_user_id

        return await UserRepository.update(
            db,
            user,
        )