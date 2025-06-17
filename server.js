const express = require('express');
const app = express();
const port = 3002;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Crawl endpoint
app.post('/crawl', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Start crawl job
    const crawlResult = await useMCPTool({
      server: 'github.com/mendableai/firecrawl-mcp-server',
      tool: 'firecrawl_crawl',
      params: {
        url,
        maxDepth: 2,
        limit: 50
      }
    });

    // Scrape all discovered pages
    const results = [];
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

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

// Scrape endpoint
app.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Use Firecrawl MCP tool
    const result = await useMCPTool({
      server: 'github.com/mendableai/firecrawl-mcp-server',
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

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

const axios = require('axios');

const { execSync } = require('child_process');

async function useMCPTool({ server, tool, params }) {
  try {
const cmd = `npx -y firecrawl-mcp --api-key ${process.env.FIRECRAWL_API_KEY} ${tool} ` +
      Object.entries(params).map(([k,v]) => `--${k} "${v}"`).join(' ');
      
    const result = execSync(cmd, { encoding: 'utf-8' });
    return JSON.parse(result);
  } catch (error) {
    console.error('MCP Execution Error:', error.message);
    throw new Error(`MCP Command Failed: ${error.stderr || error.message}`);
  }
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
