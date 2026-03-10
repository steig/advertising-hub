"""Abstract base class for platform authentication."""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class AuthToken:
    """Normalized authentication token across platforms."""
    access_token: str
    token_type: str = "Bearer"
    expires_at: Optional[datetime] = None
    refresh_token: Optional[str] = None
    platform: str = ""
    scopes: list[str] = field(default_factory=list)

    @property
    def is_expired(self) -> bool:
        if self.expires_at is None:
            return False
        return datetime.utcnow() >= self.expires_at

    @property
    def is_refreshable(self) -> bool:
        return self.refresh_token is not None


class BaseAuth(ABC):
    """Abstract authentication provider.

    All platform auth classes implement this interface for consistent
    authentication across all 14 supported platforms.
    """
    platform: str = ""

    @abstractmethod
    def authenticate(self) -> AuthToken:
        """Perform initial authentication and return a token."""
        ...

    @abstractmethod
    def refresh(self, token: AuthToken) -> AuthToken:
        """Refresh an expired token."""
        ...

    @abstractmethod
    def validate(self, token: AuthToken) -> bool:
        """Validate that a token is still active."""
        ...

    def get_headers(self, token: AuthToken) -> dict[str, str]:
        """Return authorization headers for API requests."""
        return {"Authorization": f"{token.token_type} {token.access_token}"}
