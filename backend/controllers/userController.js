const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const { sendOTP } = require('./otpController')
const createToken = require('../utility/createToken')


const loginUser = async (req, res) => { 
    const {email, password} = req.body

    try {
        const user = await User.loginUser(email, password)

        // create a token  
        const token = createToken(user._id)
        
        // Format profile image URLs if they exist
        const profile = user.profile || {};
        if (profile.profileImage) {
            profile.profileImage = `process.env.URLPATH /${profile.profileImage}`;
        }
        if (profile.idImage) {
            profile.idImage = `process.env.URLPATH /${profile.idImage}`;
        }

        res.status(200).json({
            email,
            token,
            accountType: user.accountType,
            profile: profile
        })
    } catch(error) {
       res.status(400).json({error: error.message})
    }
}

// signup user
const signupUser = async (req, res) => {
    const { email, password, accountType } = req.body

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' })
        }

        // Store registration data in session or temporary storage
        req.session = req.session || {};
        req.session.pendingRegistration = {
            email,
            password,
            accountType
        };

        // Generate and send OTP
        const otpSubject = "Email Verification for Registration";
        const otpMessage = "Thank you for registering. Please verify your email with the following OTP:";
        
        try {
            await sendOTP({
                email,
                subject: otpSubject,
                message: otpMessage,
                duration: 1
            });
            
            res.status(200).json({
                success: true,
                message: "OTP sent successfully. Please verify your email to complete registration.",
                email
            });
        } catch (otpError) {
            console.error('OTP Error:', otpError);
            res.status(400).json({
                success: false,
                error: otpError.message || "Failed to send OTP. Please try again."
            });
        }
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(400).json({
            success: false,
            error: error.message || "An error occurred during signup"
        });
    }
}

// verify email
const verifyEmail = async (req, res) => {
    try {
        const user = await User.verifyEmail(req.user._id)
        res.status(200).json({
            success: true,
            emailVerified: user.emailVerified
        })
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// update user details
const updateUserDetails = async (req, res) => {
    try {
        const { name, fatherName, phone, address } = req.body;
        
        const updates = {
            profile: {
                name,
                fatherName,
                phoneNumber: phone,
                address
            }
        };

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { 
                new: true,
                runValidators: true 
            }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: {
                email: user.email,
                accountType: user.accountType,
                profile: user.profile,
                emailVerified: user.emailVerified
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

module.exports = {
    signupUser,
    loginUser,
    verifyEmail,
    updateUserDetails
}