import { useState } from 'react'
import { X } from 'lucide-react'
import { api } from '../../lib/api'
import { ModalOverlay } from './BookSlotModal'
import { CustomSelect } from '../ui/CustomSelect'

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
      <div className="modal-in bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm w-full max-w-sm shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
          <h3 className="text-[18px] font-medium serif-font">Add Vehicle</h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer">
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
            <CustomSelect
              value={form.vtype}
              onChange={val => setForm(f => ({ ...f, vtype: val }))}
              options={[
                { label: 'Two-Wheeler', value: 'Two-Wheeler' },
                { label: 'Four-Wheeler', value: 'Four-Wheeler' },
                { label: 'Heavy Vehicle', value: 'Heavy Vehicle' }
              ]}
            />
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
            className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50
                       text-[var(--accent-fg)] text-[13px] font-medium rounded-sm transition-colors cursor-pointer"
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
      <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 font-medium">{label}</label>
      {children}
    </div>
  )
}
