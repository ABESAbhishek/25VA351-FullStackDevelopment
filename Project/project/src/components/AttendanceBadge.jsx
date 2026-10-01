export default function AttendanceBadge({ status }) { return <span className={`badge badge-${String(status).toLowerCase()}`}><i/>{status}</span> }
