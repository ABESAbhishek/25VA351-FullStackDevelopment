import { useLocation } from 'react-router-dom'
import { Bell, Menu, Search } from 'lucide-react'
import { useAuth } from '../lib/useAuth'

const titles = { dashboard: 'Dashboard', students: 'Students', subjects: 'Subjects', attendance: 'Attendance', reports: 'Reports', profile: 'My profile' }
export default function Navbar({ onMenu }) {
  const location = useLocation()
  const { profile } = useAuth()
  const title = titles[location.pathname.split('/')[1]] || 'Dashboard'
  const name = profile?.full_name || ({ admin: 'Demo Admin', teacher: 'Demo Teacher', student: 'Demo Student' }[sessionStorage.getItem('attendance-demo-role')] || 'Workspace user')
  return <header className="top-nav"><button className="mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={20}/></button><div className="top-nav-title"><span>Northstar College</span><i>/</i><b>{title}</b></div><div className="top-nav-tools"><button className="nav-search" onClick={() => document.querySelector('[data-page-search]')?.focus()}><Search size={15}/><span>Search</span><kbd>⌘ K</kbd></button><button className="bell-button" aria-label="Notifications"><Bell size={18}/><i/></button><div className="nav-user"><span className="user-initials">{name.split(' ').map((part) => part[0]).slice(0,2).join('')}</span><span><b>{name}</b><small>{profile?.role || sessionStorage.getItem('attendance-demo-role') || 'staff'}</small></span></div></div></header>
}
