// netlify/common/mcp_tool.js
const { execSync } = require('child_process');

async function useMCPTool({ server, tool, params }) {
  try {
    if (!process.env.FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set.');
    }
    const apiKey = process.env.FIRECRAWL_API_KEY;

    const cmd = `npx -y firecrawl-mcp --api-key ${apiKey} ${tool} ` +
      Object.entries(params).map(([k,v]) => {
        if (typeof v === 'object') {
          return `--${k} '${JSON.stringify(v)}'`;
        }
        return `--${k} "${v}"`;
      }).join(' ');

    const result = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    return JSON.parse(result);
  } catch (error) {
    console.error('MCP Execution Error:', error.stderr ? error.stderr.toString() : error.message);
    throw new Error(`MCP Command Failed: ${error.stderr ? error.stderr.toString() : error.message}`);
  }
}

module.exports = { useMCPTool };
