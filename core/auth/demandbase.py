"""Demandbase advertising platform authentication. See platforms/demandbase/ for details."""
from dataclasses import dataclass
from .base import BaseAuth, AuthToken

@dataclass
class DemandbaseAuth(BaseAuth):
    platform: str = "demandbase"
    def authenticate(self) -> AuthToken:
        raise NotImplementedError("See platforms/demandbase/patterns/ for auth setup")
    def refresh(self, token: AuthToken) -> AuthToken:
        raise NotImplementedError
    def validate(self, token: AuthToken) -> bool:
        raise NotImplementedError
