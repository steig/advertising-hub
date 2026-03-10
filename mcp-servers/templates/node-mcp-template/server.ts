/**
 * MCP Server Template for Advertising Platforms
 * Replace PLATFORM_NAME with your target platform.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "PLATFORM_NAME-mcp",
  version: "0.1.0",
}, {
  capabilities: { tools: {} },
});

server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "list_campaigns",
      description: "List campaigns with status and basic metrics",
      inputSchema: {
        type: "object",
        properties: {
          account_id: { type: "string", description: "Account ID" },
          status: { type: "string", enum: ["active", "paused", "all"] },
        },
        required: ["account_id"],
      },
    },
  ],
}));

server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  if (name === "list_campaigns") {
    // TODO: Implement platform API call
    return { content: [{ type: "text", text: JSON.stringify({ campaigns: [] }) }] };
  }
  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
