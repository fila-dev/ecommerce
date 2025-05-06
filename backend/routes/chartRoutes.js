const express = require('express');
const router = express.Router();
const { 
    getTotalUsers,
    getTotalCustommer,
    getCategoriesVisited,
    getVisitorData,
    getDailyRevenue
} = require('../controllers/chartController');

// Admin routes
router.get('/admin/revenue-chart', getTotalUsers);
router.get('/admin/report', getTotalUsers);
router.get('/admin/categoriesVisted', getCategoriesVisited);
router.get('/admin/visitors', getVisitorData);
router.get('/admin/revenue-daily', getDailyRevenue);

// Provider routes
router.get('/provider/report', getTotalCustommer);
router.get('/provider/categoriesVisted', getCategoriesVisited);
router.get('/provider/visitors', getVisitorData);
router.get('/provider/revenue-daily', getDailyRevenue);

module.exports = router;
