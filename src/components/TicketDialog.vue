<script setup lang="ts">
import { X, Info, ArrowRight, Check } from "@lucide/vue";

import { nextTick, reactive, ref } from "vue";
import {
  normalizeTicket,
  validateTicket,
  type TicketErrors,
  type TicketFields,
} from "../lib/ticket";

const dialog = ref<HTMLDialogElement>();
const nameInput = ref<HTMLInputElement>();
const fields = reactive<TicketFields>({ name: "", email: "", problem: "" });
const errors = ref<TicketErrors>({});
const submitted = ref(false);
const ticketNumber = ref("");
let count = 0;

function open() {
  dialog.value?.showModal();
}
function close() {
  dialog.value?.close();
}
function onBackdrop(event: MouseEvent) {
  if (event.target !== dialog.value || !dialog.value) return;
  const rect = dialog.value.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    close();
}
function clearFieldError(key: keyof TicketFields) {
  delete errors.value[key];
}
async function submit() {
  errors.value = validateTicket(fields);
  if (Object.keys(errors.value).length) {
    await nextTick();
    dialog.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    return;
  }
  Object.assign(fields, normalizeTicket(fields));
  ticketNumber.value = `DEMO-${String(++count).padStart(3, "0")}`;
  submitted.value = true;
  await nextTick();
  dialog.value?.querySelector<HTMLElement>(".ticket-success")?.focus();
}
async function newTicket() {
  submitted.value = false;
  Object.assign(fields, { name: "", email: "", problem: "" });
  errors.value = {};
  await nextTick();
  nameInput.value?.focus();
}
defineExpose({ open });
</script>

<template>
  <dialog ref="dialog" class="ticket-dialog" aria-labelledby="ticket-heading" @click="onBackdrop">
    <div class="dialog-heading">
      <span class="dialog-eyebrow">ПОДДЕРЖКА ПОРТАЛА</span
      ><button
        class="icon-button"
        type="button"
        aria-label="Закрыть форму обращения"
        @click="close"
      >
        <X aria-hidden="true" />
      </button>
    </div>
    <template v-if="!submitted">
      <h2 id="ticket-heading">Расскажите о проблеме<span>.</span></h2>
      <p class="dialog-description">Чем больше деталей, тем проще найти решение.</p>
      <div class="demo-notice">
        <Info :size="19" aria-hidden="true" />
        <p>
          Это демо-форма: данные не отправляются оператору. Для проверки используйте вымышленные
          данные.
        </p>
      </div>
      <form class="ticket-form" novalidate @submit.prevent="submit">
        <div class="field">
          <label for="ticket-name">Как к вам обращаться <span>*</span></label
          ><input
            id="ticket-name"
            ref="nameInput"
            v-model="fields.name"
            name="name"
            autocomplete="name"
            placeholder="Например, Александр"
            maxlength="60"
            required
            :aria-invalid="!!errors.name"
            :aria-describedby="errors.name ? 'name-error' : undefined"
            @input="clearFieldError('name')"
          />
          <p v-if="errors.name" id="name-error" class="field-error">{{ errors.name }}</p>
        </div>
        <div class="field">
          <label for="ticket-email">Электронная почта <span>*</span></label
          ><input
            id="ticket-email"
            v-model="fields.email"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="student@example.ru"
            maxlength="100"
            required
            :aria-invalid="!!errors.email"
            :aria-describedby="errors.email ? 'email-error' : undefined"
            @input="clearFieldError('email')"
          />
          <p v-if="errors.email" id="email-error" class="field-error">{{ errors.email }}</p>
        </div>
        <div class="field">
          <label for="ticket-problem">Что случилось? <span>*</span></label
          ><textarea
            id="ticket-problem"
            v-model="fields.problem"
            name="problem"
            rows="5"
            placeholder="Что вы хотели сделать и на каком шаге возникла проблема?"
            maxlength="500"
            required
            :aria-invalid="!!errors.problem"
            :aria-describedby="errors.problem ? 'problem-error' : undefined"
            @input="clearFieldError('problem')"
          ></textarea>
          <div class="field-bottom">
            <p v-if="errors.problem" id="problem-error" class="field-error">{{ errors.problem }}</p>
            <span class="character-count">{{ fields.problem.length }}/500</span>
          </div>
        </div>
        <button class="primary-button" type="submit">
          Создать демо-обращение <ArrowRight :size="18" aria-hidden="true" />
        </button>
        <p class="form-footnote">
          Все поля обязательны. Не указывайте пароли и другие конфиденциальные данные.
        </p>
      </form>
    </template>
    <div v-else class="ticket-success" tabindex="-1" role="status">
      <span class="success-icon"><Check :size="30" aria-hidden="true" /></span>
      <span class="success-eyebrow">{{ ticketNumber }}</span>
      <h2 id="ticket-heading">Готово, {{ fields.name }}!</h2>
      <p>Демо-обращение создано на этой странице.</p>
      <div class="success-summary">
        <span>Почта для ответа</span><strong>{{ fields.email }}</strong
        ><span>Описание</span>
        <p>{{ fields.problem }}</p>
      </div>
      <p class="success-disclaimer">
        Оператор не получил это обращение. В реальном сервисе ответ поступил бы на указанную почту.
        После обновления страницы данные исчезнут.
      </p>
      <button class="primary-button" @click="close">
        Вернуться к помощнику <ArrowRight :size="18" aria-hidden="true" /></button
      ><button class="secondary-button" @click="newTicket">Создать ещё одно</button>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
