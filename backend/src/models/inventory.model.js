const { pool } = require("../config/db");

const TRANSACTION_TYPE = {
  PURCHASE: "PURCHASE",
  ADJUSTMENT: "ADJUSTMENT",
};

const InventoryModel = {
  /**
   * Write a stock-movement record. Never update Ingredients.current_stock
   * silently — every change must produce a row here.
   * Accepts an optional `conn` to participate in a larger transaction
   * (e.g. receiving a purchase order).
   */
  async createTransaction(
    { ingredient_id, branch_id, quantity, transaction_type, reference_id, reference_type, notes, created_by },
    conn = pool
  ) {
    const [result] = await conn.execute(
      `INSERT INTO Inventory_Transactions
         (ingredient_id, branch_id, quantity, transaction_type, reference_id, reference_type, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ingredient_id, branch_id, quantity, transaction_type, reference_id || null, reference_type, notes || null, created_by]
    );
    return result.insertId;
  },

  /**
   * GET /api/inventory/transactions
   * Filters: ?date= &ingredient_id= &supplier_id= &transaction_type=
   * supplier_id is resolved via the ingredient's current supplier.
   */
  async findTransactions({ branch_id, date, ingredient_id, supplier_id, transaction_type } = {}) {
    let query = `
      SELECT
        it.id,
        it.ingredient_id,
        i.name AS ingredient_name,
        i.unit,
        it.branch_id,
        it.quantity,
        it.transaction_type,
        it.reference_id,
        it.reference_type,
        it.notes,
        it.created_by,
        u.name AS created_by_name,
        it.transaction_date
      FROM Inventory_Transactions it
      JOIN Ingredients i ON it.ingredient_id = i.id
      LEFT JOIN Users u ON it.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (branch_id) {
      query += " AND it.branch_id = ?";
      params.push(branch_id);
    }
    if (date) {
      query += " AND DATE(it.transaction_date) = ?";
      params.push(date);
    }
    if (ingredient_id) {
      query += " AND it.ingredient_id = ?";
      params.push(ingredient_id);
    }
    if (supplier_id) {
      query += " AND i.supplier_id = ?";
      params.push(supplier_id);
    }
    if (transaction_type) {
      query += " AND it.transaction_type = ?";
      params.push(transaction_type);
    }

    query += " ORDER BY it.transaction_date DESC";
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  /**
   * GET /api/inventory/low-stock
   * Ingredients where current_stock <= minimum_stock.
   */
  async findLowStock({ branch_id } = {}) {
    // V1 stock lives on Ingredients (global). branch_id reserved for
    // future Branch_Inventory-based low-stock once POS V2 wires
    // per-branch deduction; accepted here for forward compatibility.
    const [rows] = await pool.execute(
      `SELECT
        i.id,
        i.name,
        i.unit,
        i.current_stock,
        i.minimum_stock,
        i.supplier_id,
        s.name AS supplier_name
       FROM Ingredients i
       LEFT JOIN Suppliers s ON i.supplier_id = s.id
       WHERE i.is_active = TRUE AND i.current_stock <= i.minimum_stock
       ORDER BY (i.current_stock / NULLIF(i.minimum_stock, 0)) ASC`
    );
    return rows;
  },

  /**
   * GET /api/inventory/dashboard
   * Aggregated cards: total ingredients, low stock, out of stock,
   * today's purchase spend, today's transaction count.
   */
  async getDashboardStats({ branch_id } = {}) {
    const [[ingredientStats]] = await pool.query(
      `SELECT
         COUNT(*) AS total_ingredients,
         SUM(CASE WHEN current_stock <= minimum_stock AND current_stock > 0 THEN 1 ELSE 0 END) AS low_stock_count,
         SUM(CASE WHEN current_stock = 0 THEN 1 ELSE 0 END) AS out_of_stock_count
       FROM Ingredients
       WHERE is_active = TRUE`
    );

    let purchaseQuery = `
      SELECT COALESCE(SUM(total_amount), 0) AS todays_purchase_amount
      FROM Purchase_Orders
      WHERE status = 'RECEIVED' AND DATE(received_at) = CURDATE()
    `;
    const purchaseParams = [];
    if (branch_id) {
      purchaseQuery += " AND branch_id = ?";
      purchaseParams.push(branch_id);
    }
    const [[purchaseStats]] = await pool.query(purchaseQuery, purchaseParams);

    let txnQuery = `
      SELECT COUNT(*) AS todays_transaction_count
      FROM Inventory_Transactions
      WHERE DATE(transaction_date) = CURDATE()
    `;
    const txnParams = [];
    if (branch_id) {
      txnQuery += " AND branch_id = ?";
      txnParams.push(branch_id);
    }
    const [[txnStats]] = await pool.query(txnQuery, txnParams);

    return {
      total_ingredients: ingredientStats.total_ingredients || 0,
      low_stock_count: ingredientStats.low_stock_count || 0,
      out_of_stock_count: ingredientStats.out_of_stock_count || 0,
      todays_purchase_amount: parseFloat(purchaseStats.todays_purchase_amount || 0),
      todays_transaction_count: txnStats.todays_transaction_count || 0,
    };
  },
};

module.exports = { InventoryModel, TRANSACTION_TYPE };