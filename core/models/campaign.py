"""Universal campaign representation across all advertising platforms."""
from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from typing import Optional

class CampaignStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    REMOVED = "removed"
    DRAFT = "draft"

class CampaignType(str, Enum):
    SEARCH = "search"
    SHOPPING = "shopping"
    DISPLAY = "display"
    VIDEO = "video"
    SOCIAL = "social"
    PMAX = "performance_max"
    DEMAND_GEN = "demand_gen"
    APP = "app"
    AUDIO = "audio"
    PROGRAMMATIC = "programmatic"
    SPONSORED = "sponsored"

@dataclass
class Campaign:
    """Normalized campaign model. Maps to:
    - Google Ads: Campaign
    - Meta: Campaign
    - Microsoft: Campaign
    - Amazon: Campaign (Sponsored Products/Brands/Display)
    - LinkedIn: Campaign
    - Pinterest: Campaign
    - The Trade Desk: Campaign
    """
    platform: str
    name: str
    campaign_type: CampaignType = CampaignType.SEARCH
    status: CampaignStatus = CampaignStatus.ACTIVE
    budget_daily: Optional[float] = None
    budget_lifetime: Optional[float] = None
    currency: str = "USD"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    platform_id: Optional[str] = None
    platform_data: dict = field(default_factory=dict)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
