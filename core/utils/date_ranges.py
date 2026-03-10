"""Consistent date range formatting across platforms."""
from datetime import date, timedelta

def last_n_days(n: int) -> tuple[date, date]:
    end = date.today() - timedelta(days=1)
    start = end - timedelta(days=n - 1)
    return start, end

def this_month() -> tuple[date, date]:
    today = date.today()
    return today.replace(day=1), today

def last_month() -> tuple[date, date]:
    today = date.today()
    first_of_this_month = today.replace(day=1)
    last_of_prev = first_of_this_month - timedelta(days=1)
    return last_of_prev.replace(day=1), last_of_prev

def format_for_platform(d: date, platform: str) -> str:
    """Format date per platform requirements."""
    if platform in ("google-ads", "microsoft-ads"):
        return d.strftime("%Y-%m-%d")
    elif platform == "meta-ads":
        return d.strftime("%Y-%m-%d")
    elif platform == "amazon-ads":
        return d.strftime("%Y%m%d")
    return d.isoformat()
