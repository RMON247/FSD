import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth, API_URL } from './AuthContext.jsx'
import { useToast } from './ToastContext.jsx'

const OrgContext = createContext(null)

export function OrgProvider({ children }) {
  const { authHeader, isAuthenticated, user } = useAuth()
  const { addToast } = useToast()

  const [organizations, setOrganizations] = useState([])
  const [activeOrgId, setActiveOrgId] = useState(() => {
    return localStorage.getItem('stockyard-active-org-id') || null
  })
  const [activeOrgDetails, setActiveOrgDetails] = useState(null)
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  const refreshOrgs = useCallback(async () => {
    if (!isAuthenticated) {
      setOrganizations([])
      setActiveOrgId(null)
      setActiveOrgDetails(null)
      setLoadingOrgs(false)
      return
    }

    try {
      setLoadingOrgs(true)
      const res = await fetch(`${API_URL}/api/organizations`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      const data = await res.json()
      if (res.ok && data.organizations) {
        setOrganizations(data.organizations)

        // Determine which org should be active
        let targetId = activeOrgId
        const exists = data.organizations.some((o) => o.id === targetId || o._id === targetId)

        if (!exists || !targetId) {
          targetId = data.organizations[0]?.id || data.organizations[0]?._id || null
        }

        if (targetId) {
          setActiveOrgId(targetId)
          localStorage.setItem('stockyard-active-org-id', targetId)
        } else {
          setActiveOrgId(null)
          localStorage.removeItem('stockyard-active-org-id')
        }
      }
    } catch {
      // ignore network errors
    } finally {
      setLoadingOrgs(false)
    }
  }, [authHeader, isAuthenticated, activeOrgId])

  useEffect(() => {
    refreshOrgs()
  }, [isAuthenticated, authHeader])

  // Fetch full details of active organization whenever activeOrgId changes
  const fetchActiveDetails = useCallback(async (orgId) => {
    if (!orgId || !authHeader.Authorization) return
    try {
      const res = await fetch(`${API_URL}/api/organizations/${orgId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      const data = await res.json()
      if (res.ok && data.organization) {
        setActiveOrgDetails(data.organization)
      }
    } catch {
      // ignore
    }
  }, [authHeader])

  useEffect(() => {
    if (activeOrgId) {
      fetchActiveDetails(activeOrgId)
    } else {
      setActiveOrgDetails(null)
    }
  }, [activeOrgId, fetchActiveDetails])

  const activeOrg = useMemo(() => {
    if (!activeOrgId) return null
    const basic = organizations.find((o) => o.id === activeOrgId || o._id === activeOrgId)
    return activeOrgDetails || basic || null
  }, [organizations, activeOrgId, activeOrgDetails])

  const switchOrg = useCallback((orgId) => {
    setActiveOrgId(orgId)
    localStorage.setItem('stockyard-active-org-id', orgId)
    fetchActiveDetails(orgId)
    const org = organizations.find((o) => o.id === orgId || o._id === orgId)
    if (org) {
      addToast(`Switched warehouse to "${org.name}"`, 'info')
    }
  }, [organizations, fetchActiveDetails, addToast])

  const createOrg = useCallback(async ({ name, description, location, initSampleBays }) => {
    const res = await fetch(`${API_URL}/api/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify({ name, description, location, initSampleBays })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to create organization')

    const newOrg = data.organization
    setOrganizations((prev) => [newOrg, ...prev])
    setActiveOrgId(newOrg.id || newOrg._id)
    localStorage.setItem('stockyard-active-org-id', newOrg.id || newOrg._id)
    setActiveOrgDetails(newOrg)
    addToast(`Warehouse "${newOrg.name}" created! Invite code: ${newOrg.code}`, 'success')
    return newOrg
  }, [authHeader, addToast])

  const joinOrg = useCallback(async (code) => {
    const res = await fetch(`${API_URL}/api/organizations/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify({ code })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to join organization')

    const joined = data.organization
    setOrganizations((prev) => {
      const exists = prev.some((o) => o.id === joined.id || o._id === joined.id)
      if (exists) {
        return prev.map((o) => (o.id === joined.id || o._id === joined.id ? joined : o))
      }
      return [joined, ...prev]
    })
    setActiveOrgId(joined.id || joined._id)
    localStorage.setItem('stockyard-active-org-id', joined.id || joined._id)
    setActiveOrgDetails(joined)
    addToast(data.message || `Connected to warehouse "${joined.name}"!`, 'success')
    return joined
  }, [authHeader, addToast])

  const regenerateInviteCode = useCallback(async (orgId) => {
    const id = orgId || activeOrgId
    if (!id) return
    const res = await fetch(`${API_URL}/api/organizations/${id}/regenerate-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to regenerate code')

    setActiveOrgDetails((prev) => (prev ? { ...prev, code: data.code } : prev))
    setOrganizations((prev) => prev.map((o) => (o.id === id || o._id === id ? { ...o, code: data.code } : o)))
    addToast(data.message || `New code generated: ${data.code}`, 'success')
    return data.code
  }, [activeOrgId, authHeader, addToast])

  const updateMemberRole = useCallback(async (userId, role) => {
    if (!activeOrgId) return
    const res = await fetch(`${API_URL}/api/organizations/${activeOrgId}/members/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify({ role })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to update member role')

    await fetchActiveDetails(activeOrgId)
    addToast(data.message || 'Role updated successfully', 'success')
  }, [activeOrgId, authHeader, fetchActiveDetails, addToast])

  const removeMember = useCallback(async (userId) => {
    if (!activeOrgId) return
    const res = await fetch(`${API_URL}/api/organizations/${activeOrgId}/members/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to remove member')

    await fetchActiveDetails(activeOrgId)
    addToast(data.message || 'Member removed', 'info')
  }, [activeOrgId, authHeader, fetchActiveDetails, addToast])

  const userOrgRole = useMemo(() => {
    if (!activeOrg || !user) return 'viewer'
    if (activeOrg.isOwner) return 'admin'
    return activeOrg.userRole || 'manager'
  }, [activeOrg, user])

  const isOrgAdmin = userOrgRole === 'admin'
  const canOrgWrite = userOrgRole === 'admin' || userOrgRole === 'manager'

  const value = useMemo(() => ({
    organizations,
    activeOrg,
    activeOrgId,
    loadingOrgs,
    userOrgRole,
    isOrgAdmin,
    canOrgWrite,
    switchOrg,
    createOrg,
    joinOrg,
    refreshOrgs,
    regenerateInviteCode,
    updateMemberRole,
    removeMember,
    refetchOrgDetails: () => activeOrgId && fetchActiveDetails(activeOrgId)
  }), [
    organizations,
    activeOrg,
    activeOrgId,
    loadingOrgs,
    userOrgRole,
    isOrgAdmin,
    canOrgWrite,
    switchOrg,
    createOrg,
    joinOrg,
    refreshOrgs,
    regenerateInviteCode,
    updateMemberRole,
    removeMember,
    activeOrgId,
    fetchActiveDetails
  ])

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>
}

export function useOrg() {
  const ctx = useContext(OrgContext)
  if (!ctx) throw new Error('useOrg must be used within OrgProvider')
  return ctx
}
