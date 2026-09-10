// Centralized dummy/mock data.
// Swap these arrays out for real API calls when a backend is connected —
// the shape of each object is designed to map cleanly onto typical REST/DB fields.

export const categories = [
  'Produce', 'Dairy & Eggs', 'Bakery', 'Meat & Seafood', 'Frozen Foods',
  'Beverages', 'Snacks', 'Pantry & Dry Goods', 'Household', 'Personal Care'
]

export const suppliers = [
  { id: 'SUP-001', name: 'Greenfield Farms Co-op', contact: 'orders@greenfieldfarms.com' },
  { id: 'SUP-002', name: 'Dairy Valley Distributors', contact: 'sales@dairyvalley.com' },
  { id: 'SUP-003', name: 'Coastal Seafood Ltd.', contact: 'supply@coastalseafood.com' },
  { id: 'SUP-004', name: 'Golden Wheat Bakeries', contact: 'wholesale@goldenwheat.com' },
  { id: 'SUP-005', name: 'Frostline Frozen Goods', contact: 'orders@frostline.com' },
  { id: 'SUP-006', name: 'Northstar Beverage Co.', contact: 'b2b@northstarbev.com' },
  { id: 'SUP-007', name: 'PureHome Household Supplies', contact: 'sales@purehome.com' },
  { id: 'SUP-008', name: 'Harvest Snack Works', contact: 'orders@harvestsnacks.com' }
]

export const storageLocations = [
  {
    id: 'WH-A1',
    name: 'Cold Storage A',
    location: 'Building A, Bay 1',
    type: 'Refrigerated',
    capacity: 5000,
    used: 3820,
    status: 'Active'
  },
  {
    id: 'WH-A2',
    name: 'Freezer Vault A',
    location: 'Building A, Bay 2',
    type: 'Frozen',
    capacity: 3200,
    used: 2990,
    status: 'Near Capacity'
  },
  {
    id: 'WH-B1',
    name: 'Dry Goods Aisle B',
    location: 'Building B, Bay 1',
    type: 'Ambient',
    capacity: 8000,
    used: 4310,
    status: 'Active'
  },
  {
    id: 'WH-B2',
    name: 'Bakery Staging B',
    location: 'Building B, Bay 2',
    type: 'Ambient',
    capacity: 2000,
    used: 640,
    status: 'Active'
  },
  {
    id: 'WH-C1',
    name: 'Beverage Depot C',
    location: 'Building C, Bay 1',
    type: 'Ambient',
    capacity: 6000,
    used: 5940,
    status: 'Near Capacity'
  },
  {
    id: 'WH-C2',
    name: 'Household Overflow C',
    location: 'Building C, Bay 2',
    type: 'Ambient',
    capacity: 4500,
    used: 1120,
    status: 'Active'
  },
  {
    id: 'WH-D1',
    name: 'Receiving Dock D',
    location: 'Building D, Dock 1',
    type: 'Staging',
    capacity: 1500,
    used: 1500,
    status: 'Full'
  },
  {
    id: 'WH-D2',
    name: 'Returns & Quarantine D',
    location: 'Building D, Dock 2',
    type: 'Staging',
    capacity: 800,
    used: 95,
    status: 'Inactive'
  }
]

