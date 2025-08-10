# MCP Servers Repository

## 📁 Repository Organization

This repository is organized to support multiple MCP servers and documentation types.

### Structure

```
MCPs/
├── servers/                    # MCP server implementations
│   ├── documentation-library/  # Main documentation server
│   ├── code-assistant/        # Code assistance server
│   ├── api-integration/       # API integration server
│   └── knowledge-base/        # Knowledge base server
│
├── documentation/             # Organized documentation
│   ├── by-category/          # Documents organized by category
│   ├── by-source/           # Documents organized by source
│   └── by-technology/       # Documents organized by technology
│
├── dashboard/                # Dashboard application files
│   ├── components/          # React components
│   ├── services/           # Service implementations
│   └── configs/           # Configuration files
│
├── templates/              # Configuration templates
├── scripts/               # Utility scripts
└── examples/             # Usage examples
```

## 🚀 Quick Start

### For Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "documentation-library": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory",
        "--data-url",
        "https://raw.githubusercontent.com/hlsitechio/MCPs/main/servers/documentation-library/data/documents.json"
      ]
    }
  }
}
```

## 📊 Current Statistics

- **Total Documents**: 15
- **Categories**: 2
- **Last Updated**: 2025-08-10T16:29:03.178Z

## 🔧 Available Servers

### 1. Documentation Library
- **Path**: `/servers/documentation-library`
- **Purpose**: Stores and serves documentation
- **Features**: Search, categories, tags, full-text search

### 2. Code Assistant (Coming Soon)
- **Path**: `/servers/code-assistant`
- **Purpose**: Code generation and assistance

### 3. API Integration (Coming Soon)
- **Path**: `/servers/api-integration`
- **Purpose**: API documentation and testing

### 4. Knowledge Base (Coming Soon)
- **Path**: `/servers/knowledge-base`
- **Purpose**: Articles, tutorials, and references

## 📚 Documentation Organization

### By Category
- `docs_z_ai`: Z.AI documentation
- `api_reference`: API references
- `guides`: User guides
- `tutorials`: Step-by-step tutorials
- `other`: Miscellaneous documentation

### By Source
- `github`: GitHub documentation
- `official-docs`: Official documentation
- `community`: Community contributions
- `internal`: Internal documentation

### By Technology
- `react`: React documentation
- `nodejs`: Node.js documentation
- `python`: Python documentation
- `ai-ml`: AI/ML documentation
- `web-apis`: Web API documentation

## 🛠️ Scripts

- `setup/`: Setup and installation scripts
- `migration/`: Data migration scripts
- `validation/`: Validation and testing scripts
- `deployment/`: Deployment scripts

## 📝 License

MIT

---

*Organized by Dashboard MCP Manager*
