---
name: nextra-writer
description: Expert in creating clear, comprehensive technical documentation with Nextra (Next.js-based docs framework), MDX, and modern documentation patterns. Use for documentation sites that need Next.js integration.
metadata:
  version: '1.0.0'
  tags: 'documentation, nextra, nextjs, mdx, technical-writing, api-docs, react, typescript'
---

# Nextra Technical Writer

## When This Activates

- Creating or updating Nextra documentation (.md, .mdx)
- Configuring Nextra settings (next.config.mjs, app/layout.tsx)
- Writing API documentation
- Organizing documentation structure and navigation
- Setting up documentation search and navigation

## Tech Stack

| Technology | Version |
| ---------- | ------- |
| Nextra     | 4.6.1   |
| Next.js    | 16.0.7  |
| React      | 19.x    |
| TypeScript | 5.x     |
| MDX        | 3.x     |

## Quick Start

```bash
# Create a Next.js app, then add Nextra
bunx create-next-app@16.0.7 docs --ts --app --no-src-dir --no-tailwind --use-bun
cd docs
bun add next@16.0.7 nextra@4.6.1 nextra-theme-docs@4.6.1

# Or add Nextra to an existing Next.js project
bun add next@16.0.7 nextra@4.6.1 nextra-theme-docs@4.6.1
```

Use the App Router. Configure the theme in `app/layout.tsx`, register its MDX
components in `mdx-components.tsx`, and render `content/` through
`app/[[...mdxPath]]/page.tsx` as shown in the full guide. Remove the generated
`app/page.tsx` so the content home page owns `/`. With Next.js 16 and Nextra 4.6.1,
use `next dev --webpack` and `next build --webpack` in the package scripts.

## Project Structure

```
docs/
├── app/
│   ├── layout.tsx         # Docs theme layout
│   └── [[...mdxPath]]/
│       └── page.tsx       # Render content routes
├── content/
│   ├── _meta.json         # Navigation config
│   ├── index.mdx          # Home page
│   ├── getting-started.mdx
│   └── api/
│       ├── _meta.json
│       └── endpoints.mdx
├── mdx-components.tsx     # Docs theme MDX components
├── next.config.mjs        # Next.js + Nextra config
└── package.json
```

## Navigation

Configure via `_meta.json`:

```json
{
  "index": "Introduction",
  "getting-started": "Getting Started",
  "---": {
    "type": "separator"
  },
  "api": "API Reference"
}
```

## Key Features

| Feature   | Pattern                          |
| --------- | -------------------------------- |
| Callouts  | `<Callout type="info">`          |
| Tabs      | `<Tabs items={['npm', 'yarn']}>` |
| Cards     | `<Cards>` component              |
| Steps     | `<Steps>` component              |
| File Tree | `<FileTree>` component           |

## Documentation Hierarchy

1. Quick Start (5-10 min)
2. Core Concepts
3. Feature Documentation
4. Guides & Tutorials
5. API Reference
6. Advanced Topics

## Integration

| Skill               | When to Use                 |
| ------------------- | --------------------------- |
| `docs`              | General technical writing   |
| `api-design-expert` | API documentation structure |
| `frontend-design`   | Custom documentation UI     |

---

**For detailed configuration, MDX patterns, and component examples:** `references/full-guide.md`
