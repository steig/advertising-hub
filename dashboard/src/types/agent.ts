export type AgentCategory = 'paid-media' | 'platform-specific' | 'cross-platform' | 'orchestrator';

export interface AgentDefinition {
  name: string;
  slug: string;
  description: string;
  tools: string[];
  author: string;
  category: AgentCategory;
  body: string; // Full markdown content
}
