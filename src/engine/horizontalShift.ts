import { AutoRepeat, type AutoRepeatOptions } from './autoRepeat'

export type ShiftDirection = -1 | 1

export const DEFAULT_SHIFT_TIMING: AutoRepeatOptions = { delayMs: 170, intervalMs: 50 }

/**
 * Tracks held left/right inputs: the most recently pressed direction wins, and releasing it
 * hands control back to the other direction if it is still held, restarting the auto shift delay.
 */
export class HorizontalShift {
  private held: ShiftDirection[] = []
  private readonly repeat: AutoRepeat

  constructor(timing: AutoRepeatOptions = DEFAULT_SHIFT_TIMING) {
    this.repeat = new AutoRepeat(timing)
  }

  get direction(): ShiftDirection | null {
    return this.held.at(-1) ?? null
  }

  press(direction: ShiftDirection): void {
    this.held = [...this.held.filter((held) => held !== direction), direction]
    this.repeat.press()
  }

  release(direction: ShiftDirection): void {
    const wasActive = this.direction === direction
    this.held = this.held.filter((held) => held !== direction)
    if (this.direction === null) this.repeat.release()
    else if (wasActive) this.repeat.press()
  }

  reset(): void {
    this.held = []
    this.repeat.release()
  }

  /** Returns how many auto-shift steps fired during `deltaMs` in the current direction. */
  update(deltaMs: number): number {
    return this.repeat.update(deltaMs)
  }
}
