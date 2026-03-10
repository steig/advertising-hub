"""Criteo advertising platform authentication. See platforms/criteo/ for details."""
from dataclasses import dataclass
from .base import BaseAuth, AuthToken

@dataclass
class CriteoAuth(BaseAuth):
    platform: str = "criteo"
    def authenticate(self) -> AuthToken:
        raise NotImplementedError("See platforms/criteo/patterns/ for auth setup")
    def refresh(self, token: AuthToken) -> AuthToken:
        raise NotImplementedError
    def validate(self, token: AuthToken) -> bool:
        raise NotImplementedError
