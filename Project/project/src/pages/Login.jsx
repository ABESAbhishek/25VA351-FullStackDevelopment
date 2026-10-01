import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/useAuth'

export default function Login() {
  const { signIn, configured } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try { const profile = await signIn(email, password); if (!profile) throw new Error('Your account has no profile. Ask an administrator to finish account setup.'); navigate('/dashboard', { replace: true }) }
    catch (issue) { setError(issue.message || 'Could not sign in. Please try again.') }
    finally { setBusy(false) }
  }
  function demo(role) { sessionStorage.setItem('attendance-demo-role', role); navigate('/dashboard', { replace: true }) }
  return <main className="login-screen"><section className="login-brand-panel"><div className="login-brand"><span className="brand-emblem">N</span><span><b>Northstar</b><small>COLLEGE PORTAL</small></span></div><div className="login-message"><span className="login-overline">LEARNING, ACCOUNTED FOR</span><h1>Every class<br/>counts.</h1><p>A thoughtful space for students and educators to stay on top of every learning day.</p><div className="login-feature"><ShieldCheck size={17}/><span>Secure, role-based access for your campus community</span></div></div><span className="login-footer">NORTHSTAR COLLEGE · EST. 1984</span></section><section className="login-form-panel"><div className="login-form-wrap"><div className="login-form-icon"><GraduationCap size={23}/></div><span className="eyebrow">WELCOME BACK</span><h2>Sign in to your account</h2><p className="login-subtitle">Use your college email to continue to your workspace.</p>{error && <div className="form-error" role="alert">{error}</div>}<form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@northstar.edu" autoComplete="username" required/></label><label>Password<div className="password-wrap"><input type={showPassword?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required/><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label><button className="login-submit" disabled={busy}>{busy?'Signing in…':'Sign in'}<span>→</span></button></form>{!configured && <div className="demo-signin"><div><b>Just exploring?</b><span>Preview the portal with sample classroom data.</span></div><div className="demo-role-buttons">{['admin','teacher','student'].map((role)=><button key={role} onClick={()=>demo(role)}>Demo {role}</button>)}</div><small>Demo mode uses sample data. Real sign-in is available after Supabase setup.</small></div>}<div className="login-help">Having trouble signing in? <a href="mailto:support@northstar.edu">Contact support</a></div></div></section></main>
}
