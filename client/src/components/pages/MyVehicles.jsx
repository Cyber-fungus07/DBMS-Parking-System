import { useState, useEffect } from 'react'
import { Car, Bike, CarFront, Truck, Plus } from 'lucide-react'
import { api } from '../../lib/api'
import { EmptyState, LoadingState } from '../ui/States'
import { AddVehicleModal } from '../modals/AddVehicleModal'

const TYPE_ICONS = { 'Two-Wheeler': Bike, 'Four-Wheeler': CarFront, 'Heavy Vehicle': Truck }

export function MyVehicles({ user, showToast }) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [showModal, setShowModal] = useState(false)

  async function load() {
    setLoading(true); setError('')
    try {
      const rows = await api(`/api/user/${user.Did}/vehicles`)
      setVehicles(rows)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="page-in max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-[18px] font-medium mb-1">My Vehicles</h2>
          <p className="text-[13px] text-[#52525B]">Manage your registered vehicles</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600
                     text-white text-[12px] font-medium rounded-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Vehicle
        </button>
      </div>

      {loading && <LoadingState />}
      {error   && <EmptyState message={error} />}
      {!loading && !error && vehicles.length === 0 && (
        <EmptyState icon={Car} message="No vehicles registered yet" />
      )}

      {!loading && !error && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {vehicles.map(v => {
            const Icon = TYPE_ICONS[v.V_type] || Car
            return (
              <div key={v.Vehicle_id} className="bg-[#111113] border border-[#1E1E21] rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#1C1C1F]
                                border border-[#2A2A2D] rounded-lg text-[#A1A1AA]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[14px] font-medium">{v.License_Plate}</div>
                  <div className="text-[11px] text-[#52525B] mt-0.5">{v.V_type} · {v.Model}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <AddVehicleModal
          user={user}
          onClose={() => setShowModal(false)}
          onAdded={() => { setShowModal(false); load(); showToast('Vehicle added!') }}
          showToast={showToast}
        />
      )}
    </div>
  )
}
