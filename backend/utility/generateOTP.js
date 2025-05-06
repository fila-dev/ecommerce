const generateOTP = () => {
    try {
        // Generate a 6-digit OTP for better security
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Generated OTP:', otp);
        
        // Validate OTP length
        if (otp.length !== 6) {
            throw new Error('Generated OTP is invalid');
        }
        
        return otp;
    } catch (error) {
        throw error; // Throw the actual error for better debugging
    }
}

module.exports = generateOTP;