import { useState, useEffect, useCallback } from 'react'
import { Building2, MapPin, Bike, CarFront, Truck } from 'lucide-react'
import { api, RATES } from '../../lib/api'
import { EmptyState, LoadingState } from '../ui/States'
import { BookSlotModal } from '../modals/BookSlotModal'
import { CustomSelect } from '../ui/CustomSelect'

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
        <h2 className="text-[24px] font-medium mb-1 serif-font">Find Parking</h2>
        <p className="text-[13px] text-[var(--text-muted)]">Browse available slots across all parking zones</p>
      </div>

      {/* Filter */}
      <CustomSelect
        value={vtype}
        onChange={setVtype}
        className="mb-6 max-w-[200px]"
        options={[
          { label: 'All Vehicle Types', value: '' },
          { label: 'Two-Wheeler', value: 'Two-Wheeler' },
          { label: 'Four-Wheeler', value: 'Four-Wheeler' },
          { label: 'Heavy Vehicle', value: 'Heavy Vehicle' },
        ]}
      />

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
  const badgeCls = avail === 0 ? 'text-red-700 bg-red-50 border-red-200'
    : avail <= 3  ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
    :               'text-green-700 bg-green-50 border-green-200'
  const badgeTxt = avail === 0 ? 'Full' : avail <= 3 ? `${avail} left` : `${avail} Available`

  return (
    <div className="mb-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm p-6">
      {/* Lot header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-[18px] font-medium mb-1.5 serif-font">
            <Building2 className="w-4 h-4 text-[var(--text-main)]" />
            {lot.Lot_name}
          </div>
          <div className="flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
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
          { label: 'Total',    value: lot.Total_slot     || 0, color: 'text-[var(--text-main)]' },
          { label: 'Free',     value: lot.available_count|| 0, color: 'text-green-700' },
          { label: 'Occupied', value: lot.occupied_count || 0, color: 'text-red-700'   },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 bg-[var(--card-muted)] border border-[var(--card-border)] rounded-sm p-3 text-center">
            <div className={`text-[24px] font-medium serif-font ${color}`}>{value}</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">{label}</div>
          </div>
        ))}
      </div>

      {/* Slot chips */}
      {lot.slots.length === 0 ? (
        <p className="text-[13px] text-[var(--text-muted)] text-center py-4">
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
      className="cursor-pointer bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm p-3 text-left
                 hover:border-[var(--accent)] transition-all duration-150 group shadow-sm"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-[14px] font-medium serif-font">
          <Icon className="w-3.5 h-3.5 text-[var(--text-main)]" />
          #{slot.Slot_id}
        </div>
        <span className="text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-sm border border-green-200">Open</span>
      </div>
      <div className="text-[11px] text-[var(--text-muted)] font-medium">{slot.S_type.split('-')[0]}</div>
      <div className="text-[13px] text-[var(--text-main)] mt-1 serif-font">₹{RATES[slot.S_type]}/hr</div>
    </button>
  )
}
