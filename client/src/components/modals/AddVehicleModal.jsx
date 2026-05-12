import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../../lib/api'
import { ModalOverlay } from './BookSlotModal'

export function AddVehicleModal({ user, onClose, onAdded, showToast }) {
  const [form, setForm] = useState({ lp: '', vtype: 'Two-Wheeler', model: '' })
  const [loading, setLoading] = useState(false)

  const update = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleAdd(e) {
    e?.preventDefault()
    if (!form.lp.trim() || !form.model.trim()) { showToast('All fields required', 'error'); return }
    setLoading(true)
    try {
      await api(`/api/user/${user.Did}/vehicles`, 'POST', {
        License_Plate: form.lp.trim(),
        V_type: form.vtype,
        Model: form.model.trim(),
      })
      onAdded()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="modal-in bg-[#111113] border border-[#2A2A2D] rounded-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E21]">
          <h3 className="text-[15px] font-medium">Add Vehicle</h3>
          <button onClick={onClose} className="text-[#52525B] hover:text-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleAdd} className="p-5 space-y-4">
          <FormField label="License Plate">
            <input
              value={form.lp}
              onChange={update('lp')}
              placeholder="e.g. MH12AB1234"
              className="input-base"
            />
          </FormField>

          <FormField label="Vehicle Type">
            <select value={form.vtype} onChange={update('vtype')} className="input-base">
              <option>Two-Wheeler</option>
              <option>Four-Wheeler</option>
              <option>Heavy Vehicle</option>
            </select>
          </FormField>

          <FormField label="Model">
            <input
              value={form.model}
              onChange={update('model')}
              placeholder="e.g. Honda City"
              className="input-base"
            />
          </FormField>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50
                       text-white text-[13px] font-medium rounded-md transition-colors cursor-pointer"
          >
            {loading ? 'Adding...' : 'Add Vehicle'}
          </button>
        </form>
      </div>
    </ModalOverlay>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-[#52525B] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
