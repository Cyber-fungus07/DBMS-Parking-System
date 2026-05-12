import { useState, useEffect, useCallback } from 'react'
import { Building2, MapPin, Bike, CarFront, Truck } from 'lucide-react'
import { api, RATES } from '../../lib/api'
import { EmptyState, LoadingState } from '../ui/States'
import { BookSlotModal } from '../modals/BookSlotModal'

const TYPE_ICONS = { 'Two-Wheeler': Bike, 'Four-Wheeler': CarFront, 'Heavy Vehicle': Truck }

export function FindParking({ user, showToast }) {
  const [vtype, setVtype]         = useState('')
  const [lots, setLots]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)

  const loadLots = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const allLots = await api('/api/user/lots')
      const lotData = await Promise.all(allLots.map(async l => {
        const params = vtype ? `?v_type=${encodeURIComponent(vtype)}` : ''
        const slots  = await api(`/api/user/lots/${l.Lot_id}/slots${params}`)
        return { ...l, slots }
      }))
      setLots(lotData)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [vtype])

  useEffect(() => { loadLots() }, [loadLots])

  return (
    <div className="page-in max-w-5xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-[18px] font-medium mb-1">Find Parking</h2>
        <p className="text-[13px] text-[#52525B]">Browse available slots across all parking zones</p>
      </div>

      {/* Filter */}
      <select
        value={vtype}
        onChange={e => setVtype(e.target.value)}
        className="mb-6 input-base max-w-[200px]"
      >
        <option value="">All Vehicle Types</option>
        <option value="Two-Wheeler">Two-Wheeler</option>
        <option value="Four-Wheeler">Four-Wheeler</option>
        <option value="Heavy Vehicle">Heavy Vehicle</option>
      </select>

      {/* Content */}
      {loading && <LoadingState />}
      {error   && <EmptyState message={error} />}
      {!loading && !error && lots.length === 0 && (
        <EmptyState icon={Building2} message="No parking lots found" />
      )}

      {!loading && !error && lots.map(lot => (
        <LotCard key={lot.Lot_id} lot={lot} vtype={vtype} onBookSlot={setSelectedSlot} />
      ))}

      {selectedSlot && (
        <BookSlotModal
          slot={selectedSlot}
          user={user}
          onClose={() => setSelectedSlot(null)}
          onBooked={() => { setSelectedSlot(null); loadLots(); showToast('Booking confirmed!') }}
          showToast={showToast}
        />
      )}
    </div>
  )
}

function LotCard({ lot, vtype, onBookSlot }) {
  const avail    = lot.available_count || 0
  const badgeCls = avail === 0 ? 'text-red-300 bg-red-950 border-red-500'
    : avail <= 3  ? 'text-yellow-300 bg-yellow-950 border-yellow-500'
    :               'text-green-300 bg-green-950 border-green-500'
  const badgeTxt = avail === 0 ? 'Full' : avail <= 3 ? `${avail} left` : `${avail} Available`

  return (
    <div className="mb-6 bg-[#111113] border border-[#2A2A2D] rounded-xl p-6">
      {/* Lot header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-[16px] font-medium mb-1.5">
            <Building2 className="w-4 h-4 text-indigo-500" />
            {lot.Lot_name}
          </div>
          <div className="flex items-center gap-1 text-[12px] text-[#52525B]">
            <MapPin className="w-3.5 h-3.5" />
            {lot.Address}
          </div>
        </div>
        <span className={`text-[11px] px-2 py-1 rounded border-l-2 font-medium uppercase tracking-wider ${badgeCls}`}>
          {badgeTxt}
        </span>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        {[
          { label: 'Total',    value: lot.Total_slot     || 0, color: 'text-indigo-400' },
          { label: 'Free',     value: lot.available_count|| 0, color: 'text-green-400'  },
          { label: 'Occupied', value: lot.occupied_count || 0, color: 'text-red-300'    },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 bg-[#1C1C1F] rounded-lg p-3 text-center">
            <div className={`text-[18px] font-medium ${color}`}>{value}</div>
            <div className="text-[11px] text-[#52525B] uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      {/* Slot chips */}
      {lot.slots.length === 0 ? (
        <p className="text-[13px] text-[#52525B] text-center py-4">
          {vtype ? `No available ${vtype} slots` : 'No available slots'}
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
          {lot.slots.map(slot => <SlotChip key={slot.Slot_id} slot={slot} onBook={onBookSlot} />)}
        </div>
      )}
    </div>
  )
}

function SlotChip({ slot, onBook }) {
  const Icon = TYPE_ICONS[slot.S_type] || CarFront
  return (
    <button
      onClick={() => onBook(slot)}
      className="cursor-pointer bg-[#111113] border border-[#1E1E21] rounded-lg p-3 text-left
                 hover:border-indigo-500/50 transition-all duration-150 group"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-[13px] font-medium">
          <Icon className="w-3.5 h-3.5 text-indigo-400" />
          #{slot.Slot_id}
        </div>
        <span className="text-[10px] text-green-400 bg-green-950 px-1.5 py-0.5 rounded border-l border-green-500">Open</span>
      </div>
      <div className="text-[11px] text-[#52525B]">{slot.S_type.split('-')[0]}</div>
      <div className="text-[11px] text-[#52525B] mt-1">₹{RATES[slot.S_type]}/hr</div>
    </button>
  )
}
