# Typescript Frontend Templates

## Prerequisites
- Typescript
- Yarn (v 4.12.0)

## Stack

Use the following libraries and tools for each category of frontend concept:

- Bundler: Vite
- UI Components: @trussworks/react-uswds
- Global store: tanstack/query
- Global state: zustand
- Forms: React Hook Form
- Validation: Zod

## Architecture

<pre>
src/
  app/ → wiring
    main.tsx → entry point, providers wiring
    App.tsx → routeing setup
    layout.tsx → main layout page
  pages/ → app route pages with top level feature sub-folders    
  shared/ → shared logic and ui components
    api/ → API call wrappers by resource
    components/ → shared UI components
    domain/ → types and enums
    hooks/ → global store queries that wrap API calls
    util/ → helper functions
tests/
  helpers/ → setup files and helper functions
  pages/ → page level tests
</pre>

## Getting started

Start your backend first (see [here](../backend/README.md) ), then in your `frontend` folder:
1. run `cp .env.example .env` to duplicate local env variables, update as applicable
1. run `yarn` to install all dependencies
1. run `yarn dev` to launch the frontend at http://localhost:5173

If you are developing with AI assistants, add the uswds MCP server for better support on using USWDS components.
1. Clone this repo in your main development folder: https://github.com/focus-digital/react-uswds-mcp.git
1. Inside your new `react-uswds-mcp` project, run `yarn install`, then `yarn build`
1. Back in this current repo add `react-uswds-mcp` as an MCP server to your AI assistant of choice with something like below in your `.toml` or `.json` MCP configuration files.

```toml
[mcp.servers.react-uswds]
command = "node"
args = ["dist/index.js"]
cwd = "/absolute/path/to/react-uswds-mcp"

[mcp.servers.react-uswds.env]
REACT_USWDS_PACKAGE = "@trussworks/react-uswds"
```

```json
{
  "mcpServers": {
    "react-uswds-mcp": {
      "command": "node",
      "args": ["/absolute/path/react-uswds-mcp/dist/index.js"]
    }
  }
}
```

Then update the following files as necessary and as your repo evolves:
*  `.env`
* `README.md`
* `AGENTS.md`

## Development patterns

- Pages: use hooks and global state
- Components: pass all data needed for render as much as possible, do not retrieve global state. Can maintain local state around interactivity.

## Deployment

We use Cloudflare to manage domains and deploy our frontend. You will need an account to access the CLoudflare dashboard.

Steps:
1. Go to Cloudflare Dashboard → Compute & AI → Workers & Pages, click on Create Application
1. Find `Looking to deploy Pages? Get started` at the bottom (not super obvious)
1. Connect with the Git repo
1. Go through settings and populate as desired, for example for this repo

  ```
  Build command: yarn build
  Build output: dist
  Root directory: frontend
  Production branch: main
  ```

1. Set environment variables. For example

```
VITE_API_URL=https://api.example.com
```

1.

