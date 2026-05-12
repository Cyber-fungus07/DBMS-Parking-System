const API = '';

// ── HELPERS ──────────────────────────────────────────────────
async function api(path, method = 'GET', body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(API + path, opts);
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Request failed');
  return d;
}

function fmt(dt) { return dt ? new Date(dt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'; }

function statusChip(s) {
  const cls = { Available:'available', Occupied:'occupied', Reserved:'reserved',
    Confirmed:'confirmed', Pending:'pending', Cancelled:'cancelled',
    Completed:'completed', Paid:'paid', Unpaid:'unpaid' };
  return `<span class="status-chip chip-${cls[s]||'pending'}">${s}</span>`;
}

function avatarClass(name) {
  if (!name) return 'av-af';
  const c = name[0].toUpperCase();
  if (c <= 'F') return 'av-af';
  if (c <= 'L') return 'av-gl';
  if (c <= 'R') return 'av-mr';
  return 'av-sz';
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast show ${type}`;
  setTimeout(() => t.className = 'toast', 3000);
}

// ── COUNT-UP ANIMATION ───────────────────────────────────────
function animateValue(el, end, prefix = '', suffix = '', duration = 600, delay = 0) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = prefix + end + suffix; return;
  }
  setTimeout(() => {
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const v = Math.round(ease(t) * end);
      el.textContent = prefix + v.toLocaleString('en-IN') + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + end.toLocaleString('en-IN') + suffix;
    }
    requestAnimationFrame(tick);
  }, delay);
}

// ── NAVIGATION ───────────────────────────────────────────────
function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name)?.classList.add('active');
  if (el) el.classList.add('active');
  document.getElementById('pageTitle').textContent = el?.querySelector('span')?.textContent || name;
  const loaders = { dashboard: loadDashboard, drivers: loadDrivers, vehicles: loadVehicles,
    lots: loadLots, slots: loadSlots, reservations: loadReservations, logs: loadLogs, schema: renderSchema };
  if (loaders[name]) loaders[name]();
  return false;
}

function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const r = document.getElementById('appRoot');
  s.classList.toggle('collapsed');
  r.style.gridTemplateColumns = s.classList.contains('collapsed') ? '0 1fr' : '';
}

function openModal(type, data) {
  document.getElementById('modalOverlay').classList.add('open');
  renderModal(type, data);
  lucide.createIcons();
}
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }

// ── LIVE CLOCK ───────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('liveClock');
  if (el) el.textContent = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
}
setInterval(updateClock, 1000); updateClock();

// ── AVATAR MENU ──────────────────────────────────────────────
function toggleAvatarMenu() {
  document.getElementById('avatarMenu').classList.toggle('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.topbar-avatar-wrap')) document.getElementById('avatarMenu')?.classList.remove('open');
  if (!e.target.closest('.ctx-menu') && !e.target.closest('.ctx-trigger')) document.getElementById('ctxMenu')?.classList.remove('open');
});

// ── COMMAND PALETTE ──────────────────────────────────────────
const cmdPages = [
  { name:'Dashboard', page:'dashboard', icon:'layout-dashboard', hint:'Overview' },
  { name:'Drivers', page:'drivers', icon:'user', hint:'Management' },
  { name:'Vehicles', page:'vehicles', icon:'car', hint:'Management' },
  { name:'Parking Lots', page:'lots', icon:'building-2', hint:'Management' },
  { name:'Slots', page:'slots', icon:'grid-2x2', hint:'Management' },
  { name:'Reservations', page:'reservations', icon:'calendar', hint:'Operations' },
  { name:'Entry / Exit Log', page:'logs', icon:'activity', hint:'Operations' },
  { name:'DB Schema', page:'schema', icon:'database', hint:'Database' },
];
let cmdSelected = 0;

function openCommandPalette() {
  const o = document.getElementById('cmdOverlay');
  o.classList.add('open');
  const inp = document.getElementById('cmdInput');
  inp.value = '';
  inp.focus();
  renderCmdResults('');
  lucide.createIcons();
}
function closeCommandPalette() { document.getElementById('cmdOverlay').classList.remove('open'); }

function renderCmdResults(q) {
  const filtered = cmdPages.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  cmdSelected = 0;
  document.getElementById('cmdResults').innerHTML = filtered.map((p, i) => `
    <div class="cmd-item ${i===0?'selected':''}" data-page="${p.page}" onclick="cmdGo('${p.page}')">
      <div class="cmd-item-left"><i data-lucide="${p.icon}"></i> ${p.name}</div>
      <span class="cmd-item-hint">${p.hint}</span>
    </div>`).join('') || '<div style="padding:16px;text-align:center;color:#52525B;font-size:13px">No results</div>';
  lucide.createIcons();
}

function cmdGo(page) {
  closeCommandPalette();
  const el = document.querySelector(`[data-page="${page}"]`);
  showPage(page, el);
}

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openCommandPalette(); }
  if (e.key === 'Escape') { closeCommandPalette(); }
  const overlay = document.getElementById('cmdOverlay');
  if (!overlay?.classList.contains('open')) return;
  const items = overlay.querySelectorAll('.cmd-item');
  if (e.key === 'ArrowDown') { e.preventDefault(); cmdSelected = Math.min(cmdSelected+1, items.length-1); items.forEach((it,i) => it.classList.toggle('selected', i===cmdSelected)); }
  if (e.key === 'ArrowUp') { e.preventDefault(); cmdSelected = Math.max(cmdSelected-1, 0); items.forEach((it,i) => it.classList.toggle('selected', i===cmdSelected)); }
  if (e.key === 'Enter' && items[cmdSelected]) { cmdGo(items[cmdSelected].dataset.page); }
});

// ── CONTEXT MENU ─────────────────────────────────────────────
function showCtxMenu(e, resId) {
  e.stopPropagation();
  const menu = document.getElementById('ctxMenu');
  menu.classList.add('open');
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.dataset.resId = resId;
}

// ── DASHBOARD ────────────────────────────────────────────────
let recentResData = [];
let recentSortKey = null;
let recentSortAsc = true;

async function loadDashboard() {
  try {
    const d = await api('/api/dashboard/stats');
    const rev = parseFloat(d.revenue) || 0;
    const occRate = d.slots ? Math.round(((d.slots - d.available) / d.slots) * 100) : 0;

    animateValue(document.getElementById('stat-revenue'), rev, '₹', '', 600, 0);
    animateValue(document.getElementById('stat-slots'), d.slots, '', '', 600, 80);
    animateValue(document.getElementById('stat-available'), d.available, '', '', 600, 160);
    animateValue(document.getElementById('stat-occupied'), d.occupied || (d.slots - d.available), '', '', 600, 240);
    animateValue(document.getElementById('stat-reservations'), d.activeReservations, '', '', 600, 320);
    animateValue(document.getElementById('stat-logs'), d.logs, '', '', 600, 400);

    const occEl = document.getElementById('stat-occ-rate');
    animateValue(occEl, occRate, '', '%', 600, 480);

    // Trend pills
    const tRev = document.getElementById('trend-revenue');
    if (tRev) { tRev.className = 'bento-trend trend-up'; tRev.textContent = '↑ Revenue collected'; }

    // Sparkline
    const svg = document.getElementById('sparklineSvg');
    if (svg) {
      const pts = [20, 35, 28, 50, 42, 60, rev > 0 ? 55 : 10];
      const max = Math.max(...pts);
      const coords = pts.map((v, i) => `${(i / (pts.length - 1)) * 120},${32 - (v / max) * 28}`).join(' ');
      svg.innerHTML = `<polyline points="${coords}" fill="none" stroke="var(--accent)" stroke-width="1.5"/>
        <polygon points="0,32 ${coords} 120,32" class="sparkline-fill"/>`;
    }

    // Occupancy bars
    const occList = document.getElementById('occ-list');
    if (occList) {
      occList.innerHTML = d.lotOccupancy.map((l, i) => {
        const pct = l.Total_slot ? Math.round((l.occupied / l.Total_slot) * 100) : 0;
        return `<div class="occ-row" style="animation-delay:${i * 100}ms">
          <span class="occ-name">${l.Lot_name}</span>
          <div class="occ-track"><div class="occ-fill" style="--fill:${pct}%;animation-delay:${i*100}ms"></div></div>
          <span class="occ-count mono">${l.occupied}/${l.Total_slot}</span>
          <span class="occ-pct mono">${pct}%</span>
        </div>`;
      }).join('');
    }

    // Bar chart
    const chartWrap = document.getElementById('slot-chart');
    const legendWrap = document.getElementById('chart-legend');
    if (chartWrap && d.slotTypes) {
      const colors = { 'Two-Wheeler':'#6366F1', 'Four-Wheeler':'#22C55E', 'Heavy Vehicle':'#F59E0B' };
      const maxTotal = Math.max(...d.slotTypes.map(t => t.total));
      chartWrap.innerHTML = d.slotTypes.map((t, i) => {
        const occ = t.total - t.available;
        const occPct = maxTotal ? (occ / maxTotal) * 100 : 0;
        const availPct = maxTotal ? (t.available / maxTotal) * 100 : 0;
        return `<div class="bar-row">
          <span class="bar-label">${t.S_type.split('-')[0]}</span>
          <div class="bar-track">
            <div class="bar-seg" style="--w:${occPct}%;background:${colors[t.S_type]};animation-delay:${i*100}ms">${occ > 0 ? occ : ''}</div>
            <div class="bar-seg bar-seg-avail" style="--w:${availPct}%;background:${colors[t.S_type]};animation-delay:${i*100+50}ms">${t.available > 0 ? t.available : ''}</div>
          </div>
          <span class="bar-count mono">${t.total}</span>
        </div>`;
      }).join('');

      if (legendWrap) {
        legendWrap.innerHTML = Object.entries(colors).map(([k,v]) =>
          `<span class="legend-item"><span class="legend-dot" style="background:${v}"></span>${k}</span>`
        ).join('') + `<span class="legend-item"><span class="legend-dot" style="background:#52525B;opacity:.4"></span>Available</span>`;
      }
    }

    // Recent reservations table
    try {
      const resData = await fetch('/api/reservations').then(r => r.json());
      recentResData = resData.slice(0, 10);
    } catch (e) {
      recentResData = d.recentReservations || [];
    }
    renderRecentTable();
  } catch (e) { showToast(e.message, 'error'); }
}

function renderRecentTable() {
  const tbody = document.getElementById('recent-res-tbody');
  if (!tbody) return;
  tbody.innerHTML = recentResData.map(r => {
    const driverName = r.first_name ? `${r.first_name} ${r.last_name || ''}`.trim() : (r.driver_name || r.D_name || 'Unknown');
    const vehicle = r.vehicle_type || r.V_type || r.S_type || '—';
    return `
    <tr>
      <td><div class="driver-cell"><div class="avatar-sm ${avatarClass(driverName)}">${driverName[0].toUpperCase()}</div><span class="driver-name">${driverName}</span></div></td>
      <td>${vehicle}</td>
      <td class="mono">#${r.Slot_id || r.R_slot_id}</td>
      <td>${fmt(r.Start_time)}</td>
      <td class="mono">₹${parseFloat(r.Fee || 0).toFixed(0)}</td>
      <td>${statusChip(r.R_status)}</td>
      <td><button class="icon-btn ctx-trigger" onclick="showCtxMenu(event,${r.Res_id})"><i data-lucide="more-horizontal"></i></button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" style="text-align:center;color:#52525B;padding:30px">No reservations</td></tr>';
  lucide.createIcons();
}

function sortRecentTable(key) {
  document.querySelectorAll('.sort-icon').forEach(s => s.textContent = '');
  if (recentSortKey === key) { recentSortAsc = !recentSortAsc; }
  else { recentSortKey = key; recentSortAsc = true; }
  const el = document.getElementById('sort-' + key);
  if (el) el.textContent = recentSortAsc ? '↑' : '↓';
  recentResData.sort((a, b) => {
    let va = a[key], vb = b[key];
    if (typeof va === 'string') return recentSortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    return recentSortAsc ? (va - vb) : (vb - va);
  });
  renderRecentTable();
}

// ── DRIVERS ──────────────────────────────────────────────────
async function loadDrivers() {
  try {
    const rows = await api('/api/drivers');
    document.getElementById('drivers-count').textContent = `${rows.length} registered`;
    document.getElementById('tDrivers').innerHTML = rows.length ? rows.map(d => `
      <tr>
        <td><div class="driver-cell"><div class="avatar-sm ${avatarClass(d.D_name)}">${d.D_name[0]}</div><span class="driver-name">${d.D_name}</span></div></td>
        <td class="mono">${d.Phone}</td><td>${d.Email}</td>
        <td class="actions-cell">
          <button class="btn-sm btn-ghost" onclick='openModal("driver",${JSON.stringify(d)})'>Edit</button>
          <button class="btn-sm btn-danger" onclick="delDriver(${d.Did})">Delete</button>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="4"><div class="empty-state"><p>No drivers registered</p></div></td></tr>';
    lucide.createIcons();
  } catch(e) { showToast(e.message,'error'); }
}
async function delDriver(id) { if (!confirm('Delete?')) return; try { await api(`/api/drivers/${id}`,'DELETE'); showToast('Deleted'); loadDrivers(); } catch(e) { showToast(e.message,'error'); } }

// ── VEHICLES ─────────────────────────────────────────────────
async function loadVehicles() {
  try {
    const rows = await api('/api/vehicles');
    document.getElementById('vehicles-count').textContent = `${rows.length} registered`;
    document.getElementById('tVehicles').innerHTML = rows.length ? rows.map(v => `
      <tr>
        <td class="mono" style="color:var(--text-primary);font-weight:500">${v.License_Plate}</td>
        <td>${v.V_type}</td><td>${v.Model}</td>
        <td><div class="driver-cell"><div class="avatar-sm ${avatarClass(v.D_name)}">${(v.D_name||'?')[0]}</div><span>${v.D_name}</span></div></td>
        <td class="actions-cell">
          <button class="btn-sm btn-ghost" onclick='openModal("vehicle",${JSON.stringify(v)})'>Edit</button>
          <button class="btn-sm btn-danger" onclick="delVehicle(${v.V_id})">Delete</button>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="5"><div class="empty-state"><p>No vehicles</p></div></td></tr>';
    lucide.createIcons();
  } catch(e) { showToast(e.message,'error'); }
}
async function delVehicle(id) { if(!confirm('Delete?'))return; try{await api(`/api/vehicles/${id}`,'DELETE');showToast('Deleted');loadVehicles();}catch(e){showToast(e.message,'error');} }

// ── LOTS ─────────────────────────────────────────────────────
async function loadLots() {
  try {
    const lots = await api('/api/lots');
    document.getElementById('lotsGrid').innerHTML = lots.length ? lots.map(l => `
      <div class="lot-card">
        <div class="lot-card-header"><span class="lot-card-name">${l.Lot_name}</span></div>
        <div class="lot-card-addr">${l.Address}</div>
        <div class="lot-card-stats">
          <div class="lot-card-stat"><div class="lot-card-stat-num mono" style="color:var(--accent)">${l.Total_slot||0}</div><div class="lot-card-stat-label">Total</div></div>
          <div class="lot-card-stat"><div class="lot-card-stat-num mono" style="color:#22C55E">${l.available_count||0}</div><div class="lot-card-stat-label">Free</div></div>
          <div class="lot-card-stat"><div class="lot-card-stat-num mono" style="color:#EF4444">${(l.slot_count||0)-(l.available_count||0)}</div><div class="lot-card-stat-label">Used</div></div>
        </div>
        <div class="lot-card-actions">
          <button class="btn-sm btn-ghost" onclick='openModal("lot",${JSON.stringify(l)})'>Edit</button>
          <button class="btn-sm btn-danger" onclick="delLot(${l.Lot_id})">Delete</button>
        </div>
      </div>`).join('')
    : '<div class="empty-state"><p>No parking lots</p></div>';
    const sel = document.getElementById('filterLot');
    if (sel) { const cur=sel.value; sel.innerHTML='<option value="">All Lots</option>'+lots.map(l=>`<option value="${l.Lot_id}">${l.Lot_name}</option>`).join(''); sel.value=cur; }
    lucide.createIcons();
  } catch(e) { showToast(e.message,'error'); }
}
async function delLot(id) { if(!confirm('Delete lot?'))return; try{await api(`/api/lots/${id}`,'DELETE');showToast('Deleted');loadLots();}catch(e){showToast(e.message,'error');} }

// ── SLOTS ────────────────────────────────────────────────────
async function loadSlots() {
  try {
    await loadLots();
    const params = new URLSearchParams();
    const lot = document.getElementById('filterLot')?.value; if(lot) params.set('lot_id',lot);
    const st = document.getElementById('filterStatus')?.value; if(st) params.set('status',st);
    const slots = await api('/api/slots?'+params);
    document.getElementById('slotsVisual').innerHTML = slots.length ? slots.map(s => `
      <div class="slot-card" onclick='openModal("slotDetail",${JSON.stringify(s)})'>
        <div class="slot-card-id">#${s.Slot_id}</div>
        <div class="slot-card-type">${s.S_type}</div>
        ${statusChip(s.Statement)}
        <div class="slot-card-lot">${s.Lot_name}</div>
      </div>`).join('')
    : '<div class="empty-state" style="grid-column:1/-1"><p>No slots found</p></div>';
  } catch(e) { showToast(e.message,'error'); }
}

// ── RESERVATIONS ──────────────────────────────────────────────
async function loadReservations() {
  try {
    const rows = await api('/api/reservations');
    document.getElementById('tReservations').innerHTML = rows.length ? rows.map(r => `
      <tr>
        <td><div class="driver-cell"><div class="avatar-sm ${avatarClass(r.D_name)}">${(r.D_name||'?')[0]}</div><span class="driver-name">${r.D_name}</span></div></td>
        <td class="mono">#${r.R_slot_id}</td><td>${r.Lot_name}</td>
        <td>${fmt(r.Start_time)}</td><td>${fmt(r.End_time)}</td>
        <td class="mono">₹${parseFloat(r.Fee||0).toFixed(0)}</td>
        <td>${statusChip(r.R_status)}</td><td>${statusChip(r.Payment_status)}</td>
        <td class="actions-cell">
          ${r.R_status==='Confirmed'?`<button class="btn-sm btn-ghost" onclick="updateRes(${r.Res_id},'Completed','Paid')">Complete</button>`:''}
          ${['Pending','Confirmed'].includes(r.R_status)?`<button class="btn-sm btn-danger" onclick="updateRes(${r.Res_id},'Cancelled')">Cancel</button>`:''}
          ${r.Payment_status==='Unpaid'&&r.R_status!=='Cancelled'?`<button class="btn-sm btn-ghost" onclick="payRes(${r.Res_id})">Pay</button>`:''}
        </td>
      </tr>`).join('')
    : '<tr><td colspan="9"><div class="empty-state"><p>No reservations</p></div></td></tr>';
    lucide.createIcons();
  } catch(e) { showToast(e.message,'error'); }
}
async function updateRes(id, status, payment) {
  if (!confirm(`Set to ${status}?`)) return;
  try { const b={R_status:status}; if(payment)b.Payment_status=payment; await api(`/api/reservations/${id}/status`,'PUT',b); showToast(`${status}`); loadReservations(); loadDashboard(); } catch(e) { showToast(e.message,'error'); }
}
async function payRes(id) { try { await api(`/api/reservations/${id}/status`,'PUT',{R_status:'Confirmed',Payment_status:'Paid'}); showToast('Paid'); loadReservations(); } catch(e) { showToast(e.message,'error'); } }
async function delRes(id) { if(!confirm('Delete?'))return; try{await api(`/api/reservations/${id}`,'DELETE');showToast('Deleted');loadReservations();}catch(e){showToast(e.message,'error');} }

// ── LOGS ──────────────────────────────────────────────────────
async function loadLogs() {
  try {
    const rows = await api('/api/logs');
    document.getElementById('tLogs').innerHTML = rows.length ? rows.map(l => `
      <tr>
        <td><span style="color:var(--text-primary);font-weight:500" class="mono">${l.License_Plate}</span><br><span style="font-size:11px;color:#52525B">${l.V_type}</span></td>
        <td><div class="driver-cell"><div class="avatar-sm ${avatarClass(l.D_name)}">${(l.D_name||'?')[0]}</div><span>${l.D_name}</span></div></td>
        <td>${l.Lot_name} / #${l.E_slot_id}</td>
        <td>${fmt(l.Entry_time)}</td><td>${fmt(l.Exit_time)}</td>
        <td class="mono">${l.Exit_time?'₹'+parseFloat(l.Fee||0).toFixed(0):'—'}</td>
        <td>${statusChip(l.Payment_status)}</td>
        <td class="actions-cell">
          ${!l.Exit_time?`<button class="btn-sm btn-ghost" onclick="exitLog(${l.Log_id})">Exit</button>`:''}
          ${l.Exit_time&&l.Payment_status==='Unpaid'?`<button class="btn-sm btn-ghost" onclick="payLog(${l.Log_id})">Pay</button>`:''}
          <button class="btn-sm btn-danger" onclick="delLog(${l.Log_id})">Del</button>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="8"><div class="empty-state"><p>No logs</p></div></td></tr>';
    lucide.createIcons();
  } catch(e) { showToast(e.message,'error'); }
}
async function exitLog(id) { const pay=confirm('Mark paid?')?'Paid':'Unpaid'; try{const r=await api(`/api/logs/${id}/exit`,'PUT',{Payment_status:pay});showToast(`Fee: ₹${r.fee}`);loadLogs();loadDashboard();}catch(e){showToast(e.message,'error');} }
async function payLog(id) { try{await api(`/api/logs/${id}/exit`,'PUT',{Exit_time:new Date().toISOString(),Payment_status:'Paid'});showToast('Paid');loadLogs();}catch(e){showToast(e.message,'error');} }
async function delLog(id) { if(!confirm('Delete?'))return; try{await api(`/api/logs/${id}`,'DELETE');showToast('Deleted');loadLogs();}catch(e){showToast(e.message,'error');} }

// ── SCHEMA ────────────────────────────────────────────────────
function renderSchema() {
  const tables = [
    {name:'Driver',note:'Registered driver details',cols:[{n:'Did',t:'INT',pk:true},{n:'D_name',t:'VARCHAR(100)'},{n:'Phone',t:'VARCHAR(15)'},{n:'Email',t:'VARCHAR(100)'}]},
    {name:'Vehicle',note:'Vehicles owned by drivers',cols:[{n:'V_id',t:'INT',pk:true},{n:'License_Plate',t:'VARCHAR(20)'},{n:'V_type',t:'ENUM'},{n:'Model',t:'VARCHAR(100)'},{n:'VDid',t:'INT',fk:'Driver.Did'}]},
    {name:'ParkingLot',note:'Parking zones',cols:[{n:'Lot_id',t:'INT',pk:true},{n:'Lot_name',t:'VARCHAR(100)'},{n:'Address',t:'VARCHAR(255)'}]},
    {name:'LotTotalSlot',note:'Capacity per lot',cols:[{n:'Lot_id',t:'INT',pk:true,fk:'ParkingLot.Lot_id'},{n:'Total_slot',t:'INT'}]},
    {name:'ParkingSlot',note:'Individual slots',cols:[{n:'Slot_id',t:'INT',pk:true},{n:'S_type',t:'ENUM'},{n:'Statement',t:'ENUM'},{n:'PLot_id',t:'INT',fk:'ParkingLot.Lot_id'}]},
    {name:'Reservation',note:'Advance bookings with fee & payment',cols:[{n:'Res_id',t:'INT',pk:true},{n:'R_status',t:'ENUM'},{n:'Start_time',t:'DATETIME'},{n:'End_time',t:'DATETIME'},{n:'Fee',t:'DECIMAL(10,2)'},{n:'Payment_status',t:'ENUM'},{n:'R_slot_id',t:'INT',fk:'ParkingSlot.Slot_id'},{n:'RD_id',t:'INT',fk:'Driver.Did'}]},
    {name:'EntryExitLog',note:'Real-time entry/exit with auto fee',cols:[{n:'Log_id',t:'INT',pk:true},{n:'Entry_time',t:'DATETIME'},{n:'Exit_time',t:'DATETIME'},{n:'Fee',t:'DECIMAL(10,2)'},{n:'Payment_status',t:'ENUM'},{n:'EV_id',t:'INT',fk:'Vehicle.V_id'},{n:'E_slot_id',t:'INT',fk:'ParkingSlot.Slot_id'}]}
  ];
  document.getElementById('schemaContainer').innerHTML = tables.map(t => `
    <div class="schema-card">
      <div class="schema-card-header"><span class="schema-card-name">${t.name}</span><span class="schema-card-badge">TABLE</span></div>
      <div class="schema-cols">${t.cols.map(c => {
        const cls=c.pk?'pk':c.fk?'fk':'attr';
        const prefix=c.pk?'PK':c.fk?'FK':'';
        return `<div class="schema-col ${cls}">${prefix?prefix+' ':''}${c.n} <span style="opacity:.6;font-size:11px;font-weight:400">${c.t}${c.fk?' → '+c.fk:''}</span></div>`;
      }).join('')}</div>
      <div class="schema-note">${t.note}</div>
    </div>`).join('');
}

// ── MODALS ────────────────────────────────────────────────────
async function renderModal(type, data) {
  const title = document.getElementById('modalTitle');
  const body  = document.getElementById('modalBody');

  if (type === 'driver') {
    title.textContent = data ? 'Edit Driver' : 'Add Driver';
    body.innerHTML = `
      <div class="form-group"><label class="form-label">Full Name</label><input class="form-control" id="f-name" value="${data?.D_name||''}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Phone</label><input class="form-control" id="f-phone" value="${data?.Phone||''}"></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-control" id="f-email" type="email" value="${data?.Email||''}"></div>
      </div>
      <div class="form-footer"><button class="btn-cancel" onclick="closeModal()">Cancel</button><button class="btn-primary" onclick="saveDriver(${data?.Did||null})">Save</button></div>`;
  } else if (type === 'vehicle') {
    const drivers = await api('/api/drivers');
    title.textContent = data ? 'Edit Vehicle' : 'Add Vehicle';
    body.innerHTML = `
      <div class="form-row">
        <div class="form-group"><label class="form-label">License Plate</label><input class="form-control" id="f-lp" value="${data?.License_Plate||''}"></div>
        <div class="form-group"><label class="form-label">Model</label><input class="form-control" id="f-model" value="${data?.Model||''}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Type</label>
          <select class="form-control" id="f-vtype">${['Two-Wheeler','Four-Wheeler','Heavy Vehicle'].map(v=>`<option ${data?.V_type===v?'selected':''}>${v}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Driver</label>
          <select class="form-control" id="f-vdid">${drivers.map(d=>`<option value="${d.Did}" ${data?.VDid===d.Did?'selected':''}>${d.D_name}</option>`).join('')}</select></div>
      </div>
      <div class="form-footer"><button class="btn-cancel" onclick="closeModal()">Cancel</button><button class="btn-primary" onclick="saveVehicle(${data?.V_id||null})">Save</button></div>`;
  } else if (type === 'lot') {
    title.textContent = data ? 'Edit Lot' : 'Add Parking Lot';
    body.innerHTML = `
      <div class="form-group"><label class="form-label">Lot Name</label><input class="form-control" id="f-lname" value="${data?.Lot_name||''}"></div>
      <div class="form-group"><label class="form-label">Address</label><input class="form-control" id="f-addr" value="${data?.Address||''}"></div>
      <div class="form-group"><label class="form-label">Total Slots</label><input class="form-control" id="f-total" type="number" value="${data?.Total_slot||10}"></div>
      <div class="form-footer"><button class="btn-cancel" onclick="closeModal()">Cancel</button><button class="btn-primary" onclick="saveLot(${data?.Lot_id||null})">Save</button></div>`;
  } else if (type === 'slot') {
    const lots = await api('/api/lots');
    title.textContent = 'Add Parking Slot';
    body.innerHTML = `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Type</label>
          <select class="form-control" id="f-stype">${['Two-Wheeler','Four-Wheeler','Heavy Vehicle'].map(v=>`<option>${v}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Lot</label>
          <select class="form-control" id="f-slotlot">${lots.map(l=>`<option value="${l.Lot_id}">${l.Lot_name}</option>`).join('')}</select></div>
      </div>
      <div class="form-footer"><button class="btn-cancel" onclick="closeModal()">Cancel</button><button class="btn-primary" onclick="saveSlot()">Save</button></div>`;
  } else if (type === 'slotDetail') {
    title.textContent = `Slot #${data.Slot_id}`;
    body.innerHTML = `
      <div style="margin-bottom:14px"><p style="margin-bottom:6px;font-size:13px"><span style="color:var(--text-muted)">Type:</span> ${data.S_type}</p>
        <p style="margin-bottom:6px;font-size:13px"><span style="color:var(--text-muted)">Status:</span> ${statusChip(data.Statement)}</p>
        <p style="font-size:13px"><span style="color:var(--text-muted)">Lot:</span> ${data.Lot_name}</p></div>
      <div class="form-group"><label class="form-label">Change Status</label>
        <select class="form-control" id="f-stmt">${['Available','Occupied','Reserved'].map(s=>`<option ${data.Statement===s?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="form-footer">
        <button class="btn-sm btn-danger" onclick="delSlot(${data.Slot_id})">Delete Slot</button>
        <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        <button class="btn-primary" onclick="updateSlot(${data.Slot_id})">Update</button>
      </div>`;
  } else if (type === 'reservation') {
    const [drivers, slots] = await Promise.all([api('/api/drivers'), api('/api/slots?status=Available')]);
    title.textContent = 'New Reservation';
    const now = new Date(); now.setSeconds(0,0);
    const end = new Date(now); end.setHours(end.getHours()+2);
    const toLocal = d => d.toISOString().slice(0,16);
    body.innerHTML = `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Driver</label>
          <select class="form-control" id="f-rdid">${drivers.map(d=>`<option value="${d.Did}">${d.D_name}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Available Slot</label>
          <select class="form-control" id="f-rslot">${slots.map(s=>`<option value="${s.Slot_id}">#${s.Slot_id} ${s.S_type} (${s.Lot_name})</option>`).join('')}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Start</label><input class="form-control" id="f-start" type="datetime-local" value="${toLocal(now)}"></div>
        <div class="form-group"><label class="form-label">End</label><input class="form-control" id="f-end" type="datetime-local" value="${toLocal(end)}"></div>
      </div>
      <div class="form-footer"><button class="btn-cancel" onclick="closeModal()">Cancel</button><button class="btn-primary" onclick="saveReservation()">Confirm</button></div>`;
  } else if (type === 'log') {
    const [vehicles, slots] = await Promise.all([api('/api/vehicles'), api('/api/slots?status=Available')]);
    title.textContent = 'Log Vehicle Entry';
    body.innerHTML = `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Vehicle</label>
          <select class="form-control" id="f-evid">${vehicles.map(v=>`<option value="${v.V_id}">${v.License_Plate} (${v.V_type})</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Slot</label>
          <select class="form-control" id="f-eslot">${slots.map(s=>`<option value="${s.Slot_id}">#${s.Slot_id} ${s.S_type} (${s.Lot_name})</option>`).join('')}</select></div>
      </div>
      <div class="form-footer"><button class="btn-cancel" onclick="closeModal()">Cancel</button><button class="btn-primary" onclick="saveLog()">Log Entry</button></div>`;
  }
}

// ── SAVE HANDLERS ─────────────────────────────────────────────
async function saveDriver(id) {
  const b={D_name:document.getElementById('f-name').value,Phone:document.getElementById('f-phone').value,Email:document.getElementById('f-email').value};
  try{await api(id?`/api/drivers/${id}`:'/api/drivers',id?'PUT':'POST',b);showToast(id?'Updated':'Added');closeModal();loadDrivers();}catch(e){showToast(e.message,'error');}
}
async function saveVehicle(id) {
  const b={License_Plate:document.getElementById('f-lp').value,Model:document.getElementById('f-model').value,V_type:document.getElementById('f-vtype').value,VDid:+document.getElementById('f-vdid').value};
  try{await api(id?`/api/vehicles/${id}`:'/api/vehicles',id?'PUT':'POST',b);showToast(id?'Updated':'Added');closeModal();loadVehicles();}catch(e){showToast(e.message,'error');}
}
async function saveLot(id) {
  const b={Lot_name:document.getElementById('f-lname').value,Address:document.getElementById('f-addr').value,Total_slot:+document.getElementById('f-total').value};
  try{await api(id?`/api/lots/${id}`:'/api/lots',id?'PUT':'POST',b);showToast(id?'Updated':'Added');closeModal();loadLots();}catch(e){showToast(e.message,'error');}
}
async function saveSlot() {
  const b={S_type:document.getElementById('f-stype').value,PLot_id:+document.getElementById('f-slotlot').value};
  try{await api('/api/slots','POST',b);showToast('Added');closeModal();loadSlots();}catch(e){showToast(e.message,'error');}
}
async function updateSlot(id) {
  try{await api(`/api/slots/${id}`,'PUT',{Statement:document.getElementById('f-stmt').value});showToast('Updated');closeModal();loadSlots();}catch(e){showToast(e.message,'error');}
}
async function delSlot(id) {
  if(!confirm('Delete?'))return; try{await api(`/api/slots/${id}`,'DELETE');showToast('Deleted');closeModal();loadSlots();}catch(e){showToast(e.message,'error');}
}
async function saveReservation() {
  const b={RD_id:+document.getElementById('f-rdid').value,R_slot_id:+document.getElementById('f-rslot').value,Start_time:document.getElementById('f-start').value,End_time:document.getElementById('f-end').value};
  try{const r=await api('/api/reservations','POST',b);showToast(`Confirmed! ₹${r.fee}`);closeModal();loadReservations();loadDashboard();}catch(e){showToast(e.message,'error');}
}
async function saveLog() {
  const b={EV_id:+document.getElementById('f-evid').value,E_slot_id:+document.getElementById('f-eslot').value};
  try{await api('/api/logs','POST',b);showToast('Entry logged');closeModal();loadLogs();loadDashboard();}catch(e){showToast(e.message,'error');}
}

// ── INIT ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  lucide.createIcons();
  document.getElementById('cmdInput')?.addEventListener('input', e => renderCmdResults(e.target.value));
});
