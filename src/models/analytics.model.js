const { pool } = require("../config/db");

/**
 * Analytics Model — read-only SELECT queries only.
 * No INSERTs, UPDATEs, or DELETEs anywhere in this file.
 *
 * Branch isolation: every query that touches branch-specific data
 * accepts an optional branch_id parameter. When null (Super Admin),
 * it aggregates across all branches. When set, it filters to that branch.
 */
const AnalyticsModel = {

  // ═══════════════════════════════════════════════════════════════
  // MODULE 1 — SALES ANALYTICS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Revenue report for a given period.
   * Only counts PAID and COMPLETED orders.
   * Returns: total_revenue, total_orders, average_order_value,
   *          and a comparison_revenue from the previous equivalent period.
   */
  async getRevenue({ period = "today", branch_id } = {}) {
    const branchFilter = branch_id ? "AND o.branch_id = ?" : "";
    const branchParam  = branch_id ? [branch_id] : [];

    let currentWhere, prevWhere;

    switch (period) {
      case "week":
        currentWhere = "AND DATE(o.order_date) >= DATE(NOW() - INTERVAL 6 DAY)";
        prevWhere    = "AND DATE(o.order_date) BETWEEN DATE(NOW() - INTERVAL 13 DAY) AND DATE(NOW() - INTERVAL 7 DAY)";
        break;
      case "month":
        currentWhere = "AND MONTH(o.order_date) = MONTH(NOW()) AND YEAR(o.order_date) = YEAR(NOW())";
        prevWhere    = "AND MONTH(o.order_date) = MONTH(NOW() - INTERVAL 1 MONTH) AND YEAR(o.order_date) = YEAR(NOW() - INTERVAL 1 MONTH)";
        break;
      case "year":
        currentWhere = "AND YEAR(o.order_date) = YEAR(NOW())";
        prevWhere    = "AND YEAR(o.order_date) = YEAR(NOW()) - 1";
        break;
      default: // today
        currentWhere = "AND DATE(o.order_date) = CURDATE()";
        prevWhere    = "AND DATE(o.order_date) = CURDATE() - INTERVAL 1 DAY";
    }

    const baseQuery = (whereClause) => `
      SELECT
        COALESCE(SUM(o.grand_total), 0)  AS total_revenue,
        COUNT(o.id)                       AS total_orders,
        COALESCE(AVG(o.grand_total), 0)  AS average_order_value
      FROM Orders o
      WHERE o.status IN ('PAID', 'COMPLETED')
        ${whereClause}
        ${branchFilter}
    `;

    const [current] = await pool.execute(baseQuery(currentWhere), [...branchParam]);
    const [prev]    = await pool.execute(baseQuery(prevWhere),    [...branchParam]);

    const currentRevenue  = Number(current[0].total_revenue);
    const prevRevenue     = Number(prev[0].total_revenue);
    const revenueChange   = prevRevenue > 0
      ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100 * 100) / 100
      : null;

    return {
      period,
      total_revenue:       Math.round(currentRevenue * 100) / 100,
      total_orders:        Number(current[0].total_orders),
      average_order_value: Math.round(Number(current[0].average_order_value) * 100) / 100,
      previous_revenue:    Math.round(prevRevenue * 100) / 100,
      revenue_change_pct:  revenueChange,
    };
  },

  /**
   * Sales summary — order counts by status, bill stats.
   */
  async getSalesSummary({ branch_id } = {}) {
    const branchFilter = branch_id ? "AND branch_id = ?" : "";
    const params = branch_id ? [branch_id] : [];

    const [rows] = await pool.execute(
      `SELECT
         COUNT(*)                                                   AS total_orders,
         SUM(status IN ('PAID','COMPLETED'))                        AS completed_orders,
         SUM(status = 'CANCELLED')                                  AS cancelled_orders,
         SUM(status NOT IN ('PAID','COMPLETED','CANCELLED'))        AS active_orders,
         COALESCE(AVG(CASE WHEN status IN ('PAID','COMPLETED') THEN grand_total END), 0) AS average_bill,
         COALESCE(MAX(CASE WHEN status IN ('PAID','COMPLETED') THEN grand_total END), 0) AS highest_bill,
         COALESCE(MIN(CASE WHEN status IN ('PAID','COMPLETED') THEN grand_total END), 0) AS lowest_bill
       FROM Orders WHERE 1=1 ${branchFilter}`,
      params
    );
    return rows[0];
  },

  /**
   * Daily sales for the last N days (default 30).
   * Returns: date, revenue, order_count.
   */
  async getDailySales({ branch_id, days = 30 } = {}) {
    const branchFilter = branch_id ? "AND o.branch_id = ?" : "";
    const params = branch_id ? [Number(days), branch_id] : [Number(days)];

    const [rows] = await pool.execute(
      `SELECT
         DATE(o.order_date)              AS sale_date,
         ROUND(SUM(o.grand_total), 2)    AS revenue,
         COUNT(o.id)                     AS order_count
       FROM Orders o
       WHERE o.status IN ('PAID', 'COMPLETED')
         AND DATE(o.order_date) >= DATE(NOW() - INTERVAL ? DAY)
         ${branchFilter}
       GROUP BY DATE(o.order_date)
       ORDER BY sale_date ASC`,
      params
    );
    return rows;
  },

  /**
   * Monthly sales for the last N months (default 12).
   * Returns: year, month, revenue, order_count.
   */
  async getMonthlySales({ branch_id, months = 12 } = {}) {
    const branchFilter = branch_id ? "AND o.branch_id = ?" : "";
    const paramsFinal = branch_id
      ? [Number(months), branch_id]
      : [Number(months)];

    const [rows] = await pool.execute(
      `SELECT
         YEAR(o.order_date)             AS sale_year,
         MONTH(o.order_date)            AS sale_month,
         MONTHNAME(o.order_date)        AS month_name,
         ROUND(SUM(o.grand_total), 2)   AS revenue,
         COUNT(o.id)                    AS order_count
       FROM Orders o
       WHERE o.status IN ('PAID', 'COMPLETED')
         AND o.order_date >= DATE_FORMAT(NOW() - INTERVAL ? MONTH, '%Y-%m-01')
         ${branchFilter}
       GROUP BY YEAR(o.order_date), MONTH(o.order_date)
       ORDER BY sale_year ASC, sale_month ASC`,
      paramsFinal
    );
    return rows;
  },

  // ═══════════════════════════════════════════════════════════════
  // MODULE 2 — BUSINESS ANALYTICS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Peak hour analysis — how many orders per hour of the day.
   * Groups by hour (0–23) across all time.
   */
  async getPeakHours({ branch_id } = {}) {
    const branchFilter = branch_id ? "AND branch_id = ?" : "";
    const params = branch_id ? [branch_id] : [];

    const [rows] = await pool.execute(
      `SELECT
         HOUR(order_date)   AS hour,
         COUNT(id)          AS order_count,
         ROUND(SUM(grand_total), 2) AS revenue
       FROM Orders
       WHERE status IN ('PAID', 'COMPLETED')
         ${branchFilter}
       GROUP BY HOUR(order_date)
       ORDER BY hour ASC`,
      params
    );

    // Label hours (0 → "12 AM", 13 → "1 PM", etc.)
    return rows.map((r) => ({
      hour:        r.hour,
      hour_label:  formatHour(r.hour),
      order_count: Number(r.order_count),
      revenue:     Number(r.revenue),
    }));
  },

  /**
   * Top selling menu items by total quantity sold.
   */
  async getTopItems({ branch_id, limit = 10 } = {}) {
    const branchFilter = branch_id ? "AND o.branch_id = ?" : "";
    const params = branch_id
      ? [branch_id, Number(limit)]
      : [Number(limit)];

    const [rows] = await pool.execute(
      `SELECT
         mi.id,
         mi.name                      AS item_name,
         mc.name                      AS category_name,
         mi.selling_price,
         SUM(oi.quantity)             AS total_quantity,
         COUNT(DISTINCT oi.order_id)  AS times_ordered,
         ROUND(SUM(oi.total_price), 2) AS total_revenue
       FROM Order_Items oi
       JOIN Menu_Items  mi ON oi.menu_item_id = mi.id
       LEFT JOIN Menu_Categories mc ON mi.category_id = mc.id
       JOIN Orders      o  ON oi.order_id = o.id
       WHERE o.status IN ('PAID', 'COMPLETED')
         ${branchFilter}
       GROUP BY mi.id
       ORDER BY total_quantity DESC
       LIMIT ?`,
      params
    );
    return rows;
  },

  /**
   * Payment method breakdown — count, percentage, revenue per method.
   */
  async getPaymentMethods({ branch_id } = {}) {
    const branchFilter = branch_id ? "AND o.branch_id = ?" : "";
    const params = branch_id ? [branch_id] : [];

    const [rows] = await pool.execute(
      `SELECT
         p.payment_method,
         COUNT(p.id)                  AS transaction_count,
         ROUND(SUM(p.amount), 2)      AS total_revenue
       FROM Payments p
       JOIN Orders o ON p.order_id = o.id
       WHERE p.payment_status = 'SUCCESS'
         ${branchFilter}
       GROUP BY p.payment_method
       ORDER BY transaction_count DESC`,
      params
    );

    const totalTransactions = rows.reduce((s, r) => s + Number(r.transaction_count), 0);
    return rows.map((r) => ({
      payment_method:    r.payment_method,
      transaction_count: Number(r.transaction_count),
      total_revenue:     Number(r.total_revenue),
      percentage:        totalTransactions > 0
        ? Math.round((Number(r.transaction_count) / totalTransactions) * 100 * 100) / 100
        : 0,
    }));
  },

  // ═══════════════════════════════════════════════════════════════
  // MODULE 3 — CUSTOMER ANALYTICS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Customer analytics — total, active, returning, average visits.
   */
  async getCustomerAnalytics({ branch_id } = {}) {
    const branchFilter = branch_id ? "AND o.branch_id = ?" : "";
    const branchParam  = branch_id ? [branch_id] : [];

    const [totals] = await pool.execute(
      "SELECT COUNT(*) AS total, SUM(is_active = TRUE) AS active FROM Customers"
    );

    const [newThisMonth] = await pool.execute(
      `SELECT COUNT(*) AS cnt FROM Customers
       WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`
    );

    const [returning] = await pool.execute(
      `SELECT COUNT(*) AS cnt FROM (
         SELECT customer_id FROM Orders
         WHERE customer_id IS NOT NULL
           AND status IN ('PAID','COMPLETED')
           ${branchFilter}
         GROUP BY customer_id
         HAVING COUNT(*) > 1
       ) AS repeat_customers`,
      branchParam
    );

    const [avgVisits] = await pool.execute(
      `SELECT ROUND(AVG(visit_count), 2) AS avg_visits FROM (
         SELECT customer_id, COUNT(*) AS visit_count
         FROM Orders
         WHERE customer_id IS NOT NULL
           AND status IN ('PAID','COMPLETED')
           ${branchFilter}
         GROUP BY customer_id
       ) AS vc`,
      branchParam
    );

    const [topSpenders] = await pool.execute(
      `SELECT
         c.id, c.name, c.phone,
         COUNT(o.id)                  AS total_visits,
         ROUND(SUM(o.grand_total), 2) AS total_spent,
         MAX(o.order_date)            AS last_visit
       FROM Customers c
       JOIN Orders o ON o.customer_id = c.id
       WHERE o.status IN ('PAID','COMPLETED')
         ${branchFilter}
       GROUP BY c.id
       ORDER BY total_spent DESC
       LIMIT 10`,
      branchParam
    );

    return {
      total_customers:     Number(totals[0].total),
      active_customers:    Number(totals[0].active),
      new_this_month:      Number(newThisMonth[0].cnt),
      returning_customers: Number(returning[0].cnt),
      average_visits:      Number(avgVisits[0].avg_visits) || 0,
      top_spenders:        topSpenders,
    };
  },

  /**
   * Loyalty program analytics — earned, redeemed, outstanding.
   */
  async getLoyaltyAnalytics({ branch_id } = {}) {
    // Loyalty is customer-level, not branch-specific in the schema,
    // so branch_id is not applied here — consistent with schema design.

    const [summary] = await pool.execute(
      `SELECT
         COALESCE(SUM(CASE WHEN transaction_type = 'EARNED'   THEN points END), 0) AS total_earned,
         COALESCE(SUM(CASE WHEN transaction_type = 'REDEEMED' THEN points END), 0) AS total_redeemed,
         COALESCE(SUM(CASE WHEN transaction_type = 'EXPIRED'  THEN points END), 0) AS total_expired,
         COUNT(DISTINCT customer_id) AS customers_with_transactions
       FROM Loyalty_Transactions`
    );

    const [outstanding] = await pool.execute(
      "SELECT COALESCE(SUM(loyalty_points), 0) AS outstanding FROM Customers WHERE is_active = TRUE"
    );

    const [topEarners] = await pool.execute(
      `SELECT
         c.id, c.name, c.phone,
         c.loyalty_points AS current_points,
         COALESCE(SUM(lt.points), 0) AS lifetime_earned
       FROM Customers c
       LEFT JOIN Loyalty_Transactions lt ON lt.customer_id = c.id AND lt.transaction_type = 'EARNED'
       WHERE c.is_active = TRUE
       GROUP BY c.id
       ORDER BY lifetime_earned DESC
       LIMIT 10`
    );

    return {
      total_points_earned:           Number(summary[0].total_earned),
      total_points_redeemed:         Number(summary[0].total_redeemed),
      total_points_expired:          Number(summary[0].total_expired),
      outstanding_points:            Number(outstanding[0].outstanding),
      customers_with_transactions:   Number(summary[0].customers_with_transactions),
      top_earners:                   topEarners,
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // MODULE 4 — INVENTORY ANALYTICS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Stock report — current levels, low stock, out of stock.
   */
  async getStockReport({ branch_id } = {}) {
    const branchFilter = branch_id
      ? "AND bi.branch_id = ?"
      : "";
    const params = branch_id ? [branch_id] : [];

    // If branch_id provided use Branch_Inventory, else use global Ingredients
    let rows;
    if (branch_id) {
      [rows] = await pool.execute(
        `SELECT
           i.id,
           i.name,
           i.unit,
           bi.current_stock,
           i.minimum_stock,
           i.is_active,
           CASE
             WHEN bi.current_stock = 0        THEN 'OUT_OF_STOCK'
             WHEN bi.current_stock <= i.minimum_stock THEN 'LOW'
             ELSE 'GOOD'
           END AS stock_status
         FROM Ingredients i
         JOIN Branch_Inventory bi ON bi.ingredient_id = i.id
         WHERE i.is_active = TRUE
           ${branchFilter}
         ORDER BY stock_status ASC, i.name ASC`,
        params
      );
    } else {
      [rows] = await pool.execute(
        `SELECT
           id,
           name,
           unit,
           current_stock,
           minimum_stock,
           is_active,
           CASE
             WHEN current_stock = 0              THEN 'OUT_OF_STOCK'
             WHEN current_stock <= minimum_stock THEN 'LOW'
             ELSE 'GOOD'
           END AS stock_status
         FROM Ingredients
         WHERE is_active = TRUE
         ORDER BY stock_status ASC, name ASC`
      );
    }

    const summary = {
      total:        rows.length,
      good:         rows.filter((r) => r.stock_status === "GOOD").length,
      low:          rows.filter((r) => r.stock_status === "LOW").length,
      out_of_stock: rows.filter((r) => r.stock_status === "OUT_OF_STOCK").length,
    };

    return { summary, items: rows };
  },

  /**
   * Purchase report — spend per supplier, PO history.
   */
  async getPurchaseReport({ branch_id } = {}) {
    const branchFilter = branch_id ? "AND po.branch_id = ?" : "";
    const params = branch_id ? [branch_id] : [];

    // by_supplier: branch_id used once in the JOIN ON clause
    const [bySupplier] = await pool.execute(
      `SELECT
         s.id,
         s.name                        AS supplier_name,
         s.contact_person,
         COUNT(po.id)                  AS total_orders,
         SUM(po.status = 'RECEIVED')   AS received_orders,
         SUM(po.status = 'PENDING')    AS pending_orders,
         ROUND(COALESCE(SUM(po.total_amount), 0), 2) AS total_spent
       FROM Suppliers s
       LEFT JOIN Purchase_Orders po ON po.supplier_id = s.id
         ${branchFilter}
       WHERE s.is_active = TRUE
       GROUP BY s.id
       ORDER BY total_spent DESC`,
      params
    );

    const [recentPOs] = await pool.execute(
      `SELECT
         po.id,
         po.po_number,
         po.status,
         po.order_date,
         po.received_at,
         ROUND(po.total_amount, 2) AS total_amount,
         s.name AS supplier_name
       FROM Purchase_Orders po
       JOIN Suppliers s ON s.id = po.supplier_id
       WHERE 1=1 ${branchFilter}
       ORDER BY po.order_date DESC
       LIMIT 10`,
      params
    );

    const [totals] = await pool.execute(
      `SELECT
         COUNT(*)                                        AS total_pos,
         SUM(status = 'RECEIVED')                        AS received,
         SUM(status = 'PENDING')                         AS pending,
         ROUND(COALESCE(SUM(total_amount), 0), 2)        AS total_spent
       FROM Purchase_Orders WHERE 1=1 ${branchFilter}`,
      params
    );

    return {
      summary:     totals[0],
      by_supplier: bySupplier,
      recent_pos:  recentPOs,
    };
  },
};

// ─── Helpers ─────────────────────────────────────────────────
function formatHour(hour) {
  if (hour === 0)  return "12 AM";
  if (hour < 12)  return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

module.exports = AnalyticsModel;