<template>
  <div class="chat-shell">
    <ChatHeader :ws-status="chatStore.wsStatus" @clear="chatStore.clearConversation" />

    <div v-if="chatStore.error" class="chat-error-banner">{{ chatStore.error }}</div>

    <ChatMessages :messages="chatStore.messages" :is-loading="chatStore.isLoading" />

    <ChatInput
      v-model="chatStore.draft"
      :disabled="!chatStore.canSend"
      @send="chatStore.sendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import ChatHeader from './ChatHeader.vue'
import ChatMessages from './ChatMessages.vue'
import ChatInput from './ChatInput.vue'

const chatStore = useChatStore()
</script>
