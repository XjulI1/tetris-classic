import { readJson, writeJson } from './localStore'

const STORAGE_KEY = 'tetris:settings'

export const MAX_START_LEVEL = 9

export type ThemePreference = 'system' | 'light' | 'dark'

export type Settings = {
  startLevel: number
  muted: boolean
  theme: ThemePreference
  playerName: string
}

export const DEFAULT_SETTINGS: Settings = { startLevel: 0, muted: false, theme: 'system', playerName: '' }

const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark']

const isStartLevel = (value: unknown): value is number =>
  Number.isInteger(value) && (value as number) >= 0 && (value as number) <= MAX_START_LEVEL

const isThemePreference = (value: unknown): value is ThemePreference =>
  THEME_PREFERENCES.includes(value as ThemePreference)

/** Keeps every valid field of a stored value and falls back to defaults for the rest. */
export const parseSettings = (value: unknown): Settings => {
  if (typeof value !== 'object' || value === null) return { ...DEFAULT_SETTINGS }
  const stored = value as Record<string, unknown>
  return {
    startLevel: isStartLevel(stored.startLevel) ? stored.startLevel : DEFAULT_SETTINGS.startLevel,
    muted: typeof stored.muted === 'boolean' ? stored.muted : DEFAULT_SETTINGS.muted,
    theme: isThemePreference(stored.theme) ? stored.theme : DEFAULT_SETTINGS.theme,
    playerName: typeof stored.playerName === 'string' ? stored.playerName : DEFAULT_SETTINGS.playerName,
  }
}

export const loadSettings = (): Settings => parseSettings(readJson(STORAGE_KEY))

export const saveSettings = (settings: Settings): void => writeJson(STORAGE_KEY, settings)
