import type { NormalizedMetrics } from './metrics';

export interface CrossPlatformReport {
  dateStart: string;
  dateEnd: string;
  platforms: string[];
  metricsByPlatform: Record<string, NormalizedMetrics[]>;
}

export function totalSpend(report: CrossPlatformReport): number {
  return Object.values(report.metricsByPlatform)
    .flat()
    .reduce((sum, m) => sum + m.cost, 0);
}

export function totalConversions(report: CrossPlatformReport): number {
  return Object.values(report.metricsByPlatform)
    .flat()
    .reduce((sum, m) => sum + m.conversions, 0);
}

export function blendedCpa(report: CrossPlatformReport): number {
  const tc = totalConversions(report);
  return tc > 0 ? totalSpend(report) / tc : 0;
}
