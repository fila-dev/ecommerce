require('dotenv').config();

const API_CONFIG = {
    API_KEY: process.env.ID_ANALYZER_API_KEY,
    BASE_URL: "https://api.idanalyzer.com/core/v1",
    SERVER_URL: process.env.SERVER_URL || "process.env.URLPATH ",
    PARAMS: {
        country: "ET",  // Ethiopia
        authentication: true,
        verify_expiry: true,
        verify_age: true,
        face_match: true, // Enable face matching
        check_duplicate: true // Check for duplicate IDs
    }
};

// Check API connection and key validity
const checkAPIConnection = async () => {
    try {
        console.log('Testing connection to:', API_CONFIG.BASE_URL);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/status`, {
            headers: {
                'apikey': API_CONFIG.API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('API Response:', data);
            return true;
        } else {
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                data: data
            });
            return false;
        }
    } catch (error) {
        console.error('API Connection Error:', {
            message: error.message,
            stack: error.stack
        });
        return false;
    }
};

// Check API key and connection on startup
if (!API_CONFIG.API_KEY) {
    console.warn('Warning: ID_ANALYZER_API_KEY is not set in environment variables');
} else {
    checkAPIConnection();
}

module.exports = { API_CONFIG, checkAPIConnection };
