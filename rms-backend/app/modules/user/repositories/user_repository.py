from datetime import UTC
from datetime import datetime

from sqlalchemy import asc
from sqlalchemy import desc
from sqlalchemy import func
from sqlalchemy import or_
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.user.models.user import User
from sqlalchemy import insert
from sqlalchemy import delete
from app.auth.models.auth import user_roles
from app.auth.models.auth import Role


class UserRepository:

    @staticmethod
    async def create(
        db: AsyncSession,
        user: User,
    ) -> User:
        db.add(user)

        await db.commit()
        await db.refresh(user)

        return user

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        user_id: str,
    ) -> User | None:
        result = await db.execute(
            select(User).where(
                User.id == user_id,
                User.is_deleted == False,
            )
        )

        return result.scalars().first()

    @staticmethod
    async def get_all(
        db: AsyncSession,
        page: int = 1,
        size: int = 10,
        search: str | None = None,
        is_active: bool | None = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ):
        offset = (page - 1) * size

        query = (
            select(User)
            .options(
                selectinload(User.roles)
            )
            .where(
                User.is_deleted == False
            )
        )

        count_query = (
            select(func.count())
            .select_from(User)
            .where(
                User.is_deleted == False
            )
        )

        if search:
            search_filter = or_(
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.employee_id.ilike(f"%{search}%"),
            )

            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        if is_active is not None:
            query = query.where(
                User.is_active == is_active
            )

            count_query = count_query.where(
                User.is_active == is_active
            )

        sort_column = getattr(
            User,
            sort_by,
            User.created_at,
        )

        if sort_order == "asc":
            query = query.order_by(
                asc(sort_column)
            )
        else:
            query = query.order_by(
                desc(sort_column)
            )

        total_result = await db.execute(
            count_query
        )

        total = total_result.scalar()

        result = await db.execute(
            query.offset(offset).limit(size)
        )

        users = result.scalars().all()

        return {
            "items": users,
            "total": total,
            "page": page,
            "size": size,
        }

    @staticmethod
    async def get_by_email(
        db: AsyncSession,
        email: str,
    ) -> User | None:
        result = await db.execute(
            select(User).where(
                User.email == email,
                User.is_deleted == False,
            )
        )

        return result.scalars().first()

    @staticmethod
    async def get_by_employee_id(
        db: AsyncSession,
        employee_id: str,
    ) -> User | None:
        result = await db.execute(
            select(User).where(
                User.employee_id == employee_id,
                User.is_deleted == False,
            )
        )

        return result.scalars().first()

    @staticmethod
    async def get_by_email_excluding_user(
        db: AsyncSession,
        email: str,
        user_id: str,
    ) -> User | None:
        result = await db.execute(
            select(User).where(
                User.email == email,
                User.id != user_id,
                User.is_deleted == False,
            )
        )

        return result.scalars().first()  

    @staticmethod
    async def get_by_employee_id_excluding_user(
        db: AsyncSession,
        employee_id: str,
        user_id: str,
    ) -> User | None:
        result = await db.execute(
            select(User).where(
                User.employee_id == employee_id,
                User.id != user_id,
                User.is_deleted == False,
            )
        )

        return result.scalars().first()      

    @staticmethod
    async def update(
        db: AsyncSession,
        user: User,
    ) -> User:
        await db.commit()
        await db.refresh(user)

        return user

    @staticmethod
    async def soft_delete(
        db: AsyncSession,
        user: User,
    ) -> User:
        user.is_deleted = True
        user.deleted_at = datetime.now(UTC)

        await db.commit()
        await db.refresh(user)

        return user
    @staticmethod
    async def assign_roles(
        db: AsyncSession,
        user_id: str,
        role_ids: list[str],
    ):

        await db.execute(
            delete(user_roles).where(
                user_roles.c.user_id == user_id
            )
        )

        for role_id in role_ids:

            await db.execute(
                insert(user_roles).values(
                    user_id=user_id,
                    role_id=role_id,
                )
            )

        await db.commit()

        return {
            "message": "Roles updated successfully"
        }
        assigned = 0
        skipped = 0

        for role_id in role_ids:

            existing = await db.execute(
                select(user_roles).where(
                    user_roles.c.user_id == user_id,
                    user_roles.c.role_id == role_id,
                )
            )

            if existing.first():
                skipped += 1
                continue

            await db.execute(
                insert(user_roles).values(
                    user_id=user_id,
                    role_id=role_id,
                )
            )

            assigned += 1

        await db.commit()

        return {
            "message": "Roles processed successfully",
            "assigned": assigned,
            "skipped": skipped,
        }  

    @staticmethod
    async def get_user_with_profile(
        db: AsyncSession,
        user_id: str,
    ):
        result = await db.execute(
            select(User)
            .options(
                selectinload(User.department),
                selectinload(User.designation),
            )
            .where(
                User.id == user_id,
                User.is_deleted == False,
            )
        )

        return result.scalars().first()

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        user_id: str,
    ):
        result = await db.execute(
            select(User).where(
                User.id == user_id,
                User.is_deleted == False,
            )
        )

        return result.scalars().first()

    @staticmethod
    async def get_user_by_role(
        db: AsyncSession,
        role_id: str,
    ):
        result = await db.execute(
            select(User)
            .join(
                user_roles,
                User.id == user_roles.c.user_id,
            )
            .where(
                user_roles.c.role_id == role_id,
                User.is_deleted == False,
            )
        )

        return result.scalars().first()
