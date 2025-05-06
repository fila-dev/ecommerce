const stripe = require('../config/stripe');

// Create payment intent
const createPaymentIntent = async (req, res) => {
    try {
        const { amount, items } = req.body;

        console.log('Processing payment request:', {
            amount,
            itemCount: items?.length,
            userId: req.user?._id
        });

        // Add more specific amount validation
        if (!amount || isNaN(amount) || amount <= 0) {
            console.log('Invalid amount:', amount);
            return res.status(400).json({
                status: "FAILED",
                message: "Invalid amount. Amount must be a positive number."
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            console.log('Invalid items:', items);
            return res.status(400).json({
                status: "FAILED",
                message: "Items array is required"
            });
        }

        // Convert amount to cents and ensure it's an integer
        const amountInCents = Math.round(amount * 100);

        // Create simplified metadata that won't exceed the 500 character limit
        const simplifiedMetadata = {
            order_count: items.length.toString(),
            user_id: req.user._id.toString(),
            total_amount: amount.toString()
        };

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: simplifiedMetadata,
            description: `Order for user ${req.user._id} with ${items.length} items`,
        });

        console.log('Payment intent created:', {
            id: paymentIntent.id,
            amount: amountInCents,
            status: paymentIntent.status
        });

        return res.status(200).json({
            status: "SUCCESS",
            clientSecret: paymentIntent.client_secret
        });

    } catch (error) {
        console.error('Payment intent creation failed:', {
            error: error.message,
            stack: error.stack,
            code: error.code
        });

        // Handle Stripe-specific errors
        if (error.type === 'StripeError') {
            return res.status(400).json({
                status: "FAILED",
                message: `Payment error: ${error.message}`
            });
        }

        return res.status(500).json({
            status: "FAILED",
            message: 'Failed to create payment intent. Please try again.'
        });
    }
};

// Handle Stripe webhook events
const handleWebhook = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!endpointSecret) {
            return res.status(500).json({
                status: "FAILED",
                message: "Webhook secret is not configured"
            });
        }

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            return res.status(400).json({ error: `Webhook Error: ${err.message}` });
        }

        // Handle specific event types
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
                // Create order in database
                const orderCount = paymentIntent.metadata.order_count;
                const userId = paymentIntent.metadata.user_id;
                // Add your order creation logic here
                break;
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log(`PaymentIntent ${failedPayment.id} failed`);
                // Log failed payment
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });

    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: error.message
        });
    }
};

module.exports = {
    createPaymentIntent,
    handleWebhook
};