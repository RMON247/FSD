import { useState, useEffect, useCallback } from 'react'
import {
  Sun, Moon, Monitor, Bell, Building2, ShieldCheck, Save, Users,
  Shield, Check, UserCheck, UserX, AlertCircle, Trash2
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth, API_URL } from '../context/AuthContext.jsx'
import { useRealtime } from '../context/RealtimeContext.jsx'
import Card, { CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { TextField, SelectField } from '../components/ui/Field.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { formatDateTime } from '../utils/format.js'

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${checked ? 'bg-brand-600' : 'bg-slate-200 dark:bg-ink-600'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  )
}

function RoleBadge({ role }) {
  if (role === 'admin') {
    return <Badge variant="primary">Administrator</Badge>
  }
  if (role === 'manager') {
    return <Badge variant="success">Manager (Write/Edit)</Badge>
  }
  return <Badge variant="default">Viewer (Read-Only)</Badge>
}

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { addToast } = useToast()
  const { user, isAdmin, canWrite, authHeader } = useAuth()
  const { subscribe, clientId } = useRealtime()

  const [notifications, setNotifications] = useState({ lowStock: true, outOfStock: true, dailySummary: false, newCustomers: true })
  const [profile, setProfile] = useState({
    name: user?.name || 'Maria Winters',
    email: user?.email || 'admin@stockyard.com',
    role: user?.role === 'admin' ? 'Administrator' : user?.role === 'manager' ? 'Warehouse Manager' : 'Viewer',
    warehouse: 'Central Warehouse #04'
  })

  // Team management state (for admins)
  const [usersList, setUsersList] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        role: user.role === 'admin' ? 'Administrator' : user.role === 'manager' ? 'Warehouse Manager' : 'Viewer'
      }))
    }
  }, [user])

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return
    setLoadingUsers(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/users`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': clientId,
          ...authHeader
        }
      })
      const data = await res.json()
      if (res.ok && data.users) {
        setUsersList(data.users)
      }
    } catch {
      // ignore
    } finally {
      setLoadingUsers(false)
    }
  }, [isAdmin, authHeader, clientId])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Real-time synchronization for user list
  useEffect(() => {
    if (!subscribe || !isAdmin) return

    const unsubscribe = subscribe((event) => {
      if (!event || !event.type) return

      if (event.type === 'user:registered') {
        const newUser = event.payload
        setUsersList((prev) => {
          if (prev.some((u) => u.id === newUser.id || u._id === newUser.id)) return prev
          return [newUser, ...prev]
        })
        addToast(`New account awaiting verification: ${newUser.name} (${newUser.email})`, 'warning')
      } else if (event.type === 'user:authorized' || event.type === 'user:role_updated') {
        const { id, role, isVerified, user: updatedUser } = event.payload || {}
        setUsersList((prev) =>
          prev.map((u) => (u.id === id || u._id === id ? {
            ...u,
            ...(role ? { role } : {}),
            ...(isVerified !== undefined ? { isVerified } : {}),
            ...(updatedUser || {})
          } : u))
        )
      } else if (event.type === 'user:deleted') {
        const targetId = event.payload?.id
        if (targetId) {
          setUsersList((prev) => prev.filter((u) => u.id !== targetId && u._id !== targetId))
        }
      }
    })

    return unsubscribe
  }, [subscribe, isAdmin, addToast])

  const handleRoleChange = async (targetUserId, newRole, targetUserName) => {
    setUpdatingId(targetUserId)
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${targetUserId}/authorization`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': clientId,
          ...authHeader
        },
        body: JSON.stringify({ role: newRole })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update role')

      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUserId || u._id === targetUserId ? { ...u, role: newRole } : u))
      )
      addToast(`Updated ${targetUserName}'s access level to ${newRole === 'admin' ? 'Administrator' : newRole === 'manager' ? 'Manager (Write/Edit)' : 'Viewer (Read-Only)'}`)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleVerification = async (targetUserId, currentVerified, targetUserName) => {
    const newStatus = !currentVerified
    setUpdatingId(targetUserId)
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${targetUserId}/authorization`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': clientId,
          ...authHeader
        },
        body: JSON.stringify({ isVerified: newStatus })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update verification status')

      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUserId || u._id === targetUserId ? { ...u, isVerified: newStatus } : u))
      )
      if (newStatus) {
        addToast(`Verified and approved ${targetUserName}. Database access is now unlocked!`, 'success')
      } else {
        addToast(`Revoked verification for ${targetUserName}. Database access is suspended.`, 'info')
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': clientId,
          ...authHeader
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to delete user')

      setUsersList((prev) => prev.filter((u) => u.id !== deleteTarget.id && u._id !== deleteTarget.id))
      addToast(`User ${deleteTarget.name} removed`, 'info')
      setDeleteTarget(null)
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleSaveProfile = () => addToast('Profile settings saved')
  const handleSaveNotifications = () => addToast('Notification preferences updated')

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Access Control Status for All Users */}
      <Card className="border-l-4 border-l-brand-600">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="text-brand-600 dark:text-brand-400" size={20} />
              <h2 className="font-display font-bold text-slate-900 dark:text-white text-base">Your Access Level</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Signed in as <span className="font-medium text-slate-700 dark:text-slate-200">{user?.name || 'Guest'}</span> ({user?.email || 'Not signed in'})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role={user?.role || 'viewer'} />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-ink-700 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {isAdmin ? (
            <p className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-medium">
              <Check size={14} /> You have full Administrator access: read, write, edit, delete, and grant access to team members.
            </p>
          ) : canWrite ? (
            <p className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-medium">
              <Check size={14} /> You have Write &amp; Edit access granted by an Administrator (can add products, adjust stock, manage storage &amp; customers).
            </p>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3 text-amber-800 dark:text-amber-300">
              <p className="font-medium flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" /> Read-Only Mode (Viewer Access)
              </p>
              <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400">
                Newly registered users can view data, but cannot add, edit, or adjust stock until an Administrator grants them write access below.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Admin User Management Section */}
      {isAdmin && (
        <Card padded={false} className="pt-5 overflow-hidden">
          <div className="px-5 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardHeader
                  title="Team Access Management"
                  subtitle="Control who can read, write, and edit database records in real time"
                  icon={Users}
                />
              </div>
              <span className="text-xs bg-slate-100 dark:bg-ink-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium">
                {usersList.length} Team Member{usersList.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-sm min-w-[760px]">
              <thead>
                <tr className="border-y border-slate-200 dark:border-ink-700 bg-slate-50/50 dark:bg-ink-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                  <th className="py-3 px-5">Team Member</th>
                  <th className="py-3 px-5">Verification Status</th>
                  <th className="py-3 px-5">Authorization Role</th>
                  <th className="py-3 px-5">Database Access</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-ink-700">
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                      {loadingUsers ? 'Loading team members…' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  usersList.map((u) => {
                    const isSelf = u.id === user?.id || u._id === user?.id
                    const isVerified = Boolean(u.isVerified)
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-ink-800/40 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                              {u.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                {u.name} {isSelf && <span className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 px-1.5 py-0.5 rounded font-normal">You</span>}
                              </p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            {isVerified ? (
                              <Badge variant="success">Verified</Badge>
                            ) : (
                              <Badge variant="warning">Pending Approval</Badge>
                            )}

                            {!isSelf && (
                              <button
                                onClick={() => handleToggleVerification(u.id, isVerified, u.name)}
                                disabled={updatingId === u.id}
                                className={`text-[11px] font-medium px-2 py-1 rounded-md transition-colors ${
                                  !isVerified
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-sm'
                                    : 'text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-ink-700'
                                }`}
                                title={!isVerified ? 'Verify and grant database access' : 'Revoke verification and suspend access'}
                              >
                                {!isVerified ? 'Verify Account' : 'Revoke'}
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <RoleBadge role={u.role} />
                        </td>

                        <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400">
                          {!isVerified ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                              <AlertCircle size={13} /> Blocked (Pending Verification)
                            </span>
                          ) : u.role === 'admin' ? (
                            <span className="text-brand-600 dark:text-brand-400 font-medium">Read, Write, Edit, Delete &amp; Admin</span>
                          ) : u.role === 'manager' ? (
                            <span className="text-teal-600 dark:text-teal-400 font-medium">Read, Write &amp; Edit</span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">Read-Only (No Write/Edit)</span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={u.role}
                              disabled={isSelf || updatingId === u.id}
                              onChange={(e) => handleRoleChange(u.id, e.target.value, u.name)}
                              className="text-xs rounded-lg border border-slate-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
                            >
                              <option value="viewer">Viewer (Read-Only)</option>
                              <option value="manager">Manager (Write/Edit)</option>
                              <option value="admin">Administrator (Full)</option>
                            </select>

                            {!isSelf && (
                              <button
                                onClick={() => setDeleteTarget(u)}
                                title="Remove team member"
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Appearance Settings */}
      <Card>
        <CardHeader title="Appearance" subtitle="Choose how StockYard looks on this device" icon={Sun} />
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'light', label: 'Light', icon: Sun },
            { key: 'dark', label: 'Dark', icon: Moon },
            { key: 'system', label: 'System', icon: Monitor }
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                if (opt.key === 'system') setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                else setTheme(opt.key)
              }}
              className={`flex flex-col items-center gap-2 rounded-xl border py-4 text-sm font-medium transition-colors ${
                theme === opt.key
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'border-slate-200 dark:border-ink-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-ink-700'
              }`}
            >
              <opt.icon size={18} />
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader title="Profile" subtitle="Your account information" icon={Building2} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <TextField label="Email Address" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <TextField label="Assigned Role" disabled value={profile.role} onChange={() => {}} />
          <TextField label="Primary Warehouse" value={profile.warehouse} onChange={(e) => setProfile({ ...profile, warehouse: e.target.value })} />
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-ink-700 flex justify-end">
          <Button icon={Save} onClick={handleSaveProfile}>Save Profile</Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader title="Notifications" subtitle="Choose what you want to be alerted about" icon={Bell} />
        <div className="space-y-1">
          {[
            { key: 'lowStock', label: 'Low stock alerts', desc: 'Get notified when products fall below minimum stock level' },
            { key: 'outOfStock', label: 'Out-of-stock alerts', desc: 'Immediate alert when a product quantity reaches zero' },
            { key: 'dailySummary', label: 'Daily summary email', desc: 'A daily digest of inventory and transaction activity' },
            { key: 'newCustomers', label: 'New customer sign-ups', desc: 'Notify when a new customer profile is created' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0 border-slate-100 dark:border-ink-700">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <Toggle checked={notifications[item.key]} onChange={(v) => setNotifications({ ...notifications, [item.key]: v })} />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-ink-700 flex justify-end">
          <Button icon={Save} onClick={handleSaveNotifications}>Save Preferences</Button>
        </div>
      </Card>

      {/* System info */}
      <Card>
        <CardHeader title="Security &amp; Permissions Model" subtitle="Role-based access control with live WebSocket synchronization" icon={ShieldCheck} />
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          StockYard enforces strict role-based access control. Public sign-up creates read-only <strong>Viewer</strong> accounts.
          Only <strong>Administrators</strong> have authority to write, edit, delete, and grant write permissions to other users.
          When an administrator changes a user&rsquo;s role, the update is broadcast instantly over WebSockets, activating or
          deactivating editing capabilities in real time without refreshing.
        </p>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
        title="Remove team member?"
        message={`Are you sure you want to remove ${deleteTarget?.name}? They will lose access to the system.`}
        confirmLabel="Remove User"
      />
    </div>
  )
}
