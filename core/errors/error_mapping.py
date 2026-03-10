"""Maps platform-specific error codes to unified error types."""
from .exceptions import *

# Google Ads error code → unified exception
GOOGLE_ADS_ERRORS = {
    "AUTHENTICATION_ERROR": AuthenticationError,
    "AUTHORIZATION_ERROR": AuthenticationError,
    "RATE_EXCEEDED": RateLimitError,
    "QUOTA_CHECK_FAILED": QuotaExceededError,
    "REQUEST_ERROR": ValidationError,
    "NOT_FOUND": ResourceNotFoundError,
}

# Meta Marketing API error code → unified exception
META_ADS_ERRORS = {
    190: AuthenticationError,       # Invalid OAuth access token
    4: RateLimitError,              # Application request limit reached
    17: RateLimitError,             # User request limit reached
    100: ValidationError,           # Invalid parameter
    803: ResourceNotFoundError,     # Resource not found
}

def map_google_error(error_type: str, message: str = "") -> AdvertisingHubError:
    exc_class = GOOGLE_ADS_ERRORS.get(error_type, PlatformError)
    return exc_class(message, platform="google-ads")

def map_meta_error(error_code: int, message: str = "") -> AdvertisingHubError:
    exc_class = META_ADS_ERRORS.get(error_code, PlatformError)
    return exc_class(message, platform="meta-ads")
