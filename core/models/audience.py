"""Universal audience / segment representation."""
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

class AudienceType(str, Enum):
    FIRST_PARTY = "first_party"
    LOOKALIKE = "lookalike"
    SIMILAR = "similar"
    IN_MARKET = "in_market"
    AFFINITY = "affinity"
    CUSTOM_INTENT = "custom_intent"
    RETARGETING = "retargeting"
    ACCOUNT_LIST = "account_list"

@dataclass
class Audience:
    """Normalized audience. Maps to Customer Match, Custom Audiences, etc."""
    platform: str
    name: str
    audience_type: AudienceType
    size: Optional[int] = None
    description: Optional[str] = None
    platform_id: Optional[str] = None
    platform_data: dict = field(default_factory=dict)
