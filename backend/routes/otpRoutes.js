const express = require('express')

const router = express.Router();

const { sendOTP, verifyOTP } = require('../controllers/otpController')

// request new verification otp
router.post('/request-otp', async (req, res) => {
    try {
        const { email, subject, message, duration } = req.body;
        
        if (!email || !subject || !message) {
            return res.status(400).json({
                status: "FAILED",
                message: "Missing required fields"
            });
        }

        const createdOTP = await sendOTP({ email, subject, message, duration });
        res.status(200).json({
            status: "PENDING", 
            message: "OTP sent successfully",
            data: {
                email,
                expiresAt: createdOTP.expiresAt
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: error.message
        });
    }
});    

// verify otp 

router.post('/verify', verifyOTP)

module.exports = router;