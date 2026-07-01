const { pool } = require("../config/db");

const KITCHEN_STATUS = {
  PENDING:   "PENDING",
  PREPARING: "PREPARING",
  READY:     "READY",
  SERVED:    "SERVED",
};

/**
 * Valid status transitions — kitchen workflow is strictly one-directional.
 * Controller validates against this before any UPDATE.
 */
const VALID_TRANSITIONS = {
  PENDING:   "PREPARING",
  PREPARING: "READY",
  READY:     "SERVED",
};

const KitchenModel = {
  /**
   * Find all kitchen orders with rich join data.
   *
   * Filters:
   *   branch_id   — always applied (branch isolation)
   *   status      — PENDING | PREPARING | READY | SERVED
   *   search      — partial match on order_number or table_number
   *   sort        — "oldest" (FIFO queue default) | "newest"
   *   date        — filter by order date (YYYY-MM-DD)
   */
  async findAll({ branch_id, status, search, sort = "oldest", date } = {}) {
    let query = `
      SELECT
        ko.id,
        ko.order_id,
        ko.status,
        ko.assigned_chef,
        ko.notes,
        ko.started_at,
        ko.ready_at,
        ko.served_at,
        ko.created_at,
        ko.updated_at,
        o.order_number,
        o.branch_id,
        rt.table_number,
        u.name   AS waiter_name,
        c.name   AS customer_name,
        chef.name AS chef_name,
        TIMESTAMPDIFF(MINUTE, ko.created_at, NOW()) AS minutes_since_received
      FROM Kitchen_Orders ko
      JOIN Orders o           ON ko.order_id = o.id
      LEFT JOIN Restaurant_Tables rt ON o.table_id = rt.id
      LEFT JOIN Users u        ON o.created_by = u.id
      LEFT JOIN Customers c    ON o.customer_id = c.id
      LEFT JOIN Users chef     ON ko.assigned_chef = chef.id
      WHERE 1=1
    `;
    const params = [];

    if (branch_id) {
      query += " AND ko.branch_id = ?";
      params.push(branch_id);
    }
    if (status) {
      query += " AND ko.status = ?";
      params.push(status);
    }
    if (date) {
      query += " AND DATE(ko.created_at) = ?";
      params.push(date);
    }
    if (search && search.trim()) {
      query += " AND (o.order_number LIKE ? OR rt.table_number LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    // FIFO (oldest first) is the kitchen queue default
    query += sort === "newest"
      ? " ORDER BY ko.created_at DESC"
      : " ORDER BY ko.created_at ASC";

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT
        ko.id,
        ko.order_id,
        ko.branch_id,
        ko.status,
        ko.assigned_chef,
        ko.notes,
        ko.started_at,
        ko.ready_at,
        ko.served_at,
        ko.created_at,
        ko.updated_at,
        o.order_number,
        o.branch_id AS order_branch_id,
        rt.table_number,
        u.name   AS waiter_name,
        c.name   AS customer_name,
        chef.name AS chef_name,
        TIMESTAMPDIFF(MINUTE, ko.created_at, NOW()) AS minutes_since_received
       FROM Kitchen_Orders ko
       JOIN Orders o           ON ko.order_id = o.id
       LEFT JOIN Restaurant_Tables rt ON o.table_id = rt.id
       LEFT JOIN Users u        ON o.created_by = u.id
       LEFT JOIN Customers c    ON o.customer_id = c.id
       LEFT JOIN Users chef     ON ko.assigned_chef = chef.id
       WHERE ko.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find kitchen order by its parent order_id.
   * Used by POS to check if an order already has a kitchen entry.
   */
  async findByOrderId(orderId) {
    const [rows] = await pool.execute(
      `SELECT id, status FROM Kitchen_Orders WHERE order_id = ? LIMIT 1`,
      [orderId]
    );
    return rows[0] || null;
  },

  /**
   * Fetch all order items for a kitchen order (for chef display).
   */
  async findOrderItems(kitchenOrderId) {
    const [rows] = await pool.execute(
      `SELECT
        oi.id,
        oi.quantity,
        oi.unit_price,
        mi.name AS item_name,
        mc.name AS category_name
       FROM Kitchen_Orders ko
       JOIN Order_Items oi    ON ko.order_id = oi.order_id
       JOIN Menu_Items mi     ON oi.menu_item_id = mi.id
       JOIN Menu_Categories mc ON mi.category_id = mc.id
       WHERE ko.id = ?
       ORDER BY mc.name, mi.name`,
      [kitchenOrderId]
    );
    return rows;
  },

  /**
   * Update kitchen order status and the relevant timestamp column.
   * Does NOT validate the transition — that is the service's job.
   */
  async updateStatus(id, status, conn = pool) {
    const timestampCol = {
      PREPARING: "started_at",
      READY:     "ready_at",
      SERVED:    "served_at",
    }[status];

    let sql = `UPDATE Kitchen_Orders SET status = ?`;
    const params = [status];

    if (timestampCol) {
      sql += `, ${timestampCol} = NOW()`;
    }

    sql += ` WHERE id = ?`;
    params.push(id);

    const [result] = await conn.execute(sql, params);
    return result.affectedRows > 0;
  },

  /**
   * Dashboard aggregation — one query for all summary cards.
   * "Served Today" counts rows where served_at is today's date.
   */
  async getDashboardStats(branch_id) {
    const params = [];
    let branchClause = "";
    if (branch_id) {
      branchClause = "AND ko.branch_id = ?";
      params.push(branch_id, branch_id, branch_id, branch_id);
    }

    const [rows] = await pool.query(
      `SELECT
         SUM(CASE WHEN ko.status = 'PENDING'   ${branchClause} THEN 1 ELSE 0 END) AS pending_count,
         SUM(CASE WHEN ko.status = 'PREPARING' ${branchClause} THEN 1 ELSE 0 END) AS preparing_count,
         SUM(CASE WHEN ko.status = 'READY'     ${branchClause} THEN 1 ELSE 0 END) AS ready_count,
         SUM(CASE WHEN ko.status = 'SERVED' AND DATE(ko.served_at) = CURDATE() ${branchClause} THEN 1 ELSE 0 END) AS served_today
       FROM Kitchen_Orders ko`,
      params
    );

    return {
      pending:     parseInt(rows[0].pending_count   || 0),
      preparing:   parseInt(rows[0].preparing_count || 0),
      ready:       parseInt(rows[0].ready_count     || 0),
      served_today: parseInt(rows[0].served_today   || 0),
    };
  },
};

module.exports = { KitchenModel, KITCHEN_STATUS, VALID_TRANSITIONS };