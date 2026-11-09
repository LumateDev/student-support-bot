<script setup lang="ts">
import {
  Asterisk,
  MessagesSquare,
  ChevronRight,
  LifeBuoy,
  ArrowUpRight,
  LogIn,
  KeyRound,
  BookOpen,
} from '@lucide/vue'
import { topics, type TopicId } from '../lib/faq'
defineProps<{ selectedTopic?: TopicId }>()
const emit = defineEmits<{ 'select-topic': [id: TopicId]; restart: []; contact: [] }>()

const topicIcons = { login: LogIn, password: KeyRound, materials: BookOpen }
</script>

<template>
  <aside class="sidebar" aria-label="Навигация поддержки">
    <a class="brand" href="#" @click.prevent="emit('restart')"
      ><span class="brand-symbol"><Asterisk :size="25" aria-hidden="true" /></span
      ><span
        >учебный<span class="brand-second">портал<span class="brand-dot">.</span></span></span
      ></a
    >
    <div class="sidebar-section-label">ВАШ ПОМОЩНИК</div>
    <button class="nav-item home-item" :class="{ active: !selectedTopic }" @click="emit('restart')">
      <MessagesSquare :size="19" aria-hidden="true" /><span>Центр поддержки</span
      ><ChevronRight class="nav-chevron" :size="15" aria-hidden="true" />
    </button>
    <div class="sidebar-section-label topics-label">ЧАСТЫЕ ВОПРОСЫ</div>
    <nav class="topic-nav" aria-label="Темы справочника">
      <button
        v-for="topic in topics"
        :key="topic.id"
        class="nav-item"
        :class="{ active: selectedTopic === topic.id }"
        :aria-current="selectedTopic === topic.id ? 'true' : undefined"
        @click="emit('select-topic', topic.id)"
      >
        <component :is="topicIcons[topic.id]" :size="19" aria-hidden="true" /><span>{{
          topic.label
        }}</span>
      </button>
    </nav>
    <div class="sidebar-help">
      <span class="help-icon"><LifeBuoy :size="21" aria-hidden="true" /></span>
      <h2>Нужна другая помощь?</h2>
      <p>Расскажите о проблеме<br />в форме обращения.</p>
      <button class="sidebar-contact" @click="emit('contact')">
        Написать в поддержку <ArrowUpRight :size="16" aria-hidden="true" />
      </button>
    </div>
    <div class="sidebar-footer">
      <span class="prototype-dot"></span> Учебный прототип <span class="version">v1.0</span>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  min-height: 0;
  overflow-y: auto;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100dvh;
  background: var(--color-sidebar);
  border-right: 1px solid var(--color-border);
  padding: 38px 22px 22px;
  display: flex;
  flex-direction: column;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 13px 55px;
  font-size: 18px;
  font-weight: 650;
  line-height: 1.08;
  letter-spacing: -0.7px;
  width: fit-content;
}
.brand-symbol {
  background: var(--color-accent);
  color: var(--color-on-accent);
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
}
.brand-second {
  display: block;
}
.brand-dot {
  color: var(--color-accent);
}
.sidebar-section-label {
  font-size: 10px;
  color: var(--color-text-muted);
  letter-spacing: 1.6px;
  font-weight: 550;
  margin: 0 13px 14px;
}
.nav-item {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 8px;
  background: none;
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 46px;
  padding: 10px 12px;
  text-align: left;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.nav-item > svg {
  color: var(--color-text-muted);
}
.nav-item:hover {
  background: var(--color-accent-soft);
}
.nav-item.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 550;
}
.nav-item.active > svg {
  color: var(--color-accent);
}
.nav-chevron {
  margin-left: auto;
}
.topics-label {
  margin-top: 37px;
}
.topic-nav {
  display: grid;
  gap: 5px;
}
.sidebar-help {
  margin-top: auto;
  padding: 36px 12px 28px;
}
.help-icon {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  color: var(--color-text-secondary);
  margin-bottom: 14px;
}
.sidebar-help h2 {
  font-size: 12px;
  font-weight: 550;
  margin-bottom: 8px;
}
.sidebar-help p {
  font-size: 11px;
  line-height: 1.8;
  color: var(--color-text-muted);
}
.sidebar-contact {
  margin-top: 17px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  border: 0;
  background: none;
  font-size: 10px;
  font-weight: 550;
  color: var(--color-accent);
}
.sidebar-contact:hover {
  color: var(--color-accent);
}
.sidebar-footer {
  border-top: 1px solid var(--color-border);
  padding: 20px 11px 0;
  font-size: 9px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--color-text-muted);
}
.prototype-dot {
  width: 5px;
  height: 5px;
  background: var(--color-accent);
  border-radius: 50%;
}
.version {
  margin-left: auto;
  font-size: 9px;
}
@media (max-width: 1150px) {
  .sidebar {
    padding-left: 14px;
    padding-right: 14px;
  }
}
@media (max-width: 900px) {
  .sidebar {
    padding-left: 8px;
    padding-right: 8px;
  }
  .brand {
    font-size: 16px;
    margin-left: 10px;
  }
  .brand-symbol {
    width: 36px;
    height: 36px;
  }
  .sidebar-section-label {
    font-size: 8px;
    letter-spacing: 1px;
  }
  .nav-item {
    gap: 9px;
    font-size: 10px;
    padding: 10px;
  }
  .sidebar-help {
    padding-left: 10px;
    padding-right: 6px;
  }
  .sidebar-help h2 {
    font-size: 11px;
  }
  .sidebar-contact {
    gap: 4px;
    font-size: 9px;
  }
  .sidebar-footer {
    padding-left: 4px;
    padding-right: 4px;
    font-size: 8px;
  }
}
@media (max-width: 700px) {
  .sidebar {
    position: static;
    height: auto;
    padding: 16px 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }
  .brand {
    margin: 0;
    font-size: 14px;
    gap: 9px;
  }
  .brand-symbol {
    width: 33px;
    height: 33px;
    border-radius: 10px;
  }
  .brand-symbol svg {
    width: 21px;
  }
  .sidebar-section-label,
  .topic-nav,
  .home-item,
  .sidebar-help {
    display: none;
  }
  .sidebar-footer {
    border: 0;
    padding: 0;
    gap: 6px;
    font-size: 9px;
  }
  .version {
    display: none;
  }
}
</style>
