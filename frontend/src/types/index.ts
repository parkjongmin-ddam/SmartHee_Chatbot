export interface Message {
  role: 'user' | 'assistant'
  content: string
  inputTokens?: number
  outputTokens?: number
}
