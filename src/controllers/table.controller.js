const { TableModel, TABLE_STATUS } = require("../models/table.model");
const AuditService = require("../services/audit.service");

const TableController = {
  /**
   * GET /api/tables
   * Branch-scoped via req.branchScope.
   * Optional query: ?status=AVAILABLE
   */
  async getAll(req, res) {
    try {
      const branch_id = req.branchScope ?? (req.query.branch_id ? parseInt(req.query.branch_id) : undefined);
      const { status } = req.query;

      const tables = await TableModel.findAll({ branch_id, status });
      return res.status(200).json({
        success: true,
        count: tables.length,
        data: tables,
      });
    } catch (err) {
      console.error("TableController.getAll:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch tables." });
    }
  },

  /**
   * GET /api/tables/:id
   */
  async getById(req, res) {
    try {
      const table = await TableModel.findById(parseInt(req.params.id));
      if (!table) {
        return res.status(404).json({ success: false, message: "Table not found." });
      }

      // Branch scope check for non-admins
      if (req.branchScope && table.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      return res.status(200).json({ success: true, data: table });
    } catch (err) {
      console.error("TableController.getById:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch table." });
    }
  },

  /**
   * POST /api/tables
   * Manager/Admin only.
   */
  async create(req, res) {
    try {
      const { table_number, capacity, branch_id } = req.body;
      const targetBranch = req.branchScope ?? branch_id;

      if (!targetBranch) {
        return res.status(400).json({ success: false, message: "branch_id is required." });
      }

      const id = await TableModel.create({
        table_number,
        capacity,
        branch_id: targetBranch,
      });

      await AuditService.log(req.user.id, "TABLE_CREATED", "Restaurant_Tables", id, {
        table_number,
        capacity,
        branch_id: targetBranch,
      });

      const table = await TableModel.findById(id);
      return res.status(201).json({ success: true, message: "Table created.", data: table });
    } catch (err) {
      console.error("TableController.create:", err);
      return res.status(500).json({ success: false, message: "Failed to create table." });
    }
  },

  /**
   * PUT /api/tables/:id
   */
  async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      const table = await TableModel.findById(id);
      if (!table) {
        return res.status(404).json({ success: false, message: "Table not found." });
      }
      if (req.branchScope && table.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      const { table_number, capacity, status } = req.body;

      // Validate status value if provided
      if (status && !Object.values(TABLE_STATUS).includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed: ${Object.values(TABLE_STATUS).join(", ")}.`,
        });
      }

      const updated = await TableModel.update(id, { table_number, capacity, status });
      if (!updated) {
        return res.status(400).json({ success: false, message: "Nothing to update." });
      }

      await AuditService.log(req.user.id, "TABLE_UPDATED", "Restaurant_Tables", id, {
        table_number, capacity, status,
      });

      const updatedTable = await TableModel.findById(id);
      return res.status(200).json({ success: true, message: "Table updated.", data: updatedTable });
    } catch (err) {
      console.error("TableController.update:", err);
      return res.status(500).json({ success: false, message: "Failed to update table." });
    }
  },

  /**
   * DELETE /api/tables/:id
   * Hard delete — only when table is AVAILABLE (not mid-order).
   */
  async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      const table = await TableModel.findById(id);
      if (!table) {
        return res.status(404).json({ success: false, message: "Table not found." });
      }
      if (req.branchScope && table.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }
      if (table.status !== TABLE_STATUS.AVAILABLE) {
        return res.status(409).json({
          success: false,
          message: `Cannot delete a table that is currently ${table.status}.`,
        });
      }

      await TableModel.delete(id);
      await AuditService.log(req.user.id, "TABLE_DELETED", "Restaurant_Tables", id);

      return res.status(200).json({ success: true, message: "Table deleted." });
    } catch (err) {
      console.error("TableController.delete:", err);
      return res.status(500).json({ success: false, message: "Failed to delete table." });
    }
  },
};

module.exports = TableController;