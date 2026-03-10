"""Adaptive rate limiter that respects platform-specific limits."""
import time
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class RateLimitConfig:
    requests_per_second: Optional[float] = None
    requests_per_minute: Optional[float] = None
    requests_per_day: Optional[int] = None
    retry_after_header: str = "Retry-After"

# Platform defaults
PLATFORM_LIMITS = {
    "google-ads": RateLimitConfig(requests_per_day=15000),
    "meta-ads": RateLimitConfig(requests_per_minute=200),
    "microsoft-ads": RateLimitConfig(requests_per_second=6),
    "amazon-ads": RateLimitConfig(requests_per_second=2),
    "linkedin-ads": RateLimitConfig(requests_per_day=100000),
    "pinterest-ads": RateLimitConfig(requests_per_minute=1000),
    "thetradedesk": RateLimitConfig(requests_per_second=100),
    "criteo": RateLimitConfig(requests_per_minute=600),
}

@dataclass
class Throttler:
    platform: str
    config: RateLimitConfig = field(default_factory=RateLimitConfig)
    _last_request: float = 0.0

    def __post_init__(self):
        if self.platform in PLATFORM_LIMITS:
            self.config = PLATFORM_LIMITS[self.platform]

    def wait_if_needed(self):
        if self.config.requests_per_second:
            min_interval = 1.0 / self.config.requests_per_second
            elapsed = time.time() - self._last_request
            if elapsed < min_interval:
                time.sleep(min_interval - elapsed)
        self._last_request = time.time()
