const { execSync } = require('child_process');

exports.handler = async (event) => {
  try {
    const { url } = JSON.parse(event.body);
    const cmd = `npx -y firecrawl-mcp --api-key ${process.env.FIRECRAWL_API_KEY} firecrawl_scrape ` + 
      `--url "${url}" --formats extract ` +
      `--extract.schema '{"type":"object","properties":` +
      `{"name":{"type":"string"},"phone":{"type":"string"},` +
      `"email":{"type":"string"},"address":{"type":"string"},` +
      `"website":{"type":"string"}}}' ` +
      `--extract.systemPrompt "Extract contact details matching bi-person=name, bi-telephone=phone, bi-envelope=email, bi-mailbox=address, bi-cloud=website"`;

    const result = execSync(cmd, { encoding: 'utf-8' });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: JSON.parse(result) }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        error: error.message
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
