const { pool } = require("../config/db");

const CRMModel = {
  /**
   * Module 6: CRM Dashboard
   * All queries are pure SQL aggregates — no AI, just counts and sums.
   */
  async getDashboard() {
    const [totalCustomers] = await pool.execute(
      "SELECT COUNT(*) AS total FROM Customers WHERE is_active = TRUE"
    );

    const [newThisMonth] = await pool.execute(
      `SELECT COUNT(*) AS total FROM Customers
       WHERE is_active = TRUE
         AND MONTH(created_at) = MONTH(CURRENT_DATE)
         AND YEAR(created_at) = YEAR(CURRENT_DATE)`
    );

    // Returning = has more than 1 completed/paid order
    const [returning] = await pool.execute(
      `SELECT COUNT(*) AS total FROM (
         SELECT customer_id
         FROM Orders
         WHERE customer_id IS NOT NULL
           AND status IN ('PAID', 'COMPLETED')
         GROUP BY customer_id
         HAVING COUNT(*) > 1
       ) AS repeat_customers`
    );

    const [loyaltyMembers] = await pool.execute(
      "SELECT COUNT(*) AS total FROM Customers WHERE loyalty_points > 0 AND is_active = TRUE"
    );

    const [avgSpend] = await pool.execute(
      `SELECT ROUND(AVG(order_total), 2) AS avg_spend FROM (
         SELECT customer_id, SUM(grand_total) AS order_total
         FROM Orders
         WHERE customer_id IS NOT NULL AND status IN ('PAID', 'COMPLETED')
         GROUP BY customer_id
       ) AS per_customer`
    );

    const [topCustomers] = await pool.execute(
      `SELECT
         c.id, c.name, c.phone, c.email, c.loyalty_points,
         COUNT(o.id) AS total_visits,
         ROUND(SUM(o.grand_total), 2) AS total_spent,
         MAX(o.order_date) AS last_visit
       FROM Customers c
       JOIN Orders o ON o.customer_id = c.id
       WHERE o.status IN ('PAID', 'COMPLETED')
       GROUP BY c.id
       ORDER BY total_spent DESC
       LIMIT 10`
    );

    return {
      total_customers: Number(totalCustomers[0].total),
      new_this_month: Number(newThisMonth[0].total),
      returning_customers: Number(returning[0].total),
      loyalty_members: Number(loyaltyMembers[0].total),
      average_spend_per_customer: Number(avgSpend[0].avg_spend) || 0,
      top_customers: topCustomers,
    };
  },
};

module.exports = CRMModel;