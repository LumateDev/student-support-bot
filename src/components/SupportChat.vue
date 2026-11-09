<script setup lang="ts">
import {
  Asterisk,
  RotateCcw,
  ArrowUpRight,
  ArrowRight,
  ArrowUp,
  LogIn,
  KeyRound,
  BookOpen,
} from '@lucide/vue'

import { computed, nextTick, ref, watch } from 'vue'
import { findFaq, topics, type TopicId } from '../lib/faq'

interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
  topic?: TopicId
}
const messages = ref<Message[]>([])
const query = ref('')
const conversation = ref<HTMLDivElement>()
const queryInput = ref<HTMLTextAreaElement>()
const selectedTopic = ref<TopicId>()
const hasConversation = computed(() => messages.value.length > 0)
let nextId = 0

function append(role: Message['role'], text: string, topic?: TopicId) {
  messages.value.push({ id: ++nextId, role, text, topic })
}
function selectTopic(id: TopicId) {
  const topic = topics.find((item) => item.id === id)
  if (!topic) return
  selectedTopic.value = id
  append('user', topic.question)
  append('assistant', topic.answer, id)
  queryInput.value?.focus()
}
function sendQuestion() {
  const text = query.value.trim()
  if (!text) return
  append('user', text)
  query.value = ''
  if (text.toLocaleLowerCase('ru') === 'меню') {
    selectedTopic.value = undefined
    append(
      'assistant',
      'Помогу со входом, восстановлением пароля и учебными материалами. Выберите тему в меню или напишите вопрос, например «Где конспекты?».',
    )
    return
  }
  const topic = findFaq(text)
  selectedTopic.value = topic?.id
  append(
    'assistant',
    topic?.answer ??
      'Пока не нашёл подходящий ответ в справочнике. Попробуйте спросить о входе, пароле или материалах курса. Если вопрос о другом — опишите его в форме обращения ниже.',
    topic?.id,
  )
}
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault()
    sendQuestion()
  }
}
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    conversation.value?.scrollTo({ top: conversation.value.scrollHeight, behavior: 'smooth' })
  },
)
function startAgain() {
  messages.value = []
  query.value = ''
  selectedTopic.value = undefined
  queryInput.value?.focus()
}

const emit = defineEmits<{ contact: []; 'topic-change': [id: TopicId | undefined] }>()
watch(selectedTopic, (id) => emit('topic-change', id))
defineExpose({ selectTopic, startAgain })

const topicIcons = { login: LogIn, password: KeyRound, materials: BookOpen }
</script>

