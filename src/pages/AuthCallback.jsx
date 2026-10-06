import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ADMIN_ROLE_LABELS, getAdminHomePath } from '../lib/adminRoles'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { user, loading, signOut } = useAuth()
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
      setError('Google authentication failed. No user session was found.')
      return
    }

    if (user.is_active === false) {
      setError('This account is disabled. Contact your main administrator for help.')
      return
    }

    const requestedRole = localStorage.getItem('campusplus_oauth_role')
    const requestedAdminRole = localStorage.getItem('campusplus_oauth_admin_role')
    localStorage.removeItem('campusplus_oauth_role')
    localStorage.removeItem('campusplus_oauth_admin_role')

    if (user.role !== 'admin' && user.role !== 'student') {
      console.error('Authenticated user has no valid profile role')
      setError('Your Google account is authenticated, but it has no campus role yet. Ask an administrator to set your profile role to admin or student.')
      return
    }

    if (requestedRole && requestedRole !== user.role) {
      console.error('Google account does not match the selected portal', user.email, requestedRole)
      setError(`This Google account is assigned to the ${user.role} portal, not the selected ${requestedRole} portal. Choose the matching sign-in type and try again.`)
      void signOut()
      return
    }

    if (requestedRole === 'admin' && requestedAdminRole && user.admin_role !== requestedAdminRole) {
      console.error('Google account does not match the selected admin role', user.email, requestedAdminRole)
      setError(`This Google account is not assigned the ${ADMIN_ROLE_LABELS[requestedAdminRole] || 'selected admin'} role. Select the role assigned to your account and try again.`)
      void signOut()
      return
    }

    console.log('GOOGLE LOGIN SUCCESS')
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
      console.log('Redirecting to STUDENT dashboard')
      navigate('/student/dashboard', { replace: true })
    }

  }, [loading, user, navigate, signOut])

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">

          <div className="text-red-500 text-5xl mb-4">
            !
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-3">
            Google Sign-In Failed
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
          Completing Google authentication
        </p>

      </div>
    </div>
  )
}