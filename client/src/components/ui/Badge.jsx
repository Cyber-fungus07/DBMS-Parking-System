export function Badge({ status }) {
  const map = {
    Confirmed: 'bg-indigo-950 text-indigo-300 border-l-indigo-500',
    Pending:   'bg-yellow-950 text-yellow-300 border-l-yellow-500',
    Cancelled: 'bg-red-950   text-red-300    border-l-red-500',
    Completed: 'bg-green-950 text-green-300  border-l-green-500',
    Paid:      'bg-green-950 text-green-300  border-l-green-500',
    Unpaid:    'bg-red-950   text-red-300    border-l-red-500',
    Active:    'bg-yellow-950 text-yellow-300 border-l-yellow-500',
  }
  const cls = map[status] || map.Pending
  return (
    <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded border-l-2 ${cls}`}>
      {status}
    </span>
  )
}
