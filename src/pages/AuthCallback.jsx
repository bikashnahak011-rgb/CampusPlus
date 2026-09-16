import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AppLogo from '../components/AppLogo'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Completing sign in...')
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return

    const redirect = async (session) => {
      if (done.current) return
      done.current = true
      setStatus('Welcome! Setting up your profile...')
      try {
        const { data } = await supabase.from('profiles').select('role, name, roll_no').eq('id', session.user.id).single()
        const role = data?.role || 'student'
        const isComplete = data?.name && (role === 'admin' || data?.roll_no)
        navigate(isComplete
          ? (role === 'admin' ? '/admin/dashboard' : '/student/dashboard')
          : (role === 'admin' ? '/admin/profile' : '/student/profile'),
          { replace: true }
        )
      } catch {
        navigate('/student/profile', { replace: true })
      }
    }

    if (!supabase) { navigate('/login', { replace: true }); return }

    // PKCE flow — exchange ?code= for session
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data?.session) redirect(data.session)
        else if (!done.current) { done.current = true; navigate('/login', { replace: true }) }
      })
      return
    }

    // Fallback: check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) redirect(session)
      else if (!done.current) { done.current = true; navigate('/login', { replace: true }) }
    })

    const timeout = setTimeout(() => {
      if (!done.current) { done.current = true; navigate('/login', { replace: true }) }
    }, 8000)

    return () => clearTimeout(timeout)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient">
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <div className="animate-pulse-slow" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.25))' }}>
          <AppLogo size={56} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-blue-200 text-sm font-medium">{status}</p>
        </div>
      </div>
    </div>
  )
}
