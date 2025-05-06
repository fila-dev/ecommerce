const nodemailer = require('nodemailer')
require('dotenv').config()

let transporter;

try {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSWORD
        }
    });

    // test transporter
    transporter.verify((error, success) => {
        if (error) {
            console.error('SMTP Error:', error);
        } else {
            console.log('Email server is ready to take messages');
        }
    });
} catch (error) {
    console.error('Error creating email transporter:', error);
}

// Add verification confirmation template
const getVerificationConfirmationEmail = (userName, email) => {
    return {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: 'Account Verification Confirmed',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50; text-align: center;">Account Verification Successful</h2>
                <p style="color: #34495e;">Dear ${userName || email},</p>
                <p style="color: #34495e;">Congratulations! Your provider account has been successfully verified.</p>
                <p style="color: #34495e;">You can now access all provider features and start listing your products.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #7f8c8d; font-size: 12px;">If you didn't request this verification, please contact our support team immediately.</p>
                </div>
            </div>
        `
    };
};

const sendEmail = async (mailOptions) => {
    if (!transporter) {
        throw new Error('Email transporter not initialized. Check your email configuration.');
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Email sending error:', error);
        if (error.code === 'EAUTH') {
            throw new Error('Email authentication failed. Please check your email credentials.');
        } else {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}

module.exports = { 
    sendEmail,
    getVerificationConfirmationEmail
};