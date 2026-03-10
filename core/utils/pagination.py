"""Cursor/offset pagination abstraction."""
from dataclasses import dataclass
from typing import Optional, Any

@dataclass
class Page:
    items: list[Any]
    next_cursor: Optional[str] = None
    total_count: Optional[int] = None
    has_more: bool = False
