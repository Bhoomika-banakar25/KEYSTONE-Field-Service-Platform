-- ============================================================
-- ManageByHR - Sample Seed Data
-- Run this in MySQL Workbench on hr_emp_management database
-- ============================================================

USE hr_emp_management;

-- ── Parts ─────────────────────────────────────────────────
INSERT INTO part (name, sku, unit_cost, stock_qty) VALUES
('Air Filter',        'AF-001', 250.00,  50),
('Coolant Pump',      'CP-002', 1200.00, 20),
('Electrical Wire',   'EW-003', 80.00,   200),
('Circuit Breaker',   'CB-004', 450.00,  30),
('Water Valve',       'WV-005', 320.00,  25),
('HVAC Compressor',   'HC-006', 8500.00, 10),
('Thermostat',        'TH-007', 600.00,  40),
('PVC Pipe (1m)',     'PP-008', 120.00,  100),
('LED Light Panel',   'LP-009', 750.00,  35),
('Motor Bearing',     'MB-010', 380.00,  60);

-- ── Customers ─────────────────────────────────────────────
INSERT INTO customer (company_name, contact_person, email, phone, address, active, created_at) VALUES
('Meridian Towers',     'Rajesh Kumar',   'rajesh@meridian.com',   '9876543210', '123 MG Road, Bangalore',         true, NOW()),
('Prestige Corp',       'Anita Sharma',   'anita@prestige.com',    '9845123456', '45 Brigade Road, Bangalore',     true, NOW()),
('Tech Park Ltd',       'Suresh Nair',    'suresh@techpark.com',   '9731234567', '78 Whitefield, Bangalore',       true, NOW()),
('Galaxy Infra',        'Priya Menon',    'priya@galaxy.com',      '9901234567', '12 Koramangala, Bangalore',      true, NOW()),
('Horizon Hotels',      'Vikram Singh',   'vikram@horizon.com',    '9812345678', '56 Indiranagar, Bangalore',      true, NOW());

-- ── Sites ─────────────────────────────────────────────────
INSERT INTO site (name, address, city, contact_phone, active, created_at, customer_id) VALUES
('Block A - HVAC',      '123 MG Road',      'Bangalore', '9876543210', true, NOW(), 1),
('Block B - Electrical','123 MG Road',      'Bangalore', '9876543211', true, NOW(), 1),
('Main Office',         '45 Brigade Road',  'Bangalore', '9845123456', true, NOW(), 2),
('Server Room',         '78 Whitefield',    'Bangalore', '9731234567', true, NOW(), 3),
('Lobby Area',          '12 Koramangala',   'Bangalore', '9901234567', true, NOW(), 4),
('Restaurant Floor',    '56 Indiranagar',   'Bangalore', '9812345678', true, NOW(), 5);

-- ── Work Orders ───────────────────────────────────────────
-- (assigned_to is NULL = unassigned, status starts as NEW)
INSERT INTO work_order (code, title, description, priority, status, sla_due_at, sla_breached, created_at, updated_at, customer_id, site_id, assigned_to) VALUES
('WO-0001', 'AC not cooling on 3rd floor',    'Central AC unit not working since morning',      'HIGH',     'NEW',         DATE_ADD(NOW(), INTERVAL 24 HOUR),  false, NOW(), NOW(), 1, 1, NULL),
('WO-0002', 'Power trip in server room',      'Frequent power trips causing downtime',          'CRITICAL', 'ASSIGNED',    DATE_ADD(NOW(), INTERVAL 4 HOUR),   false, NOW(), NOW(), 3, 4, NULL),
('WO-0003', 'Water leakage in lobby',         'Pipe leaking near reception area',               'MEDIUM',   'IN_PROGRESS', DATE_ADD(NOW(), INTERVAL 48 HOUR),  false, NOW(), NOW(), 4, 5, NULL),
('WO-0004', 'Replace lobby LED lights',       'Several lights have stopped working',            'LOW',      'COMPLETED',   DATE_ADD(NOW(), INTERVAL 72 HOUR),  false, NOW(), NOW(), 5, 6, NULL),
('WO-0005', 'HVAC filter replacement',        'Monthly filter replacement due',                 'MEDIUM',   'CLOSED',      DATE_ADD(NOW(), INTERVAL 48 HOUR),  false, NOW(), NOW(), 1, 1, NULL),
('WO-0006', 'Electrical inspection',          'Annual electrical safety inspection',            'LOW',      'NEW',         DATE_ADD(NOW(), INTERVAL 72 HOUR),  false, NOW(), NOW(), 2, 3, NULL),
('WO-0007', 'Compressor failure - Block B',   'HVAC compressor making loud noise and failing',  'CRITICAL', 'IN_PROGRESS', DATE_ADD(NOW(), INTERVAL 4 HOUR),   false, NOW(), NOW(), 1, 2, NULL),
('WO-0008', 'Thermostat calibration',         'Temperature reading inaccurate on floor 2',     'LOW',      'NEW',         DATE_ADD(NOW(), INTERVAL 72 HOUR),  false, NOW(), NOW(), 2, 3, NULL);

