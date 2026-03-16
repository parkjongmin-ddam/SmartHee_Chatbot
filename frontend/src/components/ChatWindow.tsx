import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Message } from '../types'
import styles from './ChatWindow.module.css'

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [totalTokens, setTotalTokens] = useState({ input: 0, output: 0 })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Token': import.meta.env.VITE_APP_TOKEN ?? '', // 추가
        },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `HTTP ${res.status}`)
      }

      const data: { reply: string; input_tokens: number; output_tokens: number } = await res.json()
      setMessages([...nextMessages, {
        role: 'assistant',
        content: data.reply,
        inputTokens: data.input_tokens,
        outputTokens: data.output_tokens,
      }])
      setTotalTokens(prev => ({
        input: prev.input + data.input_tokens,
        output: prev.output + data.output_tokens,
      }))
    } catch (err) {
      const msg = err instanceof Error ? `오류: ${err.message}` : '오류가 발생했습니다.'
      setMessages([
        ...nextMessages,
        { role: 'assistant', content: msg },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>SmartHee Chatbot</span>
        {(totalTokens.input > 0 || totalTokens.output > 0) && (
          <span className={styles.tokenStats}>
            ↑{totalTokens.input.toLocaleString()} ↓{totalTokens.output.toLocaleString()} tokens
          </span>
        )}
      </div>

      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={styles.messageGroup}>
            <div
              className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.assistantBubble
                }`}
            >
              {msg.content}
            </div>
            {msg.role === 'assistant' && msg.inputTokens != null && (
              <div className={styles.tokenBadge}>
                ↑{msg.inputTokens.toLocaleString()} ↓{msg.outputTokens?.toLocaleString()} tokens
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className={styles.loading}>
            <div className={styles.dots}>
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <textarea
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          rows={1}
          disabled={loading}
        />
        <button
          className={styles.sendButton}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          전송
        </button>
      </div>
    </div>
  )
}