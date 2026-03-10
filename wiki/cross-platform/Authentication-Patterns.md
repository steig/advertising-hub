# Authentication Patterns Across Platforms

## OAuth2 Platforms

Most advertising APIs use OAuth2 with refresh tokens:

| Platform | Auth Type | Token Lifetime | Refresh | Notes |
|----------|-----------|---------------|---------|-------|
| Google Ads | OAuth2 | 1 hour | ♾️ refresh token | Requires developer token header |
| Meta Ads | OAuth2 / System User | 60 days (user) / ♾️ (system) | Exchange for long-lived | System User preferred for production |
| Microsoft Ads | OAuth2 | 1 hour | ♾️ refresh token | Same Azure AD as other Microsoft APIs |
| Amazon Ads | Login with Amazon | 1 hour | ♾️ refresh token | Separate from AWS credentials |
| LinkedIn Ads | OAuth2 | 60 days | Must re-authorize | No infinite refresh — biggest pain point |
| Pinterest Ads | OAuth2 | 30 days access / 1 year refresh | SDK handles refresh | |
| Criteo | OAuth2 | 5 minutes | ♾️ refresh token | Very short-lived access tokens |

## API Key Platforms

| Platform | Auth Type | Notes |
|----------|-----------|-------|
| The Trade Desk | Partner credentials | Login + password → session token |
| Demandbase | API key | Simple API key authentication |

## Common Auth Gotchas

1. **Google Ads**: You need BOTH OAuth2 credentials AND a developer token. The developer token has access levels (basic vs standard) that affect rate limits.

2. **Meta**: System User tokens are the production path. User tokens expire and require re-auth. Always use System User for automated systems.

3. **LinkedIn**: The 60-day token with no infinite refresh is the biggest friction point. Plan for periodic re-authorization in your workflows.

4. **Amazon**: Login with Amazon (LWA) credentials are separate from AWS. Don't confuse the two.

## Implementation

All auth providers are in `core/auth/`. Each implements the `BaseAuth` interface:

```python
from core.auth.google import GoogleAdsAuth
from core.auth.meta import MetaAdsAuth

# Same interface, different platforms
google = GoogleAdsAuth(client_id="...", client_secret="...", refresh_token="...")
meta = MetaAdsAuth(access_token="...", app_id="...", app_secret="...")

google_token = google.authenticate()
meta_token = meta.authenticate()

# Both return AuthToken with .access_token, .is_expired, .is_refreshable
```
