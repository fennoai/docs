# Nextra Technical Writer - Full Guide

Complete guide to creating documentation with Nextra, the Next.js-based documentation framework.

## Project Setup

### New Project

```bash
# Create a Next.js app, then add Nextra
bun create next-app docs
cd docs
bun add nextra nextra-theme-docs
```

### Next.js Configuration

```javascript
// next.config.mjs
import nextra from 'nextra'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
  staticImage: true
})

export default withNextra({
  // Next.js config options
})
```

### Theme Configuration

```tsx
// theme.config.tsx
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>Project Name</span>,
  project: {
    link: 'https://github.com/org/project'
  },
  docsRepositoryBase: 'https://github.com/org/project/tree/main/docs',
  footer: {
    text: '© 2024 Project Name. All rights reserved.'
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s - Project Docs'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Project documentation" />
    </>
  ),
  primaryHue: 200,
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true
  },
  toc: {
    float: true,
    title: 'On This Page'
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback'
  },
  editLink: {
    text: 'Edit this page on GitHub →'
  },
  navigation: {
    prev: true,
    next: true
  }
}

export default config
```

## Project Structure

```
docs/
├── pages/
│   ├── _meta.json              # Root navigation
│   ├── _app.tsx                # Custom App (optional)
│   ├── index.mdx               # Home page (/)
│   ├── getting-started.mdx     # /getting-started
│   ├── concepts/
│   │   ├── _meta.json          # Folder navigation
│   │   ├── index.mdx           # /concepts
│   │   └── architecture.mdx    # /concepts/architecture
│   ├── api/
│   │   ├── _meta.json
│   │   ├── index.mdx
│   │   └── endpoints.mdx
│   └── guides/
│       ├── _meta.json
│       └── quickstart.mdx
├── public/
│   └── images/
├── components/                  # Custom components
│   └── CustomCard.tsx
├── theme.config.tsx
├── next.config.mjs
├── tsconfig.json
└── package.json
```

## Navigation Configuration

### Basic _meta.json

```json
{
  "index": "Introduction",
  "getting-started": "Getting Started",
  "concepts": "Core Concepts",
  "api": "API Reference",
  "guides": "Guides"
}
```

### Advanced _meta.json

```json
{
  "index": {
    "title": "Introduction",
    "type": "page",
    "theme": {
      "layout": "full"
    }
  },
  "getting-started": "Getting Started",
  "---": {
    "type": "separator",
    "title": "Features"
  },
  "concepts": {
    "title": "Core Concepts",
    "type": "page"
  },
  "api": {
    "title": "API Reference",
    "type": "menu",
    "items": {
      "endpoints": "Endpoints",
      "authentication": "Authentication"
    }
  },
  "changelog": {
    "title": "Changelog",
    "type": "page",
    "display": "hidden"
  },
  "github": {
    "title": "GitHub",
    "type": "page",
    "href": "https://github.com/org/project",
    "newWindow": true
  }
}
```

### Navigation Item Types

| Type          | Description            |
| ------------- | ---------------------- |
| `page`        | Standard page          |
| `menu`        | Dropdown menu          |
| `separator`   | Visual divider         |
| External link | Use `href` property    |
| `hidden`      | Hidden from navigation |

## MDX Syntax

### Frontmatter

```mdx
---
title: Page Title
description: SEO description for this page
---

# Page Title

Content starts here...
```

### Basic Markdown

```mdx
# H1 - Main Title

## H2 - Section

### H3 - Subsection

**Bold text**
_Italic text_
~~Strikethrough~~

- Unordered list
- Another item
  - Nested item

1. Ordered list
2. Second item

[Link text](https://example.com)
[Internal link](/getting-started)

![Image alt text](/images/screenshot.png)
```

### Code Blocks

````mdx
```typescript
// TypeScript with syntax highlighting
interface User {
  id: string
  name: string
}
```

```typescript filename="src/types/user.ts"
// With filename
export interface User {
  id: string
  name: string
}
```

```typescript {2,4-6}
// With line highlighting
function example() {
  const highlighted = true
  const normal = false
  return {
    result: true
  }
}
```

```typescript copy
// With copy button (enabled by default)
const config = { enabled: true }
```

```typescript showLineNumbers
// With line numbers
const line1 = 'first'
const line2 = 'second'
const line3 = 'third'
```
````

## Built-in Components

### Callout

```mdx
import { Callout } from 'nextra/components'

<Callout type="info">This is an informational callout.</Callout>

<Callout type="warning">This is a warning callout.</Callout>

<Callout type="error">This is an error callout.</Callout>

<Callout emoji="💡">Custom emoji callout.</Callout>
```

**Callout Types:**

| Type      | Use Case            |
| --------- | ------------------- |
| `default` | General information |
| `info`    | Helpful tips        |
| `warning` | Caution notices     |
| `error`   | Critical warnings   |

### Tabs

````mdx
import { Tabs } from 'nextra/components'

<Tabs items={['npm', 'yarn', 'pnpm', 'bun']}>
  <Tabs.Tab>```bash npm install package-name ```</Tabs.Tab>
  <Tabs.Tab>```bash yarn add package-name ```</Tabs.Tab>
  <Tabs.Tab>```bash pnpm add package-name ```</Tabs.Tab>
  <Tabs.Tab>```bash bun add package-name ```</Tabs.Tab>
</Tabs>
````

### Cards

```mdx
import { Cards } from 'nextra/components'

<Cards>
  <Cards.Card title="Getting Started" href="/getting-started">
    Quick start guide for new users
  </Cards.Card>
  <Cards.Card title="API Reference" href="/api">
    Complete API documentation
  </Cards.Card>
</Cards>
```

