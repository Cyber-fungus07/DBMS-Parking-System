import { useState, useEffect } from 'react'
import { Clock, Bike, CarFront, Truck, LogIn, LogOut } from 'lucide-react'
import { api, fmt } from '../../lib/api'
import { EmptyState, LoadingState } from '../ui/States'
import { Badge } from '../ui/Badge'
import { ParkVehicleModal } from '../modals/ParkVehicleModal'

const TYPE_ICONS = { 'Two-Wheeler': Bike, 'Four-Wheeler': CarFront, 'Heavy Vehicle': Truck }

export function History({ user, showToast }) {
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

  const load = async () => {
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

  async function handleCheckout(logId) {
    if (!window.confirm('Are you sure you want to checkout?')) return
    try {
      const res = await api(`/api/logs/${logId}/exit`, 'PUT', { Payment_status: 'Paid' })
      showToast(`Checked out successfully! Fee: ₹${res.fee}`, 'success')
      load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const [isParkModalOpen, setIsParkModalOpen] = useState(false)

  return (
    <div className="page-in max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-[24px] font-medium mb-1 serif-font">Entry / Exit History</h2>
          <p className="text-[13px] text-[var(--text-muted)]">Your complete parking activity log</p>
        </div>
        <button
          onClick={() => setIsParkModalOpen(true)}
          className="flex items-center gap-2 h-9 px-4 bg-[var(--text-main)] text-[var(--bg-color)] font-medium text-[13px] rounded-sm hover:opacity-90 transition-opacity"
        >
          <LogIn className="w-4 h-4" />
          Check In (Park)
        </button>
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
              <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm p-4 flex flex-col shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[16px] font-medium serif-font">
                      <Icon className="w-4 h-4 text-[var(--text-main)]" />
                      {l.License_Plate}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{l.Model}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-[13px] text-[var(--text-main)] mb-4">
                  <Row label="Location" value={`${l.Lot_name} (#${l.Slot_id})`} />
                  <Row label="Entry"    value={fmt(l.Entry_time)} />
                  <Row label="Exit"     value={l.Exit_time ? fmt(l.Exit_time) : '—'} />
                  <Row label="Duration" value={dur} />
                  <Row label="Fee"      value={l.Exit_time ? `₹${l.Fee}` : '—'} mono />
                </div>

                <div className="mt-auto pt-3 border-t border-[var(--card-border)] flex items-center justify-between">
                  <Badge status={parked ? 'Active' : (l.Payment_status || 'Paid')} />
                  {parked && (
                    <button
                      onClick={() => handleCheckout(l.Log_id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[var(--bg-color)] bg-[var(--text-main)] rounded-sm hover:opacity-90 transition-opacity"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Checkout
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ParkVehicleModal
        isOpen={isParkModalOpen}
        onClose={() => setIsParkModalOpen(false)}
        user={user}
        showToast={showToast}
        onSuccess={load}
      />
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
