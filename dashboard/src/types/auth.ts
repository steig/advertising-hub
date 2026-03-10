export interface AuthToken {
  accessToken: string;
  tokenType: string;
  expiresAt?: string;
  refreshToken?: string;
  platform: string;
  scopes: string[];
}

export function isExpired(token: AuthToken): boolean {
  if (!token.expiresAt) return false;
  return new Date() >= new Date(token.expiresAt);
}

export function isRefreshable(token: AuthToken): boolean {
  return token.refreshToken != null;
}

/** Per-platform credential field definitions */
export interface PlatformCredentialFields {
  platform: string;
  fields: { key: string; label: string; required: boolean }[];
}

export const PLATFORM_CREDENTIALS: PlatformCredentialFields[] = [
  {
    platform: 'google-ads',
    fields: [
      { key: 'GOOGLE_ADS_DEVELOPER_TOKEN', label: 'Developer Token', required: true },
      { key: 'GOOGLE_ADS_CLIENT_ID', label: 'Client ID', required: true },
      { key: 'GOOGLE_ADS_CLIENT_SECRET', label: 'Client Secret', required: true },
      { key: 'GOOGLE_ADS_REFRESH_TOKEN', label: 'Refresh Token', required: true },
      { key: 'GOOGLE_ADS_LOGIN_CUSTOMER_ID', label: 'Login Customer ID', required: true },
    ],
  },
  {
    platform: 'meta-ads',
    fields: [
      { key: 'META_ACCESS_TOKEN', label: 'Access Token', required: true },
      { key: 'META_APP_ID', label: 'App ID', required: true },
      { key: 'META_APP_SECRET', label: 'App Secret', required: true },
    ],
  },
  {
    platform: 'microsoft-ads',
    fields: [
      { key: 'MICROSOFT_ADS_CLIENT_ID', label: 'Client ID', required: true },
      { key: 'MICROSOFT_ADS_CLIENT_SECRET', label: 'Client Secret', required: true },
      { key: 'MICROSOFT_ADS_REFRESH_TOKEN', label: 'Refresh Token', required: true },
      { key: 'MICROSOFT_ADS_DEVELOPER_TOKEN', label: 'Developer Token', required: true },
    ],
  },
  {
    platform: 'amazon-ads',
    fields: [
      { key: 'AMAZON_ADS_CLIENT_ID', label: 'Client ID', required: true },
      { key: 'AMAZON_ADS_CLIENT_SECRET', label: 'Client Secret', required: true },
      { key: 'AMAZON_ADS_REFRESH_TOKEN', label: 'Refresh Token', required: true },
    ],
  },
  {
    platform: 'linkedin-ads',
    fields: [
      { key: 'LINKEDIN_ACCESS_TOKEN', label: 'Access Token', required: true },
      { key: 'LINKEDIN_CLIENT_ID', label: 'Client ID', required: true },
      { key: 'LINKEDIN_CLIENT_SECRET', label: 'Client Secret', required: true },
    ],
  },
  {
    platform: 'pinterest-ads',
    fields: [
      { key: 'PINTEREST_ACCESS_TOKEN', label: 'Access Token', required: true },
      { key: 'PINTEREST_APP_ID', label: 'App ID', required: true },
      { key: 'PINTEREST_APP_SECRET', label: 'App Secret', required: true },
    ],
  },
  {
    platform: 'thetradedesk',
    fields: [
      { key: 'TTD_PARTNER_ID', label: 'Partner ID', required: true },
      { key: 'TTD_LOGIN', label: 'Login', required: true },
      { key: 'TTD_PASSWORD', label: 'Password', required: true },
    ],
  },
  {
    platform: 'demandbase',
    fields: [
      { key: 'DEMANDBASE_API_KEY', label: 'API Key', required: true },
    ],
  },
  {
    platform: 'criteo',
    fields: [
      { key: 'CRITEO_CLIENT_ID', label: 'Client ID', required: true },
      { key: 'CRITEO_CLIENT_SECRET', label: 'Client Secret', required: true },
    ],
  },
];
