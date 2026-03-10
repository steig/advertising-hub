"""Normalized metrics across all advertising platforms."""
from dataclasses import dataclass
from datetime import date
from typing import Optional

@dataclass
class NormalizedMetrics:
    """Cross-platform metrics. Every platform reports these differently;
    this model normalizes them for apples-to-apples comparison.

    Cost is always in the account's currency.
    Rates are always 0-1 (not percentages).
    """
    platform: str
    date: date
    campaign_id: Optional[str] = None
    ad_group_id: Optional[str] = None

    # Core metrics (every platform has these)
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: float = 0.0
    conversion_value: float = 0.0

    # Derived metrics
    @property
    def ctr(self) -> float:
        return self.clicks / self.impressions if self.impressions > 0 else 0.0

    @property
    def cpc(self) -> float:
        return self.cost / self.clicks if self.clicks > 0 else 0.0

    @property
    def cpa(self) -> float:
        return self.cost / self.conversions if self.conversions > 0 else 0.0

    @property
    def roas(self) -> float:
        return self.conversion_value / self.cost if self.cost > 0 else 0.0

    @property
    def conversion_rate(self) -> float:
        return self.conversions / self.clicks if self.clicks > 0 else 0.0
