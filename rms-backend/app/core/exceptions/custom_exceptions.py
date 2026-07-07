from fastapi import status


class RMSBaseException(Exception):
    """
    Base exception for all RMS application errors.
    """

    def __init__(
        self,
        message: str = "Application error",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_type: str = "rms:error",
        title: str = "Application Error",
    ):
        self.message = message
        self.status_code = status_code
        self.error_type = error_type
        self.title = title
        super().__init__(message)


class AuthenticationError(RMSBaseException):
    def __init__(
        self,
        message: str = "Authentication failed",
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_type="rms:authentication-error",
            title="Authentication Error",
        )


class AuthorizationError(RMSBaseException):
    def __init__(
        self,
        message: str = "Authorization failed",
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_type="rms:authorization-error",
            title="Authorization Error",
        )


class ValidationError(RMSBaseException):
    def __init__(
        self,
        message: str = "Validation failed",
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_type="rms:validation-error",
            title="Validation Error",
        )


class ConflictError(RMSBaseException):
    def __init__(
        self,
        message: str = "Resource conflict",
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            error_type="rms:conflict",
            title="Conflict",
        )


class NotFoundError(RMSBaseException):
    def __init__(
        self,
        resource: str = "Resource",
        resource_id: str | None = None,
    ):
        message = f"{resource} not found"

        if resource_id:
            message = f"{resource} with id '{resource_id}' not found"

        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_type="rms:not-found",
            title="Resource Not Found",
        )

class TokenExpiredError(RMSBaseException):
    def __init__(
        self,
        message: str = "Token has expired",
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_type="rms:token-expired",
            title="Token Expired",
        )


class BusinessRuleError(RMSBaseException):
    def __init__(
        self,
        message: str = "Business rule violation",
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_type="rms:business-rule-violation",
            title="Business Rule Violation",
        )


class WorkflowError(RMSBaseException):
    def __init__(
        self,
        message: str = "Invalid workflow transition",
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_type="rms:workflow-error",
            title="Workflow Error",
        )


class ApprovalError(RMSBaseException):
    def __init__(
        self,
        message: str = "Invalid approval action",
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_type="rms:approval-error",
            title="Approval Error",
        )


class RateLimitError(RMSBaseException):
    def __init__(
        self,
        message: str = "Rate limit exceeded",
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            error_type="rms:rate-limit-exceeded",
            title="Rate Limit Exceeded",
        )


class DatabaseError(RMSBaseException):
    def __init__(
        self,
        message: str = "Database operation failed",
    ):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_type="rms:database-error",
            title="Database Error",
        )


class ExternalServiceError(RMSBaseException):
    def __init__(
        self,
        service: str = "External Service",
        message: str = "Unavailable",
    ):
        super().__init__(
            message=f"{service}: {message}",
            status_code=status.HTTP_502_BAD_GATEWAY,
            error_type="rms:external-service-error",
            title="External Service Error",
        )    