import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, ClipboardCheck, LayoutDashboard, LogOut, PanelLeftClose, Users, UserCircle } from 'lucide-react'
import { useAuth } from '../lib/useAuth'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
  { to: '/students', label: 'Students', icon: Users, roles: ['admin', 'teacher'] },
  { to: '/subjects', label: 'Subjects', icon: BookOpen, roles: ['admin', 'teacher'] },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck, roles: ['admin', 'teacher', 'student'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'teacher', 'student'] },
  { to: '/profile', label: 'Profile', icon: UserCircle, roles: ['admin', 'teacher', 'student'] },
]

export default function Sidebar({ open, onClose }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const demoRole = sessionStorage.getItem('attendance-demo-role')
  const role = profile?.role || demoRole || 'admin'
  const name = profile?.full_name || (role === 'student' ? 'Demo Student' : role === 'teacher' ? 'Demo Teacher' : 'Demo Admin')
  async function logout() { await signOut(); sessionStorage.removeItem('attendance-demo-role'); navigate('/login') }
  return <><div className={`sidebar-scrim ${open ? 'visible' : ''}`} onClick={onClose}/><aside className={`app-sidebar ${open ? 'sidebar-open' : ''}`}>
    <div className="sidebar-brand"><span className="brand-emblem">N</span><span><b>Northstar</b><small>COLLEGE PORTAL</small></span><button className="sidebar-close" onClick={onClose} aria-label="Close menu"><PanelLeftClose size={18}/></button></div>
    <div className="institution-label">ACADEMIC WORKSPACE</div>
    <nav className="sidebar-nav">{links.filter((item) => item.roles.includes(role)).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `side-link ${isActive ? 'selected' : ''}`}><Icon size={17} strokeWidth={1.8}/><span>{label}</span></NavLink>)}</nav>
    <div className="sidebar-bottom"><div className="sidebar-help"><span className="help-icon">✦</span><b>Need a hand?</b><p>Visit the student and staff support desk for help.</p><a href="mailto:support@northstar.edu">Contact support <span>↗</span></a></div><div className="sidebar-user"><div className="user-initials">{name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><span className="sidebar-user-name"><b>{name}</b><small>{role}</small></span><button title="Log out" onClick={logout} aria-label="Log out"><LogOut size={16}/></button></div></div>
  </aside></>
}
