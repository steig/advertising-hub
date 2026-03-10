"""Reddit advertising platform authentication. See platforms/reddit/ for details."""
from dataclasses import dataclass
from .base import BaseAuth, AuthToken

@dataclass
class RedditAuth(BaseAuth):
    platform: str = "reddit"
    def authenticate(self) -> AuthToken:
        raise NotImplementedError("See platforms/reddit/patterns/ for auth setup")
    def refresh(self, token: AuthToken) -> AuthToken:
        raise NotImplementedError
    def validate(self, token: AuthToken) -> bool:
        raise NotImplementedError
