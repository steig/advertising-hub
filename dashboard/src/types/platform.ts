export interface RateLimits {
  requestsPerDay?: number;
  requestsPerSecond?: number;
  notes?: string;
}

export interface PlatformApi {
  baseUrl?: string;
  currentVersion?: string;
  authType?: string;
  authUrl?: string;
  tokenUrl?: string;
  scopes?: string[];
  documentation?: string;
  rateLimits?: RateLimits;
}

export interface PlatformLogin {
  url?: string;
  apiConsole?: string;
  developerPortal?: string;
}

export interface UpstreamRepo {
  repo: string;
  description?: string;
  language?: string;
  advertisingRelevant?: boolean;
}

export interface OurTool {
  name: string;
  repo?: string;
  type?: string;
  status?: string;
}

export type PlatformCategory = 'search' | 'social' | 'commerce' | 'display' | 'programmatic' | 'b2b' | 'audio' | 'retargeting';

export interface PlatformCapabilities {
  campaignManagement?: boolean;
  audienceTargeting?: boolean;
  conversionTracking?: boolean;
  reportingApi?: boolean;
  bulkOperations?: boolean;
  realTimeBidding?: boolean;
  creativeUpload?: boolean;
  offlineConversions?: boolean;
  enhancedConversions?: boolean;
  customerMatch?: boolean;
  [key: string]: boolean | undefined;
}

export interface PlatformConfig {
  name: string;
  slug: string;
  category: PlatformCategory;
  status: string;
  api?: PlatformApi;
  login?: PlatformLogin;
  upstreamRepos: UpstreamRepo[];
  ourTools: OurTool[];
  agents: string[];
  capabilities: PlatformCapabilities;
}
