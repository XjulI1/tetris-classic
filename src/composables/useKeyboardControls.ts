import { onBeforeUnmount, onMounted } from 'vue'
import type { GameAction } from './useTetrisSession'

const KEY_ACTIONS: Record<string, GameAction> = {
  arrowleft: 'left',
  arrowright: 'right',
  arrowdown: 'softDrop',
  arrowup: 'rotateClockwise',
  x: 'rotateClockwise',
  z: 'rotateCounterClockwise',
  w: 'rotateCounterClockwise',
  ' ': 'hardDrop',
}

const PAUSE_KEYS = new Set(['p', 'escape'])
const MUTE_KEYS = new Set(['m'])

export type KeyboardHandlers = {
  press: (action: GameAction) => void
  release: (action: GameAction) => void
  togglePause: () => void
  toggleMute: () => void
  releaseAll: () => void
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement

/**
 * Binds game controls to the keyboard, by character so that AZERTY users get the keys printed on
 * their keyboard: arrows, Space, X / Z (or W) to rotate, P / Escape to pause, M to mute.
 */
export const useKeyboardControls = (handlers: KeyboardHandlers) => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return
    const key = event.key.toLowerCase()
    if (PAUSE_KEYS.has(key) && !event.repeat) return handlers.togglePause()
    if (MUTE_KEYS.has(key) && !event.repeat) return handlers.toggleMute()
    const action = KEY_ACTIONS[key]
    if (!action) return
    event.preventDefault()
    if (!event.repeat) handlers.press(action)
  }

  const onKeyUp = (event: KeyboardEvent) => {
    const action = KEY_ACTIONS[event.key.toLowerCase()]
    if (!action) return
    event.preventDefault()
    handlers.release(action)
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', handlers.releaseAll)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', handlers.releaseAll)
  })
}
