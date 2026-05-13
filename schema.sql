
CREATE DATABASE IF NOT EXISTS smart_parking;
USE smart_parking;

-- ----------------------------------------------------------------
-- TABLE 1: DRIVER
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Driver (
  Did       INT AUTO_INCREMENT PRIMARY KEY,
  D_name    VARCHAR(100) NOT NULL,
  Phone     VARCHAR(15) NOT NULL UNIQUE,
  Email     VARCHAR(100) NOT NULL UNIQUE
);

-- ----------------------------------------------------------------
-- TABLE 2: VEHICLE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Vehicle (
  V_id          INT AUTO_INCREMENT PRIMARY KEY,
  License_Plate VARCHAR(20) NOT NULL UNIQUE,
  V_type        ENUM('Two-Wheeler','Four-Wheeler','Heavy Vehicle') NOT NULL,
  Model         VARCHAR(100) NOT NULL,
  VDid          INT NOT NULL,
  FOREIGN KEY (VDid) REFERENCES Driver(Did) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- TABLE 3: PARKING LOT
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ParkingLot (
  Lot_id    INT AUTO_INCREMENT PRIMARY KEY,
  Lot_name  VARCHAR(100) NOT NULL,
  Address   VARCHAR(255) NOT NULL
);

-- ----------------------------------------------------------------
-- TABLE 4: LOT TOTAL SLOT (weak entity of ParkingLot)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS LotTotalSlot (
  Lot_id     INT PRIMARY KEY,
  Total_slot INT NOT NULL DEFAULT 0,
  FOREIGN KEY (Lot_id) REFERENCES ParkingLot(Lot_id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- TABLE 5: PARKING SLOT
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ParkingSlot (
  Slot_id   INT AUTO_INCREMENT PRIMARY KEY,
  S_type    ENUM('Two-Wheeler','Four-Wheeler','Heavy Vehicle') NOT NULL,
  Statement ENUM('Available','Occupied','Reserved') NOT NULL DEFAULT 'Available',
  PLot_id   INT NOT NULL,
  FOREIGN KEY (PLot_id) REFERENCES ParkingLot(Lot_id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- TABLE 6: RESERVATION
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Reservation (
  Res_id      INT AUTO_INCREMENT PRIMARY KEY,
  R_status    ENUM('Pending','Confirmed','Cancelled','Completed') NOT NULL DEFAULT 'Pending',
  Start_time  DATETIME NOT NULL,
  End_time    DATETIME NOT NULL,
  Fee         DECIMAL(10,2) DEFAULT 0.00,
  Payment_status ENUM('Unpaid','Paid') DEFAULT 'Unpaid',
  R_slot_id   INT NOT NULL,
  RD_id       INT NOT NULL,
  FOREIGN KEY (R_slot_id) REFERENCES ParkingSlot(Slot_id) ON DELETE CASCADE,
  FOREIGN KEY (RD_id)     REFERENCES Driver(Did) ON DELETE CASCADE,
  -- Prevent double-booking same slot at overlapping times
  CHECK (End_time > Start_time)
);

-- ----------------------------------------------------------------
-- TABLE 7: ENTRY-EXIT LOG
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS EntryExitLog (
  Log_id      INT AUTO_INCREMENT PRIMARY KEY,
  Entry_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Exit_time   DATETIME,
  Fee         DECIMAL(10,2) DEFAULT 0.00,
  Payment_status ENUM('Unpaid','Paid') DEFAULT 'Unpaid',
  EV_id       INT NOT NULL,
  E_slot_id   INT NOT NULL,
  FOREIGN KEY (EV_id)     REFERENCES Vehicle(V_id) ON DELETE CASCADE,
  FOREIGN KEY (E_slot_id) REFERENCES ParkingSlot(Slot_id) ON DELETE CASCADE
);

-- ================================================================
-- INDEXES for performance
-- ================================================================
CREATE INDEX idx_vehicle_driver   ON Vehicle(VDid);
CREATE INDEX idx_slot_lot         ON ParkingSlot(PLot_id);
CREATE INDEX idx_slot_status      ON ParkingSlot(Statement);
CREATE INDEX idx_reservation_slot ON Reservation(R_slot_id);
CREATE INDEX idx_reservation_driver ON Reservation(RD_id);
CREATE INDEX idx_log_vehicle      ON EntryExitLog(EV_id);
CREATE INDEX idx_log_slot         ON EntryExitLog(E_slot_id);

-- ================================================================
-- SAMPLE DATA
-- ================================================================

INSERT INTO Driver (D_name, Phone, Email) VALUES
  ('Ayush Mishra',  '9876543210', 'ayush@example.com'),
  ('Riya Sharma',   '9123456789', 'riya@example.com'),
  ('Karan Mehta',   '9988776655', 'karan@example.com'),
  ('Sneha Patel',   '9000111222', 'sneha@example.com');

INSERT INTO Vehicle (License_Plate, V_type, Model, VDid) VALUES
  ('MH12AB1234', 'Four-Wheeler',  'Honda City',     1),
  ('MH12CD5678', 'Two-Wheeler',   'Royal Enfield',  1),
  ('MH14EF9012', 'Four-Wheeler',  'Hyundai i20',    2),
  ('MH01GH3456', 'Heavy Vehicle', 'Tata Ace',       3),
  ('MH03IJ7890', 'Two-Wheeler',   'Honda Activa',   4);

INSERT INTO ParkingLot (Lot_name, Address) VALUES
  ('Zone A - Main Block',  '123 MG Road, Pune'),
  ('Zone B - West Wing',   '45 FC Road, Pune'),
  ('Zone C - Market Area', '78 Market Street, Pune');

INSERT INTO LotTotalSlot (Lot_id, Total_slot) VALUES (1, 10), (2, 8), (3, 6);

INSERT INTO ParkingSlot (S_type, Statement, PLot_id) VALUES
  ('Two-Wheeler',   'Available', 1), ('Two-Wheeler',   'Available', 1),
  ('Four-Wheeler',  'Available', 1), ('Four-Wheeler',  'Available', 1),
  ('Four-Wheeler',  'Available', 1), ('Heavy Vehicle', 'Available', 1),
  ('Two-Wheeler',   'Available', 2), ('Two-Wheeler',   'Available', 2),
  ('Four-Wheeler',  'Available', 2), ('Four-Wheeler',  'Available', 2),
  ('Heavy Vehicle', 'Available', 2), ('Heavy Vehicle', 'Available', 2),
  ('Two-Wheeler',   'Available', 3), ('Four-Wheeler',  'Available', 3),
  ('Four-Wheeler',  'Available', 3), ('Heavy Vehicle', 'Available', 3);

INSERT INTO Reservation (R_status, Start_time, End_time, Fee, Payment_status, R_slot_id, RD_id) VALUES
  ('Confirmed',  '2026-05-10 09:00:00', '2026-05-10 11:00:00', 100.00, 'Paid',   3, 1),
  ('Pending',    '2026-05-10 13:00:00', '2026-05-10 15:00:00',  40.00, 'Unpaid', 1, 2),
  ('Completed',  '2026-05-09 10:00:00', '2026-05-09 12:00:00', 100.00, 'Paid',   4, 3),
  ('Cancelled',  '2026-05-08 08:00:00', '2026-05-08 10:00:00',   0.00, 'Unpaid', 7, 4);

INSERT INTO EntryExitLog (Entry_time, Exit_time, Fee, Payment_status, EV_id, E_slot_id) VALUES
  ('2026-05-09 10:05:00', '2026-05-09 12:10:00', 103.33, 'Paid',   1, 4),
  ('2026-05-10 09:02:00', NULL,                    0.00, 'Unpaid', 1, 3),
  ('2026-05-10 08:00:00', '2026-05-10 09:30:00',  30.00, 'Paid',   3, 7);
