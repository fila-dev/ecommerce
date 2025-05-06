const generateOTP = require('../utility/generateOTP')
const Otp = require('../models/otpModel')
const {sendEmail} = require('../utility/sendEmail')
const bcrypt = require('bcrypt')
require('dotenv').config()
const {AUTH_EMAIL, AUTH_PASSWORD} = process.env;
const User = require('../models/userModel')
const createToken = require('../utility/createToken')

const sendOTP = async ({email, subject, message, duration = 1}) => {
  try {
    // Validate required fields
    if (!(email && subject && message)) {
      throw Error('Please provide values for email, subject and message')
    }  

    // Clear any old records 
    await Otp.deleteOne({email});

    // Generate OTP
    const generatedOTP = generateOTP()

    // Validate email configuration
    if (!process.env.AUTH_EMAIL || !process.env.AUTH_PASSWORD) {
      throw new Error('Email configuration is missing. Please check AUTH_EMAIL and AUTH_PASSWORD in .env file');
    }

    console.log('----------------------------------------');
    console.log('Email:', email);
    console.log('OTP:', generatedOTP);
    console.log('----------------------------------------');

    // Send email
    const mailOptions = { 
      from: process.env.AUTH_EMAIL,
      to: email,
      subject,
      html: `
        <p>${message}</p>
        <p>Here is your OTP: <strong>${generatedOTP}</strong></p>
        <p>This code <b>expires in ${duration} hour(s)</b></p>
      `,
    } 

    try {
      await sendEmail(mailOptions)
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    // Hash and save OTP to database
    const hashedOTP = await bcrypt.hash(generatedOTP, 10)
    const newOTP = new Otp({
      email,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + duration * 30 * 1000
    })  

    const createdOTPRecord = await newOTP.save();
    return createdOTPRecord;

  } catch (error) {
    console.error('Error in sendOTP:', error);
    throw error;
  }
}   
   

// verify otp 

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({
                status: "FAILED",
                message: "Empty otp details are not allowed"
            });
        }

        // Get pending registration data from session
        const pendingRegistration = req.session?.pendingRegistration;
        if (!pendingRegistration || pendingRegistration.email !== email) {
            return res.status(400).json({
                status: "FAILED",
                message: "No pending registration found. Please try signing up again."
            });
        }

        // Find the most recent OTP for this email
        const matchedOTPRecord = await Otp.findOne({ 
            email: email 
        }).sort({ createdAt: -1 });
        
        if (!matchedOTPRecord) {
            return res.status(404).json({
                status: "FAILED",
                message: "No OTP found for this email"
            });
        }

        // Check if OTP has expired
        const { expiresAt } = matchedOTPRecord;
        
        if (expiresAt < Date.now()) {
            // Delete expired OTP
            await Otp.deleteOne({ _id: matchedOTPRecord._id });
            return res.status(401).json({
                status: "FAILED",
                message: "OTP has expired. Please request a new one"
            });
        }

        // If not expired, check if OTP matches
        const validOTP = await bcrypt.compare(otp, matchedOTPRecord.otp);

        if (!validOTP) {
            return res.status(400).json({
                status: "FAILED",
                message: "Invalid OTP"
            });
        }

        try {
            // Create the user account
            const user = await User.signupUser(
                pendingRegistration.email,
                pendingRegistration.password,
                pendingRegistration.accountType
            );

            if (!user) {
                throw new Error('Failed to create user account');
            }

            // Set email as verified since OTP is valid
            user.emailVerified = true;
            await user.save();

            // Create token
            const token = createToken(user._id);

            // Clear OTP and pending registration
            await Otp.deleteOne({ _id: matchedOTPRecord._id });
            delete req.session.pendingRegistration;

            // Return success with user data
            return res.status(201).json({
                status: "SUCCESS",
                message: "Email verified and registration completed successfully",
                userData: {
                    email: user.email,
                    accountType: user.accountType,
                    token,
                    userId: user._id,
                    emailVerified: true,
                    profile: {
                        ...user.profile,
                        profileImage: user.profile?.profileImage ? 
                            `process.env.URLPATH /${user.profile.profileImage}` : null,
                        idImage: user.profile?.idImage ? 
                            `process.env.URLPATH /${user.profile.idImage}` : null
                    }
                }
            });
        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(400).json({
                status: "FAILED",
                message: "Failed to create user account: " + error.message
            });
        }
    } catch (error) {
        console.error("Error in verifyOTP:", error);
        return res.status(400).json({
            status: "FAILED",
            message: error.message
        });
    }
};


module.exports = { sendOTP, verifyOTP }