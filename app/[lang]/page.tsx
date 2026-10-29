import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { isLocale, SITE_URL } from '../../lib/seo'

type Props = { params: Promise<{ lang: string }> }

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'zh' }]
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  return { alternates: { canonical: `${SITE_URL}/${lang}/api/` } }
}

export default async function LocaleEntry({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  permanentRedirect(`/${lang}/api/`)
}
