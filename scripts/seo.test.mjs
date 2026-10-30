import assert from 'node:assert/strict'
import { readdir, readFile, access } from 'node:fs/promises'
import test from 'node:test'
import { parse } from 'yaml'

const origin = 'https://docs.fenno.ai'
const root = new URL('../', import.meta.url)
const decode = (value) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
const attrs = (tag) =>
  Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [
      key.toLowerCase(),
      decode(value)
    ])
  )
const tags = (html, tag) =>
  [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map(([value]) => attrs(value))
const read = (path) => readFile(new URL(path, root), 'utf8')
async function sources(path = 'content') {
  const files = await readdir(new URL(`${path}/`, root), { withFileTypes: true })
  return (
    await Promise.all(
      files.map((file) =>
        file.isDirectory()
          ? sources(`${path}/${file.name}`)
          : file.name.endsWith('.mdx')
            ? [`${path}/${file.name}`]
            : []
      )
    )
  ).flat()
}
const paths = await sources()
const metadata = new Map(
  await Promise.all(
    paths.map(async (path) => {
      const source = await read(path)
      const frontMatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1]
      const route = `/${path
        .slice('content/'.length)
        .replace(/\.mdx$/, '')
        .replace(/(?:^|\/)index$/, '')}/`
      return [route, parse(frontMatter || '') || {}]
    })
  )
)
const routes = [...metadata.keys()]
const indexedRoutes = routes.filter((route) => metadata.get(route).noindex !== true)
function expectedAlternates(route) {
  const languages = {}
  for (const [locale, language] of [
    ['en', 'en'],
    ['zh', 'zh-CN']
  ]) {
    const translation = route.replace(/^\/(en|zh)\//, `/${locale}/`)
    if (indexedRoutes.includes(translation)) languages[language] = origin + translation
  }
  const fallback = languages.en || languages['zh-CN']
  if (fallback) languages['x-default'] = fallback
  return languages
}
const pages = new Map(
  await Promise.all(routes.map(async (route) => [route, await read(`out${route}index.html`)]))
)
const sitemap = await read('out/sitemap.xml')
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, value]) => decode(value))
const titles = new Set()
const descriptions = new Set()

