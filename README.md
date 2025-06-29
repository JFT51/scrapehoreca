# Horeca Scraper

This project is a web scraper for MisterHoreca, designed to extract contact information. It uses Firecrawl to perform the scraping.

## Prerequisites

Before running this project, ensure you have Node.js and npm installed.

You will also need a Firecrawl API key. Set this key as an environment variable named `FIRECRAWL_API_KEY`.

## Setup

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd horeca-scraper
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## Running the Server Locally

To start the Express server locally (primarily for testing the `/crawl` and `/scrape` endpoints):

```bash
npm start
```

The server will run on `http://localhost:3002`.

## Deployment

This project is configured for deployment on Netlify.

-   **Build Command**: `npm run build`
-   **Publish Directory**: `public`
-   **Serverless Functions**: Deployed from `netlify/functions`

The Netlify function `scrape` also requires the `FIRECRAWL_API_KEY` environment variable to be set in your Netlify site settings.

## How it Works

The application provides two main functionalities:

1.  **Express Server (`server.js`)**:
    *   `/crawl`: Initiates a crawl job using Firecrawl to discover pages from a given starting URL. It then scrapes contact details (name, phone, email, address, website) from each discovered page.
    *   `/scrape`: Scrapes contact details from a single specified URL.
2.  **Netlify Serverless Function (`netlify/functions/scrape.js`)**:
    *   Provides a serverless endpoint for scraping a single URL, similar to the `/scrape` endpoint in the Express server.

Both the server and the serverless function utilize the `firecrawl-mcp` command-line tool to interact with the Firecrawl service.
