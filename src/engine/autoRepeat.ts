export type AutoRepeatOptions = {
  delayMs: number
  intervalMs: number
}

/** Delayed auto shift: once held for `delayMs`, fires a repeat every `intervalMs`. */
export class AutoRepeat {
  private heldFor: number | null = null

  constructor(private readonly options: AutoRepeatOptions) {}

  get isHeld(): boolean {
    return this.heldFor !== null
  }

  press(): void {
    this.heldFor = 0
  }

  release(): void {
    this.heldFor = null
  }

  /** Advances the held time and returns how many repeats fired during `deltaMs`. */
  update(deltaMs: number): number {
    if (this.heldFor === null) return 0
    const before = this.repeatsAt(this.heldFor)
    this.heldFor += deltaMs
    return this.repeatsAt(this.heldFor) - before
  }

  private repeatsAt(heldFor: number): number {
    const { delayMs, intervalMs } = this.options
    return heldFor < delayMs ? 0 : Math.floor((heldFor - delayMs) / intervalMs) + 1
  }
}
