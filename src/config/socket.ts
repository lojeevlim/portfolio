import { io, type Socket } from 'socket.io-client'

export interface VisitorWelcomePayload {
  id: string
  others: string[]
}

export interface VisitorPresencePayload {
  id: string
}

interface VisitorSocketEvents {
  'visitor:welcome': (payload: VisitorWelcomePayload) => void
  'visitor:join': (payload: VisitorPresencePayload) => void
  'visitor:leave': (payload: VisitorPresencePayload) => void
}

export const visitorSocket: Socket<VisitorSocketEvents> = io(
  import.meta.env.VITE_VISITOR_SOCKET_URL ?? 'http://localhost:3001',
  {
    autoConnect: false,
    transports: ['websocket'],
  },
)
