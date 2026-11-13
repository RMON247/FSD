import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

import { connectDB } from './config/db.js'
import User from './models/User.js'
import Organization from './models/Organization.js'
import Product from './models/Product.js'
import Storage from './models/Storage.js'
import Customer from './models/Customer.js'
import Transaction from './models/Transaction.js'

async function migrate() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI missing')
    process.exit(1)
  }

  await connectDB(uri)
  console.log('Connected to MongoDB for organization migration...')

  // 1. Ensure admin user exists and is in good standing
  let admin = await User.findOne({ email: 'admin@stockyard.com' }).select('+password')
  if (!admin) {
    console.log('Creating admin user...')
    admin = await User.create({
      name: 'Maria Winters',
      email: 'admin@stockyard.com',
      password: 'Password123',
      role: 'admin',
      isVerified: true
    })
  } else {
    admin.isVerified = true
    admin.role = 'admin'
    admin.password = 'Password123' // reset so login with Password123 always works
    await admin.save()
    console.log('Admin account (admin@stockyard.com) updated and password reset to Password123.')
  }

  // Update all users in database so isVerified is true
  await User.updateMany({}, { $set: { isVerified: true } })

  // 2. Find or create default organization
  let defaultOrg = await Organization.findOne()
  if (!defaultOrg) {
    console.log('Creating initial Organization...')
    defaultOrg = await Organization.create({
      name: 'Central Warehouse & Store',
      code: 'STK-CENTRAL',
      description: 'Primary regional distribution warehouse and supermarket hub',
      location: 'Building A, Logistics Park',
      owner: admin._id,
      members: [
        { user: admin._id, role: 'admin', joinedAt: new Date() }
      ]
    })
    console.log(`Created default organization: "${defaultOrg.name}" (Code: ${defaultOrg.code})`)
  }

  // Ensure all existing users belong to at least this default organization as members
  const allUsers = await User.find()
  for (const u of allUsers) {
    if (!defaultOrg.isMember(u._id)) {
      defaultOrg.members.push({
        user: u._id,
        role: u.role === 'admin' ? 'admin' : 'manager',
        joinedAt: new Date()
      })
    }
  }
  await defaultOrg.save()
  console.log(`Updated organization members count: ${defaultOrg.members.length}`)

  // 3. Attach organizationId to any orphan products, storages, customers, transactions
  const pRes = await Product.updateMany(
    { $or: [{ organizationId: { $exists: false } }, { organizationId: null }] },
    { $set: { organizationId: defaultOrg._id } }
  )
  console.log(`Updated ${pRes.modifiedCount} products with organizationId.`)

  const sRes = await Storage.updateMany(
    { $or: [{ organizationId: { $exists: false } }, { organizationId: null }] },
    { $set: { organizationId: defaultOrg._id } }
  )
  console.log(`Updated ${sRes.modifiedCount} storage bays with organizationId.`)

  const cRes = await Customer.updateMany(
    { $or: [{ organizationId: { $exists: false } }, { organizationId: null }] },
    { $set: { organizationId: defaultOrg._id } }
  )
  console.log(`Updated ${cRes.modifiedCount} customers with organizationId.`)

  const tRes = await Transaction.updateMany(
    { $or: [{ organizationId: { $exists: false } }, { organizationId: null }] },
    { $set: { organizationId: defaultOrg._id } }
  )
  console.log(`Updated ${tRes.modifiedCount} transactions with organizationId.`)

  console.log('✓ Migration finished successfully!')
  await mongoose.disconnect()
  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