`nextra/components` exports `Cards` only; `Card` is not a named export. Always use
`Cards.Card`.

### Steps

````mdx
import { Steps } from 'nextra/components'

<Steps>
### Step 1: Install

Install the package using your package manager.

```bash
bun add package-name
```

### Step 2: Configure

Add configuration to your project.

### Step 3: Use

Import and use in your code.

</Steps>
````

Use a longer fence for the outer block whenever the example itself contains a
fenced code block.

### File Tree

```mdx
import { FileTree } from 'nextra/components'

<FileTree>
  <FileTree.Folder name="pages" defaultOpen>
    <FileTree.File name="_meta.json" />
    <FileTree.File name="index.mdx" />
    <FileTree.Folder name="api">
      <FileTree.File name="_meta.json" />
      <FileTree.File name="endpoints.mdx" />
    </FileTree.Folder>
  </FileTree.Folder>
  <FileTree.File name="next.config.mjs" />
  <FileTree.File name="theme.config.tsx" />
</FileTree>
```

## Custom Components

### Creating Custom Components

```tsx
// components/FeatureCard.tsx
import { ReactNode } from 'react'

interface FeatureCardProps {
  title: string
  description: string
  icon?: ReactNode
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="feature-card p-4 border rounded-lg">
      {icon && <div className="mb-2">{icon}</div>}
      <h3 className="font-semibold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
```

### Using in MDX

```mdx
import { FeatureCard } from '../components/FeatureCard'

# Features

<div className="grid grid-cols-2 gap-4">
  <FeatureCard
    title="Fast Builds"
    description="Incremental builds for quick development"
    icon="⚡"
  />
  <FeatureCard title="Full-text Search" description="Built-in search functionality" icon="🔍" />
</div>
```

## Styling

### Global Styles

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
.feature-card {
  @apply transition-shadow hover:shadow-lg;
}
```

### Theme Customization

```tsx
// theme.config.tsx
const config: DocsThemeConfig = {
  primaryHue: {
    dark: 200,
    light: 220
  },
  // Custom CSS
  head: (
    <>
      <style>{`
        :root {
          --nextra-primary-hue: 220deg;
        }
      `}</style>
    </>
  )
}
```

## Search Configuration

### Built-in Search

Nextra includes Flexsearch by default. No configuration needed.

### External Search (Algolia)

```tsx
// theme.config.tsx
const config: DocsThemeConfig = {
  search: {
    component: function Search() {
      // Custom Algolia DocSearch
      return <AlgoliaSearch />
    }
  }
}
```

## SEO Configuration

### Per-Page SEO

```mdx
---
title: Getting Started
description: Learn how to get started with Project in 5 minutes
---

# Getting Started
```

### Global SEO

```tsx
// theme.config.tsx
const config: DocsThemeConfig = {
  useNextSeoProps() {
    return {
      titleTemplate: '%s - Project Documentation',
      defaultTitle: 'Project Documentation',
      description: 'Comprehensive documentation for Project',
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://docs.project.com',
        siteName: 'Project Docs'
      }
    }
  }
}
```

## API Documentation

### Endpoint Documentation Pattern

````mdx
## Create User

Create a new user account.

### Endpoint

```http
POST /api/v1/users
```

### Authentication

Requires Bearer token.

### Request Body

| Field      | Type   | Required | Description          |
| ---------- | ------ | -------- | -------------------- |
| `email`    | string | Yes      | User email address   |
| `name`     | string | Yes      | Display name         |
| `password` | string | Yes      | Minimum 8 characters |

### Example Request

```bash
curl -X POST https://api.project.com/v1/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John", "password": "secure123"}'
```

### Response

```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "John",
  "createdAt": "2024-01-15T12:00:00Z"
}
```

### Error Responses

| Status | Description          |
| ------ | -------------------- |
| 400    | Invalid request body |
| 401    | Unauthorized         |
| 409    | Email already exists |
````

## Documentation Checklist

### Content

- [ ] Clear, descriptive title
- [ ] One-sentence summary
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Consistent terminology
- [ ] Technical accuracy verified

### Structure

- [ ] `_meta.json` configured
- [ ] Logical flow (overview → details → examples)
- [ ] Quick start near top
- [ ] Related links at end

### Code

- [ ] Language specified on all code blocks
- [ ] Examples are complete and runnable
- [ ] Copy button enabled for commands
- [ ] Line highlighting for key lines

### SEO

- [ ] Title in frontmatter
- [ ] Description in frontmatter
- [ ] Internal linking strategy
- [ ] Alt text for images

## Building and Deployment

### Development

```bash
# Start dev server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

### Deployment

```bash
# Vercel (recommended)
vercel

# Static export
# In next.config.mjs:
# output: 'export'
bun run build
```

### Deployment Checklist

- [ ] All links tested
- [ ] Images optimized
- [ ] Search working
- [ ] Mobile responsive
- [ ] SEO meta tags present
- [ ] Analytics configured

## Migration from Docusaurus

| Docusaurus                     | Nextra                                 |
| ------------------------------ | -------------------------------------- |
| `docs/` folder                 | `pages/` folder                        |
| `sidebars.ts`                  | `_meta.json` files                     |
| `docusaurus.config.ts`         | `theme.config.tsx` + `next.config.mjs` |
| `:::note` admonitions          | `<Callout>` component                  |
| `@theme/Tabs`                  | `<Tabs>` from nextra                   |
| `sidebar_position` frontmatter | Order in `_meta.json`                  |
