import { useState, useEffect } from 'react'
import { Calendar, Bike, CarFront, Truck } from 'lucide-react'
import { api, fmt } from '../../lib/api'
import { EmptyState, LoadingState } from '../ui/States'
import { Badge } from '../ui/Badge'

const TYPE_ICONS = { 'Two-Wheeler': Bike, 'Four-Wheeler': CarFront, 'Heavy Vehicle': Truck }

export function MyBookings({ user, showToast }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  async function load() {
    setLoading(true); setError('')
    try {
      const rows = await api(`/api/user/${user.Did}/reservations`)
      setBookings(rows)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCancel(id) {
    if (!window.confirm('Cancel this reservation?')) return
    try {
      await api(`/api/user/reservations/${id}/cancel`, 'PUT')
      showToast('Reservation cancelled')
      load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  return (
    <div className="page-in max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-[24px] font-medium mb-1 serif-font">My Reservations</h2>
        <p className="text-[13px] text-[var(--text-muted)]">All your current and past slot bookings</p>
      </div>

      {loading && <LoadingState />}
      {error   && <EmptyState message={error} />}
      {!loading && !error && bookings.length === 0 && (
        <EmptyState icon={Calendar} message="No reservations yet. Find a slot to book!" />
      )}

      {!loading && !error && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {bookings.map(r => {
            const Icon = TYPE_ICONS[r.S_type] || CarFront
            const canCancel = ['Pending', 'Confirmed'].includes(r.R_status)
            return (
              <div key={r.Res_id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm p-4 flex flex-col shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[16px] font-medium serif-font">
                      <Icon className="w-4 h-4 text-[var(--text-main)]" />
                      Slot #{r.R_slot_id}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{r.S_type}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-[13px] text-[var(--text-main)] mb-4">
                  <Row label="Location" value={r.Lot_name} />
                  <Row label="Start"    value={fmt(r.Start_time)} />
                  <Row label="End"      value={fmt(r.End_time)} />
                  <Row label="Fee"      value={`₹${r.Fee}`} mono />
                </div>

                <div className="mt-auto pt-3 border-t border-[var(--card-border)] flex items-center justify-between">
                  <Badge status={r.R_status} />
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(r.Res_id)}
                      className="px-3 py-1.5 text-[12px] font-medium text-red-700 bg-red-50 border border-red-200 rounded-sm
                                 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
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
      <span className="text-[var(--text-muted)] font-medium">{label}</span>
      <span className={mono ? 'font-mono tabular-nums' : ''}>{value}</span>
    </div>
  )
}
