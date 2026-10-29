import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Table } from 'nextra/components'
import type { UseMDXComponents } from 'nextra/mdx-components'
import type { ComponentProps } from 'react'
import { LinkCard } from './components/link-card'

/**
 * Nextra 官方约定：先取 docs 主题的默认组件，再合并调用方传入的覆盖项。
 * 需要自定义 Markdown 元素（如 a、img、pre）时，在这里扩展即可。
 */
const docsComponents = getDocsMDXComponents()

function DocsTable({ className = '', ...props }: ComponentProps<'table'>) {
  return (
    <div className="fenno-table-wrap">
      <Table {...props} className={`fenno-table ${className}`} />
    </div>
  )
}

const components = { ...docsComponents, table: DocsTable, LinkCard }

export const useMDXComponents: UseMDXComponents<typeof components> = <T,>(overrides?: T) => ({
  ...components,
  ...overrides
})
