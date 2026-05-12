import { useState, useEffect } from 'react'
import { X, CarFront, Hash } from 'lucide-react'
import { api } from '../../lib/api'
import { CustomSelect } from '../ui/CustomSelect'

export function ParkVehicleModal({ isOpen, onClose, user, showToast, onSuccess }) {
  const [vehicles, setVehicles] = useState([])
  const [lots, setLots] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedLot, setSelectedLot] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')

  useEffect(() => {
    if (isOpen) loadData()
  }, [isOpen])

  useEffect(() => {
    if (selectedLot && selectedVehicle) {
      const v = vehicles.find(v => v.V_id == selectedVehicle)
      if (v) loadSlots(selectedLot, v.V_type)
    }
  }, [selectedLot, selectedVehicle, vehicles])

  async function loadData() {
    try {
      const [v, l] = await Promise.all([
        api(`/api/user/${user.Did}/vehicles`),
        api('/api/user/lots')
      ])
      setVehicles(v)
      setLots(l)
      if (v.length) setSelectedVehicle(v[0].V_id)
      if (l.length) setSelectedLot(l[0].Lot_id)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function loadSlots(lotId, vType) {
    try {
      const s = await api(`/api/user/lots/${lotId}/slots?v_type=${vType}`)
      setSlots(s)
      if (s.length) setSelectedSlot(s[0].Slot_id)
      else setSelectedSlot('')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedVehicle || !selectedSlot) return showToast('Please select vehicle and slot', 'error')
    setLoading(true)
    try {
      await api('/api/logs', 'POST', { EV_id: selectedVehicle, E_slot_id: selectedSlot })
      showToast('Successfully parked vehicle!', 'success')
      onSuccess()
      onClose()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm page-in">
      <div className="w-full max-w-md bg-[var(--bg-color)] border border-[var(--card-border)] rounded-sm shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
          <div>
            <h3 className="text-[16px] font-medium serif-font text-[var(--text-main)]">Check In (Park Vehicle)</h3>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Start tracking parking duration</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-muted)] rounded-sm transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-5">
          {vehicles.length === 0 ? (
            <div className="text-[13px] text-red-500 bg-red-50 p-3 rounded-sm border border-red-200">
              You have no vehicles registered. Please add a vehicle first.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 font-medium flex items-center gap-1.5">
                  <CarFront className="w-3.5 h-3.5" /> Select Vehicle
                </label>
                <CustomSelect
                  value={selectedVehicle}
                  onChange={setSelectedVehicle}
                  options={vehicles.map(v => ({ value: v.V_id, label: `${v.License_Plate} (${v.Model})` }))}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 font-medium flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> Parking Lot
                </label>
                <CustomSelect
                  value={selectedLot}
                  onChange={setSelectedLot}
                  options={lots.map(l => ({ value: l.Lot_id, label: l.Lot_name }))}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 font-medium flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> Available Slot
                </label>
                {slots.length === 0 ? (
                  <div className="text-[13px] text-[var(--text-muted)] p-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm">
                    No available slots for this vehicle type in selected lot.
                  </div>
                ) : (
                  <CustomSelect
                    value={selectedSlot}
                    onChange={setSelectedSlot}
                    options={slots.map(s => ({ value: s.Slot_id, label: `Slot #${s.Slot_id}` }))}
                  />
                )}
              </div>
            </>
          )}

          <div className="pt-4 mt-2 border-t border-[var(--card-border)] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || vehicles.length === 0 || slots.length === 0}
              className="px-5 py-2 text-[13px] font-medium text-[var(--bg-color)] bg-[var(--text-main)] rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Park Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
