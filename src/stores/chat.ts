import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ChatMessage } from '@/types/chat'
import { ChatServiceError, sendChatMessage } from '@/services/aiChat'
import { createWebSocketConnection, type WsStatus } from '@/config/websocket'

const createId = () => crypto.randomUUID()

const now = () =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

export const useChatStore = defineStore('chat', () => {
  const sessionId = ref<string>(createId())
  const messages = ref<ChatMessage[]>([])
  const draft = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const wsStatus = ref<WsStatus>('idle')
  let wsConnection: ReturnType<typeof createWebSocketConnection> | null = null

  const canSend = computed(() => !!draft.value.trim() && !isLoading.value)

  const connectWebSocket = (url: string) => {
    if (wsConnection) return
    wsConnection = createWebSocketConnection(url, {
      onStatusChange: (s) => {
        wsStatus.value = s
      },
    })
    wsConnection.connect()
  }

  const disconnectWebSocket = () => {
    wsConnection?.disconnect()
    wsConnection = null
    wsStatus.value = 'idle'
  }

  const sendMessage = async () => {
    const text = draft.value.trim()
    if (!text || isLoading.value) return

    error.value = null
    messages.value.push({ id: createId(), role: 'user', text, createdAt: now() })
    draft.value = ''

    isLoading.value = true
    try {
      const reply = await sendChatMessage(messages.value)
      messages.value.push({ id: createId(), role: 'assistant', text: reply, createdAt: now() })
    } catch (err) {
      error.value = err instanceof ChatServiceError ? err.message : 'Failed to get a response. Please try again.'
    } finally {
      isLoading.value = false
    }
  }

  const clearConversation = () => {
    messages.value = []
    draft.value = ''
    error.value = null
    sessionId.value = createId()
  }

  return {
    sessionId,
    messages,
    draft,
    isLoading,
    error,
    wsStatus,
    canSend,
    sendMessage,
    clearConversation,
    connectWebSocket,
    disconnectWebSocket,
  }
})
