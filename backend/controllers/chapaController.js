const Order = require('../models/orderModel');
const { config } = require('../config/chapa');

const getBanks = async (req, res) => {
    try {
        const banks = await getPaymentMethods();
        res.json({ success: true, data: banks });
    } catch (error) {
        console.error('Error fetching banks:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch banks'
        });
    }
};

const createChapaPayment = async (req, res) => {
    try {
        const {
            amount,
            currency,
            email,
            first_name,
            last_name,
            tx_ref,
            return_url,
            callback_url,
            title,
            description,
            meta
        } = req.body;

        // Validate required fields
        if (!amount || !email || !first_name || !tx_ref) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Create a new order
        const order = await Order.create({
            user: req.user._id,
            items: meta.order_items.map(item => ({
                product: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: parseFloat(amount),
            paymentMethod: 'chapa',
            paymentStatus: 'pending',
            orderStatus: 'pending',
            payment: {
                transactionRef: tx_ref
            }
        });

        // Return the order ID
        res.json({
            tx_ref: tx_ref,
            orderId: order._id
        });
    } catch (error) {
        console.error('Chapa payment error:', error);
        res.status(500).json({
            error: error.message || 'Failed to initialize Chapa payment'
        });
    }
};

const handleChapaWebhook = async (req, res) => {
    try {
        const { type, data } = req.body;

        if (type === 'charge.completed') {
            const order = await Order.findOne({
                'payment.transactionRef': data.tx_ref
            });

            if (!order) {
                throw new Error('Order not found');
            }

            order.paymentStatus = 'completed';
            order.orderStatus = 'processing';
            order.payment.verificationData = data;
            await order.save();
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Chapa webhook error:', error);
        res.status(500).json({
            error: error.message || 'Failed to process webhook'
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { tx_ref } = req.params;

        const response = await fetch(`${config.baseUrl}${config.endpoints.verify(tx_ref)}`, {
            headers: config.headers
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Payment verification failed');
        }

        const data = await response.json();

        // Find and update the order
        const order = await Order.findOne({
            'payment.transactionRef': tx_ref
        });

        if (!order) {
            throw new Error('Order not found');
        }

        if (data.data.status === 'success') {
            order.paymentStatus = 'completed';
            order.orderStatus = 'processing';
            order.payment.verificationData = data.data;
            await order.save();
        }

        res.json({
            success: true,
            order: {
                _id: order._id,
                items: order.items,
                totalAmount: order.totalAmount,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                createdAt: order.createdAt
            }
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Payment verification failed'
        });
    }
};

module.exports = {
    createChapaPayment,
    handleChapaWebhook,
    verifyPayment,
    getBanks
};
