"""Universal ad group / ad set representation."""
from dataclasses import dataclass, field
from typing import Optional
from .campaign import CampaignStatus

@dataclass
class AdGroup:
    """Normalized ad group. Maps to:
    - Google: Ad Group
    - Meta: Ad Set
    - Microsoft: Ad Group
    - Amazon: Ad Group
    - LinkedIn: Campaign Group → Campaign
    - Pinterest: Ad Group
    - TTD: Ad Group
    """
    platform: str
    name: str
    campaign_id: str
    status: CampaignStatus = CampaignStatus.ACTIVE
    bid_amount: Optional[float] = None
    bid_strategy: Optional[str] = None
    targeting: dict = field(default_factory=dict)
    platform_id: Optional[str] = None
    platform_data: dict = field(default_factory=dict)
