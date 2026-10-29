import Link from 'next/link'
import type { ReactNode } from 'react'

type LinkCardProps = {
  title: string
  href: string
  children: ReactNode
}

// Text cards share Nextra's Cards grid, without its image-preview Card layout.
export function LinkCard({ title, href, children }: LinkCardProps) {
  return (
    <Link href={href} className="fenno-link-card">
      <span className="fenno-link-card-title">
        {title}
        <span aria-hidden="true" className="fenno-link-card-arrow">
          &#8599;
        </span>
      </span>
      <div className="fenno-link-card-description">{children}</div>
    </Link>
  )
}