-- ── Status History ────────────────────────────────────────
INSERT INTO work_order_status_history (work_order_id, from_status, to_status, changed_by, changed_at, note) VALUES
(1, NULL,          'NEW',         'manager@meridian.com', NOW(), 'Work order created'),
(2, NULL,          'NEW',         'manager@meridian.com', NOW(), 'Work order created'),
(2, 'NEW',         'ASSIGNED',    'manager@meridian.com', DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'Assigned to technician'),
(3, NULL,          'NEW',         'manager@meridian.com', NOW(), 'Work order created'),
(3, 'NEW',         'ASSIGNED',    'manager@meridian.com', DATE_ADD(NOW(), INTERVAL 5 MINUTE),  'Assigned to tech team'),
(3, 'ASSIGNED',    'IN_PROGRESS', 'tech@meridian.com',    DATE_ADD(NOW(), INTERVAL 30 MINUTE), 'Started repair work'),
(4, NULL,          'NEW',         'manager@meridian.com', NOW(), 'Work order created'),
(4, 'NEW',         'ASSIGNED',    'manager@meridian.com', DATE_ADD(NOW(), INTERVAL 15 MINUTE), 'Assigned'),
(4, 'ASSIGNED',    'IN_PROGRESS', 'tech@meridian.com',    DATE_ADD(NOW(), INTERVAL 1 HOUR),    'Work started'),
(4, 'IN_PROGRESS', 'COMPLETED',   'tech@meridian.com',    DATE_ADD(NOW(), INTERVAL 3 HOUR),    'All lights replaced'),
(5, NULL,          'NEW',         'manager@meridian.com', NOW(), 'Work order created'),
(5, 'NEW',         'ASSIGNED',    'manager@meridian.com', DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'Assigned to team'),
(5, 'ASSIGNED',    'IN_PROGRESS', 'tech@meridian.com',    DATE_ADD(NOW(), INTERVAL 2 HOUR),    'Filter replacement started'),
(5, 'IN_PROGRESS', 'COMPLETED',   'tech@meridian.com',    DATE_ADD(NOW(), INTERVAL 4 HOUR),    'Filters replaced'),
(5, 'COMPLETED',   'CLOSED',      'manager@meridian.com', DATE_ADD(NOW(), INTERVAL 5 HOUR),    'Signed off by manager'),
(6, NULL,          'NEW',         'manager@meridian.com', NOW(), 'Work order created'),
(7, NULL,          'NEW',         'manager@meridian.com', NOW(), 'Work order created'),
(7, 'NEW',         'ASSIGNED',    'manager@meridian.com', DATE_ADD(NOW(), INTERVAL 5 MINUTE),  'Urgent - assigned immediately'),
(7, 'ASSIGNED',    'IN_PROGRESS', 'tech@meridian.com',    DATE_ADD(NOW(), INTERVAL 20 MINUTE), 'Working on compressor'),
(8, NULL,          'NEW',         'manager@meridian.com', NOW(), 'Work order created');

SELECT 'Seed data inserted successfully!' as Status;
SELECT 'Parts:' as Table_Name, COUNT(*) as Count FROM part
UNION ALL SELECT 'Customers:', COUNT(*) FROM customer
UNION ALL SELECT 'Sites:', COUNT(*) FROM site
UNION ALL SELECT 'Work Orders:', COUNT(*) FROM work_order
UNION ALL SELECT 'Status History:', COUNT(*) FROM work_order_status_history;
