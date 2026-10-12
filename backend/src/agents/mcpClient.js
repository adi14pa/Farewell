import "dotenv/config";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

let clientPromise;

/**
 * Lazily connects to SerpApi's hosted MCP server (mcp.serpapi.com) once per
 * process and reuses the connection for every subsequent tool call.
 */
function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const key = process.env.SERPAPI_API_KEY;
      if (!key) throw new Error("SERPAPI_API_KEY is not set");

      const url = new URL(`https://mcp.serpapi.com/${key}/mcp`);
      const transport = new StreamableHTTPClientTransport(url);
      const client = new Client(
        { name: "trip-planner-agent", version: "1.0.0" },
        { capabilities: {} }
      );
      await client.connect(transport);
      return client;
    })();
  }
  return clientPromise;
}

/**
 * Calls the SerpApi MCP server's single `search` tool for any engine
 * (google_flights, google_hotels, google_local, ...).
 * Returns the parsed JSON result payload.
 */
export async function serpSearch(params, mode = "compact") {
  const client = await getClient();
  const result = await client.callTool({
    name: "search",
    arguments: { params, mode },
  });

  if (result.isError) {
    const msg = result.content?.[0]?.text || "SerpApi MCP tool call failed";
    throw new Error(msg);
  }

  const raw = result.structuredContent?.result ?? result.content?.[0]?.text;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}
