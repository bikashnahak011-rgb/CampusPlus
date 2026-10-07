import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ADMIN_ROLES, isHostelManagementEmail, isMainAdministratorEmail } from '../lib/adminRoles'
import { DEMO_LOGIN_ACCOUNTS } from '../data/demoAccounts'

const AuthContext = createContext(null)

/*
  ============================
  DEMO USERS
  ============================
*/

const DEMO_USERS = Object.fromEntries(
  DEMO_LOGIN_ACCOUNTS.map(({ password: _password, label: _label, description: _description, ...user }) => [user.email, user]),
)
const DEMO_PASSWORDS = Object.fromEntries(
  DEMO_LOGIN_ACCOUNTS.map(({ email, password }) => [email, password]),
)

const DEMO_STORAGE_KEY = 'campusplus_demo_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const authCheckComplete = useRef(false)

  /*
    ============================
    INITIAL AUTH CHECK
    ============================
  */

  useEffect(() => {
    let mounted = true
    authCheckComplete.current = false

    const initializeAuth = async () => {
      try {
        /*
          First check demo session.
        This is only created after successful
        demo login.
        */

        const savedDemoUser = localStorage.getItem(DEMO_STORAGE_KEY)

        if (savedDemoUser) {
          try {
            const demoUser = JSON.parse(savedDemoUser)

            const validDemoUser =
              demoUser?.email &&
              DEMO_USERS[demoUser.email] &&
              demoUser.isDemo === true

            if (validDemoUser) {
              if (mounted) {
                setUser({
                  ...DEMO_USERS[demoUser.email],
                })

                setLoading(false)
                authCheckComplete.current = true
              }

              return
            }

            localStorage.removeItem(DEMO_STORAGE_KEY)
          } catch {
            localStorage.removeItem(DEMO_STORAGE_KEY)
          }
        }

        /*
          Then check Supabase session.
        */

        if (!supabase) {
          if (mounted) {
            setUser(null)
            setLoading(false)
            authCheckComplete.current = true
          }

          return
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          await fetchProfile(session.user)
        } else {
          if (mounted) {
            setUser(null)
            setLoading(false)
            authCheckComplete.current = true
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)

        if (mounted) {
          setUser(null)
          setLoading(false)
          authCheckComplete.current = true
        }
      }
    }

    initializeAuth()

    /*
      Listen for Supabase authentication changes.
    */

    let subscription = null

    if (supabase) {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          /*
            Demo users are handled separately.
          */

          if (localStorage.getItem(DEMO_STORAGE_KEY)) {
            return
          }

          if (event === 'INITIAL_SESSION' && !authCheckComplete.current) {
            return
          }

          if (
            session &&
            (
              event === 'SIGNED_IN' ||
              event === 'TOKEN_REFRESHED' ||
              event === 'INITIAL_SESSION'
            )
          ) {
            await fetchProfile(session.user)
          }

          if (event === 'SIGNED_OUT') {
            setUser(null)
            setLoading(false)
          }
        }
      )

      subscription = authSubscription
    }

    return () => {
      mounted = false

      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  /*
    ============================
    FETCH SUPABASE PROFILE
    ============================
  */

  async function fetchProfile(authUser) {
    if (!supabase || !authUser) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.warn('Profile not found:', error.message)

        setUser({
          ...authUser,
          role: null,
          admin_role: null,
          is_active: true,
          name:
            authUser.user_metadata?.full_name ||
            authUser.email ||
            'User',
          avatar_url:
            authUser.user_metadata?.avatar_url || null,
          profileComplete: false,
          isDemo: false,
        })

        return
      }

      const verifiedMainAdministrator = isMainAdministratorEmail(authUser.email)
        && Boolean(authUser.email_confirmed_at || authUser.confirmed_at)
      const emailMatchesProfile = String(data?.email || '').trim().toLowerCase()
        === String(authUser.email || '').trim().toLowerCase()
      if (!emailMatchesProfile) {
        setUser({
          ...authUser,
          ...data,
          role: null,
          admin_role: null,
          is_active: data?.is_active !== false,
          profileComplete: false,
          profileEmailMismatch: true,
          isDemo: false,
        })
        return
      }

      const role = verifiedMainAdministrator
        ? 'admin'
        : data?.role === 'admin' ? 'admin' : data?.role === 'student' ? 'student' : null
      let admin_role = role === 'admin'
        ? verifiedMainAdministrator ? ADMIN_ROLES.MAIN_ADMINISTRATOR : data?.admin_role || null
        : null
      if (
        admin_role === ADMIN_ROLES.HOSTEL_MANAGEMENT &&
        (!isHostelManagementEmail(authUser.email) || !isHostelManagementEmail(data?.email))
      ) {
        admin_role = null
      }

      const profileComplete =
        !!(
          data?.name &&
          (
            role === 'admin' ||
            (role === 'student' && data?.roll_no)
          )
        )

      setUser({
        ...authUser,

        ...data,

        role,
        admin_role,
        is_active: data?.is_active !== false,

        name:
          data?.name ||
          authUser.user_metadata?.full_name ||
          authUser.email,

        avatar_url:
          data?.avatar_url ||
          authUser.user_metadata?.avatar_url ||
          null,

        profileComplete,

        isDemo: false,
      })
    } catch (error) {
      console.error('Fetch profile error:', error)

      setUser({
        ...authUser,
        role: null,
        admin_role: null,
        is_active: true,
        name:
          authUser.user_metadata?.full_name ||
          authUser.email ||
          'User',
        avatar_url:
          authUser.user_metadata?.avatar_url || null,
        profileComplete: false,
        isDemo: false,
      })
    } finally {
      setLoading(false)
    }
  }

  /*
    ============================
    SIGN IN
    ============================
  */

  async function signIn(email, password) {
    const normalizedEmail = email.trim().toLowerCase()

    /*
      DEMO LOGIN
    */

    if (DEMO_USERS[normalizedEmail]) {
      if (DEMO_PASSWORDS[normalizedEmail] !== password) {
        return {
          error: {
            message: 'Invalid demo email or password.',
          },
        }
      }

      /*
        Make sure an old Supabase session
        does not interfere with demo login.
      */

      if (supabase) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          return {
            error: {
              message: `Could not safely start the demo session: ${error.message}`,
            },
          }
        }
      }

      const demoUser = {
        ...DEMO_USERS[normalizedEmail],
      }

      localStorage.setItem(
        DEMO_STORAGE_KEY,
        JSON.stringify(demoUser)
      )

      setUser(demoUser)
      setLoading(false)

      return {
        data: {
          user: demoUser,
          session: null,
        },
        error: null,
        isDemo: true,
      }
    }

    /*
      NORMAL SUPABASE LOGIN
    */

    if (!supabase) {
      return {
        error: {
          message:
            'Supabase is not configured. Check your .env file.',
        },
      }
    }

    /*
      Remove any previous demo session
      before real login.
    */

    localStorage.removeItem(DEMO_STORAGE_KEY)

    const result =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

    return result
  }

  async function sendStudentSignInLink(email) {
    if (!supabase) {
      return {
        error: {
          message: 'Student sign-in is unavailable because Supabase is not configured.',
        },
      }
    }

    const normalizedEmail = String(email || '').trim().toLowerCase()
    if (!normalizedEmail) {
      return { error: { message: 'Enter your email address first.' } }
    }

    localStorage.removeItem(DEMO_STORAGE_KEY)

    return supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?flow=student-email-link`,
        shouldCreateUser: false,
      },
    })
  }

  /*
    ============================
    GOOGLE LOGIN
    ============================
  */

  async function signInWithGoogle() {
  if (!supabase) {
    return {
      error: {
        message:
          'Supabase is not configured. Check your .env file.',
      },
    }
  }

  // Remove demo session
  localStorage.removeItem(DEMO_STORAGE_KEY)

  const redirectTo =
    `${window.location.origin}/auth/callback`

  const { data, error } =
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    })

  if (error) {
    console.error(
      'GOOGLE OAUTH ERROR:',
      error
    )

    return {
      data,
      error,
    }
  }

  return {
    data,
    error: null,
  }
}

  async function sendPasswordReset(email) {
    if (!supabase) {
      return { error: { message: 'Password reset is unavailable because Supabase is not configured.' } }
    }
    const normalizedEmail = String(email || '').trim().toLowerCase()
    if (!normalizedEmail) {
      return { error: { message: 'Enter your email address first.' } }
    }
    return supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
  }

  function updateDemoProfile(profileUpdates) {
    if (!user?.isDemo) return
    const updatedUser = { ...user, ...profileUpdates }
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updatedUser))
    setUser(updatedUser)
  }
  /*
    ============================
    SIGN OUT
    ============================
  */

  async function signOut() {
    /*
      Remove demo login.
    */

    localStorage.removeItem(DEMO_STORAGE_KEY)

    /*
      Clear React user immediately.
    */

    setUser(null)
    setLoading(false)

    /*
      Also clear Supabase session.
    */

    if (supabase) {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error('Sign out error:', error)
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        sendStudentSignInLink,
        signInWithGoogle,
        sendPasswordReset,
        signOut,
        fetchProfile,
        updateDemoProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
