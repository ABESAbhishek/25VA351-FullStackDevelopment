export function calculateAttendancePercentage(present, total, late = 0) {
  if (!total) return 0
  return Math.round(((present + late) / total) * 100)
}

export function getAttendanceStatus(percentage, threshold = 75) {
  if (percentage < threshold - 15) return 'Critical'
  if (percentage < threshold) return 'Warning'
  return 'Safe'
}

export function getAttendanceColor(status) {
  return ({ Safe: 'green', Warning: 'amber', Critical: 'red', present: 'green', absent: 'red', late: 'amber' })[status] || 'slate'
}

export function exportCsv(filename, rows) {
  if (!rows.length) return false
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const csv = [Object.keys(rows[0]).map(escape).join(','), ...rows.map((row) => Object.values(row).map(escape).join(','))].join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url)
  return true
}

export function dateToday() { return new Date().toISOString().slice(0, 10) }
