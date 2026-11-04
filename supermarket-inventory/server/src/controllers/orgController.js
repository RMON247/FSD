import Organization, { generateInviteCode } from '../models/Organization.js'
import Storage from '../models/Storage.js'
import User from '../models/User.js'

export async function listUserOrganizations(req, res, next) {
  try {
    const orgs = await Organization.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ updatedAt: -1 })

    const formatted = orgs.map((org) => {
      const userRole = org.getUserRole(req.user.id)
      return {
        id: org._id,
        _id: org._id,
        name: org.name,
        code: org.code,
        description: org.description,
        location: org.location,
        isOwner: org.owner._id.toString() === req.user.id,
        owner: org.owner,
        memberCount: org.members.length,
        userRole,
        createdAt: org.createdAt
      }
    })

    res.json({ count: formatted.length, organizations: formatted })
  } catch (err) {
    next(err)
  }
}

export async function createOrganization(req, res, next) {
  try {
    const { name, description, location } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Warehouse organization name is required.' })
    }

    // Generate guaranteed unique code
    let code = generateInviteCode()
    let attempts = 0
    while (await Organization.exists({ code }) && attempts < 10) {
      code = generateInviteCode()
      attempts++
    }

    const org = await Organization.create({
      name: name.trim(),
      code,
      description: description ? description.trim() : '',
      location: location ? location.trim() : 'Main Warehouse',
      owner: req.user.id,
      members: [
        { user: req.user.id, role: 'admin', joinedAt: new Date() }
      ]
    })

    // Seed initial default storage bays for the new organization warehouse
    await Storage.insertMany([
      { organizationId: org._id, name: 'Main Ambient Floor', location: `${org.name} - Bay 1`, type: 'Ambient', capacity: 5000, used: 0 },
      { organizationId: org._id, name: 'Refrigerated Cold Room', location: `${org.name} - Bay 2`, type: 'Refrigerated', capacity: 3000, used: 0 },
      { organizationId: org._id, name: 'Deep Freeze Bay', location: `${org.name} - Bay 3`, type: 'Frozen', capacity: 2000, used: 0 }
    ])

    // Update current org on user
    await User.findByIdAndUpdate(req.user.id, { currentOrganizationId: org._id })

    const populated = await Organization.findById(org._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email')

    res.status(201).json({
      organization: {
        id: populated._id,
        _id: populated._id,
        name: populated.name,
        code: populated.code,
        description: populated.description,
        location: populated.location,
        isOwner: true,
        userRole: 'admin',
        owner: populated.owner,
        members: populated.members,
        memberCount: populated.members.length
      },
      message: `Organization "${org.name}" created successfully with invite code ${org.code}.`
    })
  } catch (err) {
    next(err)
  }
}

export async function joinOrganization(req, res, next) {
  try {
    const { code } = req.body
    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Organization invite code is required.' })
    }

    const cleanCode = code.trim().toUpperCase()
    const org = await Organization.findOne({ code: cleanCode })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')

    if (!org) {
      return res.status(404).json({
        message: `No organization found with code "${cleanCode}". Please verify the code with your administrator.`
      })
    }

    const userIdStr = req.user.id.toString()
    const alreadyMember = org.isMember(userIdStr)

    if (!alreadyMember) {
      org.members.push({
        user: req.user.id,
        role: 'manager',
        joinedAt: new Date()
      })
      await org.save()
    }

    await User.findByIdAndUpdate(req.user.id, { currentOrganizationId: org._id })

    const updated = await Organization.findById(org._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email')

    res.json({
      organization: {
        id: updated._id,
        _id: updated._id,
        name: updated.name,
        code: updated.code,
        description: updated.description,
        location: updated.location,
        isOwner: updated.owner._id.toString() === userIdStr,
        userRole: updated.getUserRole(req.user.id),
        owner: updated.owner,
        members: updated.members,
        memberCount: updated.members.length
      },
      message: alreadyMember
        ? `Switched to "${org.name}".`
        : `Successfully joined "${org.name}" warehouse database!`
    })
  } catch (err) {
    next(err)
  }
}

export async function getOrganizationDetails(req, res, next) {
  try {
    const org = await Organization.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email')

    if (!org) return res.status(404).json({ message: 'Organization not found.' })

    if (!org.isMember(req.user.id)) {
      return res.status(403).json({ message: 'Access denied: You do not belong to this organization.' })
    }

    const isOwner = org.owner._id.toString() === req.user.id
    const userRole = org.getUserRole(req.user.id)

    res.json({
      organization: {
        id: org._id,
        _id: org._id,
        name: org.name,
        code: org.code,
        description: org.description,
        location: org.location,
        isOwner,
        userRole,
        owner: org.owner,
        members: org.members.map((m) => ({
          userId: m.user?._id || m.user,
          name: m.user?.name || 'Unknown',
          email: m.user?.email || '',
          role: m.role,
          joinedAt: m.joinedAt
        })),
        memberCount: org.members.length
      }
    })
  } catch (err) {
    next(err)
  }
}

export async function regenerateInviteCode(req, res, next) {
  try {
    const org = await Organization.findById(req.params.id)
    if (!org) return res.status(404).json({ message: 'Organization not found.' })

    const role = org.getUserRole(req.user.id)
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Only organization administrators can regenerate the invite code.' })
    }

    let newCode = generateInviteCode()
    let attempts = 0
    while (await Organization.exists({ code: newCode }) && attempts < 10) {
      newCode = generateInviteCode()
      attempts++
    }

    org.code = newCode
    await org.save()

    res.json({
      code: org.code,
      message: `Organization invite code regenerated: ${org.code}. Share this with new team members.`
    })
  } catch (err) {
    next(err)
  }
}

export async function updateMemberRole(req, res, next) {
  try {
    const { role } = req.body
    if (!['admin', 'manager', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Role must be admin, manager, or viewer.' })
    }

    const org = await Organization.findById(req.params.id)
    if (!org) return res.status(404).json({ message: 'Organization not found.' })

    const currentRole = org.getUserRole(req.user.id)
    if (currentRole !== 'admin') {
      return res.status(403).json({ message: 'Only organization administrators can update member roles.' })
    }

    const targetUserId = req.params.userId
    if (org.owner.toString() === targetUserId && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot demote the organization owner.' })
    }

    const member = org.members.find((m) => m.user.toString() === targetUserId)
    if (!member) {
      return res.status(404).json({ message: 'User is not a member of this organization.' })
    }

    member.role = role
    await org.save()

    res.json({ message: `Member role updated to ${role}.` })
  } catch (err) {
    next(err)
  }
}

export async function removeMember(req, res, next) {
  try {
    const org = await Organization.findById(req.params.id)
    if (!org) return res.status(404).json({ message: 'Organization not found.' })

    const targetUserId = req.params.userId
    const isSelf = targetUserId === req.user.id
    const currentRole = org.getUserRole(req.user.id)

    if (!isSelf && currentRole !== 'admin') {
      return res.status(403).json({ message: 'Only organization administrators can remove members.' })
    }

    if (org.owner.toString() === targetUserId) {
      return res.status(400).json({ message: 'Organization owner cannot be removed.' })
    }

    org.members = org.members.filter((m) => m.user.toString() !== targetUserId)
    await org.save()

    res.json({ message: isSelf ? 'You have left the organization.' : 'Member removed from organization.' })
  } catch (err) {
    next(err)
  }
}
