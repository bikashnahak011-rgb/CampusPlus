import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

/*
  ============================
  DEMO USERS
  ============================
*/

const DEMO_USERS = {
  'student@demo.com': {
    id: 'demo-student-001',
    email: 'student@demo.com',
    role: 'student',
    name: 'Demo Student',
    roll_no: 'DEMO001',
    profileComplete: true,
    isDemo: true,
  },

  'admin@demo.com': {
    id: 'demo-admin-001',
    email: 'admin@demo.com',
    role: 'admin',
    name: 'Demo Admin',
    profileComplete: true,
    isDemo: true,
  },
}

const DEMO_PASSWORDS = {
  'student@demo.com': 'student123',
  'admin@demo.com': 'admin123',
}

const DEMO_STORAGE_KEY = 'campusplus_demo_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /*
    ============================
    INITIAL AUTH CHECK
    ============================
  */

  useEffect(() => {
    let mounted = true

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
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)

        if (mounted) {
          setUser(null)
          setLoading(false)
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
          role: 'student',
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

      const role = data?.role || 'student'

      const profileComplete =
        !!(
          data?.name &&
          (
            role === 'admin' ||
            data?.roll_no
          )
        )

      setUser({
        ...authUser,

        ...data,

        role,

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
        role: 'student',
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
        try {
          await supabase.auth.signOut()
        } catch {
          // Ignore Supabase sign-out errors
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

  console.log('STARTING GOOGLE LOGIN')

  const redirectTo =
    `${window.location.origin}/auth/callback`

  console.log(
    'GOOGLE REDIRECT:',
    redirectTo
  )

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

  console.log(
    'GOOGLE OAUTH STARTED:',
    data
  )

  return {
    data,
    error: null,
  }
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
        signInWithGoogle,
        signOut,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)