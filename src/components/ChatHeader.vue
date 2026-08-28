<template>
  <header class="chat-header">
    <div class="chat-header-title">
      <span class="chat-header-dot" :class="statusClass" />
      AI Assistant
    </div>
    <button class="chat-header-clear" @click="emit('clear')">Clear</button>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WsStatus } from '@/config/websocket'

const props = defineProps<{
  wsStatus: WsStatus
}>()

const emit = defineEmits<{
  (e: 'clear'): void
}>()

const statusClass = computed(() => `is-${props.wsStatus}`)
</script>
