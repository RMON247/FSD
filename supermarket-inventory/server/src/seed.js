import 'dotenv/config'
import { connectDB } from './config/db.js'
import Product from './models/Product.js'
import Storage from './models/Storage.js'
import Customer from './models/Customer.js'
import Transaction from './models/Transaction.js'
import User from './models/User.js'
import mongoose from 'mongoose'

const storageLocations = [
  { name: 'Cold Storage A', location: 'Building A, Bay 1', type: 'Refrigerated', capacity: 5000, used: 3820 },
  { name: 'Freezer Vault A', location: 'Building A, Bay 2', type: 'Frozen', capacity: 3200, used: 2990 },
  { name: 'Dry Goods Aisle B', location: 'Building B, Bay 1', type: 'Ambient', capacity: 8000, used: 4310 },
  { name: 'Bakery Staging B', location: 'Building B, Bay 2', type: 'Ambient', capacity: 2000, used: 640 },
  { name: 'Beverage Depot C', location: 'Building C, Bay 1', type: 'Ambient', capacity: 6000, used: 5940 },
  { name: 'Household Overflow C', location: 'Building C, Bay 2', type: 'Ambient', capacity: 4500, used: 1120 }
]

const productSeed = [
  ['Vine-Ripened Tomatoes', 'Produce', 2.49, 'kg', 420, 100],
  ['Organic Baby Spinach', 'Produce', 3.99, 'bag', 65, 80],
  ['Hass Avocados', 'Produce', 1.79, 'each', 310, 120],
  ['Free-Range Whole Eggs (12ct)', 'Dairy & Eggs', 4.29, 'carton', 210, 90],
  ['Whole Milk 1 Gallon', 'Dairy & Eggs', 3.59, 'jug', 18, 60],
  ['Aged Cheddar Cheese Block', 'Dairy & Eggs', 6.99, 'block', 145, 40],
  ['Greek Yogurt 32oz', 'Dairy & Eggs', 5.49, 'tub', 0, 50],
  ['Sourdough Loaf', 'Bakery', 4.49, 'loaf', 88, 40],
  ['Butter Croissants (6ct)', 'Bakery', 5.99, 'pack', 32, 35],
  ['Atlantic Salmon Fillet', 'Meat & Seafood', 12.99, 'kg', 74, 40],
  ['Boneless Chicken Breast', 'Meat & Seafood', 8.49, 'kg', 190, 100],
  ['Ground Beef 80/20', 'Meat & Seafood', 7.29, 'kg', 8, 60],
  ['Frozen Mixed Vegetables', 'Frozen Foods', 2.99, 'bag', 260, 100],
  ['Vanilla Bean Ice Cream 1.5L', 'Frozen Foods', 5.99, 'tub', 3, 45],
  ['Sparkling Water 12-pack', 'Beverages', 5.49, 'pack', 410, 120],
  ['Cold Brew Coffee 1L', 'Beverages', 4.99, 'bottle', 0, 40],
  ['Kettle-Cooked Potato Chips', 'Snacks', 3.49, 'bag', 320, 100],
  ['Dark Chocolate Almonds', 'Snacks', 5.29, 'bag', 6, 30],
  ['Extra Virgin Olive Oil 1L', 'Pantry & Dry Goods', 9.99, 'bottle', 128, 40],
  ['Penne Pasta 500g', 'Pantry & Dry Goods', 1.99, 'box', 510, 150],
  ['Laundry Detergent 3L', 'Household', 12.99, 'bottle', 58, 30],
  ['Paper Towels (8 rolls)', 'Household', 9.49, 'pack', 240, 80],
  ['Bamboo Toothbrush 2-pack', 'Personal Care', 4.99, 'pack', 70, 30],
  ['SPF 50 Sunscreen', 'Personal Care', 8.49, 'tube', 48, 25]
]

const customerSeed = [
  ['Amara Osei', 'amara.osei@mail.com', '+1 (555) 200-1000', 'Active'],
  ['Liam Chen', 'liam.chen@mail.com', '+1 (555) 201-1007', 'VIP'],
  ['Sofia Rossi', 'sofia.rossi@mail.com', '+1 (555) 202-1014', 'Active'],
  ['Noah Garcia', 'noah.garcia@mail.com', '+1 (555) 203-1021', 'Inactive'],
  ['Priya Sharma', 'priya.sharma@mail.com', '+1 (555) 204-1028', 'Active'],
  ['Ethan Novak', 'ethan.novak@mail.com', '+1 (555) 205-1035', 'VIP']
]

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not set in server/.env — cannot seed.')
    process.exit(1)
  }

  await connectDB(uri)

  console.log('Clearing existing collections…')
  await Promise.all([
    Product.deleteMany({}),
    Storage.deleteMany({}),
    Customer.deleteMany({}),
    Transaction.deleteMany({})
  ])

  console.log('Seeding storage locations…')
  const storageDocs = await Storage.insertMany(storageLocations)

  console.log('Seeding products…')
  const productDocs = await Product.insertMany(
    productSeed.map(([name, category, price, unit, quantity, minStock], i) => ({
      name,
      category,
      price,
      unit,
      quantity,
      minStock,
      sku: `${category.slice(0, 2).toUpperCase()}${1000 + i}`,
      storageId: storageDocs[i % storageDocs.length].id
    }))
  )

  console.log('Seeding customers…')
  await Customer.insertMany(
    customerSeed.map(([name, email, phone, status], i) => ({
      name,
      email,
      phone,
      status,
      totalPurchases: Math.round((Math.random() * 2000 + 100) * 100) / 100,
      orderCount: Math.floor(Math.random() * 10) + 1
    }))
  )

  console.log('Seeding sample transactions…')
  await Transaction.insertMany(
    productDocs.slice(0, 10).map((p, i) => ({
      type: i % 3 === 0 ? 'Stock Out' : 'Stock In',
      productId: p._id,
      productName: p.name,
      sku: p.sku,
      quantity: Math.floor(Math.random() * 60) + 10,
      reason: i % 3 === 0 ? 'Store Replenishment' : 'Supplier Restock',
      storageId: p.storageId,
      user: 'Seed Script'
    }))
  )

  const existingAdmin = await User.findOne({ email: 'admin@stockyard.com' })
  if (!existingAdmin) {
    console.log('Creating default admin user (admin@stockyard.com / Password123)…')
    await User.create({ name: 'Maria Winters', email: 'admin@stockyard.com', password: 'Password123', role: 'admin' })
  }

  console.log('✓ Seed complete:', productDocs.length, 'products,', storageDocs.length, 'storage locations.')
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
