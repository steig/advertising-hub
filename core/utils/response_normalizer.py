"""Transform platform-specific API responses into core models."""
from core.models.campaign import Campaign, CampaignStatus, CampaignType

def normalize_google_campaign(raw: dict) -> Campaign:
    status_map = {"ENABLED": CampaignStatus.ACTIVE, "PAUSED": CampaignStatus.PAUSED, "REMOVED": CampaignStatus.REMOVED}
    return Campaign(
        platform="google-ads",
        name=raw.get("campaign", {}).get("name", ""),
        platform_id=raw.get("campaign", {}).get("resourceName", "").split("/")[-1],
        status=status_map.get(raw.get("campaign", {}).get("status", ""), CampaignStatus.ACTIVE),
        platform_data=raw,
    )

def normalize_meta_campaign(raw: dict) -> Campaign:
    status_map = {"ACTIVE": CampaignStatus.ACTIVE, "PAUSED": CampaignStatus.PAUSED, "ARCHIVED": CampaignStatus.REMOVED}
    return Campaign(
        platform="meta-ads",
        name=raw.get("name", ""),
        platform_id=raw.get("id", ""),
        status=status_map.get(raw.get("status", ""), CampaignStatus.ACTIVE),
        budget_daily=float(raw.get("daily_budget", 0)) / 100 if raw.get("daily_budget") else None,
        platform_data=raw,
    )
