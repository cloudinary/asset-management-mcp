# Cloudinary Asset Management MCP Server


<!-- Start Summary [summary] -->
## Summary


<!-- End Summary [summary] -->

<!-- Start Table of Contents [toc] -->
## Table of Contents
<!-- $toc-max-depth=2 -->
* [Cloudinary Asset Management MCP Server](#cloudinary-asset-management-mcp-server)
  * [Installation](#installation)
  * [Configuration](#configuration)
  * [Authentication](#authentication)
  * [Available Tools](#available-tools)
  * [Custom Tools](#custom-tools)
* [Development](#development)
  * [Building from Source](#building-from-source)
  * [Contributions](#contributions)

<!-- End Table of Contents [toc] -->

<!-- Start Installation [installation] -->
## Installation

<details>
<summary>MCP Bundle (Desktop Extension)</summary>

Install the MCP server as a Desktop Extension using the pre-built [`mcp-server.mcpb`](./mcp-server.mcpb) file:

Simply drag and drop the [`mcp-server.mcpb`](./mcp-server.mcpb) file onto Claude Desktop to install the extension.

The MCP bundle package includes the MCP server and all necessary configuration. Once installed, the server will be available without additional setup.

> [!NOTE]
> MCP bundles provide a streamlined way to package and distribute MCP servers. Learn more about [Desktop Extensions](https://www.anthropic.com/engineering/desktop-extensions).

</details>

<details>
<summary>Cursor</summary>

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=CloudinaryAssetMgmt&config=eyJtY3BTZXJ2ZXJzIjp7IkNsb3VkaW5hcnlBc3NldE1nbXQiOnsiY29tbWFuZCI6Im5weCIsImFyZ3MiOlsiQGNsb3VkaW5hcnkvYXNzZXQtbWFuYWdlbWVudC1tY3AiLCJzdGFydCIsIi0tc2VydmVyLWluZGV4IiwiLi4uIiwiLS1yZWdpb24iLCIuLi4iLCItLWFwaS1ob3N0IiwiLi4uIiwiLS1hcGkta2V5IiwiLi4uIiwiLS1hcGktc2VjcmV0IiwiLi4uIiwiLS1vYXV0aDIiLCIuLi4iLCItLWNsb3VkLW5hbWUiLCIuLi4iXX19fQ==)

Or manually:

1. Open Cursor Settings
2. Select Tools and Integrations
3. Select New MCP Server
4. If the configuration file is empty paste the following JSON into the MCP Server Configuration:

```json
{
  "mcpServers": {
    "CloudinaryAssetMgmt": {
      "command": "npx",
      "args": [
        "@cloudinary/asset-management-mcp",
        "start",
        "--server-index",
        "...",
        "--region",
        "...",
        "--api-host",
        "...",
        "--api-key",
        "...",
        "--api-secret",
        "...",
        "--oauth2",
        "...",
        "--cloud-name",
        "..."
      ]
    }
  }
}
```

</details>

<details>
<summary>Claude Code CLI</summary>

```bash
claude mcp add @cloudinary/asset-management-mcp npx @cloudinary/asset-management-mcp start -- --server-index ... --region ... --api-host ... --api-key ... --api-secret ... --oauth2 ... --cloud-name ...
```

</details>
<details>
<summary>Windsurf</summary>

Refer to [Official Windsurf documentation](https://docs.windsurf.com/windsurf/cascade/mcp#adding-a-new-mcp-plugin) for latest information

1. Open Windsurf Settings
2. Select Cascade on left side menu
3. Click on `Manage MCPs`. (To Manage MCPs you should be signed in with a Windsurf Account)
4. Click on `View raw config` to open up the mcp configuration file.
5. If the configuration file is empty paste the full json
```
{
  "mcpServers": {
    "CloudinaryAssetMgmt": {
      "command": "npx",
      "args": [
        "@cloudinary/asset-management-mcp",
        "start",
        "--server-index",
        "...",
        "--region",
        "...",
        "--api-host",
        "...",
        "--api-key",
        "...",
        "--api-secret",
        "...",
        "--oauth2",
        "...",
        "--cloud-name",
        "..."
      ]
    }
  }
}
```
</details>
<details>
<summary>VS Code</summary>

Refer to [Official VS Code documentation](https://code.visualstudio.com/api/extension-guides/ai/mcp) for latest information

1. Open [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette)
1. Search and open `MCP: Open User Configuration`. This should open mcp.json file
2. If the configuration file is empty paste the full json
```
{
  "mcpServers": {
    "CloudinaryAssetMgmt": {
      "command": "npx",
      "args": [
        "@cloudinary/asset-management-mcp",
        "start",
        "--server-index",
        "...",
        "--region",
        "...",
        "--api-host",
        "...",
        "--api-key",
        "...",
        "--api-secret",
        "...",
        "--oauth2",
        "...",
        "--cloud-name",
        "..."
      ]
    }
  }
}
```

</details>
<details>
<summary>Claude Desktop</summary>
Claude Desktop doesn't yet support SSE/remote MCP servers.

You need to do the following
1. Open claude Desktop
2. Open left hand side pane, then click on your Username
3. Go to `Settings`
4. Go to `Developer` tab (on the left hand side)
5. Click on `Edit Config`
Paste the following config in the configuration

```json
{
  "mcpServers": {
    "CloudinaryAssetMgmt": {
      "command": "npx",
      "args": [
        "@cloudinary/asset-management-mcp",
        "start",
        "--server-index",
        "...",
        "--region",
        "...",
        "--api-host",
        "...",
        "--api-key",
        "...",
        "--api-secret",
        "...",
        "--oauth2",
        "...",
        "--cloud-name",
        "..."
      ]
    }
  }
}
```

</details>


<details>
<summary> Stdio installation via npm </summary>
To start the MCP server, run:

```bash
npx @cloudinary/asset-management-mcp start --server-index ... --region ... --api-host ... --api-key ... --api-secret ... --oauth2 ... --cloud-name ...
```

For a full list of server arguments, run:

```
npx @cloudinary/asset-management-mcp --help
```

</details>
<!-- End Installation [installation] -->

## Configuration

### Environment Variables

The MCP server supports the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Yes |
| `CLOUDINARY_URL` | Complete Cloudinary URL (alternative to individual vars) | No |

### CLOUDINARY_URL Format

You can use a single `CLOUDINARY_URL` instead of individual variables:

```bash
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

<!-- Start Authentication [security] -->
## Authentication

The MCP server uses your Cloudinary API key and secret for authentication:

```json
{
  "env": {
    "CLOUDINARY_CLOUD_NAME": "demo",
    "CLOUDINARY_API_KEY": "123456789012345",
    "CLOUDINARY_API_SECRET": "abcdefghijklmnopqrstuvwxyz12"
  }
}
```

<!-- End Authentication [security] -->

## Available Tools

The MCP server exposes Cloudinary's Asset Management API as tools. Use your AI application to discover and invoke the available tools for uploading, managing, searching, and transforming your media assets.

### Usage Examples

#### Example 1: Upload and Transform an Image

```
1. Upload a local image: "Upload file:///Users/me/photo.jpg to Cloudinary as 'hero-image'"
2. Transform it: "Transform asset 'hero-image' with transformations 'c_fill,w_800,h_600/e_sharpen'"
3. Get details: "Show me details for asset with ID [asset-id]"
```

#### Example 2: Search and Organize Assets

```
1. Search for images: "Find all images with tag 'product' uploaded in the last 7 days"
2. Create folder: "Create a new folder called 'summer-2024-products'"
3. List assets: "Show me all video assets in the 'marketing' folder"
```

#### Example 3: Generate Archive

```
1. Get transformation docs: "Show me the Cloudinary transformation reference"
2. Apply transformations: "Transform 'banner' asset with 'c_scale,w_1200/f_auto,q_auto'"
3. Create archive: "Generate a ZIP archive of all images with tag 'export-ready'"
```

#### Example 4: Asset Management Workflow

```
1. Upload multiple files: "Upload all images from folder /assets/new-products/"
2. Add tags: "Update asset [asset-id] and add tags 'featured,homepage'"
3. Get usage stats: "Show my Cloudinary account usage statistics"
```

## Custom Tools

This MCP server includes two powerful custom tools:

### `get-tx-reference`
Retrieves the complete Cloudinary transformation reference documentation.

**When to use:**
- Before creating or modifying transformations
- When user asks about image/video effects, resizing, cropping, filters

**Example:**
```
Use get-tx-reference to learn about available transformations
```

### `transform-asset`
Applies transformations to existing assets using Cloudinary's explicit API.

**Parameters:**
- `publicId` - The asset's public ID
- `transformations` - Transformation string (e.g., `c_fill,w_300,h_200`)
- `resourceType` - Type: `image`, `video`, or `raw` (default: `image`)
- `invalidate` - Invalidate CDN cache (default: `false`)

**Example:**
```
Transform asset "sample" with transformations "c_fill,w_500,h_500/e_sepia"
```

# Development

## Building from Source

### Prerequisites
- Node.js v20 or higher
- npm, pnpm, bun, or yarn

### Build Steps

```bash
# Clone the repository
git clone https://github.com/cloudinary/asset-management-mcp.git
cd asset-management-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run locally
npm start
```

### Project Structure

```
asset-management-mcp/
├── src/
│   ├── hooks/              # Custom authentication hooks
│   ├── mcp-server/         # MCP server implementation
│   │   ├── server.ts       # Main server (auto-generated)
│   │   ├── server.extensions.ts  # Custom tools (manual)
│   │   └── tools/          # Generated tool wrappers
│   ├── funcs/              # API function implementations
│   └── models/             # Type definitions
├── .github/
│   └── workflows/          # CI/CD workflows
└── .speakeasy/             # Speakeasy configuration
```

## Contributions

While we value contributions to this MCP Server, the code is generated programmatically. Any manual changes to generated files will be overwritten on the next generation.

**What you can contribute:**
- ✅ Custom tools in `server.extensions.ts`
- ✅ Custom hooks in `src/hooks/`
- ✅ Documentation improvements
- ✅ Bug reports and feature requests

**Generated files (do not edit):**
- ❌ `src/mcp-server/server.ts`
- ❌ `src/mcp-server/tools/*.ts`
- ❌ `src/funcs/*.ts`
- ❌ `src/models/*.ts`

We look forward to hearing your feedback. Feel free to open a PR or issue with a proof of concept and we'll do our best to include it in a future release.

---

### MCP Server Created by [Speakeasy](https://www.speakeasy.com/?utm_source=asset-management-mcp&utm_campaign=mcp-typescript)

<!-- Placeholder for Future Speakeasy SDK Sections -->
