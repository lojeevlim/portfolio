<template>
  <div class="chat-input-bar">
    <textarea
      ref="textareaEl"
      class="chat-input-textarea"
      :value="modelValue"
      placeholder="Send a message..."
      rows="1"
      @input="onInput"
      @keydown="onKeydown"
    />
    <button class="chat-input-send" :disabled="disabled" @click="emit('send')">Send</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  disabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
}>()

const textareaEl = ref<HTMLTextAreaElement | null>(null)

const onInput = (e: Event) => {
  const el = e.target as HTMLTextAreaElement
  emit('update:modelValue', el.value)
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emit('send')
  }
}
</script>
