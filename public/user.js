// ── STATE ─────────────────────────────────────────────────────
let currentUser = JSON.parse(sessionStorage.getItem('parkUser') || 'null');
let selectedSlot = null;

// ── HELPERS ───────────────────────────────────────────────────
async function api(path, method = 'GET', body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(path, opts);
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Request failed');
  return d;
}

function fmt(dt) { return dt ? new Date(dt).toLocaleString('en-IN') : '—'; }

function toast(msg, type = 'success') {
  const t = document.getElementById('uToast');
  t.textContent = msg; t.className = `u-toast show ${type}`;
  setTimeout(() => t.className = 'u-toast', 3000);
}

function badge(text) {
  const map = { Confirmed:'confirmed', Pending:'pending', Cancelled:'cancelled',
                Completed:'completed', Paid:'paid', Unpaid:'unpaid' };
  return `<span class="badge badge-${map[text]||'pending'}">${text}</span>`;
}

const ICONS = { 'Two-Wheeler': 'bike', 'Four-Wheeler': 'car-front', 'Heavy Vehicle': 'truck' };
const RATES = { 'Two-Wheeler': 20, 'Four-Wheeler': 50, 'Heavy Vehicle': 100 };

// ── AUTH ──────────────────────────────────────────────────────
function switchTab(tab) {
  document.getElementById('loginForm').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('tabLogin').classList.toggle('active',    tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
}

async function doLogin() {
  const phone = document.getElementById('loginPhone').value.trim();
  const err   = document.getElementById('loginError');
  err.textContent = '';
  if (!phone) { err.textContent = 'Please enter your phone number'; return; }
  try {
    const driver = await api('/api/user/login', 'POST', { phone });
    loginSuccess(driver);
  } catch(e) { err.textContent = e.message; }
}

async function doRegister() {
  const name  = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const err   = document.getElementById('regError');
  err.textContent = '';
  if (!name || !phone || !email) { err.textContent = 'All fields are required'; return; }
  try {
    const driver = await api('/api/user/register', 'POST', { D_name: name, Phone: phone, Email: email });
    loginSuccess(driver);
  } catch(e) { err.textContent = e.message; }
}

function loginSuccess(driver) {
  currentUser = driver;
  sessionStorage.setItem('parkUser', JSON.stringify(driver));
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('appScreen').style.display  = 'block';
  document.getElementById('uName').textContent   = driver.D_name;
  document.getElementById('uPhone').textContent  = driver.Phone;
  document.getElementById('uAvatar').textContent = driver.D_name[0].toUpperCase();
  loadUserLots();
}

function doLogout() {
  sessionStorage.removeItem('parkUser');
  currentUser = null;
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('appScreen').style.display  = 'none';
}

// ── PAGE NAVIGATION ───────────────────────────────────────────
function uPage(name, el) {
  document.querySelectorAll('.u-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.u-nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('up-' + name).classList.add('active');
  if (el) el.classList.add('active');
  const loaders = { find: loadUserLots, book: loadMyBookings, vehicles: loadMyVehicles, history: loadMyHistory };
  if (loaders[name]) loaders[name]();
}

// ── FIND PARKING ──────────────────────────────────────────────
async function loadUserLots() {
  const vtype = document.getElementById('findVtype')?.value || '';
  const list  = document.getElementById('userLotsList');
  if (!list) return;
  list.innerHTML = '<div class="empty-state"><div class="empty-icon"><i data-lucide="loader"></i></div><div class="empty-text">Loading...</div></div>';
  if(window.lucide) lucide.createIcons();
  
  try {
    const lots = await api('/api/user/lots');
    if (!lots.length) { 
      list.innerHTML = '<div class="empty-state"><div class="empty-icon"><i data-lucide="building"></i></div><div class="empty-text">No parking lots found</div></div>'; 
      if(window.lucide) lucide.createIcons();
      return; 
    }

    const lotHtmls = await Promise.all(lots.map(async l => {
      const params = vtype ? `?v_type=${encodeURIComponent(vtype)}` : '';
      const slots  = await api(`/api/user/lots/${l.Lot_id}/slots${params}`);
      const avail  = l.available_count || 0;
      const badgeCls = avail === 0 ? 'badge-red' : avail <= 3 ? 'badge-yellow' : 'badge-green';
      const badgeTxt = avail === 0 ? 'Full' : avail <= 3 ? `${avail} left` : `${avail} Available`;

      const slotChips = slots.length
        ? slots.map(s => `
          <div class="u-card" style="cursor:pointer" onclick='openBookModal(${JSON.stringify(s)})'>
            <div class="card-header">
              <div class="card-title" style="display:flex;align-items:center;gap:6px"><i data-lucide="${ICONS[s.S_type]||'square'}"></i> #${s.Slot_id}</div>
              <span class="card-badge ${badgeCls}">${avail > 0 ? 'Open' : 'Full'}</span>
            </div>
            <div class="card-sub">${s.S_type.split('-')[0]}</div>
          </div>`).join('')
        : `<div class="empty-state" style="grid-column:1/-1;padding:20px;margin-top:10px">${vtype ? `No available ${vtype} slots` : 'No available slots'}</div>`;

      return `
        <div class="u-card" style="margin-bottom:24px;border-color:var(--border-strong);padding:24px;">
          <div class="card-header" style="margin-bottom:16px;">
            <div>
              <div class="card-title" style="font-size:16px;display:flex;align-items:center;gap:8px;"><i data-lucide="building-2"></i> ${l.Lot_name}</div>
              <div class="card-sub" style="display:flex;align-items:center;gap:4px;margin-top:6px;"><i data-lucide="map-pin" style="width:14px;height:14px"></i> ${l.Address}</div>
            </div>
            <span class="card-badge ${badgeCls}" style="font-size:11px;padding:4px 8px;">${badgeTxt}</span>
          </div>
          <div style="display:flex;gap:16px;margin-bottom:24px;">
            <div style="flex:1;background:var(--bg-elevated);border-radius:6px;padding:12px;text-align:center;">
              <div style="font-size:18px;font-weight:500;color:var(--accent)">${l.Total_slot||0}</div>
              <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Total</div>
            </div>
            <div style="flex:1;background:var(--bg-elevated);border-radius:6px;padding:12px;text-align:center;">
              <div style="font-size:18px;font-weight:500;color:#22C55E">${l.available_count||0}</div>
              <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Free</div>
            </div>
            <div style="flex:1;background:var(--bg-elevated);border-radius:6px;padding:12px;text-align:center;">
              <div style="font-size:18px;font-weight:500;color:#FCA5A5">${l.occupied_count||0}</div>
              <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Occupied</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;">${slotChips}</div>
        </div>`;
    }));
    list.innerHTML = lotHtmls.join('');
    if(window.lucide) lucide.createIcons();
  } catch(e) { 
    list.innerHTML = `<div class="empty-state"><div class="empty-icon"><i data-lucide="alert-circle"></i></div><div class="empty-text">${e.message}</div></div>`; 
    if(window.lucide) lucide.createIcons();
  }
}

// ── BOOK MODAL ────────────────────────────────────────────────
function openBookModal(slot) {
  selectedSlot = slot;
  document.getElementById('bookModal').classList.add('open');
  document.getElementById('bookModalTitle').textContent = `Book Slot #${slot.Slot_id}`;
  const now = new Date(); now.setSeconds(0,0);
  const end = new Date(now); end.setHours(end.getHours() + 2);
  const toLocal = d => d.toISOString().slice(0,16);
  document.getElementById('bookModalBody').innerHTML = `
    <div style="margin-bottom:16px;background:var(--bg-elevated);border:1px solid var(--border-strong);border-radius:8px;padding:16px;display:flex;align-items:center;gap:12px;">
      <div style="color:var(--accent)"><i data-lucide="${ICONS[slot.S_type]||'square'}" style="width:32px;height:32px;"></i></div>
      <div>
        <div style="font-weight:500;font-size:15px;color:var(--text-primary);">Slot #${slot.Slot_id} — ${slot.S_type}</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Rate: ₹${RATES[slot.S_type]}/hour</div>
      </div>
    </div>
    <div style="display:flex;gap:12px;margin-bottom:16px;">
      <div class="form-group" style="flex:1"><label class="form-label">Start Time</label>
        <input class="form-control" id="bStart" type="datetime-local" value="${toLocal(now)}" onchange="updateFeePrev()"></div>
      <div class="form-group" style="flex:1"><label class="form-label">End Time</label>
        <input class="form-control" id="bEnd" type="datetime-local" value="${toLocal(end)}" onchange="updateFeePrev()"></div>
    </div>
    <div id="feePrev" style="margin-bottom:24px;font-size:13px;color:var(--text-secondary);padding:12px;background:var(--bg-hover);border-radius:6px;">Loading estimate...</div>
    <button class="btn-full" onclick="confirmBooking()">Confirm Booking</button>`;
  updateFeePrev();
  if(window.lucide) lucide.createIcons();
}

function updateFeePrev() {
  const s = new Date(document.getElementById('bStart')?.value);
  const e = new Date(document.getElementById('bEnd')?.value);
  const p = document.getElementById('feePrev');
  if (!p || isNaN(s) || isNaN(e)) return;
  if (e <= s) { p.innerHTML = '<span style="color:#FCA5A5">End time must be after start time</span>'; return; }
  const hrs = (e - s) / 3600000;
  const fee = (RATES[selectedSlot.S_type] || 50) * hrs;
  p.innerHTML = `<div style="display:flex;justify-content:space-between;"><span>Estimated Fee:</span><strong style="color:var(--text-primary);font-variant-numeric:tabular-nums;">₹${fee.toFixed(2)}</strong></div><div style="font-size:11px;margin-top:4px;color:var(--text-muted);">${hrs.toFixed(1)} hrs × ₹${RATES[selectedSlot.S_type]}/hr</div>`;
}

function closeBookModal() { document.getElementById('bookModal').classList.remove('open'); }

async function confirmBooking() {
  if (!currentUser) return;
  const start = document.getElementById('bStart').value;
  const end   = document.getElementById('bEnd').value;
  if (!start || !end) { toast('Please select times', 'error'); return; }
  try {
    const r = await api('/api/reservations', 'POST', {
      RD_id: currentUser.Did, R_slot_id: selectedSlot.Slot_id,
      Start_time: start, End_time: end
    });
    toast(`Booking confirmed! Fee: ₹${r.fee}`);
    closeBookModal();
    loadUserLots();
  } catch(e) { toast(e.message, 'error'); }
}

// ── MY BOOKINGS ───────────────────────────────────────────────
async function loadMyBookings() {
  const list = document.getElementById('userBookingsList');
  list.innerHTML = '<div class="empty-state"><div class="empty-icon"><i data-lucide="loader"></i></div><div class="empty-text">Loading...</div></div>';
  if(window.lucide) lucide.createIcons();
  
  try {
    const rows = await api(`/api/user/${currentUser.Did}/reservations`);
    if (!rows.length) { 
      list.innerHTML = '<div class="empty-state"><div class="empty-icon"><i data-lucide="calendar"></i></div><div class="empty-text">No reservations yet. Find a slot to book!</div></div>'; 
      if(window.lucide) lucide.createIcons();
      return; 
    }
    list.innerHTML = rows.map(r => {
      const canCancel = ['Pending','Confirmed'].includes(r.R_status);
      return `
        <div class="u-card">
          <div class="card-header">
            <div class="card-title" style="display:flex;align-items:center;gap:6px;"><i data-lucide="${ICONS[r.S_type]||'square'}" style="width:16px;height:16px;color:var(--accent)"></i> Slot #${r.R_slot_id}</div>
            <div class="card-sub">${r.S_type}</div>
          </div>
          <div class="card-body">
            <div class="card-row"><span class="card-label">Location</span><span>${r.Lot_name}</span></div>
            <div class="card-row"><span class="card-label">Start</span><span>${fmt(r.Start_time)}</span></div>
            <div class="card-row"><span class="card-label">End</span><span>${fmt(r.End_time)}</span></div>
            <div class="card-row"><span class="card-label">Fee</span><span class="mono">₹${r.Fee}</span></div>
          </div>
          <div class="card-footer" style="justify-content:space-between;align-items:center;">
            ${badge(r.R_status)}
            ${canCancel ? `<button class="btn-danger" onclick="cancelBooking(${r.Res_id})">Cancel</button>` : ''}
          </div>
        </div>`;
    }).join('');
    if(window.lucide) lucide.createIcons();
  } catch(e) { 
    list.innerHTML = `<div class="empty-state"><div class="empty-text">${e.message}</div></div>`; 
  }
}

async function cancelBooking(id) {
  if (!confirm('Cancel this reservation?')) return;
  try {
    await api(`/api/user/reservations/${id}/cancel`, 'PUT');
    toast('Reservation cancelled'); loadMyBookings(); loadUserLots();
  } catch(e) { toast(e.message, 'error'); }
}

// ── MY VEHICLES ───────────────────────────────────────────────
async function loadMyVehicles() {
  const list = document.getElementById('userVehiclesList');
  list.innerHTML = '';
  try {
    const rows = await api(`/api/user/${currentUser.Did}/vehicles`);
    if (!rows.length) {
      list.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon"><i data-lucide="car"></i></div><div class="empty-text">No vehicles registered yet</div></div>';
      if(window.lucide) lucide.createIcons();
      return;
    }
    list.innerHTML = rows.map(v => `
      <div class="u-card">
        <div class="card-header" style="margin-bottom:0;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="background:var(--bg-elevated);border:1px solid var(--border-strong);border-radius:6px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary)"><i data-lucide="${ICONS[v.V_type]||'car'}"></i></div>
            <div>
              <div class="card-title">${v.License_Plate}</div>
              <div class="card-sub">${v.V_type} · ${v.Model}</div>
            </div>
          </div>
        </div>
      </div>`).join('');
    if(window.lucide) lucide.createIcons();
  } catch(e) { list.innerHTML = `<div class="empty-state"><div class="empty-text">${e.message}</div></div>`; }
}

function openAddVehicle() { document.getElementById('vehicleModal').classList.add('open'); }
function closeVehicleModal() { document.getElementById('vehicleModal').classList.remove('open'); }

async function addVehicle() {
  const lp    = document.getElementById('vLp').value.trim();
  const vtype = document.getElementById('vType').value;
  const model = document.getElementById('vModel').value.trim();
  if (!lp || !model) { toast('All fields required', 'error'); return; }
  try {
    await api(`/api/user/${currentUser.Did}/vehicles`, 'POST', { License_Plate: lp, V_type: vtype, Model: model });
    toast('Vehicle added!'); closeVehicleModal(); loadMyVehicles();
    document.getElementById('vLp').value = ''; document.getElementById('vModel').value = '';
  } catch(e) { toast(e.message, 'error'); }
}

// ── HISTORY ───────────────────────────────────────────────────
async function loadMyHistory() {
  const list = document.getElementById('userHistoryList');
  list.innerHTML = '<div class="empty-state"><div class="empty-icon"><i data-lucide="loader"></i></div><div class="empty-text">Loading...</div></div>';
  if(window.lucide) lucide.createIcons();

  try {
    const rows = await api(`/api/user/${currentUser.Did}/logs`);
    if (!rows.length) { 
      list.innerHTML = '<div class="empty-state"><div class="empty-icon"><i data-lucide="clock"></i></div><div class="empty-text">No parking history yet</div></div>'; 
      if(window.lucide) lucide.createIcons();
      return; 
    }
    list.innerHTML = rows.map(l => {
      const parked = !l.Exit_time;
      const dur    = l.Exit_time ? ((new Date(l.Exit_time) - new Date(l.Entry_time)) / 3600000).toFixed(1) + ' hrs' : 'Currently Parked';
      return `
        <div class="u-card">
          <div class="card-header">
            <div class="card-title" style="display:flex;align-items:center;gap:6px;"><i data-lucide="${ICONS[l.V_type]||'car'}" style="width:16px;height:16px;color:var(--text-secondary)"></i> ${l.License_Plate}</div>
            <div class="card-sub">${l.Model}</div>
          </div>
          <div class="card-body">
            <div class="card-row"><span class="card-label">Location</span><span>${l.Lot_name} (#${l.Slot_id})</span></div>
            <div class="card-row"><span class="card-label">Entry</span><span>${fmt(l.Entry_time)}</span></div>
            <div class="card-row"><span class="card-label">Exit</span><span>${l.Exit_time ? fmt(l.Exit_time) : '—'}</span></div>
            <div class="card-row"><span class="card-label">Duration</span><span>${dur}</span></div>
            <div class="card-row"><span class="card-label">Fee</span><span class="mono">${l.Exit_time ? '₹' + l.Fee : '—'}</span></div>
          </div>
          <div class="card-footer" style="justify-content:space-between;align-items:center;">
            ${l.Exit_time ? badge(l.Payment_status) : '<span class="badge badge-pending">Active</span>'}
          </div>
        </div>`;
    }).join('');
    if(window.lucide) lucide.createIcons();
  } catch(e) { list.innerHTML = `<div class="empty-state"><div class="empty-text">${e.message}</div></div>`; }
}

// ── INIT ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    loginSuccess(currentUser);
  }
  // Allow Enter key on login
  document.getElementById('loginPhone')?.addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
});
