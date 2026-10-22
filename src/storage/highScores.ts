import { readJson, writeJson } from './localStore'

export const MAX_HIGH_SCORES = 10
export const MAX_NAME_LENGTH = 12

const STORAGE_KEY = 'tetris:high-scores'

export type HighScore = {
  name: string
  score: number
  lines: number
  level: number
  date: string
}

const isHighScore = (value: unknown): value is HighScore => {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry.name === 'string' &&
    typeof entry.score === 'number' &&
    typeof entry.lines === 'number' &&
    typeof entry.level === 'number' &&
    typeof entry.date === 'string'
  )
}

/** Whether a score would enter the leaderboard. */
export const qualifiesForHighScores = (scores: readonly HighScore[], score: number): boolean =>
  score > 0 && (scores.length < MAX_HIGH_SCORES || score > scores.at(-1)!.score)

/**
 * Inserts an entry below existing equal scores and trims the list.
 * `rank` is the 0-based position of the entry, or `null` if it did not make the cut.
 */
export const insertHighScore = (
  scores: readonly HighScore[],
  entry: HighScore,
): { scores: HighScore[]; rank: number | null } => {
  const insertAt = scores.findIndex((existing) => entry.score > existing.score)
  const position = insertAt === -1 ? scores.length : insertAt
  const updated = [...scores.slice(0, position), entry, ...scores.slice(position)].slice(0, MAX_HIGH_SCORES)
  return { scores: updated, rank: position < MAX_HIGH_SCORES ? position : null }
}

/** Trims a player name and caps its length, falling back to a placeholder when empty. */
export const normalizeName = (name: string): string => name.trim().slice(0, MAX_NAME_LENGTH) || '???'

export const loadHighScores = (): HighScore[] => {
  const stored = readJson(STORAGE_KEY)
  return Array.isArray(stored) ? stored.filter(isHighScore).slice(0, MAX_HIGH_SCORES) : []
}

export const saveHighScores = (scores: readonly HighScore[]): void => writeJson(STORAGE_KEY, scores)
