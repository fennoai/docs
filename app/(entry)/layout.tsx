import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Fenno Docs',
  alternates: { canonical: 'https://docs.fenno.ai/en/api/' }
}

export default function EntryLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
