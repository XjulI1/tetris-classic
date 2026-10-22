import { describe, expect, it } from 'vitest'
import { noteFrequency } from './notes'

describe('noteFrequency', () => {
  it('tunes A4 to 440 Hz', () => {
    expect(noteFrequency('A4')).toBe(440)
  })

  it('doubles the frequency every octave', () => {
    expect(noteFrequency('A5')).toBeCloseTo(880)
    expect(noteFrequency('A2')).toBeCloseTo(110)
  })

  it('handles sharps and flats', () => {
    expect(noteFrequency('C4')).toBeCloseTo(261.63, 1)
    expect(noteFrequency('G#4')).toBeCloseTo(noteFrequency('Ab4'))
  })

  it('rejects invalid notes', () => {
    expect(() => noteFrequency('H2')).toThrow()
  })
})
