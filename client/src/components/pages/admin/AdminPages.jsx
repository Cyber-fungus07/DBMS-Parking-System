import { useState, useEffect } from 'react'
import { api, fmt } from '../../../lib/api'
import { CustomSelect } from '../../ui/CustomSelect'

function statusChip(s) {
  const cls = {
    Available: 'border-l-2 border-green-500 bg-green-900/20 text-green-400',
    Occupied: 'border-l-2 border-red-500 bg-red-900/20 text-red-400',
    Reserved: 'border-l-2 border-yellow-500 bg-yellow-900/20 text-yellow-400',
    Confirmed: 'border-l-2 border-green-500 bg-green-900/20 text-green-400',
    Pending: 'border-l-2 border-yellow-500 bg-yellow-900/20 text-yellow-400',
    Cancelled: 'border-l-2 border-red-500 bg-red-900/20 text-red-400',
    Completed: 'border-l-2 border-indigo-500 bg-indigo-900/20 text-indigo-400',
    Paid: 'border-l-2 border-green-500 bg-green-900/20 text-green-400',
    Unpaid: 'border-l-2 border-red-500 bg-red-900/20 text-red-400',
  }
  return <span className={`text-[11px] px-2 py-0.5 rounded-r-sm inline-flex items-center ${cls[s] || cls.Pending}`}>{s}</span>
}

