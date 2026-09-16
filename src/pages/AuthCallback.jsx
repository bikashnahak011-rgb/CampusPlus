import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { fetchProfile } = useAuth()

  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const handleCallback = async () => {
      try {
        if (!supabase) {
          throw new Error(
            'Supabase is not configured. Check your .env file.'
          )
        }

        console.log('GOOGLE CALLBACK STARTED')

        const url = new URL(window.location.href)

        const code = url.searchParams.get('code')
        const authError = url.searchParams.get('error')
        const authErrorDescription =
          url.searchParams.get('error_description')

        // Google/Supabase returned an OAuth error
        if (authError) {
          throw new Error(
            authErrorDescription ||
              authError ||
              'Google authentication failed.'
          )
        }

        // PKCE callback must contain a code
        if (!code) {
          console.log('No OAuth code found.')

          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession()

          if (sessionError) {
            throw sessionError
          }

          if (session?.user) {
            console.log(
              'SESSION ALREADY EXISTS:',
              session.user.email
            )

            await fetchProfile(session.user)

            return
          }

          throw new Error(
            'Google authentication callback did not contain a valid code.'
          )
        }

        console.log('EXCHANGING GOOGLE CODE FOR SESSION')

        const {
          data,
          error: exchangeError,
        } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error(
            'CODE EXCHANGE ERROR:',
            exchangeError
          )

          throw exchangeError
        }

        if (!data?.session?.user) {
          throw new Error(
            'Google login succeeded, but no user session was returned.'
          )
        }

        console.log(
          'GOOGLE AUTH SUCCESS:',
          data.session.user.email
        )

        // Load profile and role
        await fetchProfile(data.session.user)

        if (!mounted) return

        // Clean callback URL
        window.history.replaceState(
          {},
          document.title,
          '/auth/callback'
        )

        // Get final user profile
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          throw new Error(
            'Session disappeared after Google login.'
          )
        }

        // Read profile directly to determine dashboard
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        const role = profile?.role || 'student'

        if (role === 'admin') {
          navigate('/admin/dashboard', {
            replace: true,
          })
        } else {
          navigate('/student/dashboard', {
            replace: true,
          })
        }
      } catch (err) {
        console.error(
          'GOOGLE CALLBACK ERROR:',
          err
        )

        if (!mounted) return

        setError(
          err?.message ||
            'Google authentication failed.'
        )
      }
    }

    handleCallback()

    return () => {
      mounted = false
    }
  }, [navigate, fetchProfile])

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
