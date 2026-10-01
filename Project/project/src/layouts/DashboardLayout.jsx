import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="layout-shell"><Sidebar open={menuOpen} onClose={() => setMenuOpen(false)}/><div className="layout-main"><Navbar onMenu={() => setMenuOpen(true)}/>{!import.meta.env.VITE_SUPABASE_URL && <div className="demo-notice"><span>DEMO MODE</span> Connect Supabase credentials to load and save real college records.</div>}<main className="page-main"><div className="page-container"><OutletContent/></div></main></div></div>
}

import { Outlet as OutletContent } from 'react-router-dom'
