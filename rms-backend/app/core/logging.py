"""
RMS Backend - Structured Logging Configuration

Enterprise-grade structured logging using structlog with JSON output
for production and colored console output for development.
Supports log file rotation and integration with FastAPI request lifecycle.
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path
from typing import Any

import structlog
from structlog.stdlib import ProcessorFormatter

from app.core.config import LoggingSettings, settings


# ── Shared Processors ────────────────────────────────────────
SHARED_PROCESSORS: list[Any] = [
    structlog.contextvars.merge_contextvars,
    structlog.stdlib.add_logger_name,
    structlog.stdlib.add_log_level,
    structlog.stdlib.PositionalArgumentsFormatter(),
    structlog.processors.TimeStamper(fmt="iso"),
    structlog.processors.StackInfoRenderer(),
    structlog.processors.UnicodeDecoder(),
    structlog.processors.CallsiteParameterAdder(
        parameters=[
            structlog.processors.CallsiteParameter.FILENAME,
            structlog.processors.CallsiteParameter.FUNC_NAME,
            structlog.processors.CallsiteParameter.LINENO,
        ],
    ),
]


def _add_app_context(
    logger: Any, method_name: str, event_dict: dict[str, Any]
) -> dict[str, Any]:
    """Add application context to every log entry."""
    event_dict["app"] = settings.app_name
    event_dict["environment"] = settings.app_env.value
    event_dict["version"] = settings.app_version
    return event_dict


def _json_formatter(
    logger: Any, method_name: str, event_dict: dict[str, Any]
) -> dict[str, Any]:
    """Format log entry as JSON for production log aggregation."""
    return event_dict


def _console_formatter(
    logger: Any, method_name: str, event_dict: dict[str, Any]
) -> str:
    """Format log entry as colored console output for development."""
    return structlog.dev.ConsoleRenderer()(logger, method_name, event_dict)


# ── Logging Setup ────────────────────────────────────────────
def setup_logging(logging_settings: LoggingSettings | None = None) -> None:
    """
    Configure structured logging for the application.

    In production: JSON output to stdout for log aggregation (ELK, Datadog, etc.)
    In development: Colored console output for readability
    Optionally writes to rotating log files when file_enabled is True.

    Args:
        logging_settings: Override default logging settings. Uses global
                         settings if not provided.
    """
    log_config = logging_settings or settings.logging

    # Determine format processor based on configuration
    if log_config.format == "json" or settings.is_production:
        format_processor = structlog.processors.JSONRenderer()
    else:
        format_processor = structlog.dev.ConsoleRenderer()

    # Configure structlog
    structlog.configure(
        processors=[
            *_get_pre_processors(),
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Configure standard library logging
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_config.level.upper(), logging.DEBUG))

    # Remove existing handlers
    root_logger.handlers.clear()

    # Console handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_config.level.upper(), logging.DEBUG))
    console_handler.setFormatter(
        ProcessorFormatter(
            processors=[
                structlog.stdlib.ProcessorFormatter.remove_processors_meta,
                format_processor,
            ],
            foreign_pre_chain=_get_pre_processors(),
        )
    )
    root_logger.addHandler(console_handler)

    # File handler (optional, with rotation)
    if log_config.file_enabled:
        _setup_file_handler(log_config, format_processor)

    # Quiet noisy third-party loggers
    _quiet_third_party_loggers()


def _get_pre_processors() -> list[Any]:
    """Return the list of pre-formatting processors."""
    return [
        _add_app_context,
        *SHARED_PROCESSORS,
    ]


def _setup_file_handler(log_config: LoggingSettings, format_processor: Any) -> None:
    """Set up rotating file handler for persistent log storage."""
    from logging.handlers import RotatingFileHandler

    log_path = Path(log_config.file_path)
    log_path.parent.mkdir(parents=True, exist_ok=True)

    file_handler = RotatingFileHandler(
        filename=log_config.file_path,
        maxBytes=log_config.file_max_size_mb * 1024 * 1024,
        backupCount=log_config.file_backup_count,
        encoding="utf-8",
    )
    file_handler.setLevel(getattr(logging, log_config.level.upper(), logging.DEBUG))
    file_handler.setFormatter(
        ProcessorFormatter(
            processors=[
                structlog.stdlib.ProcessorFormatter.remove_processors_meta,
                # Always use JSON for file output
                structlog.processors.JSONRenderer(),
            ],
            foreign_pre_chain=_get_pre_processors(),
        )
    )
    logging.getLogger().addHandler(file_handler)


def _quiet_third_party_loggers() -> None:
    """Reduce verbosity of third-party library loggers."""
    noisy_loggers = [
        "sqlalchemy",
        "alembic",
        "uvicorn.access",
        "httpx",
        "httpcore",
        "asyncio",
    ]
    for logger_name in noisy_loggers:
        logging.getLogger(logger_name).setLevel(logging.WARNING)


# ── Logger Factory ───────────────────────────────────────────
def get_logger(name: str | None = None) -> Any:
    """
    Get a structured logger instance.

    Args:
        name: Logger name, typically __name__ of the calling module.

    Returns:
        A bound structlog logger instance.

    Usage:
        logger = get_logger(__name__)
        logger.info("request_processed", path="/api/v1/users", duration_ms=42)
    """
    return structlog.get_logger(name)


# ── Request Context Logging ──────────────────────────────────
def bind_request_context(
    request_id: str,
    user_id: str | None = None,
    ip_address: str | None = None,
) -> None:
    """
    Bind request-scoped context to structured logging.

    All subsequent log entries within this request will include
    the bound context variables automatically.

    Args:
        request_id: Unique request identifier (UUID).
        user_id: Authenticated user ID, if available.
        ip_address: Client IP address.
    """
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(
        request_id=request_id,
        user_id=user_id,
        ip_address=ip_address,
    )


def clear_request_context() -> None:
    """Clear request-scoped logging context."""
    structlog.contextvars.clear_contextvars()
