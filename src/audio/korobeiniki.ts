/** A note name (or `null` for a rest) and its length in beats. */
export type Note = readonly [pitch: string | null, beats: number]

export type Track = {
  notes: readonly Note[]
  wave: OscillatorType
  volume: number
}

export const KOROBEINIKI_TEMPO_BPM = 150

const MELODY: readonly Note[] = [
  ['E5', 1], ['B4', 0.5], ['C5', 0.5], ['D5', 1], ['C5', 0.5], ['B4', 0.5],
  ['A4', 1], ['A4', 0.5], ['C5', 0.5], ['E5', 1], ['D5', 0.5], ['C5', 0.5],
  ['B4', 1.5], ['C5', 0.5], ['D5', 1], ['E5', 1],
  ['C5', 1], ['A4', 1], ['A4', 2],
  [null, 0.5], ['D5', 1], ['F5', 0.5], ['A5', 1], ['G5', 0.5], ['F5', 0.5],
  ['E5', 1.5], ['C5', 0.5], ['E5', 1], ['D5', 0.5], ['C5', 0.5],
  ['B4', 1], ['B4', 0.5], ['C5', 0.5], ['D5', 1], ['E5', 1],
  ['C5', 1], ['A4', 1], ['A4', 1], [null, 1],
]

const BASS_ROOTS = ['E2', 'A2', 'G#2', 'A2', 'D2', 'C2', 'B1', 'A2'] as const

const octaveUp = (note: string): string => note.replace(/\d$/, (octave) => String(Number(octave) + 1))

const walkingBassBar = (root: string): Note[] =>
  Array.from({ length: 8 }, (_, eighth): Note => [eighth % 2 === 0 ? root : octaveUp(root), 0.5])

/** Theme A of Korobeiniki (Russian folk song, public domain), as a lead and a bass track. */
export const KOROBEINIKI: readonly Track[] = [
  { notes: MELODY, wave: 'square', volume: 0.07 },
  { notes: BASS_ROOTS.flatMap(walkingBassBar), wave: 'triangle', volume: 0.12 },
]
