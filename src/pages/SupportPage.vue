<script setup lang="ts">
import { ref } from "vue";
import AppHeader from "../components/AppHeader.vue";
import SupportSidebar from "../components/SupportSidebar.vue";
import SupportChat from "../components/SupportChat.vue";
import SupportContact from "../components/SupportContact.vue";
import TicketDialog from "../components/TicketDialog.vue";
import type { TopicId } from "../lib/faq";

const selectedTopic = ref<TopicId>();
const chat = ref<InstanceType<typeof SupportChat>>();
const ticketDialog = ref<InstanceType<typeof TicketDialog>>();
function openTicket() {
  ticketDialog.value?.open();
}
</script>

<template>
  <div class="support-page">
    <SupportSidebar
      :selected-topic="selectedTopic"
      @select-topic="chat?.selectTopic($event)"
      @restart="chat?.startAgain()"
      @contact="openTicket"
    />
    <main class="workspace">
      <AppHeader />
      <div class="main-content">
        <section class="page-intro">
          <h1>Разберёмся вместе<span>.</span></h1>
          <p>Вход, пароль или материалы курса — поможем найти ответ.</p>
        </section>
        <SupportChat ref="chat" @topic-change="selectedTopic = $event" @contact="openTicket" />
        <SupportContact @contact="openTicket" />
      </div>
    </main>
    <TicketDialog ref="ticketDialog" />
  </div>
</template>
<style scoped lang="scss" src="./SupportPage.scss"></style>
