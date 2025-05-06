const User = require('../models/userModel');
const { API_KEY, BASE_URL, PARAMS } = require('../config/analyzer');

// Verify ID and Update Status
const verifyID = async (req, res) => {
    try {
        const { userId, imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({
                success: false,
                message: "No image data provided"
            });
        }

        // Find User first
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        try {
            // Log the API request for debugging
            console.log('Calling ID Analyzer API with params:', {
                apiKey: API_KEY ? 'Present' : 'Missing',
                baseUrl: BASE_URL,
                parameters: PARAMS
            });

            // Call ID Analyzer API using fetch
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apiKey: API_KEY,
                    file: imageBase64,
                    ...PARAMS
                })
            });

            const data = await response.json();
            
            // Enhanced logging
            console.log('ID Analyzer API Status:', response.status);
            console.log('ID Analyzer API Response Headers:', Object.fromEntries(response.headers));
            console.log('ID Analyzer API Response Body:', data);

            if (data.error) {
                return res.status(400).json({
                    success: false,
                    message: "ID verification failed",
                    details: data.error,
                    apiStatus: response.status
                });
            }

            // Update user verification status
            user.profile.idVerified = true;
            user.profile.verificationDate = new Date();
            await user.save();

            return res.json({
                success: true,
                message: "ID verified successfully",
                user: {
                    ...user.toObject(),
                    profile: {
                        ...user.profile.toObject(),
                        idVerified: true,
                        verificationDate: new Date()
                    }
                }
            });

        } catch (apiError) {
            console.error('ID Analyzer API Error:', apiError);
            return res.status(500).json({
                success: false,
                message: "Error calling ID verification service",
                error: apiError.message
            });
        }
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Error during verification process",
            error: error.message 
        });
    }
};

// Add a method to check verification status
const checkVerificationStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            verified: user.profile.idVerified,
            verificationDate: user.profile.verificationDate
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking verification status",
            error: error.message
        });
    }
};

module.exports = { 
    verifyID,
    checkVerificationStatus 
};
