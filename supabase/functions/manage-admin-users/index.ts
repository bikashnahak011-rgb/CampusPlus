import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const allowedAdminRoles = new Set([
  'hostel_management',
  'mess_manager',
  'faculty',
  'account_examination',
  'main_administrator',
])

const jsonResponse = (body: Record<string, unknown>, status = 200) => new Response(
  JSON.stringify(body),
  { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
)

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Admin user management requires Supabase URL, anon key, and service role key.')
    return jsonResponse({ error: 'Admin user management is not configured.' }, 500)
  }

  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Authentication is required.' }, 401)
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const accessToken = authorization.slice('Bearer '.length).trim()
  const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser(accessToken)
  if (callerError || !caller) return jsonResponse({ error: 'Your session is invalid or expired.' }, 401)

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: callerProfile, error: profileError } = await adminClient
    .from('profiles')
    .select('role,admin_role,is_active')
    .eq('id', caller.id)
    .single()

  if (profileError) {
    console.error('Unable to authorize admin user management request:', profileError.message)
    return jsonResponse({ error: 'Unable to verify administrator permissions.' }, 500)
  }
  if (callerProfile.role !== 'admin' || callerProfile.admin_role !== 'main_administrator' || !callerProfile.is_active) {
    return jsonResponse({ error: 'Only an active Main Administrator can manage accounts.' }, 403)
  }

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return jsonResponse({ error: 'Request body must be valid JSON.' }, 400)
  }

  const action = payload.action

  if (action === 'create_admin') {
    const name = typeof payload.name === 'string' ? payload.name.trim() : ''
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
    const adminRole = payload.admin_role

    if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: 'Enter a valid name and email address.' }, 400)
    }
    if (typeof adminRole !== 'string' || !allowedAdminRoles.has(adminRole)) {
      return jsonResponse({ error: 'Choose a valid administrator role.' }, 400)
    }

    const { data: invitation, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name },
    })
    if (inviteError || !invitation.user) {
      return jsonResponse({ error: inviteError?.message || 'Could not create the administrator invitation.' }, 400)
    }

    const { data: assignedProfile, error: assignError } = await adminClient
      .from('profiles')
      .update({ name, role: 'admin', admin_role: adminRole, is_active: true })
      .eq('id', invitation.user.id)
      .select('id')
      .maybeSingle()

    if (assignError || !assignedProfile) {
      const { error: cleanupError } = await adminClient.auth.admin.deleteUser(invitation.user.id)
      if (cleanupError) console.error('Failed to clean up unassigned invited user:', cleanupError.message)
      console.error('Failed to assign the invited admin role:', assignError?.message || 'Auth profile row was not created.')
      return jsonResponse({ error: 'Invitation was created, but role assignment failed. Contact support before retrying.' }, 500)
    }

    return jsonResponse({ success: true, user_id: invitation.user.id })
  }

  const targetId = typeof payload.user_id === 'string' ? payload.user_id : ''
  if (!targetId) return jsonResponse({ error: 'A target user id is required.' }, 400)
  if (targetId === caller.id) return jsonResponse({ error: 'You cannot change your own administrator account.' }, 400)

  const { data: target, error: targetError } = await adminClient
    .from('profiles')
    .select('id,role,admin_role,is_active')
    .eq('id', targetId)
    .single()

  if (targetError || !target) return jsonResponse({ error: 'User not found.' }, 404)
  if (target.role !== 'admin') return jsonResponse({ error: 'Only administrator accounts can be changed here.' }, 400)

  if (action === 'change_role') {
    const adminRole = payload.admin_role
    if (typeof adminRole !== 'string' || !allowedAdminRoles.has(adminRole)) {
      return jsonResponse({ error: 'Choose a valid administrator role.' }, 400)
    }

    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ admin_role: adminRole })
      .eq('id', targetId)

    if (updateError) {
      return jsonResponse({ error: updateError.message }, updateError.message.includes('At least one active main administrator') ? 409 : 400)
    }
    return jsonResponse({ success: true })
  }

  if (action === 'set_active') {
    if (typeof payload.is_active !== 'boolean') {
      return jsonResponse({ error: 'is_active must be true or false.' }, 400)
    }
    if (target.is_active === payload.is_active) return jsonResponse({ success: true })

    const { error: profileUpdateError } = await adminClient
      .from('profiles')
      .update({ is_active: payload.is_active })
      .eq('id', targetId)

    if (profileUpdateError) {
      return jsonResponse({ error: profileUpdateError.message }, profileUpdateError.message.includes('At least one active main administrator') ? 409 : 400)
    }

    const { error: banError } = await adminClient.auth.admin.updateUserById(targetId, {
      ban_duration: payload.is_active ? 'none' : '876000h',
    })
    if (banError) {
      console.error('Profile access state changed, but Supabase auth ban update failed:', banError.message)
      return jsonResponse({ error: 'Profile access was changed, but Supabase could not update the login ban. Check Supabase Auth users.' }, 500)
    }
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: 'Unsupported administrator action.' }, 400)
})
