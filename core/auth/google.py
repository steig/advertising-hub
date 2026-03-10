"""Google Ads OAuth2 authentication.

Setup: console.cloud.google.com → Enable Google Ads API → OAuth2 credentials → Developer token
Docs: https://developers.google.com/google-ads/api/docs/oauth/overview
"""
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional
from .base import BaseAuth, AuthToken


@dataclass
class GoogleAdsAuth(BaseAuth):
    platform: str = "google-ads"
    client_id: str = ""
    client_secret: str = ""
    refresh_token: str = ""
    developer_token: str = ""
    login_customer_id: Optional[str] = None
    TOKEN_URL: str = "https://oauth2.googleapis.com/token"

    def authenticate(self) -> AuthToken:
        import httpx
        response = httpx.post(self.TOKEN_URL, data={
            "client_id": self.client_id, "client_secret": self.client_secret,
            "refresh_token": self.refresh_token, "grant_type": "refresh_token",
        })
        response.raise_for_status()
        data = response.json()
        return AuthToken(
            access_token=data["access_token"], platform=self.platform,
            expires_at=datetime.utcnow() + timedelta(seconds=data.get("expires_in", 3600)),
            refresh_token=self.refresh_token,
        )

    def refresh(self, token: AuthToken) -> AuthToken:
        return self.authenticate()

    def validate(self, token: AuthToken) -> bool:
        return not token.is_expired

    def get_headers(self, token: AuthToken) -> dict[str, str]:
        headers = super().get_headers(token)
        headers["developer-token"] = self.developer_token
        if self.login_customer_id:
            headers["login-customer-id"] = self.login_customer_id
        return headers