export function AdminDashboard({ showToast }) {
  const [stats, setStats] = useState(null)
  
  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const d = await api('/api/dashboard/stats')
      setStats(d)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  if (!stats) return <div className="p-6 text-[var(--text-muted)]">Loading dashboard...</div>

  return (
    <div className="p-6 space-y-6 page-in">
      <div>
        <h2 className="text-[15px] font-medium text-[var(--text-main)] mb-1">Dashboard</h2>
        <p className="text-[13px] text-[var(--text-muted)]">System overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm p-4 flex flex-col">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Revenue</span>
          <span className="text-2xl font-medium number-stat mt-auto">₹{parseFloat(stats.revenue || 0).toFixed(2)}</span>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm p-4 flex flex-col">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Slots</span>
          <span className="text-2xl font-medium number-stat mt-auto">{stats.slots}</span>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm p-4 flex flex-col">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Available</span>
          <span className="text-2xl font-medium number-stat mt-auto text-green-500">{stats.available}</span>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm p-4 flex flex-col">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Occupied</span>
          <span className="text-2xl font-medium number-stat mt-auto text-red-500">{stats.occupied}</span>
        </div>
      </div>
      
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm p-4">
        <h3 className="text-[13px] font-medium mb-4 uppercase tracking-wider text-[var(--text-muted)]">Recent Reservations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--card-border)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="pb-2 font-medium">Driver</th>
                <th className="pb-2 font-medium">Slot</th>
                <th className="pb-2 font-medium">Time In</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentReservations?.length ? stats.recentReservations.map(r => (
                <tr key={r.Res_id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--card-muted)] transition-colors">
                  <td className="py-2 text-[13px]">{r.D_name}</td>
                  <td className="py-2 text-[13px] number-stat">#{r.Slot_id}</td>
                  <td className="py-2 text-[13px]">{fmt(r.Start_time)}</td>
                  <td className="py-2 text-[13px] number-stat">₹{parseFloat(r.Fee||0).toFixed(0)}</td>
                  <td className="py-2">{statusChip(r.R_status)}</td>
                </tr>
              )) : <tr><td colSpan="5" className="py-4 text-center text-[13px] text-[var(--text-muted)]">No recent reservations</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function AdminDrivers({ showToast }) {
  const [drivers, setDrivers] = useState([])
  useEffect(() => { load() }, [])
  async function load() {
    try { setDrivers(await api('/api/drivers')) }
    catch (e) { showToast(e.message, 'error') }
  }
  return (
    <div className="p-6 page-in">
      <div className="mb-6">
        <h2 className="text-[15px] font-medium text-[var(--text-main)] mb-1">Drivers</h2>
        <p className="text-[13px] text-[var(--text-muted)]">{drivers.length} registered</p>
      </div>
      <div className="overflow-x-auto bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--card-border)] text-[11px] uppercase tracking-wider text-[var(--text-muted)] bg-[var(--card-muted)]">
              <th className="px-4 py-3 font-medium">Driver</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Email</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.Did} className="border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--card-muted)] transition-colors">
                <td className="px-4 py-3 text-[13px]">{d.D_name}</td>
                <td className="px-4 py-3 text-[13px] number-stat">{d.Phone}</td>
                <td className="px-4 py-3 text-[13px]">{d.Email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminVehicles({ showToast }) {
  const [vehicles, setVehicles] = useState([])
  useEffect(() => { load() }, [])
  async function load() {
    try { setVehicles(await api('/api/vehicles')) }
    catch (e) { showToast(e.message, 'error') }
  }
  return (
    <div className="p-6 page-in">
      <div className="mb-6">
        <h2 className="text-[15px] font-medium text-[var(--text-main)] mb-1">Vehicles</h2>
        <p className="text-[13px] text-[var(--text-muted)]">{vehicles.length} registered</p>
      </div>
      <div className="overflow-x-auto bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--card-border)] text-[11px] uppercase tracking-wider text-[var(--text-muted)] bg-[var(--card-muted)]">
              <th className="px-4 py-3 font-medium">License Plate</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 font-medium">Driver</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.V_id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--card-muted)] transition-colors">
                <td className="px-4 py-3 text-[13px] font-medium number-stat">{v.License_Plate}</td>
                <td className="px-4 py-3 text-[13px]">{v.V_type}</td>
                <td className="px-4 py-3 text-[13px]">{v.Model}</td>
                <td className="px-4 py-3 text-[13px]">{v.D_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminReservations({ showToast }) {
  const [res, setRes] = useState([])
  useEffect(() => { load() }, [])
  async function load() {
    try { setRes(await api('/api/reservations')) }
    catch (e) { showToast(e.message, 'error') }
  }
  return (
    <div className="p-6 page-in">
      <div className="mb-6">
        <h2 className="text-[15px] font-medium text-[var(--text-main)] mb-1">Reservations</h2>
      </div>
      <div className="overflow-x-auto bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--card-border)] text-[11px] uppercase tracking-wider text-[var(--text-muted)] bg-[var(--card-muted)]">
              <th className="px-4 py-3 font-medium">Driver</th>
              <th className="px-4 py-3 font-medium">Slot</th>
              <th className="px-4 py-3 font-medium">Start</th>
              <th className="px-4 py-3 font-medium">End</th>
              <th className="px-4 py-3 font-medium">Fee</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payment</th>
            </tr>
          </thead>
          <tbody>
            {res.map(r => (
              <tr key={r.Res_id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--card-muted)] transition-colors">
                <td className="px-4 py-3 text-[13px]">{r.D_name}</td>
                <td className="px-4 py-3 text-[13px] number-stat">#{r.R_slot_id}</td>
                <td className="px-4 py-3 text-[13px]">{fmt(r.Start_time)}</td>
                <td className="px-4 py-3 text-[13px]">{fmt(r.End_time)}</td>
                <td className="px-4 py-3 text-[13px] number-stat">₹{parseFloat(r.Fee||0).toFixed(0)}</td>
                <td className="px-4 py-3">{statusChip(r.R_status)}</td>
                <td className="px-4 py-3">{statusChip(r.Payment_status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminLogs({ showToast }) {
  const [logs, setLogs] = useState([])
  useEffect(() => { load() }, [])
  async function load() {
    try { setLogs(await api('/api/logs')) }
    catch (e) { showToast(e.message, 'error') }
  }
  return (
    <div className="p-6 page-in">
      <div className="mb-6">
        <h2 className="text-[15px] font-medium text-[var(--text-main)] mb-1">Entry / Exit Log</h2>
      </div>
      <div className="overflow-x-auto bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--card-border)] text-[11px] uppercase tracking-wider text-[var(--text-muted)] bg-[var(--card-muted)]">
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Driver</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Entry</th>
              <th className="px-4 py-3 font-medium">Exit</th>
              <th className="px-4 py-3 font-medium">Fee</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.Log_id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--card-muted)] transition-colors">
                <td className="px-4 py-3 text-[13px] font-medium number-stat">{l.License_Plate}</td>
                <td className="px-4 py-3 text-[13px]">{l.D_name}</td>
                <td className="px-4 py-3 text-[13px]">{l.Lot_name} / #{l.E_slot_id}</td>
                <td className="px-4 py-3 text-[13px]">{fmt(l.Entry_time)}</td>
                <td className="px-4 py-3 text-[13px]">{fmt(l.Exit_time)}</td>
                <td className="px-4 py-3 text-[13px] number-stat">{l.Exit_time?'₹'+parseFloat(l.Fee||0).toFixed(0):'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminSlots({ showToast }) {
  const [slots, setSlots] = useState([])
  const [lots, setLots] = useState([])
  const [newSlot, setNewSlot] = useState({ S_type: 'Four-Wheeler', PLot_id: '', Statement: 'Available' })
  const [newLot, setNewLot] = useState({ Lot_name: '', Address: '', Total_slot: 10 })

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const [s, l] = await Promise.all([api('/api/slots'), api('/api/lots')])
      setSlots(s)
      setLots(l)
      if (l.length > 0 && !newSlot.PLot_id) setNewSlot(prev => ({ ...prev, PLot_id: l[0].Lot_id }))
    }
    catch (e) { showToast(e.message, 'error') }
  }

  async function handleAddSlot(e) {
    e.preventDefault()
    if (!newSlot.PLot_id) return showToast('Please select a parking lot', 'error')
    try {
      await api('/api/slots', 'POST', newSlot)
      showToast('Slot created successfully', 'success')
      load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleDeleteSlot(id) {
    if (!window.confirm('Are you sure you want to delete this slot?')) return
    try {
      await api(`/api/slots/${id}`, 'DELETE')
      showToast('Slot deleted successfully', 'success')
      load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  async function handleAddLot(e) {
    e.preventDefault()
    if (!newLot.Lot_name || !newLot.Address) return showToast('Please provide name and address', 'error')
    try {
      await api('/api/lots', 'POST', { ...newLot, Total_slot: parseInt(newLot.Total_slot) || 10 })
      showToast('Location created successfully', 'success')
      setNewLot({ Lot_name: '', Address: '', Total_slot: 10 })
      load()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  return (
    <div className="p-6 page-in">
      <div className="mb-6">
        <h2 className="text-[15px] font-medium text-[var(--text-main)] mb-1">Slots</h2>
        <p className="text-[13px] text-[var(--text-muted)]">Manage parking slots</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm p-5">
          <h3 className="text-[13px] font-medium text-[var(--text-main)] mb-4">Add New Location (Lot)</h3>
          <form onSubmit={handleAddLot} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Lot Name</label>
              <input
                type="text"
                value={newLot.Lot_name}
                onChange={e => setNewLot({ ...newLot, Lot_name: e.target.value })}
                className="w-full h-[38px] bg-[var(--bg-color)] border border-[var(--card-border)] rounded-sm px-3 text-[13px] text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="e.g. North Wing Parking"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Address</label>
                <input
                  type="text"
                  value={newLot.Address}
                  onChange={e => setNewLot({ ...newLot, Address: e.target.value })}
                  className="w-full h-[38px] bg-[var(--bg-color)] border border-[var(--card-border)] rounded-sm px-3 text-[13px] text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="e.g. 123 Main St"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Total Slots</label>
                <input
                  type="number"
                  min="1"
                  value={newLot.Total_slot}
                  onChange={e => setNewLot({ ...newLot, Total_slot: e.target.value })}
                  className="w-full h-[38px] bg-[var(--bg-color)] border border-[var(--card-border)] rounded-sm px-3 text-[13px] text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors number-stat"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="h-[38px] w-full bg-[var(--text-main)] text-[var(--bg-color)] font-medium text-[13px] rounded-sm hover:opacity-90 transition-opacity"
            >
              Create Location
            </button>
          </form>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm p-5">
          <h3 className="text-[13px] font-medium text-[var(--text-main)] mb-4">Add New Slot to Location</h3>
          <form onSubmit={handleAddSlot} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Parking Lot</label>
            <CustomSelect
              value={newSlot.PLot_id}
              onChange={val => setNewSlot({ ...newSlot, PLot_id: val })}
              options={lots.map(l => ({ value: l.Lot_id, label: l.Lot_name }))}
            />
          </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Slot Type</label>
                <CustomSelect
                  value={newSlot.S_type}
                  onChange={val => setNewSlot({ ...newSlot, S_type: val })}
                  options={[
                    { value: 'Two-Wheeler', label: 'Two-Wheeler' },
                    { value: 'Four-Wheeler', label: 'Four-Wheeler' },
                    { value: 'Heavy Vehicle', label: 'Heavy Vehicle' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Initial Status</label>
                <CustomSelect
                  value={newSlot.Statement}
                  onChange={val => setNewSlot({ ...newSlot, Statement: val })}
                  options={[
                    { value: 'Available', label: 'Available' },
                    { value: 'Occupied', label: 'Occupied' },
                    { value: 'Reserved', label: 'Reserved' }
                  ]}
                />
              </div>
            </div>
            <button
              type="submit"
              className="h-[38px] w-full bg-[var(--text-main)] text-[var(--bg-color)] font-medium text-[13px] rounded-sm hover:opacity-90 transition-opacity"
            >
              Create Slot
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-x-auto bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--card-border)] text-[11px] uppercase tracking-wider text-[var(--text-muted)] bg-[var(--card-muted)]">
              <th className="px-4 py-3 font-medium">Slot ID</th>
              <th className="px-4 py-3 font-medium">Lot Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.map(s => (
              <tr key={s.Slot_id} className="border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--card-muted)] transition-colors">
                <td className="px-4 py-3 text-[13px] font-medium number-stat">#{s.Slot_id}</td>
                <td className="px-4 py-3 text-[13px]">{s.Lot_name}</td>
                <td className="px-4 py-3 text-[13px]">{s.S_type}</td>
                <td className="px-4 py-3">{statusChip(s.Statement)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDeleteSlot(s.Slot_id)}
                    className="text-[11px] text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded-sm border border-transparent hover:border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {slots.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-[13px] text-[var(--text-muted)]">
                  No slots found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
