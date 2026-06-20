-- ============================================================
-- Restaurant Business Intelligence Platform — Sample Transactions
-- Run this THIRD (after 01_schema.sql and 02_seed_data.sql)
--
-- Purpose: gives the Analytics module real rows to aggregate —
-- top-selling items, peak hours, revenue, payment breakdowns.
-- ============================================================

USE restaurant_bi_platform;

-- ─── Orders ──────────────────────────────────────────────────
-- created_by = 3 (Rahul, Cashier), branch_id = 1, table_id varies

INSERT INTO Orders (id, order_number, customer_id, branch_id, table_id, created_by, order_date, status, subtotal, tax_amount, discount_amount, grand_total) VALUES
  (1, 'ORD-1001', 1, 1, 1, 3, '2026-06-15 12:30:00', 'COMPLETED', 498.00, 24.90, 0.00,  522.90),
  (2, 'ORD-1002', 2, 1, 2, 3, '2026-06-15 13:15:00', 'COMPLETED', 299.00, 14.95, 29.90, 284.05),
  (3, 'ORD-1003', 1, 1, 1, 3, '2026-06-15 19:45:00', 'COMPLETED', 348.00, 17.40, 0.00,  365.40),
  (4, 'ORD-1004', 2, 1, 3, 3, '2026-06-16 13:00:00', 'COMPLETED', 248.00, 12.40, 0.00,  260.40),
  (5, 'ORD-1005', 1, 1, 2, 3, '2026-06-16 20:10:00', 'PREPARING', 199.00, 9.95,  0.00,  208.95);

-- ─── Order Items ─────────────────────────────────────────────
-- Order 1: Pizza + Burger
INSERT INTO Order_Items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
  (1, 1, 1, 299.00, 299.00),
  (1, 2, 1, 199.00, 199.00);

-- Order 2: Pizza only (with coupon discount applied at order level)
INSERT INTO Order_Items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
  (2, 1, 1, 299.00, 299.00);

-- Order 3: Spring Rolls + Cold Coffee + Brownie
INSERT INTO Order_Items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
  (3, 3, 1, 149.00, 149.00),
  (3, 4, 1, 99.00,  99.00),
  (3, 5, 1, 129.00, 100.00);

-- Order 4: Spring Rolls + Cold Coffee
INSERT INTO Order_Items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
  (4, 3, 1, 149.00, 149.00),
  (4, 4, 1, 99.00,  99.00);

-- Order 5: Burger only
INSERT INTO Order_Items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
  (5, 2, 1, 199.00, 199.00);

-- ─── Payments ────────────────────────────────────────────────
INSERT INTO Payments (order_id, amount, payment_date, payment_method, payment_status) VALUES
  (1, 522.90, '2026-06-15 12:45:00', 'CARD', 'SUCCESS'),
  (2, 284.05, '2026-06-15 13:25:00', 'UPI',  'SUCCESS'),
  (3, 365.40, '2026-06-15 20:00:00', 'CASH', 'SUCCESS'),
  (4, 260.40, '2026-06-16 13:20:00', 'UPI',  'SUCCESS');
  -- Order 5 still PREPARING — no payment yet

-- ─── Coupon Usage ────────────────────────────────────────────
INSERT INTO Coupon_Usage (customer_id, coupon_id, usage_date) VALUES
  (2, 1, '2026-06-15 13:15:00'); -- Neha used WELCOME10 on order 2

-- ─── Loyalty Transactions ────────────────────────────────────
-- 10 points per ₹100 spent, earned after successful payment
INSERT INTO Loyalty_Transactions (customer_id, points, transaction_date, transaction_type) VALUES
  (1, 52, '2026-06-15 12:45:00', 'EARNED'), -- from order 1
  (2, 28, '2026-06-15 13:25:00', 'EARNED'), -- from order 2
  (1, 36, '2026-06-15 20:00:00', 'EARNED'), -- from order 3
  (2, 26, '2026-06-16 13:20:00', 'EARNED'); -- from order 4

-- ─── Kitchen Orders ──────────────────────────────────────────
-- assigned_chef = 4 (Chef Anand)
INSERT INTO Kitchen_Orders (order_id, status, assigned_chef, started_at, completed_at) VALUES
  (1, 'COMPLETED',   4, '2026-06-15 12:31:00', '2026-06-15 12:42:00'),
  (2, 'COMPLETED',   4, '2026-06-15 13:16:00', '2026-06-15 13:28:00'),
  (3, 'COMPLETED',   4, '2026-06-15 19:46:00', '2026-06-15 19:58:00'),
  (4, 'COMPLETED',   4, '2026-06-16 13:01:00', '2026-06-16 13:14:00'),
  (5, 'IN_PROGRESS', 4, '2026-06-16 20:11:00', NULL);

-- ─── Purchase Orders & Items ─────────────────────────────────
INSERT INTO Purchase_Orders (id, supplier_id, order_date) VALUES
  (1, 1, '2026-06-10 09:00:00'),
  (2, 2, '2026-06-12 09:00:00');

INSERT INTO Purchase_Order_Items (purchase_order_id, ingredient_id, quantity) VALUES
  (1, 1, 20.00), -- 20kg Tomato from Fresh Farms
  (1, 3, 100.00), -- 100 Burger Buns from Fresh Farms
  (2, 2, 15.00), -- 15kg Cheese from Dairy Best
  (2, 5, 5.00);   -- 5kg Coffee Powder from Dairy Best

-- ─── Inventory Transactions ──────────────────────────────────
INSERT INTO Inventory_Transactions (ingredient_id, transaction_date, quantity, transaction_type, reference_id, reference_type) VALUES
  (1, '2026-06-10 09:00:00', 20.00, 'PURCHASE', 1, 'PURCHASE_ORDER'),
  (3, '2026-06-10 09:00:00', 100.00, 'PURCHASE', 1, 'PURCHASE_ORDER'),
  (2, '2026-06-12 09:00:00', 15.00, 'PURCHASE', 2, 'PURCHASE_ORDER'),
  (5, '2026-06-12 09:00:00', 5.00,  'PURCHASE', 2, 'PURCHASE_ORDER'),
  (1, '2026-06-15 12:30:00', 0.20, 'SALE', 1, 'ORDER'),
  (2, '2026-06-15 12:30:00', 0.15, 'SALE', 1, 'ORDER'),
  (3, '2026-06-15 13:00:00', 1.00, 'SALE', 4, 'ORDER'),
  (4, '2026-06-15 13:00:00', 1.00, 'SALE', 4, 'ORDER');