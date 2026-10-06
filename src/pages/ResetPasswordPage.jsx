import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, LockKeyhole } from 'lucide-react'
import AppLogo from '../components/AppLogo'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    const checkRecoverySession = async () => {
      if (!supabase) {
        if (active) {
          setError('Password reset is unavailable because Supabase is not configured.')
          setChecking(false)
        }
        return
      }
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (!active) return
      setHasRecoverySession(Boolean(data?.session) && !sessionError)
      if (sessionError) setError('This password reset link is invalid or has expired. Request a new one from the login page.')
      setChecking(false)
    }
    checkRecoverySession()
    return () => { active = false }
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (password.length < 8) {
      setError('Choose a password with at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }
    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (updateError) {
      setError(updateError.message || 'Unable to update your password. Request a new reset link and try again.')
      return
    }
    setSuccess('Your password has been updated. You can now sign in with your new password.')
  }

  return (
    <main className="login-page">
      <section className="login-illustration" aria-label="NexCampus">
        <div className="login-brand">
          <AppLogo size={42} />
          <div><p>NEXCAMPUS PLATFORM</p><span>One campus, connected</span></div>
        </div>
      </section>
      <section className="login-panel" aria-labelledby="reset-password-title">
        <div className="login-form-column">
          <Link to="/login" className="login-back-link"><ArrowLeft size={16} />Back to login</Link>
          <div className="login-form-surface">
            <header className="login-form-heading">
              <div className="login-heading-row">
                <span className="login-form-logo"><LockKeyhole size={24} /></span>
                <h1 id="reset-password-title">Reset your password</h1>
              </div>
              <span>Choose a new password for your campus account.</span>
            </header>

            {checking ? (
              <p className="text-center text-sm text-gray-500"><Loader2 className="mr-2 inline animate-spin" size={16} />Checking your reset link…</p>
            ) : success ? (
              <div className="space-y-4">
                <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>
                <button type="button" onClick={() => navigate('/login', { replace: true })} className="w-full rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white hover:bg-violet-800">Back to login</button>
              </div>
            ) : hasRecoverySession ? (
              <form onSubmit={submit}>
                <div className="mb-4">
                  <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-gray-700">New password</label>
                  <input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" className="w-full rounded-xl border border-violet-100 px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div className="mb-4">
                  <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-gray-700">Confirm new password</label>
                  <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Re-enter your password" className="w-full rounded-xl border border-violet-100 px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <button type="submit" disabled={saving} className="w-full rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-600 px-4 py-3 font-semibold text-white shadow-lg shadow-violet-900/15 disabled:opacity-60">
                  {saving ? <><Loader2 className="mr-2 inline animate-spin" size={17} />Updating password…</> : 'Save new password'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error || 'This reset link is invalid or has expired. Request a new one from the login page.'}</p>
                <button type="button" onClick={() => navigate('/login', { replace: true })} className="w-full rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white hover:bg-violet-800">Return to login</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
