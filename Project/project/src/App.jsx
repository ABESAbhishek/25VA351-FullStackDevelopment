import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext.jsx'
import { useAuth } from './lib/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import LoadingSpinner from './components/LoadingSpinner'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Students = lazy(() => import('./pages/Students'))
const Subjects = lazy(() => import('./pages/Subjects'))
const Attendance = lazy(() => import('./pages/Attendance'))
const Reports = lazy(() => import('./pages/Reports'))
const Profile = lazy(() => import('./pages/Profile'))

export default function App() {
  return <BrowserRouter><AuthProvider><Suspense fallback={<LoadingSpinner label="Opening your workspace…"/>}><Routes>
    <Route path="/login" element={<Login/>}/>
    <Route element={<ProtectedRoute/>}><Route element={<DashboardLayout/>}>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route element={<ProtectedRoute roles={['admin','teacher']}/> }><Route path="/students" element={<Students/>}/><Route path="/subjects" element={<Subjects/>}/></Route>
      <Route element={<ProtectedRoute roles={['admin','teacher','student']}/> }><Route path="/attendance" element={<Attendance/>}/><Route path="/reports" element={<Reports/>}/><Route path="/profile" element={<Profile/>}/></Route>
    </Route></Route>
    <Route path="/" element={<RootRedirect/>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/>
  </Routes></Suspense></AuthProvider></BrowserRouter>
}

function RootRedirect() {
  const { loading, profile } = useAuth()
  const demo = sessionStorage.getItem('attendance-demo-role')
  if (loading) return null
  return <Navigate to={profile || demo ? '/dashboard' : '/login'} replace/>
}