<template>
  <section class="chat-card" aria-labelledby="chat-title">
    <div class="chat-header">
      <div class="assistant-avatar"><Asterisk :size="25" aria-hidden="true" /></div>
      <div>
        <h2 id="chat-title">Помощник портала</h2>
        <p><span class="status-dot"></span> Отвечает по справочнику</p>
      </div>
      <button
        v-if="hasConversation"
        class="icon-button reset-button"
        title="Начать новый диалог"
        aria-label="Начать новый диалог"
        @click="startAgain"
      >
        <RotateCcw :size="18" aria-hidden="true" /></button
      ><span v-else class="assistant-badge">FAQ-помощник</span>
    </div>
    <div
      ref="conversation"
      class="conversation"
      :class="{ 'conversation-start': !hasConversation }"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Переписка с помощником"
    >
      <div class="welcome-message">
        <span class="small-avatar"><Asterisk :size="17" aria-hidden="true" /></span>
        <div class="welcome-copy">
          <span class="message-author">Помощник</span>
          <div class="welcome-bubble">
            <p>Здравствуйте! С чем помочь?</p>
            <p>
              Выберите тему ниже или задайте вопрос своими словами.<br class="desktop-break" />
              Например: «Как авторизоваться?» или «Где конспекты?».
            </p>
          </div>
        </div>
      </div>
      <div v-if="!hasConversation" class="suggestions">
        <span class="suggestions-caption">С ЧЕГО НАЧНЁМ?</span>
        <div class="suggestion-grid">
          <button
            v-for="topic in topics"
            :key="topic.id"
            class="suggestion-card"
            @click="selectTopic(topic.id)"
          >
            <span class="suggestion-top"
              ><component :is="topicIcons[topic.id]" :size="21" aria-hidden="true" /><ArrowUpRight
                class="suggestion-arrow"
                :size="16"
                aria-hidden="true" /></span
            ><strong>{{ topic.label }}</strong
            ><span>{{ topic.description }}</span>
          </button>
        </div>
      </div>
      <div v-for="message in messages" :key="message.id" class="message-row" :class="message.role">
        <span v-if="message.role === 'assistant'" class="small-avatar"
          ><Asterisk :size="17" aria-hidden="true"
        /></span>
        <div class="message-content">
          <span class="message-author">{{ message.role === 'user' ? 'Вы' : 'Помощник' }}</span>
          <div class="message-bubble">{{ message.text }}</div>
          <button
            v-if="message.role === 'assistant' && !message.topic"
            class="inline-contact"
            @click="emit('contact')"
          >
            Открыть форму обращения <ArrowRight :size="15" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
    <div class="composer-area">
      <form class="composer" @submit.prevent="sendQuestion">
        <label class="sr-only" for="question">Ваш вопрос помощнику</label
        ><textarea
          id="question"
          ref="queryInput"
          v-model="query"
          rows="1"
          maxlength="300"
          placeholder="Напишите свой вопрос…"
          @keydown="handleKeydown"
        ></textarea
        ><button
          class="send-button"
          type="submit"
          :disabled="!query.trim()"
          aria-label="Отправить вопрос"
        >
          <ArrowUp :size="21" aria-hidden="true" />
        </button>
      </form>
      <div class="composer-caption">
        <span
          ><kbd>Enter</kbd> — отправить
          <span class="shift-hint">· <kbd>Shift + Enter</kbd> — новая строка</span></span
        ><span>{{ query.length }}/300</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.chat-card {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  flex: 1;
  min-height: 0;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: 0 4px 24px var(--color-shadow);
  overflow: hidden;
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--color-border);
}
.assistant-avatar {
  width: 41px;
  height: 41px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: var(--color-accent);
  background: var(--color-accent-soft);
}
.chat-header h2 {
  font-size: 13px;
  font-weight: 550;
  letter-spacing: -0.2px;
}
.chat-header p {
  font-size: 9px;
  color: var(--color-text-muted);
  display: flex;
  gap: 5px;
  align-items: center;
  margin-top: 6px;
}
.status-dot {
  width: 5px;
  height: 5px;
  background: var(--color-accent);
  border-radius: 50%;
}
.assistant-badge {
  margin-left: auto;
  border: 1px solid var(--color-border);
  padding: 5px 9px;
  border-radius: 5px;
  color: var(--color-text-muted);
  font-size: 9px;
}
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
.reset-button {
  margin-left: auto;
}
.conversation {
  min-height: 0;
  padding: 20px 24px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
  overscroll-behavior: contain;
}
.welcome-message,
.message-row {
  display: flex;
  gap: 11px;
  align-items: flex-start;
}
.small-avatar {
  width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  background: var(--color-accent-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.welcome-copy,
.message-content {
  min-width: 0;
  max-width: 85%;
}
.message-author {
  display: block;
  font-size: 9px;
  color: var(--color-text-muted);
  margin: 0 0 7px 1px;
}
.welcome-bubble {
  font-size: 12px;
  background: var(--color-surface-subtle);
  padding: 15px 18px;
  border: 1px solid var(--color-border);
  border-radius: 0 11px 11px;
  line-height: 1.85;
  color: var(--color-text-secondary);
}
.welcome-bubble p:first-child {
  font-weight: 550;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 5px;
}
.suggestions {
  margin: 20px 0 0 38px;
}
.suggestions-caption {
  font-size: 8px;
  color: var(--color-text-muted);
  font-weight: 500;
  letter-spacing: 1.3px;
}
.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 11px;
  margin-top: 12px;
}
.suggestion-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 10px;
  padding: 15px 13px;
  text-align: left;
  min-height: 96px;
}
.suggestion-card:hover {
  background: var(--color-surface-subtle);
  border-color: var(--color-border-strong);
  transform: translateY(-2px);
}
.suggestion-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: var(--color-text-secondary);
  margin-bottom: 14px;
}
.suggestion-arrow {
  color: var(--color-text-muted);
}
.suggestion-card strong {
  font-size: 10px;
  font-weight: 550;
  margin-bottom: 6px;
  line-height: 1.5;
  letter-spacing: -0.2px;
}
.suggestion-card > span:last-child {
  font-size: 9px;
  color: var(--color-text-muted);
  line-height: 1.6;
}
.message-row {
  margin-top: 24px;
}
.message-bubble {
  font-size: 12px;
  line-height: 1.85;
  padding: 14px 17px;
  border-radius: 0 12px 12px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: var(--color-text-secondary);
}
.message-row.user {
  justify-content: flex-end;
}
.message-row.user .message-author {
  text-align: right;
}
.user .message-bubble {
  background: var(--color-accent-soft);
  border-color: var(--color-border);
  color: var(--color-accent);
  border-radius: 12px 0 12px 12px;
}
.inline-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: none;
  padding: 10px 1px 0;
  font-size: 10px;
  color: var(--color-accent);
}
.inline-contact:hover {
  text-decoration: underline;
}
.composer-area {
  padding: 12px 24px 10px;
  border-top: 1px solid var(--color-border);
}
.composer {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: var(--color-surface);
  padding: 7px 8px 7px 14px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.composer:focus-within {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}
.composer textarea {
  border: 0;
  resize: none;
  flex: 1;
  min-width: 0;
  max-height: 90px;
  background: none;
  font-size: 12px;
  line-height: 1.7;
  padding: 5px 8px 5px 0;
  color: var(--color-text-secondary);
  field-sizing: content;
}
.composer textarea::placeholder {
  color: var(--color-text-muted);
}
.send-button {
  width: 33px;
  height: 33px;
  border-radius: 7px;
  border: 0;
  background: var(--color-accent);
  color: var(--color-on-accent);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.send-button:hover:not(:disabled) {
  background: var(--color-accent-hover);
}
.composer-caption {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 11px;
  font-size: 8px;
  color: var(--color-text-muted);
}
.composer-caption kbd {
  font: inherit;
  color: var(--color-text-muted);
}
.shift-hint {
  margin-left: 4px;
}
@media (max-height: 800px) and (min-width: 701px) {
  .conversation {
    padding: 16px 24px;
  }
  .welcome-bubble {
    padding: 12px 15px;
    line-height: 1.7;
  }
  .suggestions {
    margin-top: 16px;
  }
  .suggestion-card {
    min-height: 84px;
    padding: 12px;
  }
  .suggestion-top {
    margin-bottom: 10px;
  }
}
@media (max-width: 1150px) {
  .suggestions {
    margin-left: 0;
  }
  .suggestion-card {
    padding: 13px 10px;
  }
  .desktop-break {
    display: none;
  }
}
@media (max-width: 900px) {
  .conversation {
    padding: 23px 18px;
  }
  .chat-header {
    padding: 17px 18px;
  }
  .composer-area {
    padding: 16px 18px 13px;
  }
  .suggestion-grid {
    gap: 7px;
  }
  .suggestion-card strong {
    font-size: 9px;
  }
  .suggestion-card > span:last-child {
    font-size: 8px;
  }
  .shift-hint {
    display: none;
  }
}
@media (max-width: 700px) {
  .chat-header {
    padding: 16px;
    gap: 10px;
  }
  .chat-header h2 {
    font-size: 12px;
  }
  .assistant-badge {
    font-size: 8px;
    padding: 5px 7px;
  }
  .assistant-avatar {
    width: 35px;
    height: 35px;
    border-radius: 10px;
  }
  .conversation {
    padding: 20px 15px;
  }
  .welcome-copy,
  .message-content {
    max-width: calc(100% - 38px);
  }
  .welcome-bubble {
    font-size: 11px;
    padding: 12px 13px;
    line-height: 1.8;
  }
  .welcome-bubble p:first-child {
    font-size: 12px;
  }
  .suggestions {
    margin-top: 23px;
  }
  .suggestion-grid {
    grid-template-columns: 1fr;
    gap: 7px;
    margin-top: 10px;
  }
  .suggestion-card {
    padding: 11px 13px;
    min-height: 0;
    display: grid;
    grid-template-columns: 23px 1fr 16px;
    column-gap: 10px;
    align-items: center;
    position: relative;
  }
  .suggestion-top {
    margin: 0;
    display: contents;
  }
  .suggestion-top > svg:first-child {
    grid-column: 1;
    grid-row: 1 / 3;
    width: 18px;
  }
  .suggestion-arrow {
    position: absolute;
    right: 12px;
    top: 18px;
  }
  .suggestion-card strong {
    grid-column: 2;
    grid-row: 1;
    font-size: 10px;
    margin: 0 0 2px;
  }
  .suggestion-card > span:last-child {
    grid-column: 2;
    grid-row: 2;
    font-size: 9px;
  }
  .message-bubble {
    font-size: 11px;
    padding: 12px 13px;
  }
  .message-row {
    margin-top: 20px;
  }
  .composer-area {
    padding: 13px 15px 12px;
  }
  .composer-caption {
    font-size: 8px;
  }
}
@media (max-width: 390px) {
  .assistant-badge {
    display: none;
  }
}
.welcome-bubble,
.message-bubble,
.composer textarea {
  font-size: 14px;
}
.welcome-bubble p:first-child {
  font-size: 14px;
}
.message-author,
.chat-header p {
  font-size: 11px;
  color: var(--color-text-secondary);
}
.chat-header h2 {
  font-size: 14px;
}
.suggestion-card strong {
  font-size: 12px;
}
.suggestion-card > span:last-child {
  font-size: 11px;
  color: var(--color-text-secondary);
}
.composer-caption {
  font-size: 10px;
  color: var(--color-text-secondary);
}
@media (max-width: 700px) {
  .suggestion-card strong {
    font-size: 12px;
  }
  .suggestion-card > span:last-child {
    font-size: 11px;
  }
  .composer-caption {
    font-size: 9px;
  }
  .suggestion-arrow {
    top: 23px;
  }
}
</style>
