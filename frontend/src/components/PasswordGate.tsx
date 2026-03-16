import { useState, KeyboardEvent } from 'react'
import styles from './PasswordGate.module.css'

const PASSWORD = import.meta.env.VITE_APP_PASSWORD ?? ''

interface Props {
  onUnlock: () => void
}

export default function PasswordGate({ onUnlock }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = () => {
    if (input === PASSWORD) {
      sessionStorage.setItem('unlocked', 'true')
      onUnlock()
    } else {
      setError(true)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🔐 SmartHee</h1>
      <input
        type="password"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className={styles.input}
        placeholder="비밀번호 입력"
      />
      {error && <p className={styles.error}>비밀번호가 틀렸습니다.</p>}
      <button onClick={handleSubmit} className={styles.button}>입장</button>
    </div>
  )
}