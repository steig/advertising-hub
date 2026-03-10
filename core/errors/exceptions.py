"""Cross-platform error types."""

class AdvertisingHubError(Exception):
    """Base exception for all advertising hub errors."""
    platform: str = ""

class AuthenticationError(AdvertisingHubError):
    """Token expired, invalid credentials, or insufficient permissions."""
    pass

class RateLimitError(AdvertisingHubError):
    """Platform rate limit exceeded. Check retry_after."""
    def __init__(self, message: str, retry_after: int = 60, platform: str = ""):
        super().__init__(message)
        self.retry_after = retry_after
        self.platform = platform

class ValidationError(AdvertisingHubError):
    """Invalid request parameters (budget too low, invalid targeting, etc.)."""
    pass

class PlatformError(AdvertisingHubError):
    """Platform-specific error that doesn't map to a common type."""
    def __init__(self, message: str, platform: str = "", error_code: str = ""):
        super().__init__(message)
        self.platform = platform
        self.error_code = error_code

class QuotaExceededError(AdvertisingHubError):
    """Daily/monthly API quota exhausted."""
    pass

class ResourceNotFoundError(AdvertisingHubError):
    """Campaign, ad group, or ad not found."""
    pass
