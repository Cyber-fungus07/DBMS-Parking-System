import { useState, useEffect } from 'react'
import { X, Bike, CarFront, Truck } from 'lucide-react'
import { api, RATES } from '../../lib/api'

const TYPE_ICONS = { 'Two-Wheeler': Bike, 'Four-Wheeler': CarFront, 'Heavy Vehicle': Truck }

function toLocal(d) { return d.toISOString().slice(0, 16) }

export function BookSlotModal({ slot, user, onClose, onBooked, showToast }) {
  const now = new Date(); now.setSeconds(0, 0)
  const end = new Date(now); end.setHours(end.getHours() + 2)

  const [startTime, setStartTime] = useState(toLocal(now))
  const [endTime,   setEndTime]   = useState(toLocal(end))
  const [loading,   setLoading]   = useState(false)

  const Icon = TYPE_ICONS[slot.S_type] || CarFront
  const rate = RATES[slot.S_type] || 50

  const hours = (new Date(endTime) - new Date(startTime)) / 3600000
  const fee   = hours > 0 ? (rate * hours).toFixed(2) : null

  async function handleConfirm() {
    if (!startTime || !endTime) { showToast('Please select times', 'error'); return }
    if (hours <= 0) { showToast('End time must be after start time', 'error'); return }
    if (hours > 240) { showToast('Booking duration cannot exceed 10 days', 'error'); return }
    setLoading(true)
    try {
      const r = await api('/api/reservations', 'POST', {
        RD_id: user.Did, R_slot_id: slot.Slot_id,
        Start_time: startTime, End_time: endTime,
      })
      onBooked(r)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="modal-in bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm w-full max-w-md shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
          <h3 className="text-[18px] font-medium serif-font">Book Slot #{slot.Slot_id}</h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Slot info */}
          <div className="flex items-center gap-3 bg-[var(--card-muted)] border border-[var(--card-border)] rounded-sm p-4">
            <Icon className="w-8 h-8 text-[var(--text-main)] flex-shrink-0" />
            <div>
              <div className="text-[16px] font-medium serif-font">Slot #{slot.Slot_id} — {slot.S_type}</div>
              <div className="text-[12px] text-[var(--text-muted)] mt-0.5">Rate: ₹{rate}/hour</div>
            </div>
          </div>

          {/* Time pickers */}
          <div className="flex gap-3">
            <FormField label="Start Time" className="flex-1">
              <input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="input-base"
              />
            </FormField>
            <FormField label="End Time" className="flex-1">
              <input
                type="datetime-local"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="input-base"
              />
            </FormField>
          </div>

          {/* Fee estimate */}
          <div className="text-[13px] p-3 bg-[var(--card-muted)] border border-[var(--card-border)] rounded-sm">
            {!fee || hours <= 0 ? (
              <span className="text-red-600">End time must be after start time</span>
            ) : hours > 240 ? (
              <span className="text-red-600">Duration exceeds limit (Max 10 days)</span>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Estimated Fee:</span>
                  <strong className="text-[var(--text-main)] tabular-nums font-medium">₹{fee}</strong>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-1">
                  {hours.toFixed(1)} hrs × ₹{rate}/hr
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading || !fee || hours > 240}
            className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50
                       text-[var(--accent-fg)] text-[13px] font-medium rounded-sm transition-colors cursor-pointer"
          >
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

export function ModalOverlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}

function FormField({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium mb-1.5">{label}</label>
      {children}
    </div>
  )
}
