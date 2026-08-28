import aiApiClient from '@/config/axios'
import type { ChatMessage } from '@/types/chat'

export interface ChatRequestMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const DEFAULT_MODEL = 'minimax/minimax-m3:free'

export const sendChatMessage = async (history: ChatMessage[], systemPrompt?: string): Promise<string> => {
  const messages: ChatRequestMessage[] = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
    ...history.map((m) => ({ role: m.role, content: m.text })),
  ]

  try {
    const response = await aiApiClient.post('/api/chat', {
      messages,
      model: DEFAULT_MODEL,
    })

    const reply = response.data?.reply
    if (!reply) throw new Error('Empty reply from the AI service')

    return reply
  } catch {
    throw new Error('Failed to get a response from the AI service')
  }
}
