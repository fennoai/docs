# Nextra Technical Writer - Full Guide

Complete guide to creating documentation with Nextra, the Next.js-based documentation framework.

## Project Setup

### New Project

These examples target Nextra **4.6.1**, Next.js **16.0.7**, React **19.x** and the
App Router. The repository uses compatible dependency ranges; keep these versions
explicit when reproducing this setup.

```bash
# Create an App Router project, then add Nextra
bunx create-next-app@16.0.7 docs --ts --app --no-src-dir --no-tailwind --use-bun
cd docs
bun add next@16.0.7 nextra@4.6.1 nextra-theme-docs@4.6.1
bun add --dev pagefind
```

Remove the generated `app/page.tsx` so the optional catch-all route below can
serve `content/index.mdx` at `/`. Replace the generated layout with the docs layout.
Set these fields in `package.json`, then run `bun install`:

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "postbuild": "pagefind --site .next/server/app --output-path public/_pagefind",
    "start": "next start"
  },
  "overrides": {
    "zod": "4.1.12"
  }
}
```

Nextra 4.6.1 uses Webpack with Next.js 16. The Zod override keeps the docs theme's
Layout validation compatible with Nextra 4.6.1, as in this repository's
`pnpm-workspace.yaml`.

### Next.js Configuration

```javascript
// next.config.mjs
import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
  staticImage: true
})

export default withNextra({
  // Next.js config options
})
```

### Theme Layout

Theme components and options belong in the App Router layout. Nextra 4 does not
use `theme`, `themeConfig` or `theme.config.tsx`.

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Project Docs', template: '%s - Project Docs' },
  description: 'Project documentation'
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head color={{ hue: 200 }} />
      <body>
        <Layout
          navbar={
            <Navbar logo={<span>Project Name</span>} projectLink="https://github.com/org/project" />
          }
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/org/project/tree/main/docs"
          footer={<Footer>© Project Name. All rights reserved.</Footer>}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          toc={{ title: 'On This Page' }}
          feedback={{ content: 'Question? Give us feedback →', labels: 'feedback' }}
          editLink="Edit this page on GitHub →"
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
```

### MDX Components

```tsx
// mdx-components.tsx
import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import type { UseMDXComponents } from 'nextra/mdx-components'

const docsComponents = getDocsMDXComponents()

export const useMDXComponents: UseMDXComponents<typeof docsComponents> = <T,>(components?: T) => ({
  ...docsComponents,
  ...components
})
```

### Content Routes

```tsx
// app/[[...mdxPath]]/page.tsx
import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

type Props = { params: Promise<{ mdxPath?: string[] }> }

export async function generateMetadata({ params }: Props) {
  const { mdxPath } = await params
  const { metadata } = await importPage(mdxPath)
  return metadata
}

const Wrapper = getMDXComponents().wrapper

export default async function Page({ params }: Props) {
  const resolvedParams = await params
  const {
    default: MDXContent,
    toc,
    metadata,
    sourceCode
  } = await importPage(resolvedParams.mdxPath)
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent params={resolvedParams} />
    </Wrapper>
  )
}
```

## Project Structure

```
docs/
├── app/
│   ├── layout.tsx             # Docs theme layout and global metadata
│   ├── globals.css
│   └── [[...mdxPath]]/
│       └── page.tsx           # Render content routes
├── content/
│   ├── _meta.ts               # Root navigation
│   ├── index.mdx              # Home page (/)
│   ├── getting-started.mdx    # /getting-started
│   ├── concepts/
│   │   ├── _meta.ts           # Folder navigation
│   │   ├── index.mdx          # /concepts
│   │   └── architecture.mdx   # /concepts/architecture
│   ├── api/
│   │   ├── _meta.ts
│   │   ├── index.mdx
│   │   └── endpoints.mdx
│   └── guides/
│       ├── _meta.ts
│       └── quickstart.mdx
├── public/
│   └── images/
├── components/
│   └── CustomCard.tsx
├── mdx-components.tsx
├── next.config.mjs
├── tsconfig.json
└── package.json
```

## Navigation Configuration

Use a `_meta.ts` (or `_meta.js`) module with a default export to configure navigation.

### Basic _meta.ts

```ts
export default {
  index: 'Introduction',
  'getting-started': 'Getting Started',
  concepts: 'Core Concepts',
  api: 'API Reference',
  guides: 'Guides'
}
```

### Advanced _meta.ts

