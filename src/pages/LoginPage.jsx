import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Shield,
  GraduationCap
} from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import AppLogo from '../components/AppLogo'

export default function LoginPage() {

  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    user,
    signIn,
    signInWithGoogle
  } = useAuth()

  const navigate = useNavigate()


  /*
  ============================================================
  REDIRECT AFTER AUTHENTICATION
  ============================================================
  */

  useEffect(() => {

    if (!user) return

    console.log('LOGIN USER:', user)
    console.log('LOGIN ROLE:', user.role)

    const isAdmin = user.role === 'admin'

    /*
      If profile is complete,
      go directly to dashboard.
    */

    if (user.profileComplete) {

      if (isAdmin) {
        navigate('/admin/dashboard', {
          replace: true
        })
      } else {
        navigate('/student/dashboard', {
          replace: true
        })
      }

      return
    }

    /*
      If profile is incomplete,
      send user to their profile page.
    */

    if (isAdmin) {
      navigate('/admin/profile', {
        replace: true
      })
    } else {
      navigate('/student/profile', {
        replace: true
      })
    }

  }, [user, navigate])


  /*
  ============================================================
  EMAIL + PASSWORD LOGIN
  ============================================================
  */

  const handleSubmit = async (e) => {

    e.preventDefault()

    /*
      Clear previous error.
    */

    setError('')


    /*
      Validate fields.
    */

    if (!email.trim() || !password) {

      setError(
        'Please enter your email and password.'
      )

      return
    }


    setLoading(true)


    try {

      /*
        Authentication is handled by AuthContext.

        This works for:
        - Demo users
        - Supabase email/password users
      */

      const result = await signIn(
        email.trim(),
        password
      )


      /*
      ----------------------------------------------------------
      LOGIN ERROR
      ----------------------------------------------------------
      */

      if (result?.error) {

        setError(
          result.error.message ||
          'Invalid email or password.'
        )

        setLoading(false)

        return
      }


      /*
      ----------------------------------------------------------
      DEMO LOGIN
      ----------------------------------------------------------
      */

      if (
        result?.isDemo &&
        result?.data?.user
      ) {

        const loggedUser =
          result.data.user

        console.log(
          'DEMO LOGIN SUCCESS:',
          loggedUser
        )


        /*
          IMPORTANT:

          Do NOT use the selected role here.

          Use the actual role returned
          from AuthContext.
        */

        if (loggedUser.role === 'admin') {

          navigate('/admin/dashboard', {
            replace: true
          })

        } else {

          navigate('/student/dashboard', {
            replace: true
          })

        }

        setLoading(false)

        return
      }


      /*
      ----------------------------------------------------------
      REAL SUPABASE LOGIN
      ----------------------------------------------------------

      AuthContext will receive the Supabase
      session and load the user's profile.

      Then `user` changes.

      The useEffect above automatically
      redirects to the correct dashboard.
      */

      console.log(
        'SUPABASE LOGIN SUCCESS'
      )

      /*
        Do not manually navigate here.

        Wait for AuthContext to update `user`.
      */

    } catch (err) {

      console.error(
        'Login error:',
        err
      )

      setError(
        err?.message ||
        'Something went wrong. Please try again.'
      )

    } finally {

      setLoading(false)

    }
  }


  /*
  ============================================================
  GOOGLE LOGIN
  ============================================================
  */

  const handleGoogleLogin = async () => {

    setError('')
    setLoading(true)

    try {

      /*
        Google authentication is handled
        by Supabase OAuth.
      */

      const result =
        await signInWithGoogle()


      if (result?.error) {

        setError(
          result.error.message ||
          'Google login failed.'
        )

        setLoading(false)

        return
      }

      /*
        Supabase will redirect the browser
        to Google.

        After Google authentication,
        AuthCallback/AuthContext handles
        the user and role.
      */

    } catch (err) {

      console.error(
        'Google login error:',
        err
      )

      setError(
        err?.message ||
        'Unable to sign in with Google.'
      )

      setLoading(false)
    }
  }


  /*
  ============================================================
  QUICK DEMO LOGIN
  ============================================================
  */

  const handleDemoLogin = async (
    demoRole
  ) => {

    setError('')
    setLoading(true)

    const demoEmail =
      demoRole === 'admin'
        ? 'admin@demo.com'
        : 'student@demo.com'

    const demoPassword =
      demoRole === 'admin'
        ? 'admin123'
        : 'student123'


    /*
      Update visible role selector.
    */

    setRole(demoRole)


    try {

      const result = await signIn(
        demoEmail,
        demoPassword
      )


      if (result?.error) {

        setError(
          result.error.message
        )

        setLoading(false)

        return
      }


      if (
        result?.isDemo &&
        result?.data?.user
      ) {

        const loggedUser =
          result.data.user

        console.log(
          'DEMO USER:',
          loggedUser
        )


        if (loggedUser.role === 'admin') {

          navigate('/admin/dashboard', {
            replace: true
          })

        } else {

          navigate('/student/dashboard', {
            replace: true
          })

        }

        setLoading(false)

        return
      }


    } catch (err) {

      console.error(
        'Demo login error:',
        err
      )

      setError(
        err?.message ||
        'Demo login failed.'
      )

    } finally {

      setLoading(false)
    }
  }


  /*
  ============================================================
  UI
  ============================================================
  */

  return (

    <div className="min-h-screen animated-gradient flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">

      {/* Background decoration */}

      <div className="hidden sm:block absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float pointer-events-none" />

      <div
        className="hidden sm:block absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-float pointer-events-none"
        style={{
          animationDelay: '1.5s'
        }}
      />


      <div className="w-full sm:w-[90%] md:w-[60%] lg:w-[45%] xl:w-[38%] max-w-lg relative z-10">

        {/* Back button */}

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-300 hover:text-white mb-4 sm:mb-6 transition-all text-sm hover:-translate-x-1 duration-200"
        >

          <ArrowLeft size={16} />

          Back to Home

        </button>


        {/* Login Card */}

        <div
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
          style={{
            boxShadow:
              '0 25px 60px rgba(0,0,0,0.3), 0 0 40px rgba(59,130,246,0.15)'
          }}
        >

          {/* Header */}

          <div className="animated-gradient px-6 py-8 sm:p-8 text-center relative overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />


            <div className="flex justify-center mb-3 sm:mb-4">

              <div
                className="animate-float"
                style={{
                  filter:
                    'drop-shadow(0 0 20px rgba(255,255,255,0.3))'
                }}
              >

                <AppLogo size={48} />

              </div>

            </div>


            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              CampusPlus
            </h1>


            <p className="text-blue-200 text-xs sm:text-sm mt-1">
              One Campus. One Platform. Zero Confusion.
            </p>

          </div>


          {/* Form area */}

          <div className="px-5 py-6 sm:p-8">


            {/* Role selector */}

            <div className="flex bg-gray-100 rounded-2xl p-1 mb-5 sm:mb-6">

              {/* Student */}

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setRole('student')
                  setError('')
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                  role === 'student'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >

                <GraduationCap size={17} />

                Student

              </button>


              {/* Admin */}

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setRole('admin')
                  setError('')
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                  role === 'admin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >

                <Shield size={17} />

                Admin

              </button>

            </div>


            {/* Login form */}

            <form onSubmit={handleSubmit}>

              {/* Email */}

              <div className="mb-4">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>


                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />


                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />

                </div>

              </div>


              {/* Password */}

              <div className="mb-4">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>


                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />


                  <input
                    type={
                      showPass
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />


                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      setShowPass(!showPass)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >

                    {showPass
                      ? <EyeOff size={18} />
                      : <Eye size={18} />
                    }

                  </button>

                </div>

              </div>


              {/* Error */}

              {error && (

                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">

                  {error}

                </div>

              )}


              {/* Sign In */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold transition-all flex items-center justify-center gap-2"
              >

                {loading ? (

                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Signing in...

                  </>

                ) : (

                  'Sign In'

                )}

              </button>

            </form>


            {/* OR */}

            <div className="flex items-center gap-3 my-5">

              <div className="flex-1 h-px bg-gray-200" />

              <span className="text-xs text-gray-400">
                OR
              </span>

              <div className="flex-1 h-px bg-gray-200" />

            </div>


            {/* Google */}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="google-btn w-full text-sm"
            >

              {loading ? (

                <>
                  <Loader2
                    size={18}
                    className="animate-spin text-gray-400"
                  />

                  Redirecting to Google...

                </>

              ) : (

                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    className="flex-shrink-0"
                  >

                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />

                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />

                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />

                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />

                  </svg>

                  Continue with Google

                </>

              )}

            </button>


            {/* Contact */}

            <p className="text-center text-xs text-gray-400 mt-4 sm:mt-5">

              Don't have an account?{' '}

              <a
                href="mailto:admin@campusplus.dev"
                className="text-blue-600 font-medium hover:underline"
              >
                Contact your administrator
              </a>

            </p>


            {/* Demo Login */}

            <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-100">

              <p className="text-xs font-semibold text-blue-700 mb-3">
                Demo Login
              </p>


              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleDemoLogin('student')
                }
                className="w-full text-left text-xs text-blue-600 hover:text-blue-800 mb-2 disabled:opacity-50"
              >
                <strong>Student:</strong>{' '}
                student@demo.com / student123
              </button>


              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleDemoLogin('admin')
                }
                className="w-full text-left text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <strong>Admin:</strong>{' '}
                admin@demo.com / admin123
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}