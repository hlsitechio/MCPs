#!/usr/bin/env node

/**
 * MCP Server Implementation
 * This is a proper MCP server that can be deployed and connected to ChatGPT
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MCP Protocol Version
const MCP_VERSION = '1.0.0';

// Load documents from JSON files
let documentsCache = {};

async function loadDocuments() {
  try {
    const categories = ['docs_z_ai', 'other'];
    const allDocuments = [];
    
    for (const category of categories) {
      const filePath = path.join(__dirname, '..', 'documentation', 'by-category', category, 'documents.json');
      try {
        const data = await fs.readFile(filePath, 'utf8');
        const docs = JSON.parse(data);
        allDocuments.push(...docs);
      } catch (err) {
        console.log(`Could not load ${category}: ${err.message}`);
      }
    }
    
    // Also load main documentation library
    try {
      const mainPath = path.join(__dirname, '..', 'servers', 'documentation-library', 'data', 'documents.json');
      const data = await fs.readFile(mainPath, 'utf8');
      const docs = JSON.parse(data);
      allDocuments.push(...docs);
    } catch (err) {
      console.log(`Could not load main library: ${err.message}`);
    }
    
    // Remove duplicates based on title
    const uniqueDocs = allDocuments.filter((doc, index, self) =>
      index === self.findIndex((d) => d.title === doc.title)
    );
    
    documentsCache = {
      documents: uniqueDocs,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`Loaded ${uniqueDocs.length} unique documents`);
    return uniqueDocs;
  } catch (error) {
    console.error('Error loading documents:', error);
    return [];
  }
}

// Initialize documents on startup
loadDocuments();

// Reload documents every 5 minutes
setInterval(loadDocuments, 5 * 60 * 1000);

// ==================== MCP PROTOCOL ENDPOINTS ====================

// MCP Discovery endpoint
app.get('/mcp/discover', (req, res) => {
  res.json({
    version: MCP_VERSION,
    name: 'MCP Documentation Server',
    description: 'Access to documentation library via MCP protocol',
    capabilities: {
      tools: true,
      resources: true,
      prompts: false,
      sampling: false
    },
    endpoints: {
      tools: '/mcp/v1/tools',
      resources: '/mcp/v1/resources',
      execute: '/mcp/v1/execute'
    }
  });
});

// List available tools
app.get('/mcp/v1/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: 'search_documents',
        description: 'Search through documentation library',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            },
            category: {
              type: 'string',
              description: 'Filter by category (optional)'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 10)',
              default: 10
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_document',
        description: 'Get a specific document by title or ID',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Document title'
            }
          },
          required: ['title']
        }
      },
      {
        name: 'list_categories',
        description: 'List all available document categories',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  });
});

// List available resources
app.get('/mcp/v1/resources', (req, res) => {
  const categories = [...new Set(documentsCache.documents?.map(d => d.category) || [])];
  
  res.json({
    resources: categories.map(cat => ({
      uri: `doc://category/${cat}`,
      name: cat,
      description: `Documents in ${cat} category`,
      mimeType: 'application/json'
    }))
  });
});

// Execute tool
app.post('/mcp/v1/execute', async (req, res) => {
  const { tool, arguments: args } = req.body;
  
  try {
    switch (tool) {
      case 'search_documents':
        const searchResults = searchDocuments(args.query, args.category, args.limit || 10);
        res.json({
          success: true,
          result: searchResults
        });
        break;
        
      case 'get_document':
        const doc = getDocument(args.title);
        if (doc) {
          res.json({
            success: true,
            result: doc
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Document not found'
          });
        }
        break;
        
      case 'list_categories':
        const categories = listCategories();
        res.json({
          success: true,
          result: categories
        });
        break;
        
      default:
        res.status(400).json({
          success: false,
          error: `Unknown tool: ${tool}`
        });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== TOOL IMPLEMENTATIONS ====================

function searchDocuments(query, category, limit) {
  let results = documentsCache.documents || [];
  
  // Filter by category if specified
  if (category) {
    results = results.filter(doc => 
      doc.category?.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Search in title and content
  if (query) {
    const searchTerm = query.toLowerCase();
    results = results.filter(doc => 
      doc.title?.toLowerCase().includes(searchTerm) ||
      doc.content?.toLowerCase().includes(searchTerm) ||
      doc.description?.toLowerCase().includes(searchTerm)
    );
  }
  
  // Limit results
  results = results.slice(0, limit);
  
  // Return simplified results
  return results.map(doc => ({
    title: doc.title,
    category: doc.category,
    description: doc.description || doc.content?.substring(0, 200) + '...',
    url: doc.url,
    tags: doc.tags
  }));
}

function getDocument(title) {
  return documentsCache.documents?.find(doc => 
    doc.title?.toLowerCase() === title.toLowerCase()
  );
}

function listCategories() {
  const categories = [...new Set(documentsCache.documents?.map(d => d.category) || [])];
  return categories.map(cat => ({
    name: cat,
    count: documentsCache.documents.filter(d => d.category === cat).length
  }));
}

// ==================== STANDARD REST API (for compatibility) ====================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: MCP_VERSION,
    documentsLoaded: documentsCache.documents?.length || 0,
    lastUpdated: documentsCache.lastUpdated
  });
});

// Get all documents (REST API)
app.get('/api/v1/documents', (req, res) => {
  res.json(documentsCache.documents || []);
});

// Search documents (REST API)
app.get('/api/v1/search', (req, res) => {
  const { q, category, limit } = req.query;
  const results = searchDocuments(q, category, parseInt(limit) || 10);
  res.json(results);
});

// Get document by title (REST API)
app.get('/api/v1/document/:title', (req, res) => {
  const doc = getDocument(req.params.title);
  if (doc) {
    res.json(doc);
  } else {
    res.status(404).json({ error: 'Document not found' });
  }
});

// Get categories (REST API)
app.get('/api/v1/categories', (req, res) => {
  res.json(listCategories());
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'MCP Documentation Server',
    version: MCP_VERSION,
    endpoints: {
      mcp: {
        discover: '/mcp/discover',
        tools: '/mcp/v1/tools',
        resources: '/mcp/v1/resources',
        execute: '/mcp/v1/execute'
      },
      rest: {
        documents: '/api/v1/documents',
        search: '/api/v1/search',
        categories: '/api/v1/categories',
        document: '/api/v1/document/:title'
      },
      health: '/health'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP Discovery: http://localhost:${PORT}/mcp/discover`);
});
