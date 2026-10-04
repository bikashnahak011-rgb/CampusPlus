import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './ui/Toast'
import { supabase } from '../lib/supabase'

const dismissedKey = userId => `campusplus_email_prompt_skipped_${userId}`

export default function EmailVerificationPrompt() {
  const { user } = useAuth()
  const toast = useToast()
  const emailVerified = Boolean(user?.email_confirmed_at || user?.confirmed_at)
  const [open, setOpen] = useState(() => {
    if (!user || user.isDemo || user.role !== 'student' || user.email_confirmed_at || user.confirmed_at) return false
    return sessionStorage.getItem('campusplus_welcome_seen') === '1'
      && sessionStorage.getItem(dismissedKey(user.id)) !== 'true'
  })
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!user || user.isDemo || user.role !== 'student') return undefined
    const openAfterWelcome = () => {
      if (!user.email_confirmed_at && !user.confirmed_at && sessionStorage.getItem(dismissedKey(user.id)) !== 'true') {
        setOpen(true)
      }
    }
    window.addEventListener('campusplus-welcome-dismissed', openAfterWelcome)
    return () => window.removeEventListener('campusplus-welcome-dismissed', openAfterWelcome)
  }, [user])

  if (!user || user.isDemo || user.role !== 'student' || emailVerified || verified) return null

  const dismiss = () => {
    sessionStorage.setItem(dismissedKey(user.id), 'true')
    setOpen(false)
    setCodeSent(false)
    setCode('')
  }

  const sendCode = async event => {
    event.preventDefault()
    if (!supabase) {
      toast('Email verification is unavailable because Supabase is not configured.', 'error')
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: { shouldCreateUser: false },
      })
      if (error) throw error
      setCodeSent(true)
      toast('Verification code sent to your account email.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const verifyCode = async event => {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (!supabase) throw new Error('Supabase is not configured.')
      const { data, error } = await supabase.auth.verifyOtp({
        email: user.email,
        token: code.trim(),
        type: 'email',
      })
      if (error) throw error
      if (data.user?.id !== user.id) {
        await supabase.auth.signOut()
        throw new Error('The verified email does not match your signed-in student account. Please sign in again.')
      }
      sessionStorage.removeItem(dismissedKey(user.id))
      setVerified(true)
      setOpen(false)
      toast('Your email is verified. You can enable free browser push alerts in Notifications.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const resendCode = async () => {
    if (!supabase) {
      toast('Supabase is not configured.', 'error')
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: { shouldCreateUser: false },
      })
      if (error) throw error
      setCode('')
      toast('A new verification code was sent.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {(!open || verified) && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-amber-900">Verify your account email</p>
            <p className="mt-1 text-sm text-amber-800">Get an email code, then enable free browser push alerts for campus notices.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Verify email
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <section
            aria-labelledby="email-verification-title"
            aria-modal="true"
            className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
            role="dialog"
          >
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-600">CampusPlus alerts</p>
              <h2 id="email-verification-title" className="mt-2 text-xl font-bold text-gray-900">Verify your email address</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                We’ll send a one-time code to your signed-in account email. Email verification uses Supabase Auth; campus notices use free browser push.
              </p>
            </div>

            {!codeSent ? (
              <form onSubmit={sendCode} className="space-y-4">
                <div>
                  <label htmlFor="student-email" className="mb-1.5 block text-sm font-medium text-gray-700">Account email</label>
                  <input
                    id="student-email"
                    type="email"
                    autoComplete="email"
                    readOnly
                    value={user.email || ''}
                    className="input"
                  />
                </div>
                <button disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-60" type="submit">
                  {submitting ? 'Sending code…' : 'Send email code'}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyCode} className="space-y-4">
                <p className="rounded-xl bg-violet-50 p-3 text-sm text-violet-900">
                  Enter the verification code sent to <span className="font-semibold">{user.email}</span>.
                </p>
                <div>
                  <label htmlFor="student-email-code" className="mb-1.5 block text-sm font-medium text-gray-700">Email verification code</label>
                  <input
                    id="student-email-code"
                    type="text"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]{4,10}"
                    required
                    value={code}
                    onChange={event => setCode(event.target.value)}
                    placeholder="Enter code"
                    className="input"
                  />
                </div>
                <button disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-60" type="submit">
                  {submitting ? 'Verifying…' : 'Verify email'}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={resendCode}
                  className="w-full py-2 text-sm font-medium text-violet-700 hover:text-violet-900"
                >
                  Resend code
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={dismiss}
              className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Skip for now
            </button>
          </section>
        </div>
      )}
    </>
  )
}
