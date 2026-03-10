"""Pinterest advertising platform authentication. See platforms/pinterest/ for details."""
from dataclasses import dataclass
from .base import BaseAuth, AuthToken

@dataclass
class PinterestAuth(BaseAuth):
    platform: str = "pinterest"
    def authenticate(self) -> AuthToken:
        raise NotImplementedError("See platforms/pinterest/patterns/ for auth setup")
    def refresh(self, token: AuthToken) -> AuthToken:
        raise NotImplementedError
    def validate(self, token: AuthToken) -> bool:
        raise NotImplementedError
