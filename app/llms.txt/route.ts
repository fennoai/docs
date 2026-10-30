import { getDocPages, SITE_URL } from '../../lib/seo'

export const dynamic = 'force-static'

export async function GET() {
  const pages = (await getDocPages()).filter((page) => !page.noindex)
  const sections = [
    '# Fenno Docs',
    '',
    '> Official documentation for Fenno API model services and FennoAI Agent.',
    '',
    'Use the exact model IDs available to your account. Protocol and tool support varies by model.',
    `Canonical website: ${SITE_URL}/`,
    ''
  ]
  for (const [locale, heading] of [
    ['en', 'English'],
    ['zh', '中文']
  ]) {
    sections.push(`## ${heading}`, '')
    for (const page of pages.filter((item) => item.locale === locale)) {
      sections.push(`- [${page.title}](${SITE_URL}${page.route}): ${page.description}`)
    }
    sections.push('')
  }
  return new Response(sections.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
