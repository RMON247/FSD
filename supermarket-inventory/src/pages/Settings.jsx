import { useState, useEffect } from 'react'
import {
  Sun, Moon, Monitor, Bell, Building2, Save, Users,
  Shield, Check, UserX, AlertCircle, Trash2, KeyRound, Copy,
  RefreshCw, Store, Sparkles
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useOrg } from '../context/OrgContext.jsx'
import Card, { CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { TextField } from '../components/ui/Field.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'

function Toggle({ checked, onChange, id, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink-900 ${
        checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-ink-600'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
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
  const { user } = useAuth()
  const {
    activeOrg, activeOrgId, isOrgAdmin, userOrgRole, canOrgWrite,
    regenerateInviteCode, updateMemberRole, removeMember, refetchOrgDetails
  } = useOrg()

  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const [notifications, setNotifications] = useState({
    lowStock: true,
    outOfStock: true,
    dailySummary: false,
    newCustomers: true
  })

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: userOrgRole === 'admin' ? 'Administrator' : userOrgRole === 'manager' ? 'Warehouse Manager' : 'Viewer',
    warehouse: activeOrg?.name || 'Main Warehouse'
  })

  useEffect(() => {
    if (user && activeOrg) {
      setProfile((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        role: userOrgRole === 'admin' ? 'Administrator' : userOrgRole === 'manager' ? 'Warehouse Manager' : 'Viewer',
        warehouse: activeOrg.name
      }))
    }
  }, [user, activeOrg, userOrgRole])

  const handleCopyCode = () => {
    if (!activeOrg?.code) return
    navigator.clipboard.writeText(activeOrg.code)
    setCopied(true)
    addToast(`Invite code ${activeOrg.code} copied! Share with your staff.`, 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerateCode = async () => {
    setRegenerating(true)
    try {
      await regenerateInviteCode()
    } catch (err) {
      addToast(err.message || 'Could not regenerate code', 'error')
    } finally {
      setRegenerating(false)
    }
  }

  const handleRoleChange = async (userId, newRole, memberName) => {
    setUpdatingId(userId)
    try {
      await updateMemberRole(userId, newRole)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemoveMember = async () => {
    if (!deleteTarget) return
    try {
      await removeMember(deleteTarget.userId)
      setDeleteTarget(null)
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const membersList = activeOrg?.members || []

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Organization & Warehouse Overview Card */}
      <Card className="border-l-4 border-l-brand-600">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Store className="text-brand-600 dark:text-brand-400" size={20} />
              <h2 className="font-display font-bold text-slate-900 dark:text-white text-base">
                {activeOrg?.name || 'Warehouse Workspace'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Facility Location: <span className="font-medium text-slate-700 dark:text-slate-200">{activeOrg?.location || 'Main Site'}</span> &bull; Your Role: <span className="capitalize font-semibold text-brand-600 dark:text-brand-400">{userOrgRole}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role={userOrgRole} />
          </div>
        </div>

        {/* Invite Code Share Banner */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-ink-800/70 border border-slate-200/80 dark:border-ink-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <KeyRound size={15} className="text-brand-500" />
              Organization Invite Code
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Share this code with team members. Once they sign up, they can enter this code to manage this warehouse.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-ink-900 border border-slate-300 dark:border-ink-600 font-mono text-base font-bold tracking-widest text-brand-600 dark:text-brand-400 shadow-inner">
              {activeOrg?.code || '—'}
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={handleCopyCode}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
            {isOrgAdmin && (
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={handleRegenerateCode}
                disabled={regenerating}
                title="Regenerate code if compromised"
              >
                {regenerating ? '…' : 'Reset'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Organization Team Members Management */}
      <Card padded={false} className="pt-5 overflow-hidden">
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardHeader
                title="Organization Team Members"
                subtitle="Staff members who have joined this warehouse database using your invite code"
                icon={Users}
              />
            </div>
            <span className="text-xs bg-slate-100 dark:bg-ink-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium">
              {membersList.length} Member{membersList.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead>
              <tr className="border-y border-slate-200 dark:border-ink-700 bg-slate-50/50 dark:bg-ink-800/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                <th className="py-3 px-5">Team Member</th>
                <th className="py-3 px-5">Warehouse Role</th>
                <th className="py-3 px-5">Database Access Permissions</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-ink-700">
              {membersList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-xs text-slate-400">
                    No other members have joined yet. Share your organization invite code to collaborate!
                  </td>
                </tr>
              ) : (
                membersList.map((m) => {
                  const mId = m.userId?._id || m.userId || m.user?._id || m.user
                  const mName = m.name || m.user?.name || 'Team Member'
                  const mEmail = m.email || m.user?.email || ''
                  const isSelf = mId === user?.id || mId === user?._id
                  const isOwner = activeOrg?.owner?._id === mId || activeOrg?.owner === mId

                  return (
                    <tr key={mId} className="hover:bg-slate-50/60 dark:hover:bg-ink-800/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {mName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              {mName}
                              {isSelf && <span className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 px-1.5 py-0.5 rounded font-normal">You</span>}
                              {isOwner && <span className="text-[10px] bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 px-1.5 py-0.5 rounded font-normal">Owner</span>}
                            </p>
                            <p className="text-xs text-slate-400">{mEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <RoleBadge role={m.role} />
                      </td>

                      <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400">
                        {m.role === 'admin' ? (
                          <span className="text-brand-600 dark:text-brand-400 font-medium">Full Admin (Manage bays, products &amp; team)</span>
                        ) : m.role === 'manager' ? (
                          <span className="text-teal-600 dark:text-teal-400 font-medium">Write &amp; Edit (Add items, adjust stock, manage bays)</span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">Read-Only (View inventory &amp; storage status)</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isOrgAdmin && !isOwner && !isSelf && (
                            <select
                              value={m.role}
                              disabled={updatingId === mId}
                              onChange={(e) => handleRoleChange(mId, e.target.value, mName)}
                              className="text-xs rounded-lg border border-slate-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            >
                              <option value="viewer">Viewer (Read-Only)</option>
                              <option value="manager">Manager (Write/Edit)</option>
                              <option value="admin">Administrator (Full)</option>
                            </select>
                          )}

                          {isOrgAdmin && !isOwner && !isSelf && (
                            <button
                              onClick={() => setDeleteTarget({ userId: mId, name: mName })}
                              title="Remove from organization"
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 size={13} />
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
        <CardHeader title="User Profile" subtitle="Your account credentials" icon={Building2} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <TextField label="Email Address" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <TextField label="Assigned Warehouse Role" disabled value={profile.role} onChange={() => {}} />
          <TextField label="Active Warehouse" disabled value={profile.warehouse} onChange={() => {}} />
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-ink-700 flex justify-end">
          <Button icon={Save} onClick={() => addToast('Profile updated')}>Save Profile</Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader title="Notifications" subtitle="Warehouse alert preferences" icon={Bell} />
        <div className="space-y-1">
          {[
            { key: 'lowStock', label: 'Low stock alerts', desc: 'Get alerted when product stock falls below the minimum threshold' },
            { key: 'outOfStock', label: 'Out-of-stock notices', desc: 'Instant alerts when stock levels hit zero' },
            { key: 'dailySummary', label: 'Daily summary digests', desc: 'Daily rundown of stock movements and bay utilization' },
            { key: 'newCustomers', label: 'New customer activity', desc: 'Notifications when customer profiles are registered' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0 border-slate-100 dark:border-ink-700">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <Toggle
                label={item.label}
                checked={notifications[item.key]}
                onChange={(v) => setNotifications({ ...notifications, [item.key]: v })}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-ink-700 flex justify-end">
          <Button icon={Save} onClick={() => addToast('Preferences saved')}>Save Preferences</Button>
        </div>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleRemoveMember}
        title="Remove team member from warehouse?"
        message={`Are you sure you want to remove ${deleteTarget?.name}? They will lose access to this warehouse database.`}
        confirmLabel="Remove Member"
      />
    </div>
  )
}
