const express = require('express');
const router = express.Router();
const { verifyID, checkVerificationStatus } = require('../controllers/verifyController');

router.post('/match-id', verifyID);
router.get('/status/:userId', checkVerificationStatus);

module.exports = router;
