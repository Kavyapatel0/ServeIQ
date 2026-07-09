-- ============================================================
-- Restaurant Business Intelligence Platform — Seed Data
-- Run this SECOND (after 01_schema.sql)
--
-- IMPORTANT: All passwords are REAL bcrypt hashes (cost factor 12,
-- same as src/services/auth.service.js). Login using the plain-text
-- password in the comment next to each user row — never the hash.
-- ============================================================

USE restaurant_bi_platform;

-- ─── Roles ───────────────────────────────────────────────────
INSERT INTO Roles (id, name) VALUES
  (1, 'Super Admin'),
  (2, 'Branch Manager'),
  (3, 'Cashier'),
  (4, 'Chef'),
  (5, 'Waiter'),
  (6, 'Inventory Manager');

-- ─── Permissions ─────────────────────────────────────────────
-- permission_key is what the code checks (authorize("orders.create"))
-- name is the human-readable label for an admin UI

INSERT INTO Permissions (id, name, permission_key) VALUES
  (1,  'Manage Users',              'users.manage'),
  (2,  'View Users',                'users.view'),
  (3,  'Manage Roles & Permissions','roles.manage'),
  (4,  'Manage Branches',           'branches.manage'),
  (5,  'Create Orders',             'orders.create'),
  (6,  'View Orders',               'orders.view'),
  (7,  'Update Order Status',       'orders.update_status'),
  (8,  'Cancel Orders',             'orders.cancel'),
  (9,  'Process Payments',          'payments.process'),
  (10, 'View Kitchen Queue',        'kitchen.view'),
  (11, 'Update Kitchen Status',     'kitchen.update_status'),
  (12, 'Manage Menu',               'menu.manage'),
  (13, 'View Inventory',            'inventory.view'),
  (14, 'Manage Inventory',          'inventory.manage'),
  (15, 'Manage Suppliers',          'suppliers.manage'),
  (16, 'Manage Customers',          'customers.manage'),
  (17, 'Manage Loyalty Points',     'loyalty.manage'),
  (18, 'Manage Coupons',            'coupons.manage'),
  (19, 'View Analytics',            'analytics.view'),
  (20, 'View Tables',               'tables.view'),
  (21, 'View Suppliers',            'supplier.view'),
  (22, 'Manage Suppliers',          'supplier.manage'),
  (23, 'View Purchase Orders',      'purchase.view'),
  (24, 'Manage Purchase Orders',    'purchase.manage'),
  (25, 'View CRM',                  'crm.view'),
  (26, 'Manage CRM',                'crm.manage');

-- ─── Role ↔ Permission Mapping ───────────────────────────────

-- Super Admin: every permission (1–20)
INSERT INTO Role_Permissions (role_id, permission_id)
SELECT 1, id FROM Permissions;

-- Branch Manager: everything except user/role/branch management
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
  (2, 2),  -- users.view
  (2, 5),  -- orders.create
  (2, 6),  -- orders.view
  (2, 7),  -- orders.update_status
  (2, 8),  -- orders.cancel
  (2, 9),  -- payments.process
  (2, 10), -- kitchen.view
  (2, 11), -- kitchen.update_status
  (2, 12), -- menu.manage
  (2, 13), -- inventory.view
  (2, 14), -- inventory.manage
  (2, 15), -- suppliers.manage
  (2, 16), -- customers.manage
  (2, 17), -- loyalty.manage
  (2, 18), -- coupons.manage
  (2, 19), -- analytics.view
  (2, 20), -- tables.view
  (2, 21), -- supplier.view
  (2, 22), -- supplier.manage
  (2, 23), -- purchase.view
  (2, 24), -- purchase.manage
  (2, 25), -- crm.view
  (2, 26); -- crm.manage

-- Cashier: orders, payments, customers/loyalty/coupons at the till
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
  (3, 5),  -- orders.create
  (3, 6),  -- orders.view
  (3, 7),  -- orders.update_status
  (3, 9),  -- payments.process
  (3, 16), -- customers.manage
  (3, 17), -- loyalty.manage
  (3, 18), -- coupons.manage
  (3, 20), -- tables.view
  (3, 13), -- inventory.view (optional read-only)
  (3, 25); -- crm.view

-- Chef: kitchen queue + read-only inventory
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
  (4, 10), -- kitchen.view
  (4, 11), -- kitchen.update_status
  (4, 13); -- inventory.view

-- Waiter: take and track orders, view kitchen queue for ready orders
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
  (5, 5),  -- orders.create
  (5, 6),  -- orders.view
  (5, 7),  -- orders.update_status
  (5, 10), -- kitchen.view (to see READY orders and serve them)
  (5, 20); -- tables.view

-- Inventory Manager: full inventory module, no POS/orders access
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
  (6, 13), -- inventory.view
  (6, 14), -- inventory.manage
  (6, 21), -- supplier.view
  (6, 22), -- supplier.manage
  (6, 23), -- purchase.view
  (6, 24); -- purchase.manage

-- ─── Branches ────────────────────────────────────────────────
INSERT INTO Branches (id, name, location) VALUES
  (1, 'Downtown Branch', 'SG Highway, Ahmedabad'),
  (2, 'Mall Road Branch', 'Mall Road, Ahmedabad');

-- ─── Users ───────────────────────────────────────────────────
-- Plain-text password for login is in the trailing comment.

INSERT INTO Users (id, role_id, branch_id, name, email, password) VALUES
  (1, 1, NULL, 'Admin User',    'admin@restaurant.com',   '$2b$12$uiut6LGCSMe3jNh5fed3X.NVAIBjz6uyLVbjut3zQWgIZY6RewLpi'), -- admin123
  (2, 2, 1,    'Priya Sharma',  'manager@branch1.com',    '$2b$12$ZtJjPZ2igUVlUXOl5ryG..0Hug7jzED1MKAGJzmax9pwNfb.0r6q2'), -- manager123
  (3, 3, 1,    'Rahul Verma',   'cashier@branch1.com',    '$2b$12$Pf.ImIAoNA4hYluwMinGM.dkOwrx0sUscTbIY6L828x6cSMYb00LO'), -- cashier123
  (4, 4, 1,    'Chef Anand',    'chef@branch1.com',       '$2b$12$L/IDksHKqHe9AdEDb4bwse.KAFuslRicPfWKkXt7otsriH9ZISyb.'), -- chef123
  (5, 5, 1,    'Sneha Patel',   'waiter@branch1.com',     '$2b$12$APs4l.MhHEab/1EnJfHw6OJD6nVIIGc/Y9U96Xhu08TtAMUvm5uMi'), -- waiter123
  (6, 6, 1,    'Kabir Mehta',   'inventory@branch1.com',  '$2b$12$APs4l.MhHEab/1EnJfHw6OJD6nVIIGc/Y9U96Xhu08TtAMUvm5uMi'); -- waiter123

-- ─── Restaurant Tables ───────────────────────────────────────
INSERT INTO Restaurant_Tables (id, table_number, capacity, branch_id, status) VALUES
  (1, 'T1', 2, 1, 'AVAILABLE'),
  (2, 'T2', 4, 1, 'AVAILABLE'),
  (3, 'T3', 6, 1, 'AVAILABLE'),
  (4, 'T1', 4, 2, 'AVAILABLE'),
  (5, 'T4', 8, 1, 'AVAILABLE'),
  (6, 'T2', 2, 2, 'AVAILABLE');

-- ─── Menu Categories ─────────────────────────────────────────
INSERT INTO Menu_Categories (id, name) VALUES
  (1, 'Main Course'),
  (2, 'Starters'),
  (3, 'Beverages'),
  (4, 'Desserts');

-- ─── Menu Items ──────────────────────────────────────────────
INSERT INTO Menu_Items (id, category_id, name, description, selling_price, cost_price) VALUES
  (1, 1, 'Margherita Pizza',  'Classic cheese & tomato pizza',     299.00, 120.00),
  (2, 1, 'Chicken Burger',    'Grilled chicken patty burger',      199.00, 85.00),
  (3, 2, 'Veg Spring Rolls',  'Crispy vegetable spring rolls',     149.00, 60.00),
  (4, 3, 'Cold Coffee',       'Chilled blended coffee',            99.00,  35.00),
  (5, 4, 'Chocolate Brownie', 'Warm brownie with chocolate sauce', 129.00, 45.00);

-- ─── Branch Menu Items ───────────────────────────────────────
INSERT INTO Branch_Menu_Items (branch_id, menu_item_id, is_available) VALUES
  (1, 1, TRUE), (1, 2, TRUE), (1, 3, TRUE), (1, 4, TRUE), (1, 5, TRUE),
  (2, 1, TRUE), (2, 2, TRUE), (2, 3, TRUE), (2, 4, TRUE), (2, 5, FALSE);

-- ─── Suppliers ───────────────────────────────────────────────
INSERT INTO Suppliers (id, name, contact_person, phone, email, gst_number, address, is_active) VALUES
  (1, 'Fresh Farms Pvt Ltd',  'Suresh Patel', '9988776655', 'contact@freshfarms.com', '24AAAAA0000A1Z5', 'Plot 12, APMC Market, Ahmedabad', TRUE),
  (2, 'Dairy Best Suppliers', 'Meena Shah',   '9988776656', 'sales@dairybest.com',    '24BBBBB0000B1Z5', 'Sector 7, GIDC, Vatva, Ahmedabad', TRUE);

