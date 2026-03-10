export type CampaignStatus = 'active' | 'paused' | 'removed' | 'draft';

export type CampaignType =
  | 'search' | 'shopping' | 'display' | 'video' | 'social'
  | 'performance_max' | 'demand_gen' | 'app' | 'audio'
  | 'programmatic' | 'sponsored';

export interface Campaign {
  platform: string;
  name: string;
  campaignType: CampaignType;
  status: CampaignStatus;
  budgetDaily?: number;
  budgetLifetime?: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  platformId?: string;
  platformData: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
