"""Multi-currency handling for advertising platforms."""

# Platforms that report cost in micros (millionths of currency unit)
MICRO_PLATFORMS = {"google-ads", "microsoft-ads"}
MICRO_MULTIPLIER = 1_000_000

def from_micros(value: int, platform: str) -> float:
    """Convert micro-amounts to standard currency."""
    if platform in MICRO_PLATFORMS:
        return value / MICRO_MULTIPLIER
    return float(value)

def to_micros(value: float, platform: str) -> int:
    """Convert standard currency to micro-amounts."""
    if platform in MICRO_PLATFORMS:
        return int(value * MICRO_MULTIPLIER)
    return int(value)
