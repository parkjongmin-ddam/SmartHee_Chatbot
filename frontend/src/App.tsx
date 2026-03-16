import { useState } from 'react'
import ChatWindow from './components/ChatWindow'
import PasswordGate from './components/PasswordGate'

export default function App() {
  const [unlocked, setUnlocked] = useState(
    localStorage.getItem('unlocked') === 'true'
  )

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  return <ChatWindow />
}