const productSeed = [
  ['Vine-Ripened Tomatoes', 'Produce', 'SUP-001', 2.49, 'kg', 420, 100, 'WH-B1'],
  ['Organic Baby Spinach', 'Produce', 'SUP-001', 3.99, 'bag', 65, 80, 'WH-A1'],
  ['Hass Avocados', 'Produce', 'SUP-001', 1.79, 'each', 310, 120, 'WH-B1'],
  ['Navel Oranges', 'Produce', 'SUP-001', 0.99, 'kg', 540, 150, 'WH-B1'],
  ['Free-Range Whole Eggs (12ct)', 'Dairy & Eggs', 'SUP-002', 4.29, 'carton', 210, 90, 'WH-A1'],
  ['Whole Milk 1 Gallon', 'Dairy & Eggs', 'SUP-002', 3.59, 'jug', 18, 60, 'WH-A1'],
  ['Aged Cheddar Cheese Block', 'Dairy & Eggs', 'SUP-002', 6.99, 'block', 145, 40, 'WH-A1'],
  ['Greek Yogurt 32oz', 'Dairy & Eggs', 'SUP-002', 5.49, 'tub', 0, 50, 'WH-A1'],
  ['Sourdough Loaf', 'Bakery', 'SUP-004', 4.49, 'loaf', 88, 40, 'WH-B2'],
  ['Butter Croissants (6ct)', 'Bakery', 'SUP-004', 5.99, 'pack', 32, 35, 'WH-B2'],
  ['Whole Wheat Bread', 'Bakery', 'SUP-004', 3.29, 'loaf', 12, 45, 'WH-B2'],
  ['Cinnamon Raisin Bagels (6ct)', 'Bakery', 'SUP-004', 4.19, 'pack', 54, 30, 'WH-B2'],
  ['Atlantic Salmon Fillet', 'Meat & Seafood', 'SUP-003', 12.99, 'kg', 74, 40, 'WH-A1'],
  ['Boneless Chicken Breast', 'Meat & Seafood', 'SUP-003', 8.49, 'kg', 190, 100, 'WH-A1'],
  ['Ground Beef 80/20', 'Meat & Seafood', 'SUP-003', 7.29, 'kg', 8, 60, 'WH-A1'],
  ['Jumbo Shrimp (peeled)', 'Meat & Seafood', 'SUP-003', 14.99, 'bag', 40, 35, 'WH-A2'],
  ['Frozen Mixed Vegetables', 'Frozen Foods', 'SUP-005', 2.99, 'bag', 260, 100, 'WH-A2'],
  ['Frozen Margherita Pizza', 'Frozen Foods', 'SUP-005', 6.49, 'each', 95, 60, 'WH-A2'],
  ['Vanilla Bean Ice Cream 1.5L', 'Frozen Foods', 'SUP-005', 5.99, 'tub', 3, 45, 'WH-A2'],
  ['Frozen Chicken Nuggets', 'Frozen Foods', 'SUP-005', 4.79, 'bag', 130, 55, 'WH-A2'],
  ['Sparkling Water 12-pack', 'Beverages', 'SUP-006', 5.49, 'pack', 410, 120, 'WH-C1'],
  ['Cold Brew Coffee 1L', 'Beverages', 'SUP-006', 4.99, 'bottle', 0, 40, 'WH-C1'],
  ['Orange Juice 1.75L', 'Beverages', 'SUP-006', 4.29, 'bottle', 62, 50, 'WH-C1'],
  ['Craft Root Beer 6-pack', 'Beverages', 'SUP-006', 6.99, 'pack', 205, 60, 'WH-C1'],
  ['Kettle-Cooked Potato Chips', 'Snacks', 'SUP-008', 3.49, 'bag', 320, 100, 'WH-B1'],
  ['Trail Mix Family Size', 'Snacks', 'SUP-008', 7.99, 'bag', 44, 35, 'WH-B1'],
  ['Dark Chocolate Almonds', 'Snacks', 'SUP-008', 5.29, 'bag', 6, 30, 'WH-B1'],
  ['Pretzel Sticks', 'Snacks', 'SUP-008', 2.79, 'bag', 190, 70, 'WH-B1'],
  ['Extra Virgin Olive Oil 1L', 'Pantry & Dry Goods', 'SUP-001', 9.99, 'bottle', 128, 40, 'WH-B1'],
  ['Basmati Rice 5kg', 'Pantry & Dry Goods', 'SUP-001', 11.49, 'bag', 76, 30, 'WH-B1'],
  ['Penne Pasta 500g', 'Pantry & Dry Goods', 'SUP-001', 1.99, 'box', 510, 150, 'WH-B1'],
  ['Canned Black Beans', 'Pantry & Dry Goods', 'SUP-001', 1.29, 'can', 0, 100, 'WH-B1'],
  ['Laundry Detergent 3L', 'Household', 'SUP-007', 12.99, 'bottle', 58, 30, 'WH-C2'],
  ['Paper Towels (8 rolls)', 'Household', 'SUP-007', 9.49, 'pack', 240, 80, 'WH-C2'],
  ['Dish Soap 750ml', 'Household', 'SUP-007', 3.49, 'bottle', 15, 40, 'WH-C2'],
  ['Trash Bags 13-Gallon (40ct)', 'Household', 'SUP-007', 8.99, 'box', 92, 40, 'WH-C2'],
  ['Bamboo Toothbrush 2-pack', 'Personal Care', 'SUP-007', 4.99, 'pack', 70, 30, 'WH-C2'],
  ['Moisturizing Body Wash', 'Personal Care', 'SUP-007', 5.99, 'bottle', 2, 30, 'WH-C2'],
  ['SPF 50 Sunscreen', 'Personal Care', 'SUP-007', 8.49, 'tube', 48, 25, 'WH-C2'],
  ['Herbal Shampoo 400ml', 'Personal Care', 'SUP-007', 6.49, 'bottle', 33, 30, 'WH-C2']
]

