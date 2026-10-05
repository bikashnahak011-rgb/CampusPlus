import { useCallback, useEffect, useState } from 'react'
import { ShieldCheck, UserPlus, RefreshCw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { ADMIN_ROLES, ADMIN_ROLE_LABELS } from '../../lib/adminRoles'

const ROLE_OPTIONS = Object.entries(ADMIN_ROLE_LABELS)

async function fetchUsers() {
  if (!supabase) throw new Error('Supabase is not configured. Check the project environment settings.')
  const { data, error } = await supabase
    .from('profiles')
    .select('id,name,email,role,admin_role,is_active,created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export default function AdminUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(Boolean(supabase) && !user?.isDemo)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(user?.isDemo
    ? 'User management is unavailable in demo mode.'
    : supabase ? '' : 'Supabase is not configured. Check the project environment settings.')
  const [notice, setNotice] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [adminRole, setAdminRole] = useState(ADMIN_ROLES.HOSTEL_MANAGEMENT)
  const [roleDrafts, setRoleDrafts] = useState({})

  const loadUsers = useCallback(async (showLoading = false) => {
    if (user?.isDemo || !supabase) return

    if (showLoading) setLoading(true)
    try {
      setUsers(await fetchUsers())
      setError('')
    } catch (queryError) {
      setError(queryError.message || 'Unable to load campus users.')
    } finally {
      setLoading(false)
    }
  }, [user?.isDemo])

  useEffect(() => {
    if (!supabase || user?.isDemo) return undefined
    let active = true

    fetchUsers()
      .then((data) => {
        if (active) {
          setUsers(data)
          setError('')
        }
      })
      .catch((queryError) => {
        if (active) setError(queryError.message || 'Unable to load campus users.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [user?.isDemo])

  const invokeAdminAction = async (body, successMessage) => {
    if (user?.isDemo || !supabase) {
      setError(user?.isDemo ? 'User management is unavailable in demo mode.' : 'Supabase is not configured. Check the project environment settings.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')
    try {
      const { error: actionError } = await supabase.functions.invoke('manage-admin-users', { body })
      if (actionError) {
        setError(actionError.message || 'The administrator action failed.')
        return false
      }

      setNotice(successMessage)
      await loadUsers(true)
      return true
    } catch (actionError) {
      setError(actionError.message || 'The administrator action failed.')
      return false
    } finally {
      setSaving(false)
    }
  }

  const inviteAdmin = async (event) => {
    event.preventDefault()
    const succeeded = await invokeAdminAction({
      action: 'create_admin',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      admin_role: adminRole,
    }, 'Invitation sent. The new administrator can set a password from their email.')
    if (succeeded) {
      setName('')
      setEmail('')
    }
  }

  const changeAdminRole = (target) => {
    const nextRole = roleDrafts[target.id] || target.admin_role
    if (!nextRole || nextRole === target.admin_role) return
    invokeAdminAction({
      action: 'change_role',
      user_id: target.id,
      admin_role: nextRole,
    }, `Role updated for ${target.email}.`)
  }

  const toggleAdminStatus = (target) => {
    invokeAdminAction({
      action: 'set_active',
      user_id: target.id,
      is_active: !target.is_active,
    }, `${target.email} is now ${target.is_active ? 'disabled' : 'enabled'}.`)
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create administrator invitations, assign roles, and manage access.</p>
        </div>
        <button onClick={() => loadUsers(true)} disabled={loading || saving} className="secondary-button inline-flex items-center gap-2">
          <RefreshCw size={15} /> Refresh
        </button>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}

      <form onSubmit={inviteAdmin} className="card grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
        <div className="md:col-span-2 xl:col-span-4">
          <h2 className="font-semibold text-gray-900">Invite an administrator</h2>
          <p className="mt-1 text-xs text-gray-500">Supabase sends the invite link. Student accounts are not changed.</p>
        </div>
        <label className="text-sm text-gray-600">
          Name
          <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900" autoComplete="name" />
        </label>
        <label className="text-sm text-gray-600">
          Email
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900" autoComplete="email" />
        </label>
        <label className="text-sm text-gray-600">
          Admin role
          <select value={adminRole} onChange={(event) => setAdminRole(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900">
            {ROLE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button type="submit" disabled={saving} className="primary-button mt-auto inline-flex items-center justify-center gap-2">
          <UserPlus size={16} /> Send invitation
        </button>
      </form>

      <div className="card overflow-hidden !p-0">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-semibold text-gray-900">Campus users</h2>
            <p className="text-xs text-gray-500">Only the Main Administrator can view this list.</p>
          </div>
          <span className="text-sm text-gray-500">{users.length} total</span>
        </div>

        {loading ? <p className="p-5 text-sm text-gray-500">Loading users...</p> : users.length === 0 ? (
          <p className="p-5 text-sm text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Account type</th>
                  <th className="px-4 py-3">Admin role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((target) => {
                  const isSelf = target.id === user?.id
                  const isAdmin = target.role === 'admin'
                  return (
                    <tr key={target.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{target.name || 'Unnamed user'}</p>
                        <p className="text-xs text-gray-500">{target.email}</p>
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-600">{target.role}</td>
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <div className="flex items-center gap-2">
                            <select
                              aria-label={`Role for ${target.email}`}
                              value={roleDrafts[target.id] || target.admin_role}
                              onChange={(event) => setRoleDrafts((current) => ({ ...current, [target.id]: event.target.value }))}
                              disabled={isSelf || saving}
                              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 disabled:opacity-60"
                            >
                              {ROLE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            <button onClick={() => changeAdminRole(target)} disabled={isSelf || saving || !(roleDrafts[target.id] || target.admin_role)} className="text-xs font-semibold text-violet-700 disabled:opacity-40">
                              Save
                            </button>
                          </div>
                        ) : <span className="text-gray-400">Student</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${target.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {target.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <button onClick={() => toggleAdminStatus(target)} disabled={isSelf || saving} className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 disabled:cursor-not-allowed disabled:opacity-40">
                            <ShieldCheck size={14} /> {target.is_active ? 'Disable' : 'Enable'}
                          </button>
                        ) : <span className="text-xs text-gray-400">Managed by student login</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
