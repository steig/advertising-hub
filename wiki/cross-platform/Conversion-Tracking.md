# Cross-Platform Conversion Tracking

## Server-Side Tracking (The Future)

Every major platform now offers server-side conversion tracking. This is critical as browser-side tracking degrades due to cookie restrictions, ad blockers, and ITP.

| Platform | Server-Side Method | Key Concept |
|----------|--------------------|-------------|
| Google Ads | Enhanced Conversions | SHA-256 hashed user data sent with conversion tag |
| Meta | Conversions API (CAPI) | Server events with deduplication via event_id |
| Microsoft | UET + offline import | Enhanced conversions similar to Google |
| LinkedIn | Conversions API | Server-side events with user matching |
| Pinterest | Conversions API | Server-side event tracking |
| Amazon | Attribution API | Click-through attribution for off-Amazon traffic |
| The Trade Desk | Real-Time Conversion Events | Server-side conversion postback |

## Deduplication Strategy

When running both browser-side and server-side tracking (recommended during transition):

1. Generate a unique `event_id` / `order_id` for each conversion event
2. Send the same ID with BOTH browser event and server event
3. The platform deduplicates based on matching IDs within a time window

See `platforms/meta-ads/patterns/capi-deduplication.md` for the Meta-specific implementation.

## GTM Architecture

For most advertisers, Google Tag Manager remains the orchestration layer:

1. **GTM Web Container**: Browser-side tags (Google, Meta Pixel, LinkedIn Insight, etc.)
2. **GTM Server Container**: Server-side tags (CAPI, enhanced conversions, LinkedIn CAPI)
3. **Data Layer**: Single source of truth for event data

## Attribution Windows

| Platform | Default Click Window | Default View Window | Adjustable? |
|----------|---------------------|--------------------|----|
| Google Ads | 30 days | 1 day | Yes |
| Meta Ads | 7 days click / 1 day view | — | Limited |
| Microsoft Ads | 30 days | 1 day | Yes |
| LinkedIn Ads | 90 days | — | Limited |
| Pinterest | 30 days click / 1 day view | — | Yes |
