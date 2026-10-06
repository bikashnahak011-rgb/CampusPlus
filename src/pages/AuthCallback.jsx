import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAdminHomePath } from '../lib/adminRoles'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('AUTH CALLBACK PAGE')

    // Wait until AuthContext finishes checking Supabase
    if (loading) {
      console.log('Waiting for authentication...')
      return
    }

    // Authentication finished but no user
    if (!user) {
      console.error('No authenticated user found')
      setError('Authentication failed. No verified user session was found.')
      return
    }

    if (user.is_active === false) {
      setError('This account is disabled. Contact your main administrator for help.')
      return
    }

    if (user.role !== 'admin' && user.role !== 'student') {
      console.error('Authenticated user has no valid profile role')
      setError('Your email is verified, but the account has no campus role yet. Ask an administrator to assign the correct role.')
      return
    }

    console.log('AUTHENTICATION SUCCESS')
    console.log('User:', user.email)
    console.log('Role:', user.role)

    // Clean OAuth URL
    window.history.replaceState(
      {},
      document.title,
      '/auth/callback'
    )

    // IMPORTANT:
    // Role comes from public.profiles.role
    if (user.role === 'admin') {
      console.log('Redirecting to ADMIN dashboard')
      navigate(getAdminHomePath(user.admin_role, user.email), { replace: true })
    } else {
      console.log('Redirecting to STUDENT profile')
      navigate('/student/profile', { replace: true })
    }

  }, [loading, user, navigate])

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">

          <div className="text-red-500 text-5xl mb-4">
            !
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-3">
            Sign-In Failed
          </h1>

          <p className="text-sm text-gray-600 mb-6">
            {error}
          </p>

          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Back to Login
          </button>

        </div>
      </div>
    )
  }

  // Loading
  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient">
      <div className="text-center text-white">

        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-5" />

        <h1 className="text-xl font-bold">
          Signing you in...
        </h1>

        <p className="text-blue-200 text-sm mt-2">
          Completing secure email authentication
        </p>

      </div>
    </div>
  )
}
