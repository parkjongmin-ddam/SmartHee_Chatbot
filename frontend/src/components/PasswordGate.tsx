import { useState, KeyboardEvent } from 'react'
import styles from './PasswordGate.module.css'

const PASSWORD = import.meta.env.VITE_APP_PASSWORD ?? ''

interface Props {
  onUnlock: () => void
}

export default function PasswordGate({ onUnlock }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const check = () => {
    if (input === PASSWORD) {
      localStorage.setItem('unlocked', 'true')
      onUnlock()
    } else {
      setError(true)
      setInput('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') check()
  }

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.title}>SmartHee Chatbot</div>
        <input
          className={styles.input}
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false) }}
          onKeyDown={handleKeyDown}
          placeholder="비밀번호 입력"
          autoFocus
        />
        {error && <div className={styles.error}>비밀번호가 틀렸습니다</div>}
        <button className={styles.button} onClick={check}>입장</button>
      </div>
    </div>
  )
}
