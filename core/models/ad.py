"""Universal ad creative representation."""
from dataclasses import dataclass, field
from typing import Optional
from .campaign import CampaignStatus

@dataclass
class Ad:
    """Normalized ad creative. Maps across all platforms."""
    platform: str
    name: str
    ad_group_id: str
    status: CampaignStatus = CampaignStatus.ACTIVE
    headlines: list[str] = field(default_factory=list)
    descriptions: list[str] = field(default_factory=list)
    final_url: Optional[str] = None
    display_url: Optional[str] = None
    image_urls: list[str] = field(default_factory=list)
    video_urls: list[str] = field(default_factory=list)
    platform_id: Optional[str] = None
    platform_data: dict = field(default_factory=dict)
