<script setup lang="ts">
import { LifeBuoy, ArrowUpRight } from '@lucide/vue'
const emit = defineEmits<{ contact: [] }>()
</script>

<template>
  <div class="contact-strip">
    <span class="contact-strip-icon"><LifeBuoy :size="21" aria-hidden="true" /></span>
    <div>
      <strong>Не нашли ответ?</strong>
      <p>Опишите ситуацию — подготовим демо-обращение.</p>
    </div>
    <button @click="emit('contact')">
      Создать обращение <ArrowUpRight :size="17" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.contact-strip {
  display: flex;
  align-items: center;
  gap: 13px;
  flex-shrink: 0;
  margin-top: 0;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 11px;
  background: var(--color-surface-subtle);
}
.contact-strip-icon {
  color: var(--color-text-secondary);
}
.contact-strip strong {
  font-size: 11px;
  font-weight: 550;
}
.contact-strip p {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 5px;
  line-height: 1.6;
}
.contact-strip button {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-left: auto;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: 10px 12px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}
.contact-strip button:hover {
  border-color: var(--color-border-strong);
  background: var(--color-surface-subtle);
}
@media (max-width: 900px) {
  .contact-strip {
    padding: 16px 13px;
    gap: 9px;
  }
  .contact-strip p {
    max-width: 170px;
  }
  .contact-strip button {
    font-size: 9px;
    gap: 5px;
  }
  .contact-strip-icon {
    display: none;
  }
}
@media (max-width: 700px) {
  .contact-strip {
    margin-top: 0;
    flex-wrap: wrap;
    gap: 13px;
    padding: 16px;
  }
  .contact-strip > div {
    flex: 1;
    min-width: 150px;
  }
  .contact-strip p {
    max-width: none;
    font-size: 9px;
  }
  .contact-strip button {
    font-size: 10px;
  }
}
@media (max-width: 390px) {
  .contact-strip button {
    width: 100%;
    justify-content: space-between;
  }
}
.contact-strip strong {
  font-size: 12px;
}
.contact-strip p {
  font-size: 11px;
  color: var(--color-text-secondary);
}
</style>
