import { describe, expect, it } from 'vitest'
import { KOROBEINIKI } from './korobeiniki'
import { noteFrequency } from './notes'

const totalBeats = (notes: readonly (readonly [string | null, number])[]) =>
  notes.reduce((sum, [, beats]) => sum + beats, 0)

describe('KOROBEINIKI', () => {
  it('keeps every track the same length so they loop in sync', () => {
    const lengths = KOROBEINIKI.map(({ notes }) => totalBeats(notes))
    expect(new Set(lengths)).toEqual(new Set([32]))
  })

  it('only uses valid pitches', () => {
    for (const { notes } of KOROBEINIKI) {
      for (const [pitch] of notes) {
        if (pitch !== null) expect(noteFrequency(pitch)).toBeGreaterThan(0)
      }
    }
  })
})
