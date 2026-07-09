const CRMModel = require("../models/crm.model");

const CRMController = {
  /**
   * GET /api/crm/dashboard
   * Module 6: Customer Dashboard — pure SQL aggregates.
   * Role: Manager, Super Admin.
   */
  async getDashboard(req, res) {
    try {
      const data = await CRMModel.getDashboard();
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  },
};

module.exports = CRMController;