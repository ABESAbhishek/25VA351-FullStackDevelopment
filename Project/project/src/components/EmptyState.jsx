import { Inbox } from 'lucide-react'
export default function EmptyState({ title = 'Nothing here yet', description = 'Records will appear here when they are available.' }) { return <div className="empty-state"><Inbox size={23}/><b>{title}</b><span>{description}</span></div> }
