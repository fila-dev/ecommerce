const express = require('express');
const router = express.Router();
const { createPaymentIntent, handleWebhook } = require('../controllers/paymentController');
const { createChapaPayment, handleChapaWebhook, verifyPayment, getBanks } = require('../controllers/chapaController');
const requireAuth = require('../middleware/requireAuth');

// Stripe payment routes
router.post('/create-payment-intent', requireAuth, createPaymentIntent);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Chapa payment routes
router.get('/chapa-banks', requireAuth, getBanks);
router.post('/create-chapa-payment', requireAuth, createChapaPayment);
router.get('/verify-chapa-payment/:tx_ref', requireAuth, verifyPayment);
router.post('/chapa-webhook', handleChapaWebhook);

module.exports = router;
