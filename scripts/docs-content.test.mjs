import assert from 'node:assert/strict'
import { readFile, readdir, access } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const read = (path) => readFile(new URL(path, root), 'utf8')

async function listContent(path) {
  const entries = await readdir(new URL(`${path}/`, root), { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? listContent(`${path}/${entry.name}`)
          : entry.name.endsWith('.mdx')
            ? [`${path}/${entry.name}`]
            : []
      )
    )
  ).flat()
}

const files = await listContent('content')
const sources = await Promise.all(files.map(async (path) => ({ path, text: await read(path) })))

function slugs(locale) {
  return files
    .filter((path) => path.startsWith(`content/${locale}/`))
    .map((path) => path.replace(`content/${locale}/`, ''))
    .toSorted()
}
const guides = [
  'streaming',
  'tool-calling',
  'structured-output',
  'vision',
  'embeddings',
  'image-generation',
  'prompt-caching',
  'cost-management',
  'rate-limits'
]
const tools = [
  'cc-switch',
  'claude-code',
  'codex',
  'opencode',
  'deepseek-harness',
  'cline',
  'cursor',
  'gemini-cli',
  'zed',
  'workbuddy',
  'cherry-studio',
  'chatbox',
  'openai-sdk',
  'langchain',
  'llamaindex'
]

test('English and Chinese routes match and every approved guide exists', async () => {
  assert.deepEqual(slugs('en'), slugs('zh'))
  for (const locale of ['en', 'zh']) {
    for (const guide of guides) {
      assert.ok(files.includes(`content/${locale}/api/guides/${guide}.mdx`))
    }
    for (const tool of tools) {
      assert.ok(files.includes(`content/${locale}/api/integrations/${tool}.mdx`))
    }
    for (const protocol of ['openai', 'anthropic', 'gemini']) {
      assert.ok(files.includes(`content/${locale}/reference/${protocol}/index.mdx`))
      assert.ok(!files.includes(`content/${locale}/api/${protocol}.mdx`))
    }
  }
})

test('documentation sections use distinct, non-overlapping route prefixes', async () => {
  for (const locale of ['en', 'zh']) {
    const meta = await read(`content/${locale}/_meta.ts`)
    const sections = [...meta.matchAll(/^\s*([\w-]+):\s*\{[^\n]*type:\s*'page'/gm)].map(
      (match) => match[1]
    )
    assert.deepEqual(sections, ['api', 'ai', 'reference'])
    for (const section of sections) {
      assert.ok(sections.every((other) => other === section || !other.startsWith(section)))
    }
  }
})

test('JSON examples parse without sending API requests', () => {
  let count = 0
  for (const { path, text } of sources) {
    for (const [, , code] of text.matchAll(
      /^([ \t]*)```json(?:[ \t][^\n]*)?\n([\s\S]*?)^\1```/gm
    )) {
      assert.doesNotThrow(() => JSON.parse(code), path)
      count++
    }
  }
  assert.ok(count >= 10)
})

test('Python examples have valid syntax without executing their code', () => {
  const snippets = sources.flatMap(({ path, text }) =>
    [...text.matchAll(/^([ \t]*)```python(?:[ \t][^\n]*)?\n([\s\S]*?)^\1```/gm)].map(
      ([, , code]) => ({
        path,
        code
      })
    )
  )
  const result = spawnSync(
    'python3',
    [
      '-c',
      [
        'import ast,json,sys,textwrap',
        'for item in json.load(sys.stdin):',
        '    ast.parse(textwrap.dedent(item["code"]), filename=item["path"])'
      ].join('\n')
    ],
    { input: JSON.stringify(snippets), encoding: 'utf8' }
  )
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.ok(snippets.length >= 30)
})

test('JavaScript module examples parse without TypeScript-only syntax or execution', () => {
  let count = 0
  for (const { path, text } of sources) {
    for (const [, , code] of text.matchAll(
      /^([ \t]*)```(?:javascript|js|mjs)(?:[ \t][^\n]*)?\n([\s\S]*?)^\1```/gm
    )) {
      const result = spawnSync(process.execPath, ['--input-type=module', '--check'], {
        input: code,
        encoding: 'utf8'
      })
      assert.equal(result.status, 0, `${path}: ${result.stderr}`)
      count++
    }
  }
  assert.ok(count >= 2)
})

test('migrated pages do not retain reference-provider URLs or unsupported routing extensions', () => {
  for (const { path, text } of sources) {
    assert.doesNotMatch(text, /ofox|sub2api|provider\.(?:fallback|type)/i, path)
    assert.doesNotMatch(text, /\/(?:en|zh)\/api-reference/, path)
    assert.doesNotMatch(text, /@@(?:L|CLIENT|[A-Z]+)@@/, path)
  }
})

test('model guides do not inherit foreign billing or propagation promises', () => {
  for (const { path, text } of sources) {
    if (!/content\/(en|zh)\/(api|reference)\//.test(path)) continue
    assert.doesNotMatch(text, /permission changes apply immediately|debited in real time/i, path)
    assert.doesNotMatch(
      text,
      /权限变更后[^。\n]*立即生效|实时扣减额度|接通[^\n]*全部主流模型/,
      path
    )
    assert.doesNotMatch(text, /https:\/\/api\.fenno\.ai\/(anthropic|gemini)(?:\/|\b)/, path)
  }
})

test('all integration marks are local static SVGs with recorded attribution', async () => {
  const notice = await read('public/integrations/NOTICE.md')
  for (const tool of tools) {
    const svg = await read(`public/integrations/${tool}.svg`)
    assert.match(svg, /<svg\b/)
    assert.match(svg, /viewBox=/)
    assert.doesNotMatch(svg, /<script\b|<foreignObject\b|<!DOCTYPE|<!ENTITY|\son\w+=/i)
    assert.doesNotMatch(svg, /(?:href|src)=["'](?!#)/i)
    await access(new URL(`out/integrations/${tool}.svg`, root))
  }
  assert.ok(notice.includes('GPL-3.0'))
  assert.ok(notice.includes('parent-brand'))
  assert.ok(notice.includes('raw.githubusercontent.com'))
  for (const locale of ['en', 'zh']) {
    const navigation = await read(`content/${locale}/api/integrations/_meta.tsx`)
    const html = await read(`out/${locale}/api/integrations/index.html`)
    for (const tool of tools) {
      assert.ok(navigation.includes(`name="${tool}"`))
      assert.ok(html.includes(`/integrations/${tool}.svg`))
    }
  }
})
