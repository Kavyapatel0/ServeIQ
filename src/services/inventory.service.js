/**
 * Inventory Service
 *
 * Multi-table operations that must be atomic go through here, exactly
 * like POSService for the POS module. The flagship operation is
 * receivePurchaseOrder(): one supplier delivery touches the Purchase
 * Order, every Ingredient's stock, Inventory_Transactions, and
 * Audit_Logs — all inside a single DB transaction.
 */

const { pool } = require("../config/db");
const { PurchaseOrderModel, PO_STATUS } = require("../models/purchase.model");
const { IngredientModel } = require("../models/ingredient.model");
const { InventoryModel, TRANSACTION_TYPE } = require("../models/inventory.model");
const AuditService = require("./audit.service");

const InventoryService = {
  /**
   * Receive Purchase Order
   *
   * Business flow (from roadmap):
   *   Validate Purchase Order
   *     → Increase Ingredient Stock
   *     → Insert Inventory Transaction
   *     → Update Purchase Order Status
   *     → Insert Audit Log
   *   Commit (or rollback on any failure)
   */
  async receivePurchaseOrder(poId, userId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Validate Purchase Order
      const [poRows] = await conn.execute(
        `SELECT id, status, branch_id, supplier_id FROM Purchase_Orders WHERE id = ? LIMIT 1 FOR UPDATE`,
        [poId]
      );
      const po = poRows[0];
      if (!po) throw { status: 404, message: "Purchase order not found." };
      if (po.status !== PO_STATUS.PENDING) {
        throw {
          status: 409,
          message: `Cannot receive a purchase order with status: ${po.status}.`,
        };
      }

      // Must have at least one item to receive
      const [itemRows] = await conn.execute(
        `SELECT id, ingredient_id, quantity FROM Purchase_Order_Items WHERE purchase_order_id = ?`,
        [poId]
      );
      if (itemRows.length === 0) {
        throw { status: 400, message: "Cannot receive an empty purchase order." };
      }

      // 2. Increase ingredient stock + 3. Insert inventory transaction (per line item)
      for (const item of itemRows) {
        await conn.execute(
          `UPDATE Ingredients SET current_stock = current_stock + ? WHERE id = ?`,
          [item.quantity, item.ingredient_id]
        );

        await conn.execute(
          `INSERT INTO Inventory_Transactions
             (ingredient_id, branch_id, quantity, transaction_type, reference_id, reference_type, notes, created_by)
           VALUES (?, ?, ?, 'PURCHASE', ?, 'PURCHASE_ORDER', ?, ?)`,
          [
            item.ingredient_id,
            po.branch_id,
            item.quantity,
            poId,
            `Received against PO #${poId}`,
            userId,
          ]
        );
      }

      // 4. Update Purchase Order status
      await conn.execute(
        `UPDATE Purchase_Orders SET status = 'RECEIVED', received_at = NOW() WHERE id = ?`,
        [poId]
      );

      await conn.commit();

      // 5. Audit log (outside the SQL transaction — never blocks it)
      await AuditService.log(userId, "PURCHASE_RECEIVED", "Purchase_Order", poId, {
        items_received: itemRows.length,
        supplier_id: po.supplier_id,
      });

      return { received: true, items_received: itemRows.length };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Manual Stock Adjustment
   *
   * Used for corrections (e.g. physical count differs from system count,
   * spillage not yet tracked as WASTE in V1, etc). Always recorded as an
   * Inventory_Transaction with type ADJUSTMENT — the quantity delta
   * (new - old) is stored, not the absolute new value, so the
   * transaction log always represents a *movement*, never a snapshot.
   */
  async adjustStock({ ingredient_id, branch_id, new_stock, reason, userId }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.execute(
        `SELECT current_stock FROM Ingredients WHERE id = ? LIMIT 1 FOR UPDATE`,
        [ingredient_id]
      );
      if (!rows[0]) throw { status: 404, message: "Ingredient not found." };

      const oldStock = parseFloat(rows[0].current_stock);
      const delta = parseFloat((new_stock - oldStock).toFixed(2));

      if (delta === 0) {
        throw { status: 400, message: "New stock value is the same as current stock — nothing to adjust." };
      }

      await conn.execute(
        `UPDATE Ingredients SET current_stock = ? WHERE id = ?`,
        [new_stock, ingredient_id]
      );

      await conn.execute(
        `INSERT INTO Inventory_Transactions
           (ingredient_id, branch_id, quantity, transaction_type, reference_type, notes, created_by)
         VALUES (?, ?, ?, 'ADJUSTMENT', 'MANUAL_ADJUSTMENT', ?, ?)`,
        [ingredient_id, branch_id, delta, reason || null, userId]
      );

      await conn.commit();

      await AuditService.log(userId, "STOCK_ADJUSTED", "Ingredient", ingredient_id, {
        old_stock: oldStock,
        new_stock,
        delta,
        reason,
      });

      return { old_stock: oldStock, new_stock, delta };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = InventoryService;