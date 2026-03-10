"""Meta (Facebook/Instagram) Marketing API authentication.

Setup: developers.facebook.com → Create App → Add Marketing API → System User token
Docs: https://developers.facebook.com/docs/marketing-apis/overview/authentication
"""
from dataclasses import dataclass
from datetime import datetime, timedelta
from .base import BaseAuth, AuthToken


@dataclass
class MetaAdsAuth(BaseAuth):
    platform: str = "meta-ads"
    access_token: str = ""
    app_id: str = ""
    app_secret: str = ""
    api_version: str = "v21.0"
    GRAPH_URL: str = "https://graph.facebook.com"

    def authenticate(self) -> AuthToken:
        return AuthToken(access_token=self.access_token, platform=self.platform)

    def exchange_for_long_lived(self) -> AuthToken:
        import httpx
        response = httpx.get(f"{self.GRAPH_URL}/{self.api_version}/oauth/access_token", params={
            "grant_type": "fb_exchange_token", "client_id": self.app_id,
            "client_secret": self.app_secret, "fb_exchange_token": self.access_token,
        })
        response.raise_for_status()
        data = response.json()
        return AuthToken(
            access_token=data["access_token"], platform=self.platform,
            expires_at=datetime.utcnow() + timedelta(seconds=data.get("expires_in", 5184000)),
        )

    def refresh(self, token: AuthToken) -> AuthToken:
        return self.exchange_for_long_lived()

    def validate(self, token: AuthToken) -> bool:
        import httpx
        resp = httpx.get(f"{self.GRAPH_URL}/debug_token", params={
            "input_token": token.access_token, "access_token": f"{self.app_id}|{self.app_secret}",
        })
        return resp.json().get("data", {}).get("is_valid", False)
