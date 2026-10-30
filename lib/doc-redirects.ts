import type { Locale } from './seo'

export const LEGACY_DOC_ROUTES = {
  'api/openai': 'reference/openai',
  'api/anthropic': 'reference/anthropic',
  'api/gemini': 'reference/gemini'
} as const

export function legacyDocDestination(locale: Locale, path: string) {
  if (path === 'api-reference' || path.startsWith('api-reference/')) {
    return `/${locale}/${path.replace(/^api-reference/, 'reference')}/`
  }
  const destination = LEGACY_DOC_ROUTES[path as keyof typeof LEGACY_DOC_ROUTES]
  return destination ? `/${locale}/${destination}/` : undefined
}
