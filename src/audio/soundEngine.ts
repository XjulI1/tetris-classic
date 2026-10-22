import { KOROBEINIKI, KOROBEINIKI_TEMPO_BPM, type Track } from './korobeiniki'
import { noteFrequency } from './notes'

export type SoundEffect = 'move' | 'rotate' | 'lock' | 'hardDrop' | 'lineClear' | 'tetris' | 'levelUp' | 'gameOver'

type Tone = {
  frequency: number
  slideTo?: number
  duration: number
  wave: OscillatorType
  volume: number
}

const arpeggio = (notes: string[], step: number, wave: OscillatorType, volume: number): Tone[] =>
  notes.map((note) => ({ frequency: noteFrequency(note), duration: step, wave, volume }))

const EFFECTS: Record<SoundEffect, { tones: Tone[]; step: number }> = {
  move: { tones: [{ frequency: 220, duration: 0.03, wave: 'square', volume: 0.04 }], step: 0 },
  rotate: { tones: [{ frequency: 440, slideTo: 660, duration: 0.05, wave: 'square', volume: 0.05 }], step: 0 },
  lock: { tones: [{ frequency: 140, slideTo: 90, duration: 0.08, wave: 'triangle', volume: 0.25 }], step: 0 },
  hardDrop: { tones: [{ frequency: 200, slideTo: 50, duration: 0.14, wave: 'triangle', volume: 0.35 }], step: 0 },
  lineClear: { tones: arpeggio(['C5', 'E5', 'G5', 'C6'], 0.06, 'square', 0.07), step: 0.06 },
  tetris: { tones: arpeggio(['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'], 0.07, 'square', 0.07), step: 0.05 },
  levelUp: { tones: arpeggio(['G4', 'C5', 'E5', 'G5', 'E5', 'G5'], 0.08, 'triangle', 0.18), step: 0.08 },
  gameOver: { tones: arpeggio(['E4', 'C4', 'A3', 'E3'], 0.22, 'sawtooth', 0.06), step: 0.2 },
}

const SCHEDULER_INTERVAL_MS = 25
const SCHEDULE_AHEAD_S = 0.12
const ATTACK_S = 0.005
const NOTE_LENGTH_RATIO = 0.9
const MUSIC_VOLUME = 0.6

type TrackCursor = { track: Track; index: number; nextTime: number }

/** Synthesizes sound effects and background music with the Web Audio API, without any audio file. */
export class SoundEngine {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private musicBus: GainNode | null = null
  private musicTimer: ReturnType<typeof setInterval> | null = null
  private cursors: TrackCursor[] = []
  private muted = false

  /** Creates or resumes the audio context; must be called from a user gesture. */
  unlock(): void {
    if (!this.context) {
      if (typeof AudioContext === 'undefined') return
      this.context = new AudioContext()
      this.master = this.context.createGain()
      this.master.connect(this.context.destination)
      this.musicBus = this.context.createGain()
      this.musicBus.gain.value = MUSIC_VOLUME
      this.musicBus.connect(this.master)
      this.applyMute()
    }
    if (this.context.state === 'suspended') void this.context.resume()
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    this.applyMute()
  }

  play(effect: SoundEffect): void {
    if (!this.context || !this.master || this.muted) return
    const { tones, step } = EFFECTS[effect]
    const start = this.context.currentTime
    tones.forEach((tone, index) => this.playTone(tone, start + index * step, this.master!))
  }

  /** Starts the music from the beginning. */
  startMusic(): void {
    if (!this.context) return
    const start = this.context.currentTime + 0.05
    this.cursors = KOROBEINIKI.map((track) => ({ track, index: 0, nextTime: start }))
    this.resumeMusic()
  }

  /** Resumes the music where it was paused. */
  resumeMusic(): void {
    if (!this.context || this.musicTimer !== null || this.cursors.length === 0) return
    const offset = this.context.currentTime + 0.05 - Math.min(...this.cursors.map(({ nextTime }) => nextTime))
    for (const cursor of this.cursors) cursor.nextTime += Math.max(0, offset)
    this.musicTimer = setInterval(() => this.scheduleMusic(), SCHEDULER_INTERVAL_MS)
    this.scheduleMusic()
  }

  pauseMusic(): void {
    if (this.musicTimer !== null) clearInterval(this.musicTimer)
    this.musicTimer = null
  }

  stopMusic(): void {
    this.pauseMusic()
    this.cursors = []
  }

  private applyMute(): void {
    if (this.master) this.master.gain.value = this.muted ? 0 : 1
  }

  private scheduleMusic(): void {
    if (!this.context || !this.musicBus) return
    const horizon = this.context.currentTime + SCHEDULE_AHEAD_S
    const beat = 60 / KOROBEINIKI_TEMPO_BPM
    for (const cursor of this.cursors) {
      while (cursor.nextTime < horizon) {
        const [pitch, beats] = cursor.track.notes[cursor.index]!
        const duration = beats * beat
        if (pitch !== null) {
          this.playTone(
            {
              frequency: noteFrequency(pitch),
              duration: duration * NOTE_LENGTH_RATIO,
              wave: cursor.track.wave,
              volume: cursor.track.volume,
            },
            cursor.nextTime,
            this.musicBus,
          )
        }
        cursor.nextTime += duration
        cursor.index = (cursor.index + 1) % cursor.track.notes.length
      }
    }
  }

  private playTone({ frequency, slideTo, duration, wave, volume }: Tone, start: number, output: AudioNode): void {
    const context = this.context!
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    oscillator.type = wave
    oscillator.frequency.setValueAtTime(frequency, start)
    if (slideTo !== undefined) oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration)
    envelope.gain.setValueAtTime(0, start)
    envelope.gain.linearRampToValueAtTime(volume, start + ATTACK_S)
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(envelope).connect(output)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.02)
  }
}
