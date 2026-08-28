<template>
  <div class="chat-messages" ref="listEl">
    <div v-if="messages.length === 0 && !isLoading" class="chat-empty">
      <p>Ask me anything to get started.</p>
    </div>

    <ChatMessage v-for="msg in messages" :key="msg.id" :message="msg" />

    <div v-if="isLoading" class="chat-message chat-message--assistant">
      <div class="chat-message-bubble chat-typing">
        <span class="chat-typing-dot" />
        <span class="chat-typing-dot" />
        <span class="chat-typing-dot" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import ChatMessage from './ChatMessage.vue'

const props = defineProps<{
  messages: ChatMessageType[]
  isLoading: boolean
}>()

const listEl = ref<HTMLElement | null>(null)

watch(
  () => [props.messages.length, props.isLoading],
  async () => {
    await nextTick()
    if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight
  },
)
</script>
