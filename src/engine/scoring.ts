const LINE_CLEAR_BASE_POINTS = [0, 40, 100, 300, 1200] as const

export const SOFT_DROP_POINTS_PER_ROW = 1
export const HARD_DROP_POINTS_PER_ROW = 2

/** NES line clear score: base points for the number of lines, multiplied by `level + 1`. */
export const lineClearScore = (lines: number, level: number): number =>
  (LINE_CLEAR_BASE_POINTS[lines] ?? 0) * (level + 1)

/** NES level progression for starting levels 0 to 9: one level every 10 lines once caught up. */
export const levelForLines = (startLevel: number, lines: number): number =>
  Math.max(startLevel, Math.floor(lines / 10))
