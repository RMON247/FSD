import { useState } from 'react'
import { LogIn, UserPlus } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { TextField } from '../ui/Field.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function AuthModal({ open, onClose }) {
  const { login, register } = useAuth()
  const { addToast } = useToast()

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => { setForm({ name: '', email: '', password: '' }); setError(''); setMode('login') }
  const close = () => { reset(); onClose() }

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.password || (mode === 'register' && !form.name)) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const user = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password)
      addToast(`Welcome, ${user.name} (${user.role})`)
      close()
    } catch (err) {
      setError(err.message || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open} onClose={close}
      title={mode === 'login' ? 'Sign In' : 'Create Account'}
      subtitle="Sign in to add, edit, or delete records — reading data never requires an account"
      footer={(
        <>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button icon={mode === 'login' ? LogIn : UserPlus} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </>
      )}
    >
      <div className="space-y-4">
        {mode === 'register' && (
          <TextField label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Maria Winters" />
        )}
        <TextField label="Email Address" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        <TextField label="Password" required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'} />
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <button
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
          className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
        >
          {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
        </button>
      </div>
    </Modal>
  )
}
