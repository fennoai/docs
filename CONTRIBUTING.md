# Contributing

Use GitHub Issues for documentation feedback. Keep reports free of API keys,
authentication headers and private project content. Update English and Chinese
pages together when a product or configuration changes.

## Local development

```sh
pnpm install
pnpm dev
```

The root and `/en/` open `/en/api/`; `/zh/` opens `/zh/api/`. There is no separate
portal page. The product tabs use Nextra `_meta.ts` entries with `type: 'page'`.

## Content and components

- Put model-service documentation under `content/{en,zh}/api` and Agent
  documentation under `content/{en,zh}/ai`.
- Use **Fenno API (Models)** / **FennoAI (Agent)** in English, and
  **Fenno API（模型）** / **FennoAI（Agent）** in Chinese. Fenno remains the company brand.
- Use Nextra's `Cards` grid with the shared `LinkCard` for title/description links.
  `Cards.Card` is a title/image-preview layout, not a text description card.
- Markdown tables use the shared MDX mapping. Prefer `Steps`, `Callout`, `Tabs`
  and themed disclosure components for structured content rather than raw styling.
- Keep both header rows in the native Navbar. Its complete height must be in
  pixels: Nextra uses `--nextra-navbar-height` in `IntersectionObserver.rootMargin`.
- Active sidebar links keep the normal font weight. Do not globally suppress
  scrollbars or disable scroll chaining; test long pages and menus.
- Adapt reference material to Fenno's actual URLs and capabilities. Do not copy
  another provider's model prefixes, credentials, screenshots or compatibility promises.

## Search metadata

Each page needs a unique, human-written front-matter `title` and `description`.
The Nextra page map drives canonical URLs, reciprocal language alternatives,
sitemap, structured data and `llms.txt`, with `https://docs.fenno.ai` as the domain.
Redirect-only entry routes are not part of the sitemap.

If a substantive update date is known, use `lastModified: "YYYY-MM-DD"`. Do not
invent publication dates or refresh every page's date on each build. Likewise,
do not add fake ratings, reviews or FAQ markup for SEO. `llms.txt` is a discovery
aid, not a search-ranking guarantee.

## Checks

```sh
pnpm lint
pnpm format
pnpm typecheck
pnpm build
pnpm test
```

`pnpm lint` runs oxlint and `pnpm format` runs oxfmt. CI fails on lint warnings or
unformatted files, so run both before pushing; `pnpm format:check` verifies formatting
without writing.

Tests inspect the generated `out/` files, so build first. They cover metadata,
translations, internal links, anchors, structured data, removed pages and layout
markup. Also test desktop/mobile scrolling, navigation, search and both themes
in the browser. API examples require your own credentials and are not executed
by the documentation checks.

Run `pnpm assets` after changing the logo or social-card artwork.

Official references: [Nextra](https://nextra.site/docs),
[Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata),
[Google localized pages](https://developers.google.com/search/docs/specialty/international/localized-versions).
