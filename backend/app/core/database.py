"""
RMS Backend - Async Database Configuration

Enterprise-grade async SQLAlchemy 2.0 setup with connection pooling,
session management, and graceful shutdown for FastAPI.
Uses asyncpg as the async PostgreSQL driver.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

from sqlalchemy import event, pool, text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


# ── Async Engine Factory ─────────────────────────────────────
def _create_async_engine() -> AsyncEngine:
    """
    Create an async SQLAlchemy engine with production-ready configuration.

    Configures connection pooling, statement timeouts, and connection
    validation appropriate for enterprise PostgreSQL deployments.
    """
    engine = create_async_engine(
        settings.db.dsn,
        echo=settings.db.echo,
        pool_size=settings.db.pool_size,
        max_overflow=settings.db.max_overflow,
        pool_recycle=settings.db.pool_recycle,
        pool_pre_ping=settings.db.pool_pre_ping,
        pool_timeout=settings.db.connect_timeout,
        connect_args={
            "timeout": settings.db.connect_timeout,
            "command_timeout": 60,
            "server_settings": {
                "application_name": "rms-backend",
                "jit": "off",
            },
        },
    )

    # Set search_path to application schema on each new connection
    @event.listens_for(engine.sync_engine, "connect")
    def _set_search_path(dbapi_connection: Any, connection_record: Any) -> None:
        """Set default schema search path for each new database connection."""
        cursor = dbapi_connection.cursor()
        cursor.execute(f"SET search_path TO {settings.db.schema}, public")
        cursor.close()

    return engine


# ── Module-Level Instances ───────────────────────────────────
async_engine: AsyncEngine = _create_async_engine()

async_session_factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# ── Declarative Base ─────────────────────────────────────────
class Base(DeclarativeBase):
    """
    SQLAlchemy declarative base for all RMS models.

    All ORM models should inherit from this class to be registered
    with the metadata for migration generation.
    """

    type_annotation_map = {
        # Extend with custom type mappings as needed
    }


# ── Session Dependencies ────────────────────────────────────
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields an async database session.

    Automatically handles commit/rollback based on exception state.
    Ensures sessions are always properly closed after request completion.

    Usage in FastAPI endpoints:
        @router.get("/items")
        async def list_items(db: AsyncSession = Depends(get_db_session)):
            result = await db.execute(select(Item))
            return result.scalars().all()
    """
    session = async_session_factory()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager for database sessions outside of FastAPI requests.

    Useful for background tasks, scripts, and standalone operations
    that need database access without HTTP request context.

    Usage:
        async with get_db_context() as db:
            result = await db.execute(select(User))
            users = result.scalars().all()
    """
    session = async_session_factory()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


# ── Database Health Check ────────────────────────────────────
async def check_database_connection() -> dict[str, Any]:
    """
    Verify database connectivity and return connection metadata.

    Returns a dictionary with health status, PostgreSQL version,
    connection pool statistics, and current database time.
    Used by the health check endpoint for monitoring.
    """
    try:
        async with async_engine.connect() as connection:
            # Execute a simple query to verify connectivity
            result = await connection.execute(text("SELECT version()"))
            pg_version = result.scalar()

            # Get current database time
            time_result = await connection.execute(text("SELECT NOW()"))
            db_time = time_result.scalar()

            # Pool statistics
            pool_status = {
                "pool_size": async_engine.pool.status(),
                "checked_out": async_engine.pool.checkedout(),
                "checked_in": async_engine.pool.checkedin(),
                "overflow": async_engine.pool.overflow(),
            }

            return {
                "status": "healthy",
                "postgresql_version": str(pg_version),
                "database_time": str(db_time),
                "pool": pool_status,
            }
    except Exception as exc:
        return {
            "status": "unhealthy",
            "error": str(exc),
        }


# ── Graceful Shutdown ────────────────────────────────────────
async def close_database_connection() -> None:
    """
    Gracefully dispose of the async engine and all connections.

    Called during application shutdown to ensure all database
    connections are properly released before the process exits.
    """
    await async_engine.dispose()

async def get_db():

    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