export const products = productSeed.map(([name, category, supplierId, price, unit, quantity, minStock, storageId], i) => {
  const id = `PRD-${String(i + 1).padStart(4, '0')}`
  const sku = `${category.slice(0, 2).toUpperCase()}${String(1000 + i)}`
  let status = 'In Stock'
  if (quantity === 0) status = 'Out of Stock'
  else if (quantity <= minStock) status = 'Low Stock'
  return {
    id,
    sku,
    name,
    category,
    supplierId,
    price,
    unit,
    quantity,
    minStock,
    storageId,
    status,
    value: Number((price * quantity).toFixed(2)),
    addedOn: new Date(2025, (i * 3) % 12, ((i * 7) % 27) + 1).toISOString()
  }
})

const firstNames = ['Amara', 'Liam', 'Sofia', 'Noah', 'Priya', 'Ethan', 'Zara', 'Mateo', 'Chloe', 'Kenji', 'Ines', 'Oscar', 'Maya', 'Leon', 'Ava', 'Ravi']
const lastNames = ['Osei', 'Chen', 'Rossi', 'Garcia', 'Sharma', 'Novak', 'Khalil', 'Silva', 'Fischer', 'Tanaka', 'Dubois', 'Larsen', 'Petrov', 'Adeyemi', 'Nguyen', 'Moretti']
const customerStatuses = ['Active', 'Active', 'Active', 'Inactive', 'VIP']

export const customers = Array.from({ length: 16 }).map((_, i) => {
  const first = firstNames[i]
  const last = lastNames[i]
  const totalPurchases = Math.round((Math.random() * 4200 + 120) * 100) / 100
  return {
    id: `CUST-${String(i + 1).padStart(4, '0')}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@mail.com`,
    phone: `+1 (555) ${String(200 + i).padStart(3, '0')}-${String(1000 + i * 7).slice(-4)}`,
    status: customerStatuses[i % customerStatuses.length],
    joinedOn: new Date(2024, (i * 2) % 12, ((i * 5) % 27) + 1).toISOString(),
    totalPurchases,
    orderCount: Math.floor(totalPurchases / 85) + 1,
    purchaseHistory: Array.from({ length: (i % 4) + 2 }).map((__, j) => {
      const product = products[(i * 3 + j * 5) % products.length]
      const qty = (j % 3) + 1
      return {
        id: `ORD-${String(i + 1).padStart(3, '0')}-${j + 1}`,
        product: product.name,
        quantity: qty,
        total: Number((product.price * qty).toFixed(2)),
        date: new Date(2025, (i + j) % 12, ((j * 9) % 27) + 1).toISOString()
      }
    })
  }
})

const users = ['A. Osei', 'M. Chen', 'S. Rossi', 'D. Garcia', 'K. Tanaka', 'System Auto-Reorder']
const reasons = {
  'Stock In': ['Purchase Order Received', 'Supplier Restock', 'Returned to Inventory', 'Inter-warehouse Transfer In'],
  'Stock Out': ['Store Replenishment', 'Customer Order Fulfilled', 'Damaged / Expired', 'Inter-warehouse Transfer Out']
}

export const transactions = Array.from({ length: 60 }).map((_, i) => {
  const product = products[i % products.length]
  const type = i % 5 === 0 ? 'Stock Out' : (i % 2 === 0 ? 'Stock In' : 'Stock Out')
  const quantity = Math.floor(Math.random() * 80) + 5
  const reasonList = reasons[type]
  const daysAgo = i * 3 + (i % 7)
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(8 + (i % 10), (i * 11) % 60)
  return {
    id: `TXN-${String(10245 + i)}`,
    type,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    quantity,
    date: date.toISOString(),
    user: users[i % users.length],
    reason: reasonList[i % reasonList.length],
    storageId: product.storageId
  }
}).sort((a, b) => new Date(b.date) - new Date(a.date))

export const stockTrend = [
  { month: 'Mar', in: 4200, out: 3650 },
  { month: 'Apr', in: 4800, out: 4100 },
  { month: 'May', in: 4400, out: 4700 },
  { month: 'Jun', in: 5100, out: 4550 },
  { month: 'Jul', in: 4950, out: 5200 },
  { month: 'Aug', in: 5400, out: 4900 }
]

export const categoryBreakdown = categories.map((cat) => {
  const catProducts = products.filter((p) => p.category === cat)
  return {
    category: cat,
    value: Number(catProducts.reduce((sum, p) => sum + p.value, 0).toFixed(2)),
    units: catProducts.reduce((sum, p) => sum + p.quantity, 0)
  }
})
