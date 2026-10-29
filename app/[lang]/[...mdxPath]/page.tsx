import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../../mdx-components'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { docRoute, getDocPages, isLocale, pageMetadata, pageStructuredData } from '../../../lib/seo'

export const generateStaticParams = generateStaticParamsFor('mdxPath', 'lang')
export const dynamicParams = false

type Props = {
  params: Promise<{ lang: string; mdxPath: string[] }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { lang, mdxPath } = await props.params
  if (!isLocale(lang)) notFound()
  const pages = await getDocPages()
  const page = pages.find((item) => item.route === docRoute(lang, mdxPath.join('/')))
  if (!page) notFound()
  return pageMetadata(page, pages)
}

const Wrapper = getMDXComponents().wrapper!

export default async function Page(props: Props) {
  const { lang, mdxPath } = await props.params
  if (!isLocale(lang)) notFound()
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
