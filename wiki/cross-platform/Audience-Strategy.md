# Cross-Platform Audience Strategy

## First-Party Data Is the Moat

With third-party cookies disappearing, first-party data (your CRM, website visitors, purchasers) is the most valuable targeting asset. The strategy is to activate this data consistently across all platforms.

## Customer Match / Custom Audiences by Platform

| Platform | Feature Name | Match Type | Typical Match Rate |
|----------|-------------|-----------|-------------------|
| Google Ads | Customer Match | Email, phone, address | 30-60% |
| Meta Ads | Custom Audiences | Email, phone, MAID | 50-70% |
| Microsoft Ads | Customer Match | Email | 30-50% |
| LinkedIn Ads | Matched Audiences | Email, company | 20-40% (email), higher for company |
| Pinterest Ads | Customer List | Email | 30-50% |
| Amazon Ads | Advertiser Audiences | Email (via DSP) | Varies |
| The Trade Desk | First-Party Data | CRM onboarding | Varies by onboarder |

## Audience Architecture

```
Tier 1: Highest Value (smallest, most qualified)
  └── Purchasers / Customers → Exclusion from prospecting, upsell targeting

Tier 2: Warm (showed intent)
  └── Website visitors, cart abandoners, lead form starters → Retargeting

Tier 3: Expansion (similar to your best)
  └── Lookalike / Similar audiences based on Tier 1 seed lists

Tier 4: Prospecting (broadest)
  └── Interest, in-market, contextual targeting → New audience discovery
```

## Key Principles

1. **Upload the same lists everywhere** — Your purchaser list should be active on Google, Meta, LinkedIn, and Pinterest simultaneously
2. **Refresh weekly minimum** — Stale lists waste impressions on people who've already converted
3. **Always exclude purchasers from prospecting** — Unless you're running upsell/cross-sell campaigns
4. **Hash before upload** — Most platforms accept pre-hashed data. Normalize then hash (lowercase, trim, SHA-256)
