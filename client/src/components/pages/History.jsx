import { useState, useEffect } from 'react'
import { Clock, Bike, CarFront, Truck } from 'lucide-react'
import { api, fmt } from '../../lib/api'
import { EmptyState, LoadingState } from '../ui/States'
import { Badge } from '../ui/Badge'

const TYPE_ICONS = { 'Two-Wheeler': Bike, 'Four-Wheeler': CarFront, 'Heavy Vehicle': Truck }

export function History({ user }) {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true); setError('')
      try {
        const rows = await api(`/api/user/${user.Did}/logs`)
        setLogs(rows)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.Did])

  return (
    <div className="page-in max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-[18px] font-medium mb-1">Entry / Exit History</h2>
        <p className="text-[13px] text-[#52525B]">Your complete parking activity log</p>
      </div>

      {loading && <LoadingState />}
      {error   && <EmptyState message={error} />}
      {!loading && !error && logs.length === 0 && (
        <EmptyState icon={Clock} message="No parking history yet" />
      )}

      {!loading && !error && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {logs.map((l, i) => {
            const Icon   = TYPE_ICONS[l.V_type] || CarFront
            const parked = !l.Exit_time
            const dur    = parked
              ? 'Currently Parked'
              : ((new Date(l.Exit_time) - new Date(l.Entry_time)) / 3600000).toFixed(1) + ' hrs'

            return (
              <div key={i} className="bg-[#111113] border border-[#1E1E21] rounded-xl p-4 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[14px] font-medium">
                      <Icon className="w-4 h-4 text-[#A1A1AA]" />
                      {l.License_Plate}
                    </div>
                    <div className="text-[11px] text-[#52525B] mt-0.5">{l.Model}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-[13px] text-[#D4D4D8] mb-4">
                  <Row label="Location" value={`${l.Lot_name} (#${l.Slot_id})`} />
                  <Row label="Entry"    value={fmt(l.Entry_time)} />
                  <Row label="Exit"     value={l.Exit_time ? fmt(l.Exit_time) : '—'} />
                  <Row label="Duration" value={dur} />
                  <Row label="Fee"      value={l.Exit_time ? `₹${l.Fee}` : '—'} mono />
                </div>

                <div className="mt-auto pt-3 border-t border-[#1E1E21]">
                  <Badge status={parked ? 'Active' : (l.Payment_status || 'Paid')} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#52525B]">{label}</span>
      <span className={mono ? 'font-mono tabular-nums' : ''}>{value}</span>
    </div>
  )
}
