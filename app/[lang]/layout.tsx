import { Head, Search } from 'nextra/components'
import { Footer, LastUpdated, Layout, LocaleSwitch, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import { DiscordIcon } from 'nextra/icons'
import 'nextra-theme-docs/style.css'
import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { isLocale, SITE_URL } from '../../lib/seo'
import './../globals.css'

/**
 * 站点 i18n 配置：Nextra 会据此渲染官方 <LocaleSwitch />，
 * 并在 <Head> 中写入 NEXTRA_LOCALES，供 getPageMap / 静态导出使用。
 * 默认语言为英文，根路径由 app/(entry) 跳到 /en/api/。
 */
const I18N = [
  { locale: 'en', name: 'English' },
  { locale: 'zh', name: '中文' }
] as const

const COPY = {
  en: {
    siteName: 'Fenno Docs',
    description:
      'Documentation for Fenno API model services and the FennoAI Agent: API references, tool integrations and GitHub workflows.',
    editLink: 'Edit this page on GitHub',
    feedback: 'Found an issue? Report it on GitHub →',
    tocTitle: 'On this page',
    backToTop: 'Scroll to top',
    theme: { dark: 'Dark', light: 'Light', system: 'System' },
    search: 'Search documentation...',
    emptyResult: 'No results found.',
    searchError: 'Unable to load search. Please refresh and try again.',
    loading: 'Loading...',
    lastUpdated: 'Last updated on'
  },
  zh: {
    siteName: 'Fenno 文档',
    description:
      'Fenno API 模型服务与 FennoAI Agent 开发者文档，涵盖 API 参考、工具接入、GitHub 编码工作流和配置指南。',
    editLink: '在 GitHub 上编辑此页',
    feedback: '发现问题？在 GitHub 提交 Issue →',
    tocTitle: '本页目录',
    backToTop: '回到顶部',
    theme: { dark: '深色', light: '浅色', system: '跟随系统' },
    search: '搜索文档...',
    emptyResult: '未找到相关文档。',
    searchError: '无法加载搜索，请刷新后重试。',
    loading: '加载中...',
    lastUpdated: '最后更新于'
  }
} as const

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0c111b' }
  ]
}

type Params = Promise<{ lang: string }>

/**
 * 站点的根布局：直接把 <html lang> 按语言渲染进静态 HTML，
 * 保证英文页面的 lang 属性、Pagefind 分词语言与 SEO 判定都正确。
 */
export async function generateMetadata({
  params
}: {
  params: Params
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const copy = COPY[lang]

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: copy.siteName,
      template: `%s | ${copy.siteName}`
    },
    description: copy.description,
    applicationName: copy.siteName,
    referrer: 'strict-origin-when-cross-origin',
    manifest: '/site.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' }
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      ...(process.env.BING_SITE_VERIFICATION ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } } : {})
    }
  }
}

export default async function LangLayout({
  children,
  params
}: {
  children: ReactNode
  params: Params
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const copy = COPY[lang]
  const pageMap = await getPageMap(`/${lang}`)

  const navbar = (
    <Navbar
      align="left"
      className="fenno-header"
      // 点击站点 Logo 回到 Fenno 主站
      logoLink="https://fenno.ai"
      logo={
        <span className="fenno-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fenno.svg"
            alt=""
            width={28}
            height={28}
            className="fenno-brand-logo"
          />
          <span className="fenno-brand-name">{copy.siteName}</span>
        </span>
      }
      projectLink="https://github.com/fennoai"
      chatLink="https://discord.gg/9HFMKz4qrg"
      chatIcon={<DiscordIcon width={24} aria-label="Discord" />}
    >
      <a href="https://x.com/Fennoai" target="_blank" rel="noreferrer" aria-label={lang === 'en' ? 'Fenno on X' : 'Fenno 的 X 账号'} className="fenno-social-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.5-8.6L1.6 2h6.5l4.5 6.7L18.9 2Zm-1.1 18h1.7L7.2 4H5.4l12.4 16Z" />
        </svg>
      </a>
      <LocaleSwitch lite />
    </Navbar>
  )

  const footer = (
    <Footer className="fenno-footer">
      <span>
        {new Date().getFullYear()} ©{' '}
        <a href="https://fenno.ai" target="_blank" rel="noreferrer">
          Fenno
        </a>
        . {lang === 'en' ? 'All rights reserved.' : '保留所有权利。'}
      </span>
    </Footer>
  )

  return (
    <html lang={lang} dir="ltr" suppressHydrationWarning>
      <Head
        // Fenno 品牌蓝：#1c4fd8（浅色）/ #5f8ff5（深色）
        color={{
          hue: { light: 224, dark: 221 },
          saturation: { light: 77, dark: 88 },
          lightness: { light: 48, dark: 67 }
        }}
        backgroundColor={{ light: '#ffffff', dark: '#0c111b' }}
      />
      <body className="fenno-docs">
        <Layout
          navbar={navbar}
          pageMap={pageMap}
          search={<Search placeholder={copy.search} emptyResult={copy.emptyResult} errorText={copy.searchError} loading={copy.loading} aria-label={copy.search} />}
          lastUpdated={<LastUpdated locale={lang}>{copy.lastUpdated}</LastUpdated>}
          i18n={[...I18N]}
          footer={footer}
          editLink={null}
          feedback={{
            content: copy.feedback,
            labels: 'docs',
            link: 'https://github.com/fennoai/docs/issues/new'
          }}
          sidebar={{ defaultMenuCollapseLevel: 2 }}
          themeSwitch={copy.theme}
          toc={{ title: copy.tocTitle, backToTop: copy.backToTop }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
