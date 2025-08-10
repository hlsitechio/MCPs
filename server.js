#!/usr/bin/env node

/**
 * MCP Server for Documentation Library
 * Hosted on GitHub: https://github.com/hlsitechio/MCPs
 */

// Load documentation data
const DOCS_URL = 'https://raw.githubusercontent.com/hlsitechio/MCPs/main/data/documents.json';

async function loadDocs() {
  try {
    const https = require('https');
    return new Promise((resolve, reject) => {
      https.get(DOCS_URL, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });
  } catch (error) {
    console.error('Failed to load docs:', error);
    return [];
  }
}

// MCP Protocol Handler
const server = {
  name: 'documentation-library',
  version: '1.0.0',
  
  async initialize() {
    this.docs = await loadDocs();
    return {
      capabilities: {
        resources: true,
        tools: true
      }
    };
  },
  
  async listResources() {
    return {
      resources: this.docs.map(doc => ({
        uri: `doc://${doc.id}`,
        name: doc.title,
        description: `${doc.category} - ${doc.url}`,
        mimeType: 'text/plain'
      }))
    };
  },
  
  async readResource({ uri }) {
    const docId = uri.replace('doc://', '');
    const doc = this.docs.find(d => d.id === docId);
    
    if (!doc) {
      throw new Error(`Document ${docId} not found`);
    }
    
    return {
      contents: [{
        uri,
        mimeType: 'text/plain',
        text: doc.content
      }]
    };
  },
  
  async listTools() {
    return {
      tools: [
        {
          name: 'search_docs',
          description: 'Search documentation',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' }
            },
            required: ['query']
          }
        },
        {
          name: 'list_categories',
          description: 'List all categories',
          inputSchema: { type: 'object', properties: {} }
        }
      ]
    };
  },
  
  async callTool({ name, arguments: args }) {
    switch(name) {
      case 'search_docs':
        const query = args.query.toLowerCase();
        const results = this.docs.filter(d => 
          d.title.toLowerCase().includes(query) ||
          d.content.toLowerCase().includes(query)
        ).slice(0, 10);
        return { result: results };
        
      case 'list_categories':
        const categories = [...new Set(this.docs.map(d => d.category))];
        return { result: categories };
        
      default:
        throw new Error('Unknown tool: ' + name);
    }
  }
};

// Initialize and start server
server.initialize().then(() => {
  console.log('MCP Server initialized with', server.docs.length, 'documents');
  
  // Handle stdin for MCP protocol
  process.stdin.on('data', async (data) => {
    try {
      const request = JSON.parse(data.toString());
      let response;
      
      switch(request.method) {
        case 'initialize':
          response = await server.initialize();
          break;
        case 'resources/list':
          response = await server.listResources();
          break;
        case 'resources/read':
          response = await server.readResource(request.params);
          break;
        case 'tools/list':
          response = await server.listTools();
          break;
        case 'tools/call':
          response = await server.callTool(request.params);
          break;
        default:
          response = { error: 'Unknown method: ' + request.method };
      }
      
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        result: response
      }));
    } catch (error) {
      console.error('Error:', error);
    }
  });
});
