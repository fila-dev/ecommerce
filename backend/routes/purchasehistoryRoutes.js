const express = require("express");
const router = express.Router();
const {
  createPurchaseHistory,
  getUserPurchaseHistory,
  getPurchaseHistoryDownload,
  generateReceipt,
  getAllSales,
  getProviderSales
  
} = require("../controllers/purchasehistoryController");






const requireAuth = require("../middleware/requireAuth"); 


// Route to get all sales


// Apply authentication middleware to all routes
router.use(requireAuth);

// Route to get purchase history for a specific user
router.get("/:userId", getUserPurchaseHistory);

// Route to create a new purchase history entry
router.post("/create", createPurchaseHistory);

// get all purchase history download
router.get("/download", getPurchaseHistoryDownload);

// Route to generate receipt PDF
router.get("/receipt/:orderId", generateReceipt); 

router.get("/sales", getAllSales); 

// Route to get Providers sales
router.get("/provider/sales", getProviderSales);


module.exports = router;
