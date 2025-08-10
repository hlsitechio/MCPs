# MCP Server Deployment & ChatGPT Connection Guide

## Understanding the Difference

### ❌ What We Had Before (Static JSON)
- GitHub raw URLs: `https://raw.githubusercontent.com/.../documents.json`
- These are just static files, NOT actual MCP servers
- Cannot handle dynamic requests or implement the MCP protocol

### ✅ What We Have Now (Real MCP Server)
- A proper Express.js server implementing the MCP protocol
- Dynamic endpoints: `/mcp/v1/tools`, `/mcp/v1/execute`, etc.
- Can handle ChatGPT's tool calls properly

## Quick Local Testing

```bash
# Install dependencies
cd G:\dashboard_1\MCPs\server
npm install

# Start the server
npm start

# Test endpoints
curl http://localhost:3001/health
curl http://localhost:3001/mcp/discover
curl http://localhost:3001/api/v1/categories
```

## Deployment Options

### Option 1: Deploy to Vercel (Recommended - FREE)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd G:\dashboard_1\MCPs\server
   vercel
   ```

3. **Follow prompts:**
   - Login/signup to Vercel
   - Choose project name (e.g., `mcp-docs-server`)
   - Deploy

4. **Your server URL will be:**
   ```
   https://your-project-name.vercel.app
   ```

### Option 2: Deploy to Render (FREE)

1. **Push to GitHub first:**
   ```bash
   cd G:\dashboard_1\MCPs
   git add server/
   git commit -m "Add MCP server implementation"
   git push
   ```

2. **Go to [Render.com](https://render.com)**
   - Sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Settings:
     - **Root Directory:** `server`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Click "Create Web Service"

3. **Your server URL will be:**
   ```
   https://your-service-name.onrender.com
   ```

### Option 3: Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**
   ```bash
   cd G:\dashboard_1\MCPs\server
   railway login
   railway init
   railway up
   ```

3. **Get your URL:**
   ```bash
   railway open
   ```

### Option 4: Deploy to Glitch (FREE, No-Setup)

1. **Go to [Glitch.com](https://glitch.com)**
2. **Click "New Project" → "Import from GitHub"**
3. **Enter:** `hlsitechio/MCPs`
4. **Edit `.env` file:**
   ```
   PORT=3000
   ```
5. **Your server will be at:**
   ```
   https://your-project-name.glitch.me
   ```

## Connecting to ChatGPT

Once your server is deployed, use these settings in ChatGPT's Custom Tool configuration:

### For MCP Protocol Endpoints:

**Name:** `MCP Documentation Server`

**Description:** 
```
Access documentation library with search, categorization, and retrieval capabilities via MCP protocol
```

**MCP Server URL:** 
```
https://your-deployed-url.vercel.app/mcp/v1/execute
```
(Replace with your actual deployed URL)

**Authentication:** `No authentication`

### Available Tools in ChatGPT:

Once connected, you can use these commands in ChatGPT:

1. **Search documents:**
   ```
   "Search for React documentation"
   "Find docs about MCP protocol"
   ```

2. **Get specific document:**
   ```
   "Get the document titled 'Quick Start Guide'"
   ```

3. **List categories:**
   ```
   "Show me all documentation categories"
   ```

## Testing Your Deployed Server

After deployment, test these endpoints:

```bash
# Health check
curl https://your-deployed-url.vercel.app/health

# MCP Discovery
curl https://your-deployed-url.vercel.app/mcp/discover

# List tools
curl https://your-deployed-url.vercel.app/mcp/v1/tools

# REST API - Get all documents
curl https://your-deployed-url.vercel.app/api/v1/documents

# REST API - Search
curl "https://your-deployed-url.vercel.app/api/v1/search?q=react"

# REST API - Categories
curl https://your-deployed-url.vercel.app/api/v1/categories
```

## Alternative: OpenAI Function Calling Format

If ChatGPT expects OpenAI's function calling format instead of MCP, the server also supports REST endpoints:

**Base URL:** `https://your-deployed-url.vercel.app/api/v1`

**Endpoints:**
- GET `/documents` - Get all documents
- GET `/search?q=query` - Search documents
- GET `/categories` - List categories
- GET `/document/:title` - Get specific document

## Troubleshooting

### Server won't start locally
```bash
# Make sure you're in the right directory
cd G:\dashboard_1\MCPs\server

# Install dependencies
npm install

# Check if port 3001 is free
netstat -an | findstr :3001
```

### Vercel deployment fails
```bash
# Make sure you have the latest files
cd G:\dashboard_1\MCPs
git add .
git commit -m "Update server"
git push

# Try deploying again
vercel --prod
```

### ChatGPT can't connect
1. Check if your server is running:
   ```
   curl https://your-url.vercel.app/health
   ```
2. Make sure you're using the correct endpoint URL
3. Try the REST API endpoints instead of MCP endpoints

## Environment Variables

You can set these in your deployment platform:

```env
PORT=3001                    # Server port
NODE_ENV=production         # Environment
CORS_ORIGIN=*              # CORS settings
```

## Support

- Server code: `G:\dashboard_1\MCPs\server\mcp-server.js`
- GitHub repo: https://github.com/hlsitechio/MCPs
- Test locally before deploying
- Use health endpoint to verify deployment
