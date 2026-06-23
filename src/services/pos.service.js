/**
 * POS Service
 *
 * All multi-step operations that span multiple tables (order creation,
 * payment processing) go through here so controllers stay thin.
 * Heavy DB mutation uses explicit transactions to ensure atomicity.
 */

const { pool } = require("../config/db");
const { OrderModel, ORDER_STATUS } = require("../models/order.model");
const { MenuModel } = require("../models/menu.model");
const { TableModel, TABLE_STATUS } = require("../models/table.model");
const { PaymentModel } = require("../models/payment.model");
const AuditService = require("./audit.service");

const POSService = {
  // ─── Order Creation ────────────────────────────────────────────

  async createOrder({ customer_id, branch_id, table_id, created_by }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Validate table belongs to same branch and is available
      if (table_id) {
        const [tableRows] = await conn.execute(
          `SELECT id, status, branch_id FROM Restaurant_Tables WHERE id = ? LIMIT 1`,
          [table_id]
        );
        const table = tableRows[0];
        if (!table) {
          throw { status: 404, message: "Table not found." };
        }
        if (table.branch_id !== branch_id) {
          throw { status: 400, message: "Table does not belong to this branch." };
        }
        if (table.status !== TABLE_STATUS.AVAILABLE) {
          throw {
            status: 409,
            message: `Table is currently ${table.status}. Choose an available table.`,
          };
        }

        // Mark table OCCUPIED
        await conn.execute(
          `UPDATE Restaurant_Tables SET status = 'OCCUPIED' WHERE id = ?`,
          [table_id]
        );
      }

      // Create the order
      const order_number = await OrderModel.generateOrderNumber();
      const [result] = await conn.execute(
        `INSERT INTO Orders
           (order_number, customer_id, branch_id, table_id, created_by, status,
            subtotal, tax_amount, discount_amount, grand_total)
         VALUES (?, ?, ?, ?, ?, 'CREATED', 0, 0, 0, 0)`,
        [order_number, customer_id || null, branch_id, table_id || null, created_by]
      );

      const orderId = result.insertId;
      await conn.commit();

      await AuditService.log(created_by, "ORDER_CREATED", "Order", orderId, {
        order_number,
        branch_id,
        table_id,
        customer_id,
      });

      return { orderId, order_number };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // ─── Add Item to Order ─────────────────────────────────────────

  /**
   * Adds an item to an existing CREATED/PREPARING order.
   * Fetches price from DB — never trusts the frontend.
   */
  async addOrderItem({ order_id, menu_item_id, quantity, userId, branch_id }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Verify order exists, belongs to branch, and is still mutable
      const [orderRows] = await conn.execute(
        `SELECT id, status, branch_id FROM Orders WHERE id = ? LIMIT 1`,
        [order_id]
      );
      const order = orderRows[0];
      if (!order) throw { status: 404, message: "Order not found." };
      if (order.branch_id !== branch_id) {
        throw { status: 403, message: "Order does not belong to your branch." };
      }
      const immutableStatuses = [
        ORDER_STATUS.PAID,
        ORDER_STATUS.COMPLETED,
        ORDER_STATUS.CANCELLED,
      ];
      if (immutableStatuses.includes(order.status)) {
        throw {
          status: 409,
          message: `Cannot add items to an order with status: ${order.status}.`,
        };
      }

      // Fetch price from DB — never from client
      const menuItem = await MenuModel.getSellingPrice(menu_item_id);
      if (!menuItem) throw { status: 404, message: "Menu item not found." };
      if (!menuItem.is_active) throw { status: 400, message: "Menu item is no longer active." };
      if (!menuItem.is_available) {
        throw { status: 400, message: "Menu item is currently unavailable." };
      }

      const unit_price = parseFloat(menuItem.selling_price);
      const total_price = parseFloat((unit_price * quantity).toFixed(2));

      const [itemResult] = await conn.execute(
        `INSERT INTO Order_Items (order_id, menu_item_id, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?)`,
        [order_id, menu_item_id, quantity, unit_price, total_price]
      );

      // Recalculate totals inside transaction
      const [subtotalRow] = await conn.execute(
        `SELECT SUM(total_price) AS subtotal FROM Order_Items WHERE order_id = ?`,
        [order_id]
      );
      const subtotal = parseFloat(subtotalRow[0].subtotal || 0);
      const TAX_RATE = 0.05;
      const taxAmount = parseFloat((subtotal * TAX_RATE).toFixed(2));
      const grandTotal = parseFloat((subtotal + taxAmount).toFixed(2));

      await conn.execute(
        `UPDATE Orders
         SET subtotal = ?, tax_amount = ?, grand_total = ?
         WHERE id = ?`,
        [subtotal, taxAmount, grandTotal, order_id]
      );

      await conn.commit();

      await AuditService.log(userId, "ITEM_ADDED", "Order", order_id, {
        menu_item_id,
        quantity,
        unit_price,
      });

      return {
        orderItemId: itemResult.insertId,
        unit_price,
        total_price,
        order_totals: { subtotal, taxAmount, discountAmount: 0, grandTotal },
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // ─── Send Order to Kitchen ─────────────────────────────────────

  async sendToKitchen(orderId, userId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [orderRows] = await conn.execute(
        `SELECT id, status FROM Orders WHERE id = ? LIMIT 1`,
        [orderId]
      );
      const order = orderRows[0];
      if (!order) throw { status: 404, message: "Order not found." };
      if (order.status !== ORDER_STATUS.CREATED) {
        throw {
          status: 409,
          message: `Order cannot be sent to kitchen from status: ${order.status}.`,
        };
      }

      // Check at least one item exists
      const [itemCheck] = await conn.execute(
        `SELECT COUNT(*) AS cnt FROM Order_Items WHERE order_id = ?`,
        [orderId]
      );
      if (itemCheck[0].cnt === 0) {
        throw { status: 400, message: "Cannot send empty order to kitchen." };
      }

      await conn.execute(
        `UPDATE Orders SET status = 'PREPARING' WHERE id = ?`,
        [orderId]
      );

      // Create Kitchen_Order entry
      await conn.execute(
        `INSERT INTO Kitchen_Orders (order_id, status) VALUES (?, 'PENDING')`,
        [orderId]
      );

      await conn.commit();

      await AuditService.log(userId, "ORDER_SENT_TO_KITCHEN", "Order", orderId, {
        previous_status: ORDER_STATUS.CREATED,
      });

      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // ─── Payment Processing ────────────────────────────────────────

  async processPayment({ order_id, payment_method, userId }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [orderRows] = await conn.execute(
        `SELECT id, status, grand_total, table_id FROM Orders WHERE id = ? LIMIT 1`,
        [order_id]
      );
      const order = orderRows[0];
      if (!order) throw { status: 404, message: "Order not found." };

      const payableStatuses = [
        ORDER_STATUS.CREATED,
        ORDER_STATUS.PREPARING,
        ORDER_STATUS.READY,
        ORDER_STATUS.SERVED,
      ];
      if (!payableStatuses.includes(order.status)) {
        throw {
          status: 409,
          message: `Cannot process payment for order with status: ${order.status}.`,
        };
      }

      const amount = parseFloat(order.grand_total);

      // Insert payment record
      const [payResult] = await conn.execute(
        `INSERT INTO Payments (order_id, amount, payment_method, payment_status)
         VALUES (?, ?, ?, 'SUCCESS')`,
        [order_id, amount, payment_method]
      );

      // Mark order PAID
      await conn.execute(
        `UPDATE Orders SET status = 'PAID' WHERE id = ?`,
        [order_id]
      );

      // Free up the table
      if (order.table_id) {
        await conn.execute(
          `UPDATE Restaurant_Tables SET status = 'AVAILABLE' WHERE id = ?`,
          [order.table_id]
        );
      }

      await conn.commit();

      await AuditService.log(userId, "PAYMENT_COMPLETED", "Order", order_id, {
        payment_id: payResult.insertId,
        amount,
        payment_method,
      });

      return { paymentId: payResult.insertId, amount, payment_method };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // ─── Cancel Order ──────────────────────────────────────────────

  async cancelOrder(orderId, userId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [orderRows] = await conn.execute(
        `SELECT id, status, table_id FROM Orders WHERE id = ? LIMIT 1`,
        [orderId]
      );
      const order = orderRows[0];
      if (!order) throw { status: 404, message: "Order not found." };

      if ([ORDER_STATUS.PAID, ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(order.status)) {
        throw {
          status: 409,
          message: `Cannot cancel order with status: ${order.status}.`,
        };
      }

      await conn.execute(
        `UPDATE Orders SET status = 'CANCELLED' WHERE id = ?`,
        [orderId]
      );

      // Free the table if occupied
      if (order.table_id) {
        await conn.execute(
          `UPDATE Restaurant_Tables SET status = 'AVAILABLE' WHERE id = ?`,
          [order.table_id]
        );
      }

      await conn.commit();

      await AuditService.log(userId, "ORDER_CANCELLED", "Order", orderId, {
        previous_status: order.status,
      });

      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // ─── Receipt Generation ────────────────────────────────────────

  async generateReceipt(orderId) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw { status: 404, message: "Order not found." };

    const items = await OrderModel.findItemsByOrderId(orderId);
    const payments = await PaymentModel.findByOrderId(orderId);

    return {
      order_number: order.order_number,
      order_date: order.order_date,
      branch: order.branch_name,
      table: order.table_number || "Take-Away",
      customer: {
        name: order.customer_name || "Walk-in Guest",
        phone: order.customer_phone || null,
      },
      items: items.map((i) => ({
        name: i.item_name,
        category: i.category_name,
        quantity: i.quantity,
        unit_price: parseFloat(i.unit_price),
        total_price: parseFloat(i.total_price),
      })),
      totals: {
        subtotal: parseFloat(order.subtotal),
        tax_amount: parseFloat(order.tax_amount),
        discount_amount: parseFloat(order.discount_amount),
        grand_total: parseFloat(order.grand_total),
      },
      payment: payments.length > 0 ? {
        method: payments[0].payment_method,
        status: payments[0].payment_status,
        paid_at: payments[0].payment_date,
      } : null,
      status: order.status,
      served_by: order.created_by_name,
    };
  },
};

module.exports = POSService;