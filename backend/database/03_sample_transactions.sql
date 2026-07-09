-- ============================================================
-- Restaurant Business Intelligence Platform — Sample Transactions
-- Run this THIRD (after 01_schema.sql and 02_seed_data.sql)
--
-- Purpose: gives the Analytics and CRM modules real rows to
-- aggregate — top-selling items, peak hours, revenue, loyalty,
-- coupon usage, customer visit history.
--
-- All column lists verified against the current 01_schema.sql.
-- ============================================================

USE restaurant_bi_platform;

-- ─── Orders ──────────────────────────────────────────────────
-- created_by = 3 (Rahul, Cashier), branch_id = 1
-- customer_id links to Customers seeded in 02_seed_data.sql (ids 1-10)
-- Order 2 uses coupon WELCOME10 (id=1) → discount_amount = 29.90
-- Order 5 still PREPARING — no payment yet

INSERT INTO Orders (id, order_number, customer_id, branch_id, table_id, created_by, order_date, status, subtotal, tax_amount, discount_amount, grand_total) VALUES
  (1, 'ORD-1001', 1, 1, 1, 3, '2026-06-15 12:30:00', 'COMPLETED', 498.00, 24.90, 0.00,  522.90),
  (2, 'ORD-1002', 2, 1, 2, 3, '2026-06-15 13:15:00', 'COMPLETED', 299.00, 14.95, 29.90, 284.05),
  (3, 'ORD-1003', 1, 1, 1, 3, '2026-06-15 19:45:00', 'COMPLETED', 348.00, 17.40, 0.00,  365.40),
  (4, 'ORD-1004', 2, 1, 3, 3, '2026-06-16 13:00:00', 'COMPLETED', 248.00, 12.40, 0.00,  260.40),
  (5, 'ORD-1005', 1, 1, 2, 3, '2026-06-16 20:10:00', 'PREPARING', 199.00, 9.95,  0.00,  208.95);

-- Mark table 2 as OCCUPIED (order 5 is still active on it)
UPDATE Restaurant_Tables SET status = 'OCCUPIED' WHERE id = 2;

-- ─── Order Items ─────────────────────────────────────────────
-- Order 1: Pizza + Burger
INSERT INTO Order_Items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
  (1, 1, 1, 299.00, 299.00),
  (1, 2, 1, 199.00, 199.00);

-- Order 2: Pizza only (WELCOME10 coupon applied → 10% discount = 29.90)
INSERT INTO Order_Items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
  (2, 1, 1, 299.00, 299.00);

-- Order 3: Spring Rolls + Cold Coffee + Brownie
INSERT INTO Order_Items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
  (3, 3, 1, 149.00, 149.00),
  (3, 4, 1, 99.00,  99.00),
  (3, 5, 1, 100.00, 100.00);

-- Order 4: Spring Rolls + Cold Coffee
INSERT INTO Order_Items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
  (4, 3, 1, 149.00, 149.00),
  (4, 4, 1, 99.00,  99.00);

-- Order 5: Burger only (still PREPARING)
INSERT INTO Order_Items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
  (5, 2, 1, 199.00, 199.00);

-- ─── Payments ────────────────────────────────────────────────
-- Only for COMPLETED orders (1–4). Order 5 is still PREPARING.
INSERT INTO Payments (order_id, amount, payment_date, payment_method, payment_status) VALUES
  (1, 522.90, '2026-06-15 12:45:00', 'CARD', 'SUCCESS'),
  (2, 284.05, '2026-06-15 13:25:00', 'UPI',  'SUCCESS'),
  (3, 365.40, '2026-06-15 20:00:00', 'CASH', 'SUCCESS'),
  (4, 260.40, '2026-06-16 13:20:00', 'UPI',  'SUCCESS');

-- ─── Kitchen Orders ──────────────────────────────────────────
-- Columns: order_id, branch_id, status, assigned_chef, notes,
--          started_at, ready_at, served_at
-- assigned_chef = 4 (Chef Anand), branch_id = 1
-- Status ENUM: PENDING | PREPARING | READY | SERVED
-- (schema uses SERVED not COMPLETED — corrected from old version)

INSERT INTO Kitchen_Orders (order_id, branch_id, status, assigned_chef, notes, started_at, ready_at, served_at) VALUES
  (1, 1, 'SERVED',   4, NULL, '2026-06-15 12:31:00', '2026-06-15 12:40:00', '2026-06-15 12:43:00'),
  (2, 1, 'SERVED',   4, NULL, '2026-06-15 13:16:00', '2026-06-15 13:26:00', '2026-06-15 13:29:00'),
  (3, 1, 'SERVED',   4, NULL, '2026-06-15 19:46:00', '2026-06-15 19:56:00', '2026-06-15 19:59:00'),
  (4, 1, 'SERVED',   4, NULL, '2026-06-16 13:01:00', '2026-06-16 13:12:00', '2026-06-16 13:16:00'),
  (5, 1, 'PREPARING',4, NULL, '2026-06-16 20:11:00', NULL,                  NULL);

-- ─── CRM: Coupon Redemptions ──────────────────────────────────
-- Order 2: customer 2 (Jane Smith) used coupon 1 (WELCOME10)
-- discount_applied = 29.90 (10% of 299.00 subtotal)
-- Uses Coupon_Redemptions (new CRM table) — not the legacy Coupon_Usage

INSERT INTO Coupon_Redemptions (customer_id, coupon_id, order_id, discount_applied, redeemed_at) VALUES
  (2, 1, 2, 29.90, '2026-06-15 13:25:00');

-- ─── CRM: Loyalty Transactions ───────────────────────────────
-- Rule: ₹10 spent = 1 point (floor division of grand_total)
-- Order 1: John  → ₹522.90 → 52 points
-- Order 2: Jane  → ₹284.05 → 28 points
-- Order 3: John  → ₹365.40 → 36 points
-- Order 4: Jane  → ₹260.40 → 26 points

INSERT INTO Loyalty_Transactions (customer_id, points, transaction_date, transaction_type) VALUES
  (1, 52, '2026-06-15 12:45:00', 'EARNED'),
  (2, 28, '2026-06-15 13:25:00', 'EARNED'),
  (1, 36, '2026-06-15 20:00:00', 'EARNED'),
  (2, 26, '2026-06-16 13:20:00', 'EARNED');

-- ─── CRM: Update customer loyalty_points balance ─────────────
-- Keeps Customers.loyalty_points in sync with Loyalty_Transactions.
-- John (id=1): started with 100 (seed) + 52 + 36 = 188
-- Jane (id=2): started with 150 (seed) + 28 + 26 = 204

UPDATE Customers SET loyalty_points = 188 WHERE id = 1;
UPDATE Customers SET loyalty_points = 204 WHERE id = 2;