export function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  const d = new Date(Number(year), Number(month) - 1)
  return d.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })
}
