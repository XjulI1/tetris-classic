import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, parseSettings } from './settings'

describe('parseSettings', () => {
  it('returns defaults when nothing is stored', () => {
    expect(parseSettings(undefined)).toEqual(DEFAULT_SETTINGS)
  })

  it('keeps valid stored values', () => {
    expect(parseSettings({ startLevel: 7, muted: true, theme: 'dark', playerName: 'Ju' })).toEqual({
      startLevel: 7,
      muted: true,
      theme: 'dark',
      playerName: 'Ju',
    })
  })

  it('replaces invalid fields with defaults', () => {
    expect(parseSettings({ startLevel: 42, muted: 'yes', theme: 'neon', playerName: 7 })).toEqual(DEFAULT_SETTINGS)
  })
})
