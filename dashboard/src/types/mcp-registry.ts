export interface MCPServer {
  platform: string;
  name: string;
  repo?: string;
  pypi?: string;
  status: 'live' | 'planned';
  tools?: string[];
  spec?: string;
}

export interface MCPRegistry {
  servers: MCPServer[];
}
