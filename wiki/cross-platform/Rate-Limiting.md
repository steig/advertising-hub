# Rate Limiting Across Platforms

## Rate Limits Compared

| Platform | Limit Type | Default Limit | Notes |
|----------|-----------|--------------|-------|
| Google Ads | Daily | 15,000 requests/day (basic) | Standard access: higher limits |
| Meta Ads | Per-minute | ~200 calls/hr per ad account | Varies by app and account |
| Microsoft Ads | Per-second | ~6 requests/sec | Bulk API has separate limits |
| Amazon Ads | Per-second | ~2 requests/sec | Varies by endpoint |
| LinkedIn Ads | Daily | 100,000/day (application) | Per-member limits also apply |
| Pinterest Ads | Per-minute | ~1,000/min | |
| The Trade Desk | Per-second | ~100/sec | Very generous |
| Criteo | Per-minute | ~600/min | |

## Handling Strategies

Use `core/rate_limiting/throttler.py` for adaptive rate limiting:

```python
from core.rate_limiting.throttler import Throttler

throttle = Throttler(platform="google-ads")
for campaign in campaigns:
    throttle.wait_if_needed()
    response = api.get_campaign(campaign.id)
```

## Best Practices

1. **Batch where possible** — Most platforms support batch requests
2. **Cache aggressively** — Campaign structure doesn't change minute-to-minute
3. **Use async reports** — For large data pulls, use async reporting APIs
4. **Implement exponential backoff** — When you hit 429s, back off exponentially
5. **Request higher limits** — Most platforms have a process for increased API access
