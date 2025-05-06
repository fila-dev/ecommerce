const express = require("express");
const router = express.Router();
const {
  getProviderPayments,
  getProviderOrders
} = require("../controllers/transactionController");
const requireAuth = require("../middleware/requireAuth");

// Apply authentication middleware
router.use(requireAuth);

// Route to get provider payments
router.get("/provider/payments", getProviderPayments);

// Route to get provider orders
router.get("/provider/orders", getProviderOrders);

module.exports = router;
