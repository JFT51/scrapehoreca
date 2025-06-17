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

    // Start crawl job
    const crawlResult = await useMCPTool({
      server: 'github.com/mendableai/firecrawl-mcp-server', // This param seems to be part of firecrawl-mcp, keeping it.
      tool: 'firecrawl_crawl',
      params: {
        url,
        maxDepth: 2,
        limit: 50
      }
    });

    // Scrape all discovered pages
    const results = [];
    if (crawlResult && crawlResult.urls && Array.isArray(crawlResult.urls)) {
      for (const pageUrl of crawlResult.urls) {
        const scraped = await useMCPTool({
          server: 'github.com/mendableai/firecrawl-mcp-server',
          tool: 'firecrawl_scrape',
          params: {
            url: pageUrl,
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
        results.push(scraped);
      }
    } else {
      console.warn('Crawl result did not contain a valid URLs array:', crawlResult);
      // Decide if this should be an error or just return empty results for scraping
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: results }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error in crawl function:', error);
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