.icon-button {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  background: transparent;
  border-radius: 8px;
  color: var(--color-text-secondary);
}
.icon-button:hover {
  background: var(--color-surface-subtle);
}
.ticket-dialog {
  position: fixed;
  inset: 0 0 0 auto;
  margin: 0;
  width: min(500px, 100%);
  height: 100dvh;
  max-height: 100dvh;
  max-width: 100%;
  border: 0;
  border-left: 1px solid var(--color-border);
  padding: 30px 34px 36px;
  background: var(--color-surface);
  color: var(--color-text);
  overflow-y: auto;
  box-shadow: -20px 0 60px var(--color-shadow);
}
.ticket-dialog[open] {
  animation: slide-in 0.24s ease-out;
}
.ticket-dialog::backdrop {
  background: var(--color-backdrop);
  backdrop-filter: blur(3px);
}
.dialog-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
}
.dialog-eyebrow {
  font-size: 9px;
  letter-spacing: 1.6px;
  color: var(--color-text-muted);
}
.ticket-dialog h2 {
  font-size: 28px;
  font-weight: 550;
  letter-spacing: -1px;
  line-height: 1.25;
  overflow-wrap: anywhere;
}
.ticket-dialog h2 > span {
  color: var(--color-text-secondary);
}
.dialog-description {
  margin-top: 12px;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.8;
}
.demo-notice {
  margin-top: 24px;
  display: flex;
  gap: 10px;
  padding: 13px 14px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: 9px;
  color: var(--color-text-secondary);
}
.demo-notice svg {
  margin-top: 1px;
}
.demo-notice p {
  font-size: 11px;
  line-height: 1.8;
}
.ticket-form {
  margin-top: 29px;
}
.field {
  margin-bottom: 21px;
}
.field label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 9px;
}
.field label > span {
  color: var(--color-text-muted);
}
.field input,
.field textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 8px;
  padding: 12px 13px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.field textarea {
  resize: vertical;
  min-height: 120px;
  max-height: 300px;
}
.field input:focus,
.field textarea:focus {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}
.field input::placeholder,
.field textarea::placeholder {
  color: var(--color-text-muted);
}
.field [aria-invalid="true"] {
  border-color: var(--color-error-border);
  background: var(--color-error-bg);
}
.field-error {
  font-size: 10px;
  color: var(--color-error);
  line-height: 1.7;
  margin-top: 7px;
}
.field-bottom {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.character-count {
  font-size: 9px;
  color: var(--color-text-muted);
  margin: 7px 0 0 auto;
}
.primary-button {
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: var(--color-on-accent);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  border-radius: 8px;
  padding: 14px 16px;
  width: 100%;
  font-size: 12px;
  font-weight: 500;
}
.primary-button:hover {
  background: var(--color-accent-hover);
}
.form-footnote {
  font-size: 9px;
  line-height: 1.8;
  color: var(--color-text-muted);
  margin: 13px 4px;
}
.ticket-success {
  padding-top: 24px;
  outline: none;
}
.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  display: grid;
  place-items: center;
  margin-bottom: 28px;
}
.success-eyebrow {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: var(--color-text-muted);
  display: block;
  margin-bottom: 13px;
}
.ticket-success > p {
  font-size: 12px;
  line-height: 1.9;
  color: var(--color-text-muted);
  margin-top: 14px;
}
.success-summary {
  margin-top: 30px;
  padding: 20px;
  background: var(--color-surface-subtle);
  border-radius: 10px;
  overflow-wrap: anywhere;
}
.success-summary > span {
  font-size: 10px;
  color: var(--color-text-muted);
  display: block;
  margin-bottom: 9px;
}
.success-summary strong {
  font-size: 13px;
  font-weight: 500;
  display: block;
  margin-bottom: 23px;
}
.success-summary p {
  font-size: 12px;
  line-height: 1.8;
  white-space: pre-wrap;
}
.success-disclaimer {
  margin-bottom: 28px;
}
.secondary-button {
  width: 100%;
  border: 0;
  background: none;
  padding: 17px;
  color: var(--color-text-secondary);
  font-size: 11px;
}
.secondary-button:hover {
  color: var(--color-accent);
}
@keyframes slide-in {
  from {
    transform: translateX(35px);
    opacity: 0.4;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
@media (max-width: 700px) {
  .ticket-dialog {
    padding: 24px;
  }
  .dialog-heading {
    margin-bottom: 28px;
  }
  .ticket-dialog h2 {
    font-size: 26px;
  }
}
.field input,
.field textarea,
.primary-button {
  font-size: 14px;
}
.field label {
  font-size: 13px;
}
.field-error {
  font-size: 12px;
}
.demo-notice p,
.dialog-description {
  font-size: 12px;
}
</style>
