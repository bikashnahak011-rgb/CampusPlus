import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, Shield, GraduationCap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import AppLogo from '../components/AppLogo'

export default function LoginPage() {
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const isAdmin = user.role === 'admin'
      if (user.profileComplete) {
        navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard', { replace: true })
      } else {
        navigate(isAdmin ? '/admin/profile' : '/student/profile', { replace: true })
      }
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    const { data, error: err } = await signIn(email, password)
    if (err) { setLoading(false); setError(err.message); return }
    // Fetch profile to determine redirect
    try {
      const { data: profile } = await supabase.from('profiles').select('role, name, roll_no').eq('id', data.user.id).single()
      const isAdmin = (profile?.role || role) === 'admin'
      const isComplete = profile?.name && (isAdmin || profile?.roll_no)
      navigate(isComplete
        ? (isAdmin ? '/admin/dashboard' : '/student/dashboard')
        : (isAdmin ? '/admin/profile' : '/student/profile'),
        { replace: true }
      )
    } catch {
      navigate(role === 'admin' ? '/admin/profile' : '/student/profile', { replace: true })
    }
  }


  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '0.8s' }} />

      <div className="w-full max-w-md relative z-10" style={{ width: '35%', maxWidth: '35%' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-300 hover:text-white mb-6 transition-all text-sm hover:-translate-x-1 duration-200"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 0 40px rgba(59,130,246,0.15)' }}>
          {/* Header */}
          <div className="animated-gradient p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="flex justify-center mb-4">
              <div className="animate-float" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}>
                <AppLogo size={56} />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">CampusPlus</h1>
            <p className="text-blue-200 text-sm mt-1">One Campus. One Platform. Zero Confusion.</p>
          </div>

          <div className="p-8">
            {/* Role toggle */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-6 animate-fade-in">
              <button
                onClick={() => { setRole('student'); setError('') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${role === 'student' ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <GraduationCap size={16} /> Student
              </button>
              <button
                onClick={() => { setRole('admin'); setError('') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${role === 'admin' ? 'bg-white shadow-md text-indigo-600 scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Shield size={16} /> Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="animate-slide-up stagger-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="email" name="email" type="email"
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input" style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>

              <div className="animate-slide-up stagger-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="password" name="password"
                    type={showPass ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="input" style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 animate-scale-in">
                  {error}
                </div>
              )}

              <div className="animate-slide-up stagger-3">
                <button type="submit" disabled={loading} className="btn-primary-glow w-full justify-center py-3 text-base">
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="relative my-5 animate-fade-in stagger-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or continue with</span></div>
            </div>

            <div className="animate-slide-up stagger-5">
              <button
                onClick={async () => {
                  setError('')
                  setLoading(true)
                  const { error: e } = await signInWithGoogle()
                  if (e) { setLoading(false); setError(e.message) }
                }}
                disabled={loading}
                className="google-btn w-full"
              >
                {loading
                  ? <><Loader2 size={18} className="animate-spin text-gray-400" /> Redirecting to Google...</>
                  : <>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                }
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-5">
              Don't have an account?{' '}
              <a href="mailto:admin@campusone.dev" className="text-blue-600 font-medium hover:underline">Contact your administrator</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
