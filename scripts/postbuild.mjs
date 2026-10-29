#!/usr/bin/env node
// Build a bilingual search index from the actual exported pages.
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const OUT_DIR = 'out'

execFileSync('pagefind', ['--site', OUT_DIR, '--output-path', join(OUT_DIR, '_pagefind')], {
  stdio: 'inherit'
})
