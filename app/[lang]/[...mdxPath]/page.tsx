import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../../mdx-components'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { LEGACY_DOC_ROUTES, legacyDocDestination } from '../../../lib/doc-redirects'
import {
  docRoute,
  getDocPages,
  isLocale,
  LOCALES,
  pageMetadata,
  pageStructuredData,
  SITE_URL
} from '../../../lib/seo'

const generateMdxParams = generateStaticParamsFor('mdxPath', 'lang')

export async function generateStaticParams() {
  const pages = await generateMdxParams()
  return [
    ...pages,
    ...pages
      .filter(({ mdxPath }) => mdxPath[0] === 'reference')
      .map(({ lang, mdxPath }) => ({ lang, mdxPath: ['api-reference', ...mdxPath.slice(1)] })),
    ...LOCALES.flatMap((lang) =>
      Object.keys(LEGACY_DOC_ROUTES).map((path) => ({ lang, mdxPath: path.split('/') }))
    )
  ]
}
export const dynamicParams = false

type Props = {
  params: Promise<{ lang: string; mdxPath: string[] }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { lang, mdxPath } = await props.params
  if (!isLocale(lang)) notFound()
  const destination = legacyDocDestination(lang, mdxPath.join('/'))
  if (destination) {
    return {
      robots: { index: false, follow: true },
      alternates: { canonical: SITE_URL + destination }
    }
  }
  const pages = await getDocPages()
  const page = pages.find((item) => item.route === docRoute(lang, mdxPath.join('/')))
  if (!page) notFound()
  return pageMetadata(page, pages)
}

const Wrapper = getMDXComponents().wrapper!

export default async function Page(props: Props) {
  const { lang, mdxPath } = await props.params
  if (!isLocale(lang)) notFound()
  const destination = legacyDocDestination(lang, mdxPath.join('/'))
  if (destination) permanentRedirect(destination)
  const pages = await getDocPages()
  const page = pages.find((item) => item.route === docRoute(lang, mdxPath.join('/')))
  if (!page) notFound()
  const { default: MDXContent, toc, metadata, sourceCode } = await importPage(mdxPath, lang)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageStructuredData(page, pages)).replace(/</g, '\\u003c')
        }}
      />
      <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
        <MDXContent params={props.params} />
      </Wrapper>
    </>
  )
}
