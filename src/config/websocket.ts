import { ref } from 'vue'

/**
 * Standalone WebSocket infrastructure, decoupled from any one component.
 * Not wired to the chat send/receive flow by default (the AI backend used
 * by services/aiChat.ts is REST-only) — this exists so a future
 * streaming/live-status endpoint can be connected without touching
 * component or store code.
 */

export type WsStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

export interface WebSocketHandlers {
  onOpen?: (event: Event) => void
  onMessage?: (data: unknown) => void
  onError?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onStatusChange?: (status: WsStatus) => void
}

const MAX_RECONNECT_DELAY_MS = 10000
const BASE_RECONNECT_DELAY_MS = 1000
const MAX_RECONNECT_ATTEMPTS = 5

export const createWebSocketConnection = (url: string, handlers: WebSocketHandlers = {}) => {
  const status = ref<WsStatus>('idle')

  let socket: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempts = 0
  let manuallyClosed = false

  const setStatus = (next: WsStatus) => {
    status.value = next
    handlers.onStatusChange?.(next)
  }

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  const scheduleReconnect = () => {
    if (manuallyClosed || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return

    const delay = Math.min(BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempts, MAX_RECONNECT_DELAY_MS)
    reconnectAttempts += 1
    reconnectTimer = setTimeout(() => connect(), delay)
  }

  const connect = () => {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    manuallyClosed = false
    setStatus('connecting')
    socket = new WebSocket(url)

    socket.onopen = (event) => {
      reconnectAttempts = 0
      setStatus('open')
      handlers.onOpen?.(event)
    }

    socket.onmessage = (event) => {
      handlers.onMessage?.(event.data)
    }

    socket.onerror = (event) => {
      setStatus('error')
      handlers.onError?.(event)
    }

    socket.onclose = (event) => {
      setStatus('closed')
      handlers.onClose?.(event)
      scheduleReconnect()
    }
  }

  const disconnect = () => {
    manuallyClosed = true
    clearReconnectTimer()
    socket?.close()
    socket = null
    setStatus('idle')
  }

  const send = (data: Parameters<WebSocket['send']>[0]) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(data)
    }
  }

  return { connect, disconnect, send, status }
}
