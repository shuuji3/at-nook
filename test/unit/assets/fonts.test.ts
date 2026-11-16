import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const FILES = [
  'public/fonts/shadows-into-light-two/shadows-into-light-two-latin.woff2',
  'public/fonts/shadows-into-light-two/shadows-into-light-two-latin-ext.woff2',
  'public/fonts/shadows-into-light-two/OFL.txt',
  'public/fonts/zen-kurenaido/OFL.txt',
]

describe('fonts', () => {
  it.each(FILES)('%s exists', (file) => {
    expect(existsSync(file)).toBe(true)
  })

  it('css never points at google hosts', () => {
    for (const file of ['app/assets/css/fonts.css', 'app/assets/css/zen-kurenaido.css']) {
      const css = readFileSync(file, 'utf8')
      expect(css).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
    }
    expect(readFileSync('app/assets/css/fonts.css', 'utf8')).toContain('Shadows Into Light Two')
    expect(readFileSync('app/assets/css/zen-kurenaido.css', 'utf8')).toContain('Zen Kurenaido')
  })
})
