import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
        fetchProfile(session.user)
      } else if (!session && event === 'INITIAL_SESSION') {
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null); setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(authUser) {
    if (!supabase) return
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
      setUser({
        ...authUser,
        role: data?.role || 'student',
        name: data?.name || authUser.user_metadata?.full_name || authUser.email,
        avatar_url: data?.avatar_url || authUser.user_metadata?.avatar_url || null,
        profileComplete: !!(data?.name && (data?.role === 'admin' || data?.roll_no)),
        ...data,
      })
    } catch {
      setUser({
        ...authUser,
        role: 'student',
        name: authUser.user_metadata?.full_name || authUser.email,
        avatar_url: authUser.user_metadata?.avatar_url || null,
        profileComplete: false,
      })
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email, password) {
    if (!supabase) return { error: { message: 'Supabase not configured. Check your .env file.' } }
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signInWithGoogle() {
    if (!supabase) return { error: { message: 'Supabase not configured. Check your .env file.' } }
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  async function signOut() {
    setUser(null)
    if (supabase) await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
