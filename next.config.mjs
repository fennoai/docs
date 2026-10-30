import nextra from 'nextra'

const withNextra = nextra({
  latex: true,
  defaultShowCopyCode: true,
  // 静态导出没有 i18n 中间件，Nextra 默认生成的站内链接不带 locale 前缀
  // （例如 /quickstart），会直接 404。开启后链接统一生成为 /zh/quickstart、/en/quickstart。
  unstable_shouldAddLocaleToLinks: true,
  search: {
    codeblocks: false
  }
})

/**
 * Fenno 文档站：静态导出，部署到 docs.fenno.ai。
 * - output: 'export' 产出纯静态文件（out/），可直接挂 Nginx / 对象存储。
 * - images.unoptimized 是静态导出的硬性要求。
 * - i18n 使用 Nextra 的 App Router 方案：内容位于 content/<locale>，URL 为 /zh/*、/en/*。
 */
export default withNextra({
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en'
  }
})
