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
  (5, 'Waiter');

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
  (19, 'View Analytics',            'analytics.view');

-- ─── Role ↔ Permission Mapping ───────────────────────────────

-- Super Admin: every permission (1–19)
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
  (2, 19); -- analytics.view

-- Cashier: orders, payments, customers/loyalty/coupons at the till
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
  (3, 5),  -- orders.create
  (3, 6),  -- orders.view
  (3, 7),  -- orders.update_status
  (3, 9),  -- payments.process
  (3, 16), -- customers.manage
  (3, 17), -- loyalty.manage
  (3, 18); -- coupons.manage

-- Chef: kitchen queue + read-only inventory
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
  (4, 10), -- kitchen.view
  (4, 11), -- kitchen.update_status
  (4, 13); -- inventory.view

-- Waiter: take and track orders, no payment handling
INSERT INTO Role_Permissions (role_id, permission_id) VALUES
  (5, 5),  -- orders.create
  (5, 6),  -- orders.view
  (5, 7);  -- orders.update_status

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
  (5, 5, 1,    'Sneha Patel',   'waiter@branch1.com',     '$2b$12$APs4l.MhHEab/1EnJfHw6OJD6nVIIGc/Y9U96Xhu08TtAMUvm5uMi'); -- waiter123

-- ─── Restaurant Tables ───────────────────────────────────────
INSERT INTO Restaurant_Tables (id, table_number, capacity, branch_id) VALUES
  (1, 1, 2, 1),
  (2, 2, 4, 1),
  (3, 3, 6, 1),
  (4, 1, 4, 2);

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

-- ─── Ingredients ─────────────────────────────────────────────
INSERT INTO Ingredients (id, name, unit, current_stock, minimum_stock) VALUES
  (1, 'Tomato',        'kg',  8,  5),
  (2, 'Cheese',        'kg',  10, 5),
  (3, 'Burger Bun',    'pcs', 50, 20),
  (4, 'Chicken Patty', 'pcs', 40, 15),
  (5, 'Coffee Powder', 'kg',  5,  2);

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

-- ─── Suppliers ───────────────────────────────────────────────
INSERT INTO Suppliers (id, name, contact_person, phone, email) VALUES
  (1, 'Fresh Farms Pvt Ltd',  'Suresh Patel', '9988776655', 'contact@freshfarms.com'),
  (2, 'Dairy Best Suppliers', 'Meena Shah',   '9988776656', 'sales@dairybest.com');

-- ─── Taxes ───────────────────────────────────────────────────
INSERT INTO Taxes (id, tax_name, percentage) VALUES
  (1, 'CGST', 2.50),
  (2, 'SGST', 2.50);

-- ─── Coupons ─────────────────────────────────────────────────
INSERT INTO Coupons (id, code, discount, discount_type, valid_from, valid_to, minimum_order_amount, max_usage) VALUES
  (1, 'WELCOME10', 10.00, 'PERCENTAGE', '2026-01-01', '2026-12-31', 200.00, 100),
  (2, 'FLAT50',    50.00, 'FIXED',      '2026-01-01', '2026-12-31', 300.00, 50);