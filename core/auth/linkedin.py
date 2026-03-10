"""LinkedIn advertising platform authentication. See platforms/linkedin/ for details."""
from dataclasses import dataclass
from .base import BaseAuth, AuthToken

@dataclass
class LinkedInAuth(BaseAuth):
    platform: str = "linkedin"
    def authenticate(self) -> AuthToken:
        raise NotImplementedError("See platforms/linkedin/patterns/ for auth setup")
    def refresh(self, token: AuthToken) -> AuthToken:
        raise NotImplementedError
    def validate(self, token: AuthToken) -> bool:
        raise NotImplementedError
