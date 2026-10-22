const FRAME_MS = 1000 / 60

const NES_FRAMES_PER_ROW = [48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2] as const

/** Level from which the fall speed stops increasing. */
export const MAX_SPEED_LEVEL = NES_FRAMES_PER_ROW.length - 1

export const SOFT_DROP_FIRST_PAUSE_MS = 120
export const SOFT_DROP_ACCELERATION_MS = 25
export const SOFT_DROP_FASTEST_INTERVAL_MS = 3 * FRAME_MS

/** Milliseconds a piece takes to fall one row at the given level, following the NES curve. */
export const gravityInterval = (level: number): number =>
  NES_FRAMES_PER_ROW[Math.min(Math.max(level, 0), MAX_SPEED_LEVEL)]! * FRAME_MS

/**
 * Milliseconds to wait before the next soft drop row, given how many rows the current press already dropped:
 * a pause after the first row so that a tap nudges by one cell, then a ramp up to full soft drop speed.
 */
export const softDropDelay = (rowsDropped: number): number =>
  Math.max(SOFT_DROP_FASTEST_INTERVAL_MS, SOFT_DROP_FIRST_PAUSE_MS - (rowsDropped - 1) * SOFT_DROP_ACCELERATION_MS)
