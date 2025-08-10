#!/usr/bin/env node

/**
 * Documentation Library MCP Server
 * Organized implementation for hlsitechio/MCPs
 */

const REPO_BASE = 'https://raw.githubusercontent.com/hlsitechio/MCPs/main';

class DocumentationServer {
  constructor() {
    this.documents = [];
    this.categories = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    // Load main documents
    const docsUrl = `${REPO_BASE}/servers/documentation-library/data/documents.json`;
    this.documents = await this.fetchJson(docsUrl);
    
    // Organize by category
    this.documents.forEach(doc => {
      const category = doc.category || 'uncategorized';
      if (!this.categories.has(category)) {
        this.categories.set(category, []);
      }
      this.categories.get(category).push(doc);
    });
    
    this.initialized = true;
    console.log(`Initialized with ${this.documents.length} documents in ${this.categories.size} categories`);
  }

  async fetchJson(url) {
    const https = require('https');
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  async search(query, options = {}) {
    await this.initialize();
    
    const { category, limit = 10 } = options;
    let results = this.documents;
    
    // Filter by category if specified
    if (category) {
      results = this.categories.get(category) || [];
    }
    
    // Search in title and content
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.content.toLowerCase().includes(searchTerm) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }
    
    return results.slice(0, limit);
  }

  async getCategories() {
    await this.initialize();
    return Array.from(this.categories.keys()).map(cat => ({
      name: cat,
      count: this.categories.get(cat).length
    }));
  }

  async getDocument(id) {
    await this.initialize();
    return this.documents.find(doc => doc.id === id);
  }
}

// MCP Protocol Handler
if (require.main === module) {
  const server = new DocumentationServer();
  
  process.stdin.on('data', async (data) => {
    try {
      const request = JSON.parse(data.toString());
      let response;
      
      switch(request.method) {
        case 'initialize':
          await server.initialize();
          response = { 
            capabilities: {
              search: true,
              categories: true,
              documents: true
            }
          };
          break;
          
        case 'search':
          response = await server.search(
            request.params.query,
            request.params.options
          );
          break;
          
        case 'categories':
          response = await server.getCategories();
          break;
          
        case 'document':
          response = await server.getDocument(request.params.id);
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
      console.error(JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error.message
        }
      }));
    }
  });
}

module.exports = DocumentationServer;