```ts
export default {
  index: {
    title: 'Introduction',
    type: 'page',
    theme: {
      layout: 'full'
    }
  },
  'getting-started': 'Getting Started',
  '---': {
    type: 'separator',
    title: 'Features'
  },
  concepts: {
    title: 'Core Concepts',
    type: 'page'
  },
  api: {
    title: 'API Reference',
    type: 'menu',
    items: {
      endpoints: 'Endpoints',
      authentication: 'Authentication'
    }
  },
  changelog: {
    title: 'Changelog',
    type: 'page',
    display: 'hidden'
  },
  github: {
    title: 'GitHub',
    type: 'page',
    href: 'https://github.com/org/project',
    newWindow: true
  }
}
```

### Navigation Item Types

| Type          | Description         |
| ------------- | ------------------- |
| `page`        | Standard page       |
| `menu`        | Dropdown menu       |
| `separator`   | Visual divider      |
| External link | Use `href` property |

To hide a route from navigation, set `"display": "hidden"` on the item, as in
the `changelog` example above. Its `type` remains `"page"`.

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
  <Tabs.Tab>

```bash
npm install package-name
```

  </Tabs.Tab>
  <Tabs.Tab>

```bash
yarn add package-name
```

  </Tabs.Tab>
  <Tabs.Tab>

```bash
pnpm add package-name
```

  </Tabs.Tab>
  <Tabs.Tab>

```bash
bun add package-name
```

  </Tabs.Tab>
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
  <FileTree.Folder name="content" defaultOpen>
    <FileTree.File name="_meta.ts" />
    <FileTree.File name="index.mdx" />
    <FileTree.Folder name="api">
      <FileTree.File name="_meta.ts" />
      <FileTree.File name="endpoints.mdx" />
    </FileTree.Folder>
  </FileTree.Folder>
  <FileTree.File name="next.config.mjs" />
  <FileTree.File name="mdx-components.tsx" />
  <FileTree.Folder name="app">
    <FileTree.File name="layout.tsx" />
    <FileTree.Folder name="[[...mdxPath]]">
      <FileTree.File name="page.tsx" />
    </FileTree.Folder>
  </FileTree.Folder>
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
/* app/globals.css (imported by app/layout.tsx) */
.feature-card {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  transition: box-shadow 150ms;
}
.feature-card:hover {
  box-shadow: 0 2px 8px #0002;
}
```

### Theme Customization

Set theme colors on `Head` in `app/layout.tsx`:

```tsx
<Head color={{ hue: { dark: 200, light: 220 } }} />
```

## Search Configuration

### Built-in Search

Nextra 4 uses Pagefind. The setup's `postbuild` script indexes generated HTML into
`public/_pagefind`. Search needs a completed build to produce its index.

### External Search (Algolia)

Pass a custom search component to `Layout` in `app/layout.tsx` after importing your
Algolia search integration:

```tsx
<Layout pageMap={await getPageMap()} navbar={navbar} footer={footer} search={<AlgoliaSearch />}>
  {children}
</Layout>
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

Use Next.js metadata in `app/layout.tsx`. The content route's `generateMetadata`
above returns each page's front matter.

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://docs.project.com'),
  title: {
    template: '%s - Project Documentation',
    default: 'Project Documentation'
  },
  description: 'Comprehensive documentation for Project',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://docs.project.com',
    siteName: 'Project Docs'
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

- [ ] `_meta.ts` configured
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
# output: 'export', trailingSlash: true, images: { unoptimized: true }
# Set postbuild to: pagefind --site out --output-path out/_pagefind
# Set start to: python3 -m http.server 4000 -d out
bun run build
bun run start
```

Static exports are served from `out/`; `next start` is for the default server build.

### Deployment Checklist

- [ ] All links tested
- [ ] Images optimized
- [ ] Search working
- [ ] Mobile responsive
- [ ] SEO meta tags present
- [ ] Analytics configured

## Migration from Docusaurus

| Docusaurus                     | Nextra                               |
| ------------------------------ | ------------------------------------ |
| `docs/` folder                 | `content/` folder                    |
| `sidebars.ts`                  | `_meta.ts` files                     |
| `docusaurus.config.ts`         | `app/layout.tsx` + `next.config.mjs` |
| `:::note` admonitions          | `<Callout>` component                |
| `@theme/Tabs`                  | `<Tabs>` from nextra                 |
| `sidebar_position` frontmatter | Order in `_meta.ts`                  |
