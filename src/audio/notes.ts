const SEMITONES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

const A4_FREQUENCY = 440
const A4_MIDI = 69

/** Converts a scientific pitch name such as `'E5'`, `'G#2'` or `'Bb3'` to its frequency in Hz. */
export const noteFrequency = (note: string): number => {
  const match = /^([A-G])(#|b)?(-?\d)$/.exec(note)
  if (!match) throw new Error(`Invalid note "${note}"`)
  const [, letter, accidental, octave] = match
  const accidentalOffset = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0
  const midi = (Number(octave) + 1) * 12 + SEMITONES[letter!]! + accidentalOffset
  return A4_FREQUENCY * 2 ** ((midi - A4_MIDI) / 12)
}
