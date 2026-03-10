export interface NormalizedMetrics {
  platform: string;
  date: string;
  campaignId?: string;
  adGroupId?: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversionValue: number;
}

export interface ComputedMetrics {
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  conversionRate: number;
}

export function computeMetrics(m: NormalizedMetrics): ComputedMetrics {
  return {
    ctr: m.impressions > 0 ? m.clicks / m.impressions : 0,
    cpc: m.clicks > 0 ? m.cost / m.clicks : 0,
    cpa: m.conversions > 0 ? m.cost / m.conversions : 0,
    roas: m.cost > 0 ? m.conversionValue / m.cost : 0,
    conversionRate: m.clicks > 0 ? m.conversions / m.clicks : 0,
  };
}

/** Platforms that report cost in micros (millionths of currency unit) */
const MICRO_PLATFORMS = new Set(['google-ads', 'microsoft-ads']);

export function fromMicros(value: number, platform: string): number {
  return MICRO_PLATFORMS.has(platform) ? value / 1_000_000 : value;
}

export function toMicros(value: number, platform: string): number {
  return MICRO_PLATFORMS.has(platform) ? Math.round(value * 1_000_000) : Math.round(value);
}
