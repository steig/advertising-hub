"""Cross-platform reporting schema."""
from dataclasses import dataclass, field
from datetime import date
from typing import Optional
from .metrics import NormalizedMetrics

@dataclass
class CrossPlatformReport:
    """Aggregated report across multiple platforms."""
    date_start: date
    date_end: date
    platforms: list[str] = field(default_factory=list)
    metrics_by_platform: dict[str, list[NormalizedMetrics]] = field(default_factory=dict)

    @property
    def total_spend(self) -> float:
        return sum(m.cost for metrics in self.metrics_by_platform.values() for m in metrics)

    @property
    def total_conversions(self) -> float:
        return sum(m.conversions for metrics in self.metrics_by_platform.values() for m in metrics)

    @property
    def blended_cpa(self) -> float:
        tc = self.total_conversions
        return self.total_spend / tc if tc > 0 else 0.0
