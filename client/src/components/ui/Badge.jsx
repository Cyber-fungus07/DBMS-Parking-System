export function Badge({ status }) {
  const map = {
    Confirmed: 'bg-indigo-50 text-indigo-700 border border-indigo-200 border-l-indigo-500',
    Pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200 border-l-yellow-500',
    Cancelled: 'bg-red-50    text-red-700    border border-red-200    border-l-red-500',
    Completed: 'bg-green-50  text-green-700  border border-green-200  border-l-green-500',
    Paid:      'bg-green-50  text-green-700  border border-green-200  border-l-green-500',
    Unpaid:    'bg-red-50    text-red-700    border border-red-200    border-l-red-500',
    Active:    'bg-yellow-50 text-yellow-700 border border-yellow-200 border-l-yellow-500',
  }
  const cls = map[status] || map.Pending
  return (
    <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-sm border-l-2 ${cls}`}>
      {status}
    </span>
  )
}
