import { Link } from 'react-router-dom'
import { PackageX } from 'lucide-react'
import Button from '../components/ui/Button.jsx'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-ink-700 flex items-center justify-center text-slate-400 mb-4">
        <PackageX size={26} />
      </div>
      <h2 className="font-display text-lg font-semibold text-slate-800 dark:text-white">Page not found</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.</p>
      <Link to="/" className="mt-5"><Button>Back to Dashboard</Button></Link>
    </div>
  )
}
