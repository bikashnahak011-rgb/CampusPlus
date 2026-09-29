const API_URL = (import.meta.env?.VITE_AI_API_URL || (import.meta.env?.DEV ? 'http://localhost:8000' : '')).replace(/\/$/, '')

export async function requestBackend(path, { method = 'GET', body, signal } = {}) {
  const { supabase } = await import('./supabase.js')
  if (!supabase) {
    throw new Error('Supabase authentication is not configured.')
  }
  if (!API_URL) {
    throw new Error('The live campus backend is not configured. Set VITE_AI_API_URL for this deployment.')
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw new Error(sessionError.message)
  if (!session?.access_token) {
    throw new Error('Sign in with a campus account to use live AI services.')
  }

  const response = await fetch(`${API_URL}/api/${path.replace(/^\//, '')}`, {
    method,
    signal,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = typeof payload.detail === 'string' ? payload.detail : `AI service returned ${response.status}.`
    throw new Error(detail)
  }

  return payload
}
