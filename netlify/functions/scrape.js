// netlify/functions/scrape.js
const { useMCPTool } = require('../common/mcp_tool');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { url } = body;

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'URL is required in the request body.' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const result = await useMCPTool({
      server: 'github.com/mendableai/firecrawl-mcp-server', // Consistent with crawl.js
      tool: 'firecrawl_scrape',
      params: {
        url,
        formats: ["extract"],
        extract: {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              phone: { type: "string" },
              email: { type: "string" },
              address: { type: "string" },
              website: { type: "string" }
            }
          },
          systemPrompt: "Extract contact details matching bi-person=name, bi-telephone=phone, bi-envelope=email, bi-mailbox=address, bi-cloud=website"
        }
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: result }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error in scrape function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
