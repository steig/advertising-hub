export type ErrorKind =
  | 'auth'
  | 'rate_limit'
  | 'validation'
  | 'platform'
  | 'quota'
  | 'not_found';

export type AdvertisingHubError =
  | { kind: 'auth'; message: string; platform: string }
  | { kind: 'rate_limit'; message: string; platform: string; retryAfter: number }
  | { kind: 'validation'; message: string; platform: string }
  | { kind: 'platform'; message: string; platform: string; errorCode: string }
  | { kind: 'quota'; message: string; platform: string }
  | { kind: 'not_found'; message: string; platform: string };

export function createError(kind: ErrorKind, message: string, platform = '', extra?: Record<string, unknown>): AdvertisingHubError {
  const base = { kind, message, platform };
  switch (kind) {
    case 'rate_limit':
      return { ...base, kind: 'rate_limit', retryAfter: (extra?.retryAfter as number) ?? 60 };
    case 'platform':
      return { ...base, kind: 'platform', errorCode: (extra?.errorCode as string) ?? '' };
    default:
      return base as AdvertisingHubError;
  }
}