for (const [route, html] of pages) {
  test(`${route}: canonical metadata, language alternatives and structured data`, () => {
    const head = html.match(/<head>[\s\S]*?<\/head>/)?.[0]
    assert.ok(head, 'metadata must be server-rendered in head')
    const meta = tags(head, 'meta')
    const links = tags(head, 'link')
    const title = decode(head.match(/<title>([^<]+)<\/title>/)?.[1] || '')
    const description = meta.find((tag) => tag.name === 'description')?.content
    const url = origin + route
    assert.ok(title.length > 10 && title.length < 100)
    assert.ok(description && description.length > 35 && description.length < 230)
    assert.ok(!titles.has(title), `duplicate title: ${title}`)
    assert.ok(!descriptions.has(description), `duplicate description: ${description}`)
    titles.add(title)
    descriptions.add(description)
    assert.deepEqual(
      links.filter((tag) => tag.rel === 'canonical').map((tag) => tag.href),
      [url]
    )
    assert.equal(meta.find((tag) => tag.property === 'og:url')?.content, url)
    assert.equal(meta.find((tag) => tag.property === 'og:title')?.content, title)
    assert.equal(meta.find((tag) => tag.property === 'og:description')?.content, description)
    assert.equal(meta.find((tag) => tag.name === 'twitter:card')?.content, 'summary_large_image')
    assert.equal(meta.find((tag) => tag.name === 'twitter:site')?.content, '@Fennoai')
    assert.equal(meta.find((tag) => tag.property === 'og:image')?.content, `${origin}/og/docs.png`)
    const noindex = metadata.get(route).noindex === true
    assert.equal(
      meta.find((tag) => tag.name === 'robots')?.content,
      noindex ? 'noindex, follow' : 'index, follow'
    )
    const locale = route.split('/')[1]
    assert.equal(tags(html, 'html')[0].lang, locale)
    const en = route.replace(/^\/(en|zh)\//, '/en/')
    const zh = route.replace(/^\/(en|zh)\//, '/zh/')
    const alternates = Object.fromEntries(
      links.filter((tag) => tag.rel === 'alternate').map((tag) => [tag.hreflang, tag.href])
    )
    assert.deepEqual(alternates, expectedAlternates(route))
    assert.ok(pages.has(en) && pages.has(zh))
    assert.equal(locations.filter((loc) => loc === url).length, noindex ? 0 : 1)
    assert.equal((html.match(/<h1\b/g) || []).length, 1)
    const json = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1]
    assert.ok(json, 'JSON-LD must be rendered without JavaScript execution')
    const graph = JSON.parse(json)['@graph']
    assert.equal(graph.find((item) => item['@type'] === 'WebPage').url, url)
    const breadcrumbs = graph.find((item) => item['@type'] === 'BreadcrumbList').itemListElement
    assert.equal(breadcrumbs.at(-1).item, url)
    assert.ok(
      breadcrumbs.every(
        (item, index) => item.position === index + 1 && pages.has(new URL(item.item).pathname)
      )
    )
    const organization = graph.find((item) => item['@type'] === 'Organization')
    assert.ok(organization.sameAs.includes('https://x.com/Fennoai'))
    assert.ok(organization.sameAs.includes('https://discord.gg/9HFMKz4qrg'))
    assert.ok(!graph.some((item) => item.datePublished), 'do not fabricate publication dates')
  })
}

test('sitemap exactly matches the indexed MDX routes, with reciprocal translations', () => {
  assert.deepEqual(new Set(locations), new Set(indexedRoutes.map((route) => origin + route)))
  assert.equal(locations.length, indexedRoutes.length)
  for (const [, value] of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
    assert.match(
      value,
      /^\d{4}-\d{2}-\d{2}/,
      'lastmod must be a YYYY-MM-DD date declared in front matter'
    )
  }
  for (const [, node] of sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const links = tags(node, 'xhtml:link')
    const url = decode(node.match(/<loc>([^<]+)<\/loc>/)[1])
    assert.deepEqual(
      Object.fromEntries(links.map((link) => [link.hreflang, link.href])),
      expectedAlternates(new URL(url).pathname)
    )
    assert.ok(links.every((link) => locations.includes(link.href)))
  }
})

test('all internal HTML links and fragment targets exist', async () => {
  const errors = []
  for (const [route, html] of pages) {
    const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
    for (const { href } of tags(body, 'a')) {
      if (!href || !/^(\/[^/]|#)/.test(href)) continue
      const url = new URL(href, origin + route)
      const targetRoute = `${url.pathname.replace(/\/$/, '')}/`
      if (pages.has(targetRoute)) {
        if (url.hash) {
          const id = decodeURIComponent(url.hash.slice(1))
          if (!pages.get(targetRoute).includes(`id="${id}"`)) errors.push(`${route} -> ${href}`)
        }
      } else {
        try {
          await access(new URL(`out${url.pathname}`, root))
        } catch {
          errors.push(`${route} -> ${href}`)
        }
      }
    }
  }
  assert.deepEqual(errors, [])
})

test('robots, 404, social assets and LLM discovery are deployable', async () => {
  const robots = await read('out/robots.txt')
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`))
  assert.ok(!/Disallow:\s*\/\s*$/m.test(robots))
  assert.ok(!robots.includes('Disallow: /_next/'))
  assert.ok((await read('out/404.html')).includes('noindex'))
  const fallback = await read('out/index.html')
  assert.ok(fallback.includes(`href="${origin}/en/api/"`))
  const png = await readFile(new URL('out/og/docs.png', root))
  assert.equal(png.readUInt32BE(16), 1200)
  assert.equal(png.readUInt32BE(20), 630)
  const manifest = JSON.parse(await read('out/site.webmanifest'))
  for (const icon of manifest.icons) await access(new URL(`out${icon.src}`, root))
  const llms = await read('out/llms.txt')
  for (const url of locations) assert.ok(llms.includes(`](${url})`))
  for (const lang of ['en', 'zh']) {
    await assert.rejects(access(new URL(`out/${lang}/api/changelog/index.html`, root)))
    for (const tool of ['cc-switch', 'deepseek-harness', 'workbuddy']) {
      assert.ok(pages.has(`/${lang}/api/integrations/${tool}/`))
    }
  }
  assert.ok(![...pages.values()].some((html) => /Fenno AI Gateway|Coding Agent/.test(html)))
})
