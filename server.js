const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const pool = require('./db');
const app  = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// FEE RATES (₹/hour)
// ============================================================
const RATE = { 'Two-Wheeler': 20, 'Four-Wheeler': 50, 'Heavy Vehicle': 100 };

function calcFee(slotType, startTime, endTime) {
  const hrs = (new Date(endTime) - new Date(startTime)) / 3600000;
  return parseFloat(((RATE[slotType] || 50) * Math.max(hrs, 0)).toFixed(2));
}

// ============================================================
// DASHBOARD STATS
// ============================================================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [[drivers]]     = await pool.query('SELECT COUNT(*) AS c FROM Driver');
    const [[vehicles]]    = await pool.query('SELECT COUNT(*) AS c FROM Vehicle');
    const [[slots]]       = await pool.query('SELECT COUNT(*) AS c FROM ParkingSlot');
    const [[available]]   = await pool.query("SELECT COUNT(*) AS c FROM ParkingSlot WHERE Statement='Available'");
    const [[occupied]]    = await pool.query("SELECT COUNT(*) AS c FROM ParkingSlot WHERE Statement='Occupied'");
    const [[reserved]]    = await pool.query("SELECT COUNT(*) AS c FROM ParkingSlot WHERE Statement='Reserved'");
    const [[activeRes]]   = await pool.query("SELECT COUNT(*) AS c FROM Reservation WHERE R_status IN ('Pending','Confirmed')");
    const [[logs]]        = await pool.query('SELECT COUNT(*) AS c FROM EntryExitLog');
    const [[revenue]]     = await pool.query("SELECT COALESCE(SUM(Fee),0) AS total FROM Reservation WHERE Payment_status='Paid'");

    const [slotTypes]     = await pool.query(
      "SELECT S_type, COUNT(*) AS total, SUM(Statement='Available') AS available FROM ParkingSlot GROUP BY S_type"
    );
    const [lotOccupancy]  = await pool.query(`
      SELECT pl.Lot_name, lts.Total_slot,
        SUM(ps.Statement != 'Available') AS occupied
      FROM ParkingLot pl
      JOIN LotTotalSlot lts ON lts.Lot_id = pl.Lot_id
      JOIN ParkingSlot  ps  ON ps.PLot_id = pl.Lot_id
      GROUP BY pl.Lot_id
    `);
    const [recentRes]     = await pool.query(`
      SELECT r.Res_id, d.D_name, ps.Slot_id, r.R_status, r.Start_time, r.End_time, r.Fee, r.Payment_status
      FROM Reservation r
      JOIN Driver d      ON d.Did = r.RD_id
      JOIN ParkingSlot ps ON ps.Slot_id = r.R_slot_id
      ORDER BY r.Res_id DESC LIMIT 5
    `);

    res.json({
      drivers: drivers.c, vehicles: vehicles.c,
      slots: slots.c, available: available.c,
      occupied: occupied.c, reserved: reserved.c,
      activeReservations: activeRes.c, logs: logs.c,
      revenue: revenue.total,
      slotTypes, lotOccupancy, recentReservations: recentRes
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
// DRIVERS
// ============================================================
app.get('/api/drivers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Driver ORDER BY Did');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/drivers', async (req, res) => {
  const { D_name, Phone, Email } = req.body;
  if (!D_name || !Phone || !Email) return res.status(400).json({ error: 'All fields required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO Driver (D_name, Phone, Email) VALUES (?,?,?)', [D_name, Phone, Email]
    );
    res.status(201).json({ Did: result.insertId, D_name, Phone, Email });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/drivers/:id', async (req, res) => {
  const { D_name, Phone, Email } = req.body;
  try {
    await pool.query(
      'UPDATE Driver SET D_name=?, Phone=?, Email=? WHERE Did=?',
      [D_name, Phone, Email, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Driver WHERE Did=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
// VEHICLES
// ============================================================
app.get('/api/vehicles', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.*, d.D_name FROM Vehicle v
      JOIN Driver d ON d.Did = v.VDid ORDER BY v.V_id
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/vehicles', async (req, res) => {
  const { License_Plate, V_type, Model, VDid } = req.body;
  if (!License_Plate || !V_type || !Model || !VDid)
    return res.status(400).json({ error: 'All fields required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO Vehicle (License_Plate, V_type, Model, VDid) VALUES (?,?,?,?)',
      [License_Plate, V_type, Model, VDid]
    );
    res.status(201).json({ V_id: result.insertId, License_Plate, V_type, Model, VDid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/vehicles/:id', async (req, res) => {
  const { License_Plate, V_type, Model, VDid } = req.body;
  try {
    await pool.query(
      'UPDATE Vehicle SET License_Plate=?, V_type=?, Model=?, VDid=? WHERE V_id=?',
      [License_Plate, V_type, Model, VDid, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Vehicle WHERE V_id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
// PARKING LOTS
// ============================================================
app.get('/api/lots', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pl.*, lts.Total_slot,
        SUM(ps.Statement = 'Available') AS available_count,
        COUNT(ps.Slot_id)              AS slot_count
      FROM ParkingLot pl
      LEFT JOIN LotTotalSlot lts ON lts.Lot_id = pl.Lot_id
      LEFT JOIN ParkingSlot  ps  ON ps.PLot_id = pl.Lot_id
      GROUP BY pl.Lot_id
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/lots', async (req, res) => {
  const { Lot_name, Address, Total_slot } = req.body;
  if (!Lot_name || !Address) return res.status(400).json({ error: 'Name and address required' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO ParkingLot (Lot_name, Address) VALUES (?,?)', [Lot_name, Address]
    );
    await conn.query(
      'INSERT INTO LotTotalSlot (Lot_id, Total_slot) VALUES (?,?)', [result.insertId, Total_slot || 0]
    );
    await conn.commit();
    res.status(201).json({ Lot_id: result.insertId, Lot_name, Address, Total_slot });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});

app.put('/api/lots/:id', async (req, res) => {
  const { Lot_name, Address, Total_slot } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE ParkingLot SET Lot_name=?, Address=? WHERE Lot_id=?',
      [Lot_name, Address, req.params.id]
    );
    await conn.query(
      'UPDATE LotTotalSlot SET Total_slot=? WHERE Lot_id=?',
      [Total_slot, req.params.id]
    );
    await conn.commit();
    res.json({ message: 'Updated' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});

app.delete('/api/lots/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM ParkingLot WHERE Lot_id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
// PARKING SLOTS
// ============================================================
app.get('/api/slots', async (req, res) => {
  try {
    let q = `
      SELECT ps.*, pl.Lot_name FROM ParkingSlot ps
      JOIN ParkingLot pl ON pl.Lot_id = ps.PLot_id WHERE 1=1
    `;
    const params = [];
    if (req.query.lot_id)  { q += ' AND ps.PLot_id=?'; params.push(req.query.lot_id); }
    if (req.query.status)  { q += ' AND ps.Statement=?'; params.push(req.query.status); }
    if (req.query.s_type)  { q += ' AND ps.S_type=?'; params.push(req.query.s_type); }
    q += ' ORDER BY ps.Slot_id';
    const [rows] = await pool.query(q, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/slots', async (req, res) => {
  const { S_type, PLot_id, Statement } = req.body;
  if (!S_type || !PLot_id) return res.status(400).json({ error: 'Type and lot required' });
  try {
    const [result] = await pool.query(
      "INSERT INTO ParkingSlot (S_type, Statement, PLot_id) VALUES (?,?,?)",
      [S_type, Statement || 'Available', PLot_id]
    );
    res.status(201).json({ Slot_id: result.insertId, S_type, Statement: Statement || 'Available', PLot_id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/slots/:id', async (req, res) => {
  const { Statement } = req.body;
  try {
    await pool.query('UPDATE ParkingSlot SET Statement=? WHERE Slot_id=?', [Statement, req.params.id]);
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/slots/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM ParkingSlot WHERE Slot_id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
// RESERVATIONS  (with transaction + conflict check)
// ============================================================
app.get('/api/reservations', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, d.D_name, ps.S_type, ps.PLot_id, pl.Lot_name
      FROM Reservation r
      JOIN Driver d       ON d.Did      = r.RD_id
      JOIN ParkingSlot ps ON ps.Slot_id = r.R_slot_id
      JOIN ParkingLot  pl ON pl.Lot_id  = ps.PLot_id
      ORDER BY r.Res_id DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reservations', async (req, res) => {
  const { Start_time, End_time, R_slot_id, RD_id } = req.body;
  if (!Start_time || !End_time || !R_slot_id || !RD_id)
    return res.status(400).json({ error: 'All fields required' });
  if (new Date(End_time) <= new Date(Start_time))
    return res.status(400).json({ error: 'End time must be after start time' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check slot availability
    const [[slot]] = await conn.query(
      'SELECT * FROM ParkingSlot WHERE Slot_id=? FOR UPDATE', [R_slot_id]
    );
    if (!slot) throw new Error('Slot not found');
    if (slot.Statement !== 'Available') throw new Error(`Slot is currently ${slot.Statement}`);

    // Check time conflict
    const [conflicts] = await conn.query(`
      SELECT Res_id FROM Reservation
      WHERE R_slot_id=? AND R_status IN ('Pending','Confirmed')
        AND NOT (End_time <= ? OR Start_time >= ?)
    `, [R_slot_id, Start_time, End_time]);
    if (conflicts.length > 0) throw new Error('Slot already reserved for this time period');

    // Calculate fee
    const fee = calcFee(slot.S_type, Start_time, End_time);

    // Insert reservation
    const [result] = await conn.query(
      "INSERT INTO Reservation (R_status, Start_time, End_time, Fee, Payment_status, R_slot_id, RD_id) VALUES ('Confirmed',?,?,?,'Unpaid',?,?)",
      [Start_time, End_time, fee, R_slot_id, RD_id]
    );

    // Mark slot as reserved
    await conn.query("UPDATE ParkingSlot SET Statement='Reserved' WHERE Slot_id=?", [R_slot_id]);

    await conn.commit();
    res.status(201).json({ Res_id: result.insertId, fee, message: 'Reservation confirmed' });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally { conn.release(); }
});

app.put('/api/reservations/:id/status', async (req, res) => {
  const { R_status, Payment_status } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[res]] = await conn.query('SELECT * FROM Reservation WHERE Res_id=?', [req.params.id]);
    if (!res) throw new Error('Reservation not found');

    await conn.query(
      'UPDATE Reservation SET R_status=?, Payment_status=COALESCE(?,Payment_status) WHERE Res_id=?',
      [R_status, Payment_status || null, req.params.id]
    );

    // Free the slot on cancel / complete
    if (R_status === 'Cancelled' || R_status === 'Completed') {
      await conn.query("UPDATE ParkingSlot SET Statement='Available' WHERE Slot_id=?", [res.R_slot_id]);
    }
    await conn.commit();
    res.json({ message: `Status updated to ${R_status}` });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});

app.delete('/api/reservations/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[reservation]] = await conn.query('SELECT * FROM Reservation WHERE Res_id=?', [req.params.id]);
    if (reservation && ['Pending','Confirmed'].includes(reservation.R_status)) {
      await conn.query("UPDATE ParkingSlot SET Statement='Available' WHERE Slot_id=?", [reservation.R_slot_id]);
    }
    await conn.query('DELETE FROM Reservation WHERE Res_id=?', [req.params.id]);
    await conn.commit();
    res.json({ message: 'Deleted' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});

// ============================================================
// ENTRY-EXIT LOGS
// ============================================================
app.get('/api/logs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.*, v.License_Plate, v.V_type, v.Model,
             d.D_name, ps.Slot_id AS slot_num, pl.Lot_name
      FROM EntryExitLog l
      JOIN Vehicle     v  ON v.V_id     = l.EV_id
      JOIN Driver      d  ON d.Did      = v.VDid
      JOIN ParkingSlot ps ON ps.Slot_id = l.E_slot_id
      JOIN ParkingLot  pl ON pl.Lot_id  = ps.PLot_id
      ORDER BY l.Log_id DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/logs', async (req, res) => {
  const { EV_id, E_slot_id, Entry_time } = req.body;
  if (!EV_id || !E_slot_id) return res.status(400).json({ error: 'Vehicle and slot required' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[slot]] = await conn.query('SELECT * FROM ParkingSlot WHERE Slot_id=? FOR UPDATE', [E_slot_id]);
    if (!slot) throw new Error('Slot not found');
    if (slot.Statement === 'Occupied') throw new Error('Slot is already occupied');

    const [result] = await conn.query(
      'INSERT INTO EntryExitLog (Entry_time, EV_id, E_slot_id) VALUES (?,?,?)',
      [Entry_time || new Date(), EV_id, E_slot_id]
    );
    await conn.query("UPDATE ParkingSlot SET Statement='Occupied' WHERE Slot_id=?", [E_slot_id]);
    await conn.commit();
    res.status(201).json({ Log_id: result.insertId, message: 'Entry logged' });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally { conn.release(); }
});

// Vehicle Exit — auto-calculate fee
app.put('/api/logs/:id/exit', async (req, res) => {
  const { Exit_time, Payment_status } = req.body;
  const exitAt = Exit_time ? new Date(Exit_time) : new Date();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[log]] = await conn.query(`
      SELECT l.*, ps.S_type FROM EntryExitLog l
      JOIN ParkingSlot ps ON ps.Slot_id = l.E_slot_id
      WHERE l.Log_id=?
    `, [req.params.id]);
    if (!log) throw new Error('Log not found');
    if (log.Exit_time) throw new Error('Vehicle already exited');

    const fee = calcFee(log.S_type, log.Entry_time, exitAt);
    await conn.query(
      'UPDATE EntryExitLog SET Exit_time=?, Fee=?, Payment_status=? WHERE Log_id=?',
      [exitAt, fee, Payment_status || 'Unpaid', req.params.id]
    );
    await conn.query("UPDATE ParkingSlot SET Statement='Available' WHERE Slot_id=?", [log.E_slot_id]);
    await conn.commit();
    res.json({ fee, message: 'Exit recorded' });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally { conn.release(); }
});

app.delete('/api/logs/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM EntryExitLog WHERE Log_id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
// USER PORTAL APIs
// ============================================================

// Login by phone number
app.post('/api/user/login', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone required' });
  try {
    const [[driver]] = await pool.query('SELECT * FROM Driver WHERE Phone=?', [phone]);
    if (!driver) return res.status(404).json({ error: 'No account found with this phone number' });
    res.json(driver);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Register new driver (user self-registration)
app.post('/api/user/register', async (req, res) => {
  const { D_name, Phone, Email } = req.body;
  if (!D_name || !Phone || !Email) return res.status(400).json({ error: 'All fields required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO Driver (D_name, Phone, Email) VALUES (?,?,?)', [D_name, Phone, Email]
    );
    res.status(201).json({ Did: result.insertId, D_name, Phone, Email });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get available lots with slot counts
app.get('/api/user/lots', async (req, res) => {
  try {
    const [lots] = await pool.query(`
      SELECT pl.Lot_id, pl.Lot_name, pl.Address, lts.Total_slot,
        SUM(ps.Statement = 'Available') AS available_count,
        SUM(ps.Statement = 'Occupied')  AS occupied_count,
        SUM(ps.Statement = 'Reserved')  AS reserved_count
      FROM ParkingLot pl
      LEFT JOIN LotTotalSlot lts ON lts.Lot_id = pl.Lot_id
      LEFT JOIN ParkingSlot  ps  ON ps.PLot_id  = pl.Lot_id
      GROUP BY pl.Lot_id
    `);
    res.json(lots);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get available slots for a lot (optionally filter by vehicle type)
app.get('/api/user/lots/:lotId/slots', async (req, res) => {
  try {
    let q = `SELECT * FROM ParkingSlot WHERE PLot_id=? AND Statement='Available'`;
    const params = [req.params.lotId];
    if (req.query.v_type) { q += ' AND S_type=?'; params.push(req.query.v_type); }
    const [slots] = await pool.query(q, params);
    res.json(slots);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get driver's own reservations
app.get('/api/user/:driverId/reservations', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, ps.S_type, pl.Lot_name, pl.Address
      FROM Reservation r
      JOIN ParkingSlot ps ON ps.Slot_id = r.R_slot_id
      JOIN ParkingLot  pl ON pl.Lot_id  = ps.PLot_id
      WHERE r.RD_id = ?
      ORDER BY r.Res_id DESC
    `, [req.params.driverId]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get driver's own vehicles
app.get('/api/user/:driverId/vehicles', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Vehicle WHERE VDid=? ORDER BY V_id', [req.params.driverId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add vehicle for a driver
app.post('/api/user/:driverId/vehicles', async (req, res) => {
  const { License_Plate, V_type, Model } = req.body;
  if (!License_Plate || !V_type || !Model) return res.status(400).json({ error: 'All fields required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO Vehicle (License_Plate, V_type, Model, VDid) VALUES (?,?,?,?)',
      [License_Plate, V_type, Model, req.params.driverId]
    );
    res.status(201).json({ V_id: result.insertId, License_Plate, V_type, Model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get driver's entry-exit logs (via vehicles)
app.get('/api/user/:driverId/logs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.*, v.License_Plate, v.V_type, v.Model, ps.Slot_id, pl.Lot_name
      FROM EntryExitLog l
      JOIN Vehicle     v  ON v.V_id     = l.EV_id
      JOIN ParkingSlot ps ON ps.Slot_id = l.E_slot_id
      JOIN ParkingLot  pl ON pl.Lot_id  = ps.PLot_id
      WHERE v.VDid = ?
      ORDER BY l.Log_id DESC
    `, [req.params.driverId]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Cancel own reservation
app.put('/api/user/reservations/:id/cancel', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[reservation]] = await conn.query('SELECT * FROM Reservation WHERE Res_id=?', [req.params.id]);
    if (!reservation) throw new Error('Reservation not found');
    if (!['Pending','Confirmed'].includes(reservation.R_status)) throw new Error('Cannot cancel this reservation');
    await conn.query("UPDATE Reservation SET R_status='Cancelled' WHERE Res_id=?", [req.params.id]);
    await conn.query("UPDATE ParkingSlot SET Statement='Available' WHERE Slot_id=?", [reservation.R_slot_id]);
    await conn.commit();
    res.json({ message: 'Reservation cancelled' });
  } catch (err) { await conn.rollback(); res.status(400).json({ error: err.message }); }
  finally { conn.release(); }
});

// ============================================================
// SERVE FRONTEND
// ============================================================
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
app.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log(`✅ MySQL connected to '${process.env.DB_NAME || 'smart_parking'}'`);
  } catch (e) {
    console.error('❌ MySQL connection failed:', e.message);
    console.error('   Make sure MySQL is running and .env credentials are correct.');
  }
  console.log(`🚀 SmartPark server running at http://localhost:${PORT}`);
});
