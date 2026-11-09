<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    role="switch"
    aria-label="Тёмная тема"
    :aria-checked="isDark"
    :title="isDark ? 'Включить светлую тему' : 'Включить тёмную тему'"
    @click="toggleTheme"
  >
    <component :is="isDark ? Moon : Sun" :size="16" aria-hidden="true" />
    <span class="theme-label">{{ isDark ? 'Тёмная' : 'Светлая' }}</span>
    <span class="switch-track" aria-hidden="true"><span></span></span>
  </button>
</template>

<style scoped lang="scss">
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 36px;
  padding: 7px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 11px;

  &:hover {
    background: var(--color-surface-hover);
  }
  &[aria-checked='true'] .switch-track {
    background: var(--color-accent);
    span {
      transform: translateX(12px);
      background: var(--color-on-accent);
    }
  }
}
.switch-track {
  display: inline-flex;
  align-items: center;
  width: 28px;
  height: 16px;
  padding: 2px;
  border-radius: 20px;
  background: var(--color-border-strong);

  span {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--color-surface);
    transition: transform 0.18s ease;
  }
}
@media (max-width: 440px) {
  .theme-toggle {
    gap: 6px;
    padding: 7px;
  }
  .theme-label {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .switch-track span {
    transition: none;
  }
}
</style>
