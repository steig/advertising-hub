import { Check, X } from 'lucide-react';
import type { PlatformConfig } from '../../../types/platform';

const capabilityLabels: Record<string, string> = {
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

export function CapabilityMatrix({ platforms }: { platforms: PlatformConfig[] }) {
  const allCaps = new Set<string>();
  for (const p of platforms) {
    for (const key of Object.keys(p.capabilities)) {
      allCaps.add(key);
    }
  }
  const capabilities = Array.from(allCaps);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="sticky left-0 bg-slate-900 text-left py-3 px-4 text-slate-300 font-medium z-10">
              Capability
            </th>
            {platforms.map(p => (
              <th key={p.slug} className="py-3 px-4 text-center text-slate-300 font-medium whitespace-nowrap">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {capabilities.map(cap => (
            <tr key={cap} className="border-b border-slate-800">
              <td className="sticky left-0 bg-slate-900 py-2.5 px-4 text-slate-400 z-10">
                {capabilityLabels[cap] || cap}
              </td>
              {platforms.map(p => (
                <td key={p.slug} className="py-2.5 px-4 text-center">
                  {p.capabilities[cap] ? (
                    <Check size={16} className="inline text-green-400" />
                  ) : (
                    <X size={16} className="inline text-slate-600" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
