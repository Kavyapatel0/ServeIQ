const { SupplierModel } = require("../models/supplier.model");
const AuditService = require("../services/audit.service");

const SupplierController = {
  /**
   * GET /api/suppliers
   * ?search=fresh &is_active=true
   */
  async getAll(req, res) {
    try {
      const { search, is_active } = req.query;
      const suppliers = await SupplierModel.findAll({
        search,
        is_active: is_active !== undefined ? is_active === "true" : undefined,
      });
      return res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
    } catch (err) {
      console.error("SupplierController.getAll:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch suppliers." });
    }
  },

  async getById(req, res) {
    try {
      const supplier = await SupplierModel.findById(parseInt(req.params.id));
      if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found." });
      return res.status(200).json({ success: true, data: supplier });
    } catch (err) {
      console.error("SupplierController.getById:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch supplier." });
    }
  },

  async create(req, res) {
    try {
      const { name, contact_person, phone, email, gst_number, address } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Supplier name is required." });
      }

      const id = await SupplierModel.create({
        name: name.trim(), contact_person, phone, email, gst_number, address,
      });

      await AuditService.log(req.user.id, "SUPPLIER_CREATED", "Supplier", id, { name });

      const supplier = await SupplierModel.findById(id);
      return res.status(201).json({ success: true, message: "Supplier created.", data: supplier });
    } catch (err) {
      console.error("SupplierController.create:", err);
      return res.status(500).json({ success: false, message: "Failed to create supplier." });
    }
  },

  async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      const existing = await SupplierModel.findById(id);
      if (!existing) return res.status(404).json({ success: false, message: "Supplier not found." });

      const { name, contact_person, phone, email, gst_number, address } = req.body;
      const updated = await SupplierModel.update(id, { name, contact_person, phone, email, gst_number, address });

      if (!updated) return res.status(400).json({ success: false, message: "Nothing to update." });

      await AuditService.log(req.user.id, "SUPPLIER_UPDATED", "Supplier", id, req.body);

      const supplier = await SupplierModel.findById(id);
      return res.status(200).json({ success: true, message: "Supplier updated.", data: supplier });
    } catch (err) {
      console.error("SupplierController.update:", err);
      return res.status(500).json({ success: false, message: "Failed to update supplier." });
    }
  },

  /**
   * PATCH /api/suppliers/:id/toggle-active
   */
  async toggleActive(req, res) {
    try {
      const id = parseInt(req.params.id);
      const newState = await SupplierModel.toggleActive(id);

      if (newState === null) {
        return res.status(404).json({ success: false, message: "Supplier not found." });
      }

      await AuditService.log(req.user.id, "SUPPLIER_UPDATED", "Supplier", id, { is_active: newState });

      return res.status(200).json({
        success: true,
        message: `Supplier is now ${newState ? "active" : "inactive"}.`,
        data: { id, is_active: newState },
      });
    } catch (err) {
      console.error("SupplierController.toggleActive:", err);
      return res.status(500).json({ success: false, message: "Failed to toggle supplier status." });
    }
  },

  async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      const existing = await SupplierModel.findById(id);
      if (!existing) return res.status(404).json({ success: false, message: "Supplier not found." });

      await SupplierModel.delete(id);
      await AuditService.log(req.user.id, "SUPPLIER_DELETED", "Supplier", id);
      return res.status(200).json({ success: true, message: "Supplier deactivated." });
    } catch (err) {
      console.error("SupplierController.delete:", err);
      return res.status(500).json({ success: false, message: "Failed to delete supplier." });
    }
  },
};

module.exports = SupplierController;