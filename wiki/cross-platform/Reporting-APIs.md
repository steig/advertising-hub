# Cross-Platform Reporting APIs

## API Report Endpoints by Platform

| Platform | Report Method | Format | Async? |
|----------|-------------|--------|--------|
| Google Ads | GAQL queries via Search endpoint | JSON stream | No (streaming) |
| Meta Ads | Insights API on campaign/adset/ad | JSON | Yes (for large reports) |
| Microsoft Ads | Reporting API | CSV/TSV | Yes |
| Amazon Ads | Reporting API v3 | JSON/CSV | Yes |
| LinkedIn Ads | Analytics Finder | JSON | No |
| Pinterest Ads | Analytics endpoint | JSON | No |
| The Trade Desk | MyReports API | CSV | Yes |
| Criteo | Statistics API | JSON | Yes |

## Normalized Metrics

Use `core/models/metrics.py` to normalize metrics across platforms:

```python
from core.models.metrics import NormalizedMetrics

# Same interface regardless of source
google_metrics = NormalizedMetrics(
    platform="google-ads", date=today,
    impressions=10000, clicks=500, cost=250.00,  # Already converted from micros
    conversions=25, conversion_value=2500.00
)

print(f"CPC: ${google_metrics.cpc:.2f}")  # $0.50
print(f"ROAS: {google_metrics.roas:.1f}x")  # 10.0x
```

## Cost Format Gotchas

- **Google Ads**: Reports cost in micros (multiply by 1,000,000). $5.00 = 5,000,000 micros.
- **Meta Ads**: Reports cost in account currency units (dollars, not cents).
- **Microsoft Ads**: Reports cost in micros, same as Google.
- **Amazon Ads**: Reports cost in dollars.
- **LinkedIn Ads**: Reports cost in account currency (dollars).

Use `core/utils/currency.py` to handle conversions.
