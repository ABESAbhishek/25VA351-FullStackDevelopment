import { useEffect, useState } from 'react'
import { Activity, BookOpen, CalendarDays, ClipboardCheck, Users, UserRoundCheck } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import StatCard from '../components/StatCard'
import AttendanceBadge from '../components/AttendanceBadge'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../lib/useAuth'
import { supabase } from '../lib/supabase'
import { demoRecords, demoStudents, demoSubjects } from '../lib/demoData'
import { calculateAttendancePercentage } from '../lib/utils'

const trend = [{day:'Mon',present:88,absent:12},{day:'Tue',present:92,absent:8},{day:'Wed',present:84,absent:16},{day:'Thu',present:96,absent:4},{day:'Fri',present:90,absent:10}]

export default function Dashboard() {
  const { profile } = useAuth()
  const role = profile?.role || sessionStorage.getItem('attendance-demo-role') || 'admin'
  const [students, setStudents] = useState(demoStudents)
  const [subjects, setSubjects] = useState(demoSubjects)
  const [records, setRecords] = useState(demoRecords)
  const [error, setError] = useState('')
  const [todayLabel] = useState(() => new Intl.DateTimeFormat('en',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(new Date()).toUpperCase())
  useEffect(() => {
    if (!supabase) return
    let alive = true
    async function load() {
      const queries = [supabase.from('students').select('id,roll_number,enrollment_number,branch,section,semester,profiles(full_name,email)'), supabase.from('subjects').select('id,name,code,branch,semester,section,teachers(profiles(full_name))'), supabase.from('attendance').select('id,status,marked_at,students(roll_number,profiles(full_name)),classes(class_date,section,subjects(name,code))')]
      const results = await Promise.all(queries)
      const failure = results.find((result) => result.error)
      if (failure) { if (alive) setError(failure.error.message); return }
      if (alive) {
        const attendanceRows = results[2].data || []
        const roster = (results[0].data || []).map((student) => {
          const marks = attendanceRows.filter((mark) => mark.students?.roll_number === student.roll_number)
          const counted = marks.filter((mark) => ['present', 'late', 'absent'].includes(mark.status))
          const attended = marks.filter((mark) => ['present', 'late'].includes(mark.status)).length
          return { ...student, attendance_pct: calculateAttendancePercentage(attended, counted.length) }
        })
        setStudents(roster); setSubjects(results[1].data || []); setRecords(attendanceRows.map((item) => ({id:item.id,date:item.classes?.class_date,subject:item.classes?.subjects?.name,student:item.students?.profiles?.full_name,roll:item.students?.roll_number,status:item.status,section:item.classes?.section})))
      }
    }
    load().catch((issue)=>alive&&setError(issue.message))
    return () => { alive = false }
  }, [])
  const viewedRecords = role === 'student' ? records.filter((record) => record.roll === 'CS2401') : records
  const present = viewedRecords.filter((record) => record.status === 'present' || record.status === 'late').length
  const absent = viewedRecords.filter((record) => record.status === 'absent').length
  const attendance = calculateAttendancePercentage(present, present + absent)
  const name = profile?.full_name?.split(' ')[0] || (role === 'student' ? 'Aarav' : role === 'teacher' ? 'Priya' : 'Priya')
  const studentStats = [
    {label:'Overall attendance',value:`${attendance}%`,hint:attendance>=75?'Above the 75% requirement':'Below the 75% requirement',icon:Activity,tone:'blue'},
    {label:'Classes attended',value:present,hint:'Present and late',icon:UserRoundCheck,tone:'green'},
    {label:'Classes missed',value:absent,hint:'Across all subjects',icon:CalendarDays,tone:'amber'},
    {label:'Enrolled subjects',value:new Set(viewedRecords.map(record=>record.subject)).size,hint:'Subjects with recorded classes',icon:BookOpen,tone:'violet'},
  ]
  const staffStats = role === 'admin' ? [
    {label:'Total students',value:students.length,hint:'Across all departments',icon:Users,tone:'blue'},
    {label:'Faculty members',value:'24',hint:'Active this semester',icon:UserRoundCheck,tone:'green'},
    {label:'Subjects',value:subjects.length,hint:'Across all branches',icon:BookOpen,tone:'violet'},
    {label:'Today’s attendance',value:`${attendance}%`,hint:`${present} marked present`,icon:ClipboardCheck,tone:'amber'},
  ] : [
    {label:'Assigned subjects',value:subjects.length,hint:'This semester',icon:BookOpen,tone:'blue'},
    {label:'Students',value:students.length,hint:'Across your classes',icon:Users,tone:'green'},
    {label:'Classes today',value:'3',hint:'1 completed · 2 upcoming',icon:CalendarDays,tone:'violet'},
    {label:'Average attendance',value:`${attendance}%`,hint:'Across your classes',icon:Activity,tone:'amber'},
  ]
  const pieData = [{name:'Present',value:present||1},{name:'Absent',value:absent||0}]
  const subjectBreakdown = subjects.map((subject) => { const marks = records.filter((record) => record.subject === subject.name); return { name: subject.name, attendance: calculateAttendancePercentage(marks.filter((mark) => ['present','late'].includes(mark.status)).length, marks.length) } })
  return <>
    <div className="page-heading"><div><span className="eyebrow">{todayLabel}</span><h1>Good morning, {name}</h1><p>{role==='student'?'Here’s your attendance and class progress this semester.':'Here’s what’s happening across your classes today.'}</p></div><a className="primary-button" href="/attendance"><ClipboardCheck size={16}/> {role==='student'?'View attendance':'Take attendance'}</a></div>
    {error && <div className="inline-error">Some live data could not load: {error}</div>}
    <div className="metric-grid">{(role==='student'?studentStats:staffStats).map((stat)=><StatCard key={stat.label} {...stat}/>)}</div>
    <div className="chart-grid"><section className="content-card trend-card"><div className="card-heading"><div><small>ATTENDANCE OVERVIEW</small><h2>Attendance trend</h2></div><span className="chart-range">Last 5 class days⌄</span></div><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend} margin={{top:12,right:14,bottom:0,left:-16}}><CartesianGrid stroke="#edf0f5" strokeDasharray="4 4" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:'#9299a8',fontSize:11}}/><YAxis domain={[0,100]} axisLine={false} tickLine={false} tick={{fill:'#9299a8',fontSize:10}} tickFormatter={(value)=>`${value}%`}/><Tooltip formatter={(value)=>`${value}%`}/><Line type="monotone" dataKey="present" name="Attendance" stroke="#4269bd" strokeWidth={2.5} dot={{r:3,fill:'#4269bd',strokeWidth:0}} activeDot={{r:5}}/></LineChart></ResponsiveContainer></div></section><section className="content-card distribution-card"><div className="card-heading"><div><small>CLASS PARTICIPATION</small><h2>Present vs. absent</h2></div></div><div className="pie-box"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={59} outerRadius={79} paddingAngle={3} stroke="none"><Cell fill="#4b72c3"/><Cell fill="#f0b375"/></Pie><Tooltip/></PieChart></ResponsiveContainer><div className="pie-center"><b>{role==='student'?'92%':`${attendance}%`}</b><span>ATTENDANCE</span></div></div><div className="pie-legend"><span><i className="legend-blue"/>Present <b>{role==='student'?'46':present}</b></span><span><i className="legend-amber"/>Absent <b>{role==='student'?'4':absent}</b></span></div></section></div>
    <div className="bottom-grid"><section className="content-card table-card"><div className="card-heading"><div><small>RECENT ACTIVITY</small><h2>Recent attendance</h2></div><a href="/attendance" className="subtle-link">View register →</a></div>{records.length?<div className="responsive-table"><table><thead><tr><th>STUDENT</th><th>SUBJECT</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>{records.slice(0,5).map((record)=><tr key={record.id}><td><b>{record.student}</b><small>{record.roll}</small></td><td>{record.subject}</td><td>{record.date}</td><td><AttendanceBadge status={record.status}/></td></tr>)}</tbody></table></div>:<EmptyState title="No attendance records yet" description="Records will show here after your first class."/>}</section><section className="content-card low-card"><div className="card-heading"><div><small>STUDENT SUPPORT</small><h2>Attendance check-in</h2></div><span className="warning-count">{students.filter((s)=>s.attendance_pct<75).length}</span></div><p className="low-description">Students below the 75% attendance threshold may need a check-in.</p>{students.filter((s)=>s.attendance_pct<75).length?students.filter((s)=>s.attendance_pct<75).slice(0,3).map((s)=><div className="low-student" key={s.id}><span className="person-avatar">{(s.profiles?.full_name||'Student').split(' ').map((part)=>part[0]).join('')}</span><span><b>{s.profiles?.full_name}</b><small>{s.roll_number}</small></span><strong>{s.attendance_pct}%</strong></div>):<div className="healthy-note">✓ All students are above the attendance threshold.</div>}</section></div>
    <section className="content-card subject-chart"><div className="card-heading"><div><small>SUBJECT BREAKDOWN</small><h2>Attendance by subject</h2></div></div><div className="subject-chart-box"><ResponsiveContainer width="100%" height="100%"><BarChart data={subjectBreakdown} margin={{top:12,right:10,bottom:0,left:-14}}><CartesianGrid stroke="#edf0f5" strokeDasharray="4 4" vertical={false}/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#7f8795',fontSize:10}}/><YAxis domain={[0,100]} axisLine={false} tickLine={false} tick={{fill:'#9299a8',fontSize:10}} tickFormatter={(value)=>`${value}%`}/><Tooltip formatter={(value)=>`${value}%`}/><Bar dataKey="attendance" name="Attendance" fill="#718bc8" radius={[5,5,0,0]} maxBarSize={42}/></BarChart></ResponsiveContainer></div></section>
  </>
}
