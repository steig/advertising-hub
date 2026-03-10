"""Amazon advertising platform authentication. See platforms/amazon/ for details."""
from dataclasses import dataclass
from .base import BaseAuth, AuthToken

@dataclass
class AmazonAuth(BaseAuth):
    platform: str = "amazon"
    def authenticate(self) -> AuthToken:
        raise NotImplementedError("See platforms/amazon/patterns/ for auth setup")
    def refresh(self, token: AuthToken) -> AuthToken:
        raise NotImplementedError
    def validate(self, token: AuthToken) -> bool:
        raise NotImplementedError
