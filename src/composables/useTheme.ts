import { computed, readonly, ref } from 'vue'

export type Theme = 'light' | 'dark'
export const THEME_STORAGE_KEY = 'student-support-theme'
const theme = ref<Theme>('light')
let initialized = false
let hasExplicitPreference = false

export function resolveTheme(stored: string | null, systemDark: boolean): Theme {
  return stored === 'light' || stored === 'dark' ? stored : systemDark ? 'dark' : 'light'
}

function applyTheme(value: Theme) {
  theme.value = value
  document.documentElement.dataset.theme = value
}

export function initializeTheme() {
  if (initialized) return
  initialized = true
  const system = window.matchMedia('(prefers-color-scheme: dark)')
  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    /* Storage may be blocked. */
  }
  hasExplicitPreference = stored === 'light' || stored === 'dark'
  applyTheme(resolveTheme(stored, system.matches))
  system.addEventListener('change', (event) => {
    if (!hasExplicitPreference) applyTheme(event.matches ? 'dark' : 'light')
  })
}

function toggleTheme() {
  const value: Theme = theme.value === 'light' ? 'dark' : 'light'
  hasExplicitPreference = true
  applyTheme(value)
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, value)
  } catch {
    /* The switch still works without storage. */
  }
}

export function useTheme() {
  return { theme: readonly(theme), isDark: computed(() => theme.value === 'dark'), toggleTheme }
}
