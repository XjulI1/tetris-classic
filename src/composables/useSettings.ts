import { reactive, watch } from 'vue'
import { loadSettings, saveSettings, type Settings } from '../storage/settings'

let settings: Settings | null = null

/** Shared, persisted user settings. */
export const useSettings = (): Settings => {
  if (!settings) {
    settings = reactive(loadSettings())
    watch(settings, (current) => saveSettings({ ...current }), { deep: true })
  }
  return settings
}
