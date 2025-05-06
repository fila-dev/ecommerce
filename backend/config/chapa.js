require('dotenv').config()

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY

if (!CHAPA_SECRET_KEY) {
    console.error('ERROR: CHAPA_SECRET_KEY is not set in environment variables')
    process.exit(1)
}

const CHAPA_BASE_URL = 'https://api.chapa.co/v1';

const config = {
    secretKey: CHAPA_SECRET_KEY,
    baseUrl: CHAPA_BASE_URL,
    endpoints: {
        initialize: '/transaction/initialize',
        verify: (tx_ref) => `/transaction/verify/${tx_ref}`,
        banks: '/banks',
    },
    headers: {
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
    }
};

const getPaymentMethods = async () => {
    try {
        const response = await fetch(`${CHAPA_BASE_URL}/banks`, {
            headers: config.headers
        });

        if (!response.ok) {
            throw new Error('Failed to fetch payment methods');
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        throw error;
    }
};

module.exports = {
    config,
    getPaymentMethods
};
