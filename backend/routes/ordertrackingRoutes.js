const express = require('express');
const {
    getUserOrders,
    getOrderById,
    updateTrackingInfo
} = require('../controllers/ordertrackingController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);
// 
// Routes should be under /api/ordertracking
router.get('/:userId', getUserOrders);
router.get('/order/:id', getOrderById);
router.patch('/order/:id/tracking', updateTrackingInfo);

module.exports = router;  







