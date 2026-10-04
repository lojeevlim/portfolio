import aiApiClient from '@/config/axios'
import type { ChatMessage } from '@/types/chat'

export interface ChatRequestMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const INSUFFICIENT_CREDITS_MESSAGE = 'Insufficient credits.'
export const AI_BUSY_MESSAGE = 'The AI is experiencing high demand right now. Please try again later.'

export const AI_QUOTA_MESSAGE = 'The AI has reached its usage limit for now.'

// Turns "Please retry in 17h3m37.5s" into "17h 3m"; null when absent.
const parseRetryDelay = (detail: string): string | null => {
  const match = detail.match(/retry in\s+(?:(\d+)h)?(?:(\d+)m)?(?:([\d.]+)s)?/i)
  if (!match) return null
  const [, h, m, sec] = match
  const parts = [h && `${h}h`, m && `${m}m`, !h && !m && sec && `${Math.ceil(Number(sec))}s`].filter(Boolean)
  return parts.length ? parts.join(' ') : null
}

// Errors whose message is safe to show to the user as-is.
export class ChatServiceError extends Error {}

const DEFAULT_MODEL = 'gemini-3.8-flash'

export const sendChatMessage = async (history: ChatMessage[], systemPrompt?: string): Promise<string> => {
  const messages: ChatRequestMessage[] = [
    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
    ...history.map((m) => ({ role: m.role, content: m.text })),
  ]

  try {
    const response = await aiApiClient.post('/api/chat/v1', {
      messages,
      model: DEFAULT_MODEL,
    })

    const reply = response.data?.message ?? response.data?.reply
    if (!reply) throw new Error('Empty reply from the AI service')

    return reply
  } catch (err) {
    const body = (err as { response?: { data?: { error?: unknown } } }).response?.data?.error
    const detail = typeof body === 'string' ? body : JSON.stringify(body ?? '')
    if (/insufficient credits/i.test(detail)) throw new ChatServiceError(INSUFFICIENT_CREDITS_MESSAGE)
    const status = (err as { response?: { status?: number } }).response?.status
    if (status === 503 || /"status":\s*"UNAVAILABLE"|"code":\s*503|high demand/i.test(detail)) {
      throw new ChatServiceError(AI_BUSY_MESSAGE)
    }
    if (status === 429 || /"status":\s*"RESOURCE_EXHAUSTED"|"code":\s*429|exceeded your current quota/i.test(detail)) {
      const retry = parseRetryDelay(detail)
      throw new ChatServiceError(retry ? `${AI_QUOTA_MESSAGE} Please try again in about ${retry}.` : `${AI_QUOTA_MESSAGE} Please try again later.`)
    }
    throw new Error('Failed to get a response from the AI service')
  }
}
