import type { Metadata } from 'next'
import type { PageMapItem } from 'nextra'
import { getPageMap } from 'nextra/page-map'
import { cache } from 'react'

export const SITE_URL = 'https://docs.fenno.ai'
export const LOCALES = ['en', 'zh'] as const
export type Locale = (typeof LOCALES)[number]
export const SITE_NAMES = { en: 'Fenno Docs', zh: 'Fenno 文档' }
export const LANGUAGE_TAGS = { en: 'en', zh: 'zh-CN' }
const OG_LOCALES = { en: 'en_US', zh: 'zh_CN' }

export type DocPage = {
  locale: Locale
  route: string
  slug: string
  title: string
  description: string
  noindex: boolean
  lastModified?: string
}

export function isLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale === value)
}

export function docRoute(locale: Locale, slug = '') {
  return `/${[locale, ...slug.split('/').filter(Boolean)].join('/')}/`
}

export const getDocPages = cache(async (): Promise<DocPage[]> => {
  const pages: DocPage[] = []
  for (const locale of LOCALES) {
    const visit = (items: PageMapItem[]) => {
      for (const item of items) {
        if ('children' in item) {
          visit(item.children)
        } else if ('route' in item) {
          const route = `${item.route.replace(/\/$/, '')}/`
          const meta = item.frontMatter || {}
          if (typeof meta.title !== 'string' || typeof meta.description !== 'string') {
            throw new Error(`Missing SEO title or description: ${route}`)
          }
          // Do not use Nextra's build-time fallback timestamp as a publication date.
          const date = meta.lastModified
          if (
            date &&
            (typeof date !== 'string' ||
              !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
              Number.isNaN(Date.parse(date)))
          ) {
            throw new Error(`Invalid lastModified date: ${route}`)
          }
          pages.push({
            locale,
            route,
            slug: route.slice(`/${locale}/`.length).replace(/\/$/, ''),
            title: meta.title,
            description: meta.description,
            noindex: meta.noindex === true,
            ...(date ? { lastModified: date } : {})
          })
        }
      }
    }
    visit(await getPageMap(`/${locale}`))
  }
  // oxlint-disable-next-line unicorn/no-array-sort -- sorting the local array built above
  return pages.sort((a, b) => a.route.localeCompare(b.route))
})

export function languageAlternates(page: DocPage, pages: DocPage[]) {
  const translations = pages.filter((item) => item.slug === page.slug && !item.noindex)
  const languages: Record<string, string> = Object.fromEntries(
    translations.map((item) => [LANGUAGE_TAGS[item.locale], SITE_URL + item.route])
  )
  const fallback = translations.find((item) => item.locale === 'en') || translations[0]
  if (fallback) languages['x-default'] = SITE_URL + fallback.route
  return languages
}

export function pageMetadata(page: DocPage, pages: DocPage[]): Metadata {
  const url = SITE_URL + page.route
  const title = `${page.title} | ${SITE_NAMES[page.locale]}`
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url, languages: languageAlternates(page, pages) },
    robots: {
      index: !page.noindex,
      follow: true,
      googleBot: {
        index: !page.noindex,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1
      }
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description: page.description,
      siteName: SITE_NAMES[page.locale],
      locale: OG_LOCALES[page.locale],
      alternateLocale: pages
        .filter((item) => item.slug === page.slug && item.locale !== page.locale && !item.noindex)
        .map((item) => OG_LOCALES[item.locale]),
      images: [
        {
          url: `${SITE_URL}/og/docs.png`,
          width: 1200,
          height: 630,
          alt: 'Fenno API and FennoAI developer documentation'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Fennoai',
      title,
      description: page.description,
      images: [
        { url: `${SITE_URL}/og/docs.png`, alt: 'Fenno API and FennoAI developer documentation' }
      ]
    }
  }
}

export function pageStructuredData(page: DocPage, pages: DocPage[]) {
  const url = SITE_URL + page.route
  const organization = 'https://fenno.ai/#organization'
  const website = `${SITE_URL}/#website`
  const parts = page.slug ? page.slug.split('/') : []
  const routes = [
    docRoute(page.locale),
    ...parts.map((_, index) => docRoute(page.locale, parts.slice(0, index + 1).join('/')))
  ]
  const ancestors = routes
    .map((route) => pages.find((item) => item.route === route))
    .filter((item): item is DocPage => Boolean(item))
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organization,
        name: 'Fenno',
        url: 'https://fenno.ai/',
        logo: `${SITE_URL}/icon-512.png`,
        sameAs: [
          'https://github.com/fennoai',
          'https://x.com/Fennoai',
          'https://discord.gg/9HFMKz4qrg'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': website,
        url: `${SITE_URL}/`,
        name: 'Fenno Docs',
        publisher: { '@id': organization },
        inLanguage: Object.values(LANGUAGE_TAGS)
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: LANGUAGE_TAGS[page.locale],
        isPartOf: { '@id': website },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        ...(page.slug && !page.slug.endsWith('/terms')
          ? { mainEntity: { '@id': `${url}#article` } }
          : {})
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: ancestors.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.title,
          item: SITE_URL + item.route
        }))
      },
      ...(page.slug && !page.slug.endsWith('/terms')
        ? [
            {
              '@type': 'TechArticle',
              '@id': `${url}#article`,
              headline: page.title,
              description: page.description,
              inLanguage: LANGUAGE_TAGS[page.locale],
              mainEntityOfPage: { '@id': `${url}#webpage` },
              author: { '@id': organization },
              publisher: { '@id': organization },
              image: `${SITE_URL}/og/docs.png`,
              ...(page.lastModified ? { dateModified: page.lastModified } : {})
            }
          ]
        : [])
    ]
  }
}
