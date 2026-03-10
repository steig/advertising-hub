"""Spotify advertising platform authentication. See platforms/spotify/ for details."""
from dataclasses import dataclass
from .base import BaseAuth, AuthToken

@dataclass
class SpotifyAuth(BaseAuth):
    platform: str = "spotify"
    def authenticate(self) -> AuthToken:
        raise NotImplementedError("See platforms/spotify/patterns/ for auth setup")
    def refresh(self, token: AuthToken) -> AuthToken:
        raise NotImplementedError
    def validate(self, token: AuthToken) -> bool:
        raise NotImplementedError