-- ─── Ingredients ─────────────────────────────────────────────
INSERT INTO Ingredients (id, name, unit, current_stock, minimum_stock, cost_price, supplier_id, is_active) VALUES
  (1, 'Tomato',        'kg',  8,  5,  18.00, 1, TRUE),
  (2, 'Cheese',        'kg',  10, 5,  320.00, 2, TRUE),
  (3, 'Burger Bun',    'pcs', 50, 20, 8.00,  1, TRUE),
  (4, 'Chicken Patty', 'pcs', 40, 15, 35.00, 1, TRUE),
  (5, 'Coffee Powder', 'kg',  5,  2,  450.00, 2, TRUE);

-- ─── Recipes (menu item -> ingredients used) ────────────────
INSERT INTO Recipes (menu_item_id, ingredient_id, quantity_required) VALUES
  (1, 1, 0.20), -- Pizza uses 0.2kg Tomato
  (1, 2, 0.15), -- Pizza uses 0.15kg Cheese
  (2, 3, 1),    -- Burger uses 1 Bun
  (2, 4, 1),    -- Burger uses 1 Patty
  (4, 5, 0.02); -- Cold Coffee uses 0.02kg Coffee Powder

-- ─── Branch Inventory ────────────────────────────────────────
INSERT INTO Branch_Inventory (branch_id, ingredient_id, current_stock) VALUES
  (1, 1, 8), (1, 2, 10), (1, 3, 50), (1, 4, 40), (1, 5, 5),
  (2, 1, 6), (2, 2, 8),  (2, 3, 30), (2, 4, 25), (2, 5, 3);

-- ─── Purchase Orders (sample: one RECEIVED, one PENDING) ──────
INSERT INTO Purchase_Orders (id, po_number, supplier_id, branch_id, created_by, status, total_amount, order_date, received_at) VALUES
  (1, 'PO-20260601-0001', 1, 1, 2, 'RECEIVED', 600.00, '2026-06-01 09:00:00', '2026-06-01 14:30:00'),
  (2, 'PO-20260628-0001', 2, 1, 2, 'PENDING',  640.00, '2026-06-28 10:00:00', NULL);

-- ─── Purchase Order Items ──────────────────────────────────────
INSERT INTO Purchase_Order_Items (id, purchase_order_id, ingredient_id, quantity, unit_price, total_price) VALUES
  (1, 1, 1, 20, 18.00, 360.00), -- 20kg Tomato @ ₹18/kg (PO-1, received)
  (2, 1, 3, 30, 8.00,  240.00), -- 30 Burger Buns @ ₹8/pc (PO-1, received) — subtotal 600.00
  (3, 2, 2, 2,  320.00, 640.00); -- 2kg Cheese @ ₹320/kg (PO-2, pending)

-- ─── Inventory Transactions (only for the RECEIVED purchase order) ──
INSERT INTO Inventory_Transactions (ingredient_id, branch_id, quantity, transaction_type, reference_id, reference_type, notes, created_by, transaction_date) VALUES
  (1, 1, 20, 'PURCHASE', 1, 'PURCHASE_ORDER', 'Received PO-20260601-0001', 2, '2026-06-01 14:30:00'),
  (3, 1, 30, 'PURCHASE', 1, 'PURCHASE_ORDER', 'Received PO-20260601-0001', 2, '2026-06-01 14:30:00');

-- ─── Taxes ───────────────────────────────────────────────────
INSERT INTO Taxes (id, tax_name, percentage) VALUES
  (1, 'CGST', 2.50),
  (2, 'SGST', 2.50);

-- ─── Coupons ─────────────────────────────────────────────────
INSERT INTO Coupons (id, code, discount, discount_type, valid_from, valid_to, minimum_order_amount, max_usage) VALUES
  (1, 'WELCOME10', 10.00, 'PERCENTAGE', '2026-01-01', '2026-12-31', 200.00, 100),
  (2, 'FLAT50',    50.00, 'FIXED',      '2026-01-01', '2026-12-31', 300.00, 50);

-- ─── Kitchen Orders (sample data — tied to no real Orders yet) ───
-- These are inserted in 03_sample_transactions.sql instead,
-- once real Orders exist. Keeping seed data minimal here.
-- Customers

INSERT INTO Customers
(id, name, email, phone, loyalty_points)
VALUES
(1, 'John Doe', 'john.doe@example.com', '9876543210', 100),
(2, 'Jane Smith', 'jane.smith@example.com', '9876543211', 150),
(3, 'Rahul Patel', 'rahul.patel@example.com', '9876543212', 75),
(4, 'Neha Shah', 'neha.shah@example.com', '9876543213', 200),
(5, 'Amit Mehta', 'amit.mehta@example.com', '9876543214', 50),
(6, 'Priya Desai', 'priya.desai@example.com', '9876543215', 120),
(7, 'Karan Joshi', 'karan.joshi@example.com', '9876543216', 80),
(8, 'Sneha Trivedi', 'sneha.trivedi@example.com', '9876543217', 160),
(9, 'Vikas Sharma', 'vikas.sharma@example.com', '9876543218', 30),
(10, 'Riya Kapoor', 'riya.kapoor@example.com', '9876543219', 90);