/**
 * Kitchen Service
 *
 * Owns the kitchen order lifecycle:
 *   PENDING → PREPARING → READY → SERVED
 *
 * Every status update:
 *   1. Validates the transition is legal
 *   2. Updates Kitchen_Orders
 *   3. Syncs the parent Order status (Orders table) so POS
 *      always reflects what the kitchen has done
 *   4. Emits a Socket.IO event to the branch room
 *   5. Writes an Audit Log
 *
 * This service is the ONLY place that changes Kitchen_Orders.status.
 * Controllers must go through here — never call KitchenModel.updateStatus()
 * directly from a controller.
 */

const { pool } = require("../config/db");
const { KitchenModel, VALID_TRANSITIONS } = require("../models/kitchen.model");
const AuditService = require("./audit.service");
const { getIO, KITCHEN_EVENTS } = require("../sockets/socket");

/**
 * Map kitchen status → the Orders.status value it drives.
 * Kitchen leads; POS follows.
 */
const ORDER_STATUS_SYNC = {
  PREPARING: "PREPARING",
  READY:     "READY",
  SERVED:    "SERVED",
};

const KitchenService = {
  /**
   * Advance a kitchen order to the next status.
   *
   * @param {number} kitchenOrderId
   * @param {string} targetStatus   — must be the next legal step
   * @param {number} userId         — who triggered the change (chef/waiter)
   * @returns {object}              — updated kitchen order row
   */
  async updateStatus(kitchenOrderId, targetStatus, userId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Load current kitchen order (lock row to prevent race)
      const [koRows] = await conn.execute(
        `SELECT id, status, order_id, branch_id
         FROM Kitchen_Orders WHERE id = ? LIMIT 1 FOR UPDATE`,
        [kitchenOrderId]
      );
      const ko = koRows[0];
      if (!ko) throw { status: 404, message: "Kitchen order not found." };

      // 2. Validate transition
      const allowedNext = VALID_TRANSITIONS[ko.status];
      if (allowedNext !== targetStatus) {
        throw {
          status: 409,
          message: `Invalid transition: ${ko.status} → ${targetStatus}. Expected next status: ${allowedNext || "none (order is already SERVED)"}.`,
        };
      }

      // 3. Update Kitchen_Orders
      await KitchenModel.updateStatus(kitchenOrderId, targetStatus, conn);

      // 4. Sync Orders table
      const orderStatus = ORDER_STATUS_SYNC[targetStatus];
      if (orderStatus) {
        await conn.execute(
          `UPDATE Orders SET status = ? WHERE id = ?`,
          [orderStatus, ko.order_id]
        );
      }

      await conn.commit();

      // 5. Emit Socket.IO event to the branch room
      const eventName = {
        PREPARING: KITCHEN_EVENTS.ORDER_PREPARING,
        READY:     KITCHEN_EVENTS.ORDER_READY,
        SERVED:    KITCHEN_EVENTS.ORDER_SERVED,
      }[targetStatus];

      if (eventName) {
        try {
          getIO()
            .to(`branch_${ko.branch_id}`)
            .emit(eventName, {
              kitchen_order_id: kitchenOrderId,
              order_id: ko.order_id,
              status: targetStatus,
              branch_id: ko.branch_id,
              updated_by: userId,
              timestamp: new Date().toISOString(),
            });
        } catch (socketErr) {
          // Socket.IO failure must never break the DB transaction
          console.error("⚠️  Socket.IO emit failed:", socketErr.message);
        }
      }

      // 6. Audit log
      const auditAction = {
        PREPARING: "ORDER_PREPARING",
        READY:     "ORDER_READY",
        SERVED:    "ORDER_SERVED",
      }[targetStatus];

      await AuditService.log(userId, auditAction, "KitchenOrder", kitchenOrderId, {
        order_id: ko.order_id,
        previous_status: ko.status,
        new_status: targetStatus,
      });

      // Return full updated row for response
      return await KitchenModel.findById(kitchenOrderId);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = KitchenService;