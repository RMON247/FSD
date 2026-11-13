import { Routes, Route } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import Layout from './components/layout/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Storage from './pages/Storage.jsx'
import Inventory from './pages/Inventory.jsx'
import Products from './pages/Products.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Customers from './pages/Customers.jsx'
import Transactions from './pages/Transactions.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import NotFound from './pages/NotFound.jsx'
import LandingLogin from './pages/LandingLogin.jsx'
import WarehouseSetup from './pages/WarehouseSetup.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { useOrg } from './context/OrgContext.jsx'
import { useData } from './context/DataContext.jsx'
import { Loading } from './components/ui/States.jsx'

export default function App() {
  const { isAuthenticated } = useAuth()
  const { organizations, activeOrgId, loadingOrgs } = useOrg()
  const { loading, error } = useData()

  // 1. Unauthenticated users see the clean professional Landing & Sign-in page
  if (!isAuthenticated) {
    return <LandingLogin />
  }

  // 2. Loading organization memberships
  if (loadingOrgs) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-ink-950 flex items-center justify-center">
        <Loading label="Loading warehouse workspaces…" />
      </div>
    )
  }

  // 3. If the user doesn't belong to any organization yet, guide them to Create or Join
  if (organizations.length === 0 || !activeOrgId) {
    return <WarehouseSetup />
  }

  // 4. Authenticated users with active organization warehouse
  return (
    <Layout>
      {error && (
        <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle size={17} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-800 dark:text-rose-300">
            <span className="font-medium">Couldn&rsquo;t reach the backend.</span> {error} — verify the API server is active and accessible.
          </p>
        </div>
      )}
      {loading ? (
        <Loading label="Loading warehouse database…" full />
      ) : (
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </Layout>
  )
}
