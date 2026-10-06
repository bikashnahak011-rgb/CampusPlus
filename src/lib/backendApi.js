const API_URL = (import.meta.env?.VITE_AI_API_URL || (import.meta.env?.DEV ? 'http://localhost:8000' : '')).replace(/\/$/, '')

export async function requestBackend(path, { method = 'GET', body, signal } = {}) {
  const { supabase } = await import('./supabase.js')
  if (!supabase) {
    throw new Error('Supabase authentication is not configured.')
  }
  if (!API_URL) {
    throw new Error('The live campus backend is not configured. Set VITE_AI_API_URL for this deployment.')
  }
  if (!import.meta.env?.DEV) {
    const hostname = new URL(API_URL).hostname
    if (['localhost', '127.0.0.1', '[::1]'].includes(hostname)) {
      throw new Error('VITE_AI_API_URL points to localhost, which is not reachable from a deployed site. Set it to your publicly reachable HTTPS backend URL and redeploy.')
    }
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
  }).catch((error) => {
    if (signal?.aborted) throw error
    if (error instanceof TypeError) {
      throw new Error(
        `Campus AI backend at ${API_URL} could not be reached. Check that the backend is running and allows this site's origin. For local development, start it with "uvicorn backend.main:app --reload --port 8000" from the project root.`,
        { cause: error },
      )
    }
    throw error
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = typeof payload.detail === 'string' ? payload.detail : `AI service returned ${response.status}.`
    const error = new Error(detail)
    error.status = response.status
    throw error
  }

  return payload
}
