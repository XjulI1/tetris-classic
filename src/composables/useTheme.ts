import { computed, onBeforeUnmount, ref, watchEffect } from 'vue'
import type { ThemePreference } from '../storage/settings'
import { useSettings } from './useSettings'

export type ResolvedTheme = 'light' | 'dark'

const NEXT_PREFERENCE: Record<ThemePreference, ThemePreference> = { system: 'light', light: 'dark', dark: 'system' }

const THEME_COLORS: Record<ResolvedTheme, string> = { light: '#f4f5f8', dark: '#11131a' }

/** Applies the theme preference to the document and resolves `system` against the OS setting. */
export const useTheme = () => {
  const settings = useSettings()
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const systemPrefersDark = ref(darkQuery.matches)
  const onSystemChange = (event: MediaQueryListEvent) => (systemPrefersDark.value = event.matches)
  darkQuery.addEventListener('change', onSystemChange)
  onBeforeUnmount(() => darkQuery.removeEventListener('change', onSystemChange))

  const resolvedTheme = computed<ResolvedTheme>(() => {
    if (settings.theme !== 'system') return settings.theme
    return systemPrefersDark.value ? 'dark' : 'light'
  })

  watchEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'system') delete root.dataset.theme
    else root.dataset.theme = settings.theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolvedTheme.value])
  })

  const cycleTheme = () => {
    settings.theme = NEXT_PREFERENCE[settings.theme]
  }

  return { preference: computed(() => settings.theme), resolvedTheme, cycleTheme }
}
