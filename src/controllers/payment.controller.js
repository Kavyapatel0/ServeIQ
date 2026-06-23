const POSService = require("../services/pos.service");
const { PaymentModel, PAYMENT_METHOD } = require("../models/payment.model");
const { OrderModel } = require("../models/order.model");

const PaymentController = {
  /**
   * POST /api/payments
   * Body: { order_id, payment_method }
   * Marks order PAID, frees the table.
   */
  async process(req, res) {
    try {
      const { order_id, payment_method } = req.body;

      if (!order_id || !payment_method) {
        return res.status(400).json({
          success: false,
          message: "order_id and payment_method are required.",
        });
      }

      const allowedMethods = Object.values(PAYMENT_METHOD);
      if (!allowedMethods.includes(payment_method.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment method. Allowed: ${allowedMethods.join(", ")}.`,
        });
      }

      // Branch scope check
      const order = await OrderModel.findById(parseInt(order_id));
      if (!order) return res.status(404).json({ success: false, message: "Order not found." });
      if (req.branchScope && order.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      const result = await POSService.processPayment({
        order_id: parseInt(order_id),
        payment_method: payment_method.toUpperCase(),
        userId: req.user.id,
      });

      const receipt = await POSService.generateReceipt(parseInt(order_id));

      return res.status(200).json({
        success: true,
        message: "Payment processed successfully.",
        data: {
          payment: result,
          receipt,
        },
      });
    } catch (err) {
      console.error("PaymentController.process:", err);
      return res
        .status(err.status || 500)
        .json({ success: false, message: err.message || "Failed to process payment." });
    }
  },

  /**
   * GET /api/payments/order/:orderId
   * Fetch all payments for an order.
   */
  async getByOrder(req, res) {
    try {
      const order_id = parseInt(req.params.orderId);

      const order = await OrderModel.findById(order_id);
      if (!order) return res.status(404).json({ success: false, message: "Order not found." });
      if (req.branchScope && order.branch_id !== req.branchScope) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }

      const payments = await PaymentModel.findByOrderId(order_id);
      return res.status(200).json({ success: true, count: payments.length, data: payments });
    } catch (err) {
      console.error("PaymentController.getByOrder:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch payments." });
    }
  },
};

module.exports = PaymentController;