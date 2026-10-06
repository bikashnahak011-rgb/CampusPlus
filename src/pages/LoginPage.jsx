import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  GraduationCap,
  Sparkles,
  X,
} from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import AppLogo from '../components/AppLogo'
import { ADMIN_ROLES, ADMIN_ROLE_LABELS, getAdminHomePath } from '../lib/adminRoles'
import { DEMO_LOGIN_ACCOUNTS } from '../data/demoAccounts'
import loginStudentArtwork from '../assets/man-at-computer.png'

const ADMIN_ROLE_OPTIONS = [
  { value: ADMIN_ROLES.HOSTEL_MANAGEMENT, description: 'Hostel rooms, allocations, student housing, and maintenance.' },
  { value: ADMIN_ROLES.MESS_MANAGER, description: 'Dining menus, meal orders, and mess operations.' },
  { value: ADMIN_ROLES.FACULTY, description: 'Classes, timetables, attendance, assignments, and academic results.' },
  { value: ADMIN_ROLES.ACCOUNT_EXAMINATION, description: 'Fees, payments, accounts, and examination records.' },
  { value: ADMIN_ROLES.MAIN_ADMINISTRATOR, description: 'Admin accounts, campus settings, and all campus modules.' },
]

export default function LoginPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetNotice, setResetNotice] = useState('')
  const [showDemoAccounts, setShowDemoAccounts] = useState(false)
  const [loginMode, setLoginMode] = useState('student')
  const [adminRoleChoice, setAdminRoleChoice] = useState('')

  const {
    user,
    signIn,
    signInWithGoogle,
    sendPasswordReset,
  } = useAuth()

  const navigate = useNavigate()
  const { t } = useApp()

  /*
  ============================================================
  REDIRECT AFTER AUTHENTICATION
  ============================================================
  */

  useEffect(() => {

    if (!user) return

    console.log('LOGIN USER:', user)
    console.log('LOGIN ROLE:', user.role)

    if (user.is_active === false || !['student', 'admin'].includes(user.role)) {
      navigate('/unauthorized', { replace: true })
      return
    }

    const isAdmin = user.role === 'admin'

    /*
      If profile is complete,
      go directly to dashboard.
    */

    if (user.profileComplete) {

      if (isAdmin) {
        navigate(getAdminHomePath(user.admin_role, user.email), {
          replace: true
        })
      } else {
        navigate('/student/profile', {
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

    if (!email.trim() || (loginMode === 'admin' && !password)) {

      setError(
        loginMode === 'admin' ? 'Please enter your email and password.' : 'Please enter your email.'
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
        loginMode === 'student' ? '' : password
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

        // The authentication effect validates the profile role before routing.
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

  const handleForgotPassword = async () => {
    setError('')
    setResetNotice('')
    if (!email.trim()) {
      setError('Enter your email address above, then choose “Forgot password?”.')
      return
    }
    setLoading(true)
    try {
      const result = await sendPasswordReset(email)
      if (result?.error) {
        setError(result.error.message || 'Unable to send a password reset email.')
      } else {
        setResetNotice('If an account exists for this email, a password reset link has been sent. Check your inbox and spam folder.')
      }
    } catch (resetError) {
      setError(resetError?.message || 'Unable to send a password reset email. Please try again.')
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

  const handleDemoLogin = async (account) => {

    setError('')
    setLoading(true)
    setLoginMode(account.role === 'admin' ? 'admin' : 'student')
    setAdminRoleChoice(account.admin_role || '')

    try {

      const result = await signIn(
        account.email,
        account.password
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

        // The authentication effect validates the profile role before routing.
        setShowDemoAccounts(false)
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

    <main className="login-page">
      <section className="login-illustration" aria-labelledby="login-showcase-title">
        <div className="login-brand">
          <AppLogo size={42} />
          <div>
            <p>NEXCAMPUS PLATFORM</p>
            <span>One campus, connected</span>
          </div>
        </div>
        <div className="login-copy">
          <h1 id="login-showcase-title">Campus life,<br /><span>in better view.</span></h1>
          <p>Bring classes, attendance, results, and campus services together in one clear place.</p>
        </div>
        <div className="login-art-scene" aria-hidden="true">
          <div className="login-art-halo login-art-halo--outer" />
          <div className="login-art-halo login-art-halo--inner" />
          <div className="login-art-orbit login-art-orbit--one" />
          <div className="login-art-orbit login-art-orbit--two" />
          <div className="login-art-student">
            <img src={loginStudentArtwork} alt="" />
          </div>
          <div className="login-art-float login-art-float--book"><Sparkles size={22} /></div>
          <div className="login-art-float login-art-float--cap"><GraduationCap size={28} /></div>
          <div className="login-art-caption">
            <span>YOUR CAMPUS, AT A GLANCE</span>
            <strong>Everything in sync</strong>
            <small>Student services · Academic updates · Campus notices</small>
          </div>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-form-column">

        <button
          onClick={() => navigate('/landing')}
          className="login-back-link"
        >
          <ArrowLeft size={16} />
          {t('backToHome')}
        </button>

        <div className="login-form-surface">
          <header className="login-form-heading">
            <div className="login-heading-row">
              <span className="login-form-logo"><AppLogo size={38} /></span>
              <h1 id="login-title">Welcome to NexCampus</h1>
            </div>
            <span>{loginMode === 'student' ? 'Enter any email to preview the student portal demo' : 'Sign in to continue to your campus'}</span>
          </header>

            <div className="login-role-switch" role="group" aria-label="Choose sign-in type">
              <button
                type="button"
                className={loginMode === 'student' ? 'bg-white' : ''}
                aria-pressed={loginMode === 'student'}
                onClick={() => setLoginMode('student')}
                disabled={loading}
              >Login as Student</button>
              <button
                type="button"
                className={loginMode === 'admin' ? 'bg-white' : ''}
                aria-pressed={loginMode === 'admin'}
                onClick={() => setLoginMode('admin')}
                disabled={loading}
              >Login as Admin</button>
            </div>

            {loginMode === 'admin' ? (
              <div className="login-admin-role-field">
                <label htmlFor="login-admin-role">Admin area</label>
                <select
                  id="login-admin-role"
                  value={adminRoleChoice}
                  onChange={event => setAdminRoleChoice(event.target.value)}
                  disabled={loading}
                >
                  <option value="">Choose an admin area</option>
                  {ADMIN_ROLE_OPTIONS.map(({ value }) => (
                    <option key={value} value={value}>{ADMIN_ROLE_LABELS[value]}</option>
                  ))}
                </select>
                <p>
                  {ADMIN_ROLE_OPTIONS.find(({ value }) => value === adminRoleChoice)?.description
                    || 'Choose an area to see what that admin role manages.'}
                </p>
                <p className="login-role-note">Your actual role and permissions are assigned by the Main Administrator in User Management. This choice does not grant access.</p>
              </div>
            ) : (
              <p className="login-role-note mb-4 text-sm text-gray-500">Student accounts access classes, attendance, results, and campus services. Your account role is checked after sign in.</p>
            )}


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
                    className="w-full pl-10 pr-4 py-3 border border-violet-100 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-violet-50"
                  />

                </div>

              </div>


              {/* Password */}

              <div className="mb-4">

                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Password {loginMode === 'student' && <span className="font-normal text-gray-400">(optional for demo)</span>}</label>
                  <button type="button" onClick={handleForgotPassword} disabled={loading} className="login-forgot-password text-sm font-semibold text-violet-200 transition-colors hover:text-white disabled:opacity-60">
                    Forgot password?
                  </button>
                </div>


                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />


                  <input
                    id="login-password"
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
                    className="w-full pl-10 pr-12 py-3 border border-violet-100 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-violet-50"
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

              {resetNotice && (
                <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  {resetNotice}
                </div>
              )}


              {/* Sign In */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-600 hover:from-violet-800 hover:via-purple-800 hover:to-fuchsia-700 disabled:opacity-60 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-900/25"
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

                  `Sign in as ${loginMode === 'admin' ? 'Admin' : 'Student'}`

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
                href="mailto:admin@nexcampus.dev"
                className="login-contact-link font-medium hover:underline"
              >
                Contact your administrator
              </a>

            </p>


            <div className="login-demo-box">
              <button
                type="button"
                disabled={loading}
                aria-expanded={showDemoAccounts}
                aria-controls="login-demo-accounts"
                onClick={() => setShowDemoAccounts((visible) => !visible)}
                className="login-demo-toggle"
              >
                <Sparkles size={16} />
                {showDemoAccounts ? 'Choose a demo account' : 'Use a demo account'}
              </button>
            </div>
            {showDemoAccounts && (
              <>
                <button
                  type="button"
                  className="login-demo-backdrop"
                  aria-label="Close demo account picker"
                  onClick={() => setShowDemoAccounts(false)}
                />
                <section
                  id="login-demo-accounts"
                  className="login-demo-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="login-demo-title"
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setShowDemoAccounts(false)
                  }}
                >
                  <header className="login-demo-dialog-heading">
                    <div>
                      <h2 id="login-demo-title">Choose a demo account</h2>
                      <p>Preview the portal from a specific role.</p>
                    </div>
                    <button
                      type="button"
                      className="login-demo-close"
                      aria-label="Close demo account picker"
                      onClick={() => setShowDemoAccounts(false)}
                    >
                      <X size={18} />
                    </button>
                  </header>
                  <div className="login-demo-accounts">
                    {DEMO_LOGIN_ACCOUNTS.map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        disabled={loading}
                        onClick={() => handleDemoLogin(account)}
                        className="login-demo-account"
                      >
                        <span>{account.label}</span>
                        <small>{account.description}</small>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

        </div>
      </div>
      </section>
    </main>
  )
}
