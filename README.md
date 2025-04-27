# view-source

A small Cloudflare Workers app that lets you fetch and view the raw HTML (or other text) of any URL with syntax highlighting.

## Features

- **Fetch arbitrary URLs**  
  Fetch the plain source of any page via a simple form.
- **Syntax highlighting**  
  Powered by [Shiki](https://shiki.style/) using the GitHub Dark theme.
- **Edge caching with “force reload”**  
  Built-in Cloudflare Workers cache for 5 minutes; optionally bypass with a reload toggle.
- **Single-page server-rendered UI**  
  Form and preview pages rendered server-side with [Hono.js](https://honojs.dev/) JSX.
- **Tailwind CSS styling**  
  Lightweight styling via the Tailwind CDN.
- **Minimal UI components**  
  Reusable `Input` and `Button` components inspired by shadcn/ui patterns.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js (server-side JSX)
- **Syntax Highlighter**: Shiki (JavaScript regex engine)
- **Styling**: Tailwind CSS (via CDN)
- **Language**: TypeScript
- **Package Manager**: pnpm
- **CLI & Deploy**: Wrangler

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [pnpm](https://pnpm.io/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/) (v4+)

### Install

```bash
git clone https://github.com/your-username/view-source.git
cd view-source
pnpm install
```
