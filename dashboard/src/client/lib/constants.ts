/** Shared constants used across multiple components */

export const PLATFORM_CATEGORY_COLORS: Record<string, string> = {
  search: 'bg-blue-500/20 text-blue-400',
  social: 'bg-purple-500/20 text-purple-400',
  commerce: 'bg-amber-500/20 text-amber-400',
  display: 'bg-rose-500/20 text-rose-400',
  programmatic: 'bg-cyan-500/20 text-cyan-400',
  b2b: 'bg-green-500/20 text-green-400',
  audio: 'bg-pink-500/20 text-pink-400',
  retargeting: 'bg-orange-500/20 text-orange-400',
};

export const AGENT_CATEGORY_COLORS: Record<string, string> = {
  'paid-media': 'bg-blue-500/20 text-blue-400',
  'platform-specific': 'bg-purple-500/20 text-purple-400',
  'cross-platform': 'bg-cyan-500/20 text-cyan-400',
  orchestrator: 'bg-amber-500/20 text-amber-400',
};

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  planned: 'bg-yellow-500/20 text-yellow-400',
  beta: 'bg-blue-500/20 text-blue-400',
};

export const CAPABILITY_LABELS: Record<string, string> = {
  campaignManagement: 'Campaign Management',
  audienceTargeting: 'Audience Targeting',
  conversionTracking: 'Conversion Tracking',
  reportingApi: 'Reporting API',
  bulkOperations: 'Bulk Operations',
  realTimeBidding: 'Real-Time Bidding',
  creativeUpload: 'Creative Upload',
  offlineConversions: 'Offline Conversions',
  enhancedConversions: 'Enhanced Conversions',
  customerMatch: 'Customer Match',
};
