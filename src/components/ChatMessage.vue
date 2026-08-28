<template>
  <div class="chat-message" :class="`chat-message--${message.role}`">
    <div class="chat-message-bubble">
      <p class="chat-message-text">{{ message.text }}</p>
      <span class="chat-message-time">{{ message.createdAt }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@/types/chat'

defineProps<{
  message: ChatMessage
}>()
</script>
