import sharp from 'sharp'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const publicDir = new URL('../public/', import.meta.url)
const logo = await readFile(new URL('fenno.svg', publicDir))
await mkdir(new URL('og/', publicDir), { recursive: true })
const logoUri = `data:image/svg+xml;base64,${logo.toString('base64')}`
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#f7f9ff"/><stop offset="1" stop-color="#e9effc"/></linearGradient></defs>
<rect width="1200" height="630" fill="url(#bg)"/>
<circle cx="1130" cy="100" r="250" fill="none" stroke="#ccd9f7" stroke-width="2"/>
<circle cx="1130" cy="100" r="190" fill="none" stroke="#ccd9f7" stroke-width="2"/>
<image href="${logoUri}" x="68" y="55" width="70" height="70"/>
<g font-family="Helvetica, sans-serif" fill="#182235">
<text x="155" y="102" font-size="36" font-weight="700">Fenno Docs</text>
<text x="76" y="257" font-size="70" font-weight="700">Build with Fenno.</text>
<text x="80" y="328" font-size="30" fill="#526078">Model APIs. Coding agents. One place to start.</text>
<rect x="80" y="393" width="250" height="56" rx="10" fill="#1c4fd8"/>
<text x="104" y="430" font-size="25" fill="#ffffff">Fenno API / Models</text>
<rect x="350" y="393" width="250" height="56" rx="10" fill="#ffffff" stroke="#c6d2e8"/>
<text x="374" y="430" font-size="25">FennoAI / Agent</text>
<text x="80" y="558" font-size="23" fill="#526078">docs.fenno.ai</text>
</g></svg>`
await sharp(Buffer.from(social)).png().toFile(new URL('og/docs.png', publicDir).pathname)
for (const [name, size] of [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512]
]) {
  const padding = Math.round(size * 0.1)
  const mark = await sharp(logo)
    .resize(size - padding * 2, size - padding * 2)
    .png()
    .toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: '#ffffff' } })
    .composite([{ input: mark, left: padding, top: padding }])
    .png()
    .toFile(new URL(name, publicDir).pathname)
}
await writeFile(
  new URL('site.webmanifest', publicDir),
  JSON.stringify(
    {
      name: 'Fenno Docs',
      short_name: 'Fenno Docs',
      start_url: '/en/api/',
      scope: '/',
      display: 'browser',
      background_color: '#ffffff',
      theme_color: '#1c4fd8',
      icons: [192, 512].map((size) => ({
        src: `/icon-${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'any'
      }))
    },
    null,
    2
  ) + '\n'
)
console.log('Generated 1200x630 social image and site icons')
