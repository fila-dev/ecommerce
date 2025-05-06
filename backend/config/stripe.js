require('dotenv').config()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_SECRET_KEY) {
    console.error('ERROR: STRIPE_SECRET_KEY is not set in environment variables')
    process.exit(1)
}

// Initialize Stripe with secret key
const stripe = require('stripe')(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16', // Use latest API version
    maxNetworkRetries: 2, // Retry failed requests
    timeout: 10000 // 10 second timeout
})

// Verify Stripe connection
stripe.paymentIntents.list({ limit: 1 })
    .then(() => console.log('Stripe connection verified successfully'))
    .catch(error => {
        console.error('Stripe connection failed:', error)
        process.exit(1)
    })

module.exports = stripe
