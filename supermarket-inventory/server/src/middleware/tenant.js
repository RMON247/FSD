import Organization from '../models/Organization.js'

export async function requireOrganization(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    let orgId = req.headers['x-organization-id']
    let org = null

    if (orgId && orgId !== 'null' && orgId !== 'undefined') {
      org = await Organization.findById(orgId)
    }

    // Fallback: If no org header provided or invalid, check if user belongs to any organization
    if (!org) {
      org = await Organization.findOne({
        $or: [
          { owner: req.user.id },
          { 'members.user': req.user.id }
        ]
      })
    }

    if (!org) {
      return res.status(400).json({
        message: 'No warehouse organization found. Please create or join an organization first.',
        code: 'NO_ORGANIZATION'
      })
    }

    // Verify user belongs to this org
    if (!org.isMember(req.user.id)) {
      return res.status(403).json({
        message: 'Access denied: You are not an authorized member of this organization warehouse.',
        code: 'NOT_A_MEMBER'
      })
    }

    req.organization = org
    req.organizationId = org._id
    req.orgRole = org.getUserRole(req.user.id) || 'viewer'
    next()
  } catch (err) {
    next(err)
  }
}

export function requireOrgRole(...roles) {
  return (req, res, next) => {
    const role = req.orgRole
    if (!role || !roles.includes(role)) {
      const isWrite = roles.includes('admin') && roles.includes('manager')
      return res.status(403).json({
        message: isWrite
          ? 'Write permission required. Only organization administrators or managers can perform this action.'
          : 'Administrator privileges required for this organization.'
      })
    }
    next()
  }
}
