<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import ThemeToggle from './ThemeToggle.vue'
</script>

<template>
  <header class="topbar">
    <div class="breadcrumb">
      <span>Учебный портал</span><ChevronRight :size="14" aria-hidden="true" /><strong
        >Поддержка</strong
      >
    </div>
    <ThemeToggle />
  </header>
</template>

<style scoped lang="scss">
.topbar {
  height: 64px;
  flex-shrink: 0;
  margin: 0 44px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 11px;
  color: var(--color-text-muted);
  strong {
    color: var(--color-text-secondary);
    font-weight: 450;
  }
  svg {
    color: var(--color-text-muted);
  }
}
@media (max-width: 1150px) {
  .topbar {
    margin: 0 32px;
  }
}
@media (max-width: 900px) {
  .topbar {
    margin: 0 24px;
  }
}
@media (max-width: 700px) {
  .topbar {
    height: 60px;
    margin: 0 20px;
  }
  .breadcrumb {
    font-size: 10px;
    gap: 8px;
  }
}
@media (max-width: 390px) {
  .topbar {
    margin: 0 16px;
  }
}
</style>
