import type { MetadataRoute } from 'next'
import { getDocPages, languageAlternates, SITE_URL } from '../lib/seo'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getDocPages()
  return pages.filter(page => !page.noindex).map(page => ({
    url: SITE_URL + page.route,
    ...(page.lastModified ? { lastModified: page.lastModified } : {}),
    alternates: { languages: languageAlternates(page, pages) }
  }))
}
