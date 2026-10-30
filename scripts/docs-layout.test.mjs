import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function readPage(route) {
  return readFile(new URL(`out/${route}/index.html`, root), 'utf8')
}

function sidebar(html) {
  const result = html.match(
    /<aside\b[^>]*class="[^"]*\bnextra-sidebar\b[^"]*"[^>]*>[\s\S]*?<\/aside>/
  )
  assert.ok(result, 'Nextra sidebar markup must exist')
  return result[0]
}

for (const locale of ['en', 'zh']) {
  test(`${locale}: native header owns all three documentation sections, without Console`, async () => {
    const html = await readPage(`${locale}/api`)
    const header = html.match(/<header\b[^>]*>[\s\S]*?<\/header>/)?.[0]
    assert.ok(header)
    assert.ok(header.includes(`href="/${locale}/api/"`))
    assert.ok(header.includes(`href="/${locale}/ai/"`))
    assert.ok(header.includes(`href="/${locale}/reference/"`))
    assert.ok(header.includes('fenno-header'))
    assert.ok(!header.includes('href="https://api.fenno.ai'))
    assert.ok(!html.includes('fenno-tabs'))
    assert.ok(header.includes('https://x.com/Fennoai'))
    assert.ok(header.includes('https://discord.gg/9HFMKz4qrg'))
    assert.ok(html.includes('https://github.com/fennoai/docs/issues/new'))
    assert.ok(!html.includes('mailto:contact@fenno.ai'))
  })

  test(`${locale}: language entry redirects to API documentation`, async () => {
    const html = await readPage(locale)
    assert.ok(html.includes(`NEXT_REDIRECT;replace;/${locale}/api/;308;`))
    assert.ok(!html.includes('Redirecting to'))
    assert.ok(!html.includes('fenno-home'))
  })

  test(`${locale}: Agent quickstart and FAQ use Nextra components`, async () => {
    const quickstart = await readPage(`${locale}/ai/quick-start`)
    assert.ok(quickstart.includes('nextra-steps'))
    assert.equal((quickstart.match(/<h3\b/g) || []).length, 5)
    assert.equal((quickstart.match(/class="fenno-link-card"/g) || []).length, 3)
    const faq = await readPage(`${locale}/ai/faq`)
    assert.equal((faq.match(/<details\b/g) || []).length, 8)
    assert.ok(faq.includes('x:cursor-pointer'))
  })

  for (const route of [
    'api',
    'api/quickstart',
    'api/guides/streaming',
    'api/integrations/zed',
    'ai',
    'ai/commands',
    'reference',
    'reference/openai/chat-completions',
    'reference/anthropic/messages',
    'reference/gemini/generate-content'
  ]) {
    test(`${locale}/${route}: sidebar is scoped to the current documentation section`, async () => {
      const html = await readPage(`${locale}/${route}`)
      const markup = sidebar(html)
      assert.doesNotMatch(markup, /\bx:hidden\b/)
      const links = [...markup.matchAll(/href="([^"]+)"/g)].map((match) => match[1])
      assert.ok(links.length > 0)
      const prefix = `/${locale}/${route.split('/')[0]}/`
      assert.ok(links.every((href) => href.startsWith(prefix) || href.startsWith('#')))
    })
  }

  for (const [route, cardCount] of [
    ['api/integrations', 4],
    ['api', 4],
    ['api/models', 3],
    ['ai', 4],
    ['reference', 4]
  ]) {
    test(`${locale}/${route}: text cards and Markdown tables use shared styles`, async () => {
      const html = await readPage(`${locale}/${route}`.replace(/\/$/, ''))
      const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0]
      assert.ok(main)
      const cards = [...main.matchAll(/<a\b[^>]*class="fenno-link-card"[^>]*>[\s\S]*?<\/a>/g)]
      assert.equal(cards.length, cardCount)
      for (const [card] of cards) {
        const title = card.indexOf('fenno-link-card-title')
        const description = card.indexOf('fenno-link-card-description')
        assert.ok(title >= 0 && description > title)
      }
      const tables = [...main.matchAll(/<table\b[^>]*>/g)]
      assert.ok(tables.length > 0)
      assert.ok(tables.every(([table]) => table.includes('fenno-table')))
      assert.equal((main.match(/class="fenno-table-wrap"/g) || []).length, tables.length)
    })
  }
}

test('integrations precede capability workflows in both guide sidebars', async () => {
  for (const locale of ['en', 'zh']) {
    const markup = sidebar(await readPage(`${locale}/api`))
    const integrations = markup.indexOf(`href="/${locale}/api/integrations`)
    const workflows = markup.indexOf(`href="/${locale}/api/guides`)
    assert.ok(integrations >= 0 && workflows > integrations)
  }
})

test('viewport-wide shell keeps a separate bounded article width', async () => {
  const css = await readFile(new URL('app/globals.css', root), 'utf8')
  assert.match(css, /--nextra-content-width:\s*100%/)
  assert.match(css, /--fenno-article-width:\s*61rem/)
  assert.match(css, /max-inline-size:\s*var\(--fenno-article-width\)/)
  assert.match(css, /\.fenno-docs article\s*\{[^}]*margin-inline:\s*auto/s)
  assert.match(
    css,
    /\.nextra-sidebar:has\(\.nextra-sidebar-footer button\[aria-expanded='true'\]\)/
  )
  assert.match(css, /inline-size:\s*100%\s*!important/)
})

test('legacy protocol pages and temporary reference URLs redirect without being indexed', async () => {
  const sitemap = await readFile(new URL('out/sitemap.xml', root), 'utf8')
  for (const locale of ['en', 'zh']) {
    for (const protocol of ['openai', 'anthropic', 'gemini']) {
      const html = await readPage(`${locale}/api/${protocol}`)
      assert.ok(html.includes(`NEXT_REDIRECT;replace;/${locale}/reference/${protocol}/;308;`))
      assert.ok(!sitemap.includes(`<loc>https://docs.fenno.ai/${locale}/api/${protocol}/</loc>`))
    }
    for (const suffix of ['', '/openai/chat-completions', '/anthropic/messages']) {
      const html = await readPage(`${locale}/api-reference${suffix}`)
      assert.ok(html.includes(`NEXT_REDIRECT;replace;/${locale}/reference${suffix}/;308;`))
      assert.ok(!sitemap.includes(`/${locale}/api-reference`))
    }
  }
})

test('header offset remains valid for Nextra IntersectionObserver', async () => {
  const css = await readFile(new URL('app/globals.css', root), 'utf8')
  const heights = [...css.matchAll(/--nextra-navbar-height:\s*([^;]+);/g)]
  assert.ok(heights.length > 0)
  assert.ok(heights.every(([, value]) => /^\d+px$/.test(value)))
  assert.doesNotMatch(css, /(?:scrollbar-width|overscroll-behavior):\s*none/)
  assert.doesNotMatch(css, /overflow(?:-[xy])?:\s*none/)
  assert.match(css, /li\.active\s*>\s*:is\(a, button\)\s*\{\s*font-weight:\s*400/)
})
