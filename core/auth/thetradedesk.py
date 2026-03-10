"""TradeDesk advertising platform authentication. See platforms/thetradedesk/ for details."""
from dataclasses import dataclass
from .base import BaseAuth, AuthToken

@dataclass
class TradeDeskAuth(BaseAuth):
    platform: str = "thetradedesk"
    def authenticate(self) -> AuthToken:
        raise NotImplementedError("See platforms/thetradedesk/patterns/ for auth setup")
    def refresh(self, token: AuthToken) -> AuthToken:
        raise NotImplementedError
    def validate(self, token: AuthToken) -> bool:
        raise NotImplementedError
