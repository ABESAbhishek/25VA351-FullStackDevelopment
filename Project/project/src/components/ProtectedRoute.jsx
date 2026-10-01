import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'

export default function ProtectedRoute({ roles }) {
  const { loading, profile, configured } = useAuth()
  const demo = sessionStorage.getItem('attendance-demo-role')
  if (loading) return <div className="route-loading">Loading your workspace…</div>
  if (!profile && !(demo && !configured)) return <Navigate to="/login" replace />
  const role = profile?.role || demo
  if (roles && !roles.includes(role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
