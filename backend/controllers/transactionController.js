const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const PurchaseHistory = require('../models/purchaseHistory');
const Card = require('../models/cardModel');

// Get all payments for a provider with detailed transaction info
const getProviderPayments = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all cards belonging to the provider
    const providerCards = await Card.find({ user: userId });
    const cardIds = providerCards.map(card => card._id);

    // Find all purchase histories that include the provider's cards
    const purchaseHistories = await PurchaseHistory.find({
      'items.id': { $in: cardIds.map(id => id.toString()) }
    }).sort({ createdAt: -1 }); // Sort by newest first

    // Calculate total earnings and format payment data
    const payments = purchaseHistories.map(history => {
      const providerItems = history.items.filter(item => 
        cardIds.map(id => id.toString()).includes(item.id)
      );

      const totalEarnings = providerItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );

      return {
        orderId: history.orderId,
        date: history.createdAt,
        items: providerItems,
        totalEarnings,
        customerEmail: history.email,
        customerDetails: {
          name: history.shippingAddress.name,
          phone: history.shippingAddress.phone,
          address: {
            street: history.shippingAddress.street,
            city: history.shippingAddress.city,
            state: history.shippingAddress.state,
            zipCode: history.shippingAddress.zipCode
          }
        },
        subtotal: history.subtotal,
        tax: history.tax,
        total: history.total
      };
    });

    // Calculate summary statistics
    const summary = {
      totalTransactions: payments.length,
      totalEarnings: payments.reduce((sum, payment) => sum + payment.totalEarnings, 0),
      totalItemsSold: payments.reduce((sum, payment) => 
        sum + payment.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      ),
      averageOrderValue: payments.length > 0 ? 
        payments.reduce((sum, payment) => sum + payment.totalEarnings, 0) / payments.length : 0
    };

    res.status(200).json({
      success: true,
      summary,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching provider payments",
      error: error.message
    });
  }
};

// Get all orders for a provider with detailed tracking and status
const getProviderOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all cards belonging to the provider
    const providerCards = await Card.find({ user: userId });
    const cardIds = providerCards.map(card => card._id);

    // Find all orders that include the provider's cards
    const orders = await Order.find({
      'storeOrders.items.id': { $in: cardIds }
    })
    .populate('userId', 'email name')
    .sort({ createdAt: -1 }); // Sort by newest first

    // Format order data with detailed information
    const formattedOrders = orders.map(order => {
      const relevantStoreOrders = order.storeOrders.filter(storeOrder =>
        storeOrder.items.some(item => 
          cardIds.map(id => id.toString()).includes(item.id.toString())
        )
      );

      return {
        orderId: order.orderId,
        customerInfo: order.userId,
        storeOrders: relevantStoreOrders.map(storeOrder => ({
          storeName: storeOrder.storeName,
          city: storeOrder.city,
          items: storeOrder.items.filter(item => 
            cardIds.map(id => id.toString()).includes(item.id.toString())
          ),
          status: storeOrder.status,
          packingId: storeOrder.packingId,
          trackingInfo: {
            ...storeOrder.trackingInfo,
            statusHistory: storeOrder.trackingInfo?.statusHistory?.sort((a, b) => 
              new Date(b.timestamp) - new Date(a.timestamp)
            )
          }
        })),
        createdAt: order.createdAt,
        notes: order.notes
      };
    });

    // Calculate order statistics
    const orderStats = {
      totalOrders: formattedOrders.length,
      statusBreakdown: formattedOrders.reduce((acc, order) => {
        order.storeOrders.forEach(store => {
          acc[store.status] = (acc[store.status] || 0) + 1;
        });
        return acc;
      }, {}),
      averageDeliveryTime: calculateAverageDeliveryTime(formattedOrders)
    };

    res.status(200).json({
      success: true,
      statistics: orderStats,
      orders: formattedOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching provider orders",
      error: error.message
    });
  }
};

// Helper function to calculate average delivery time
const calculateAverageDeliveryTime = (orders) => {
  let totalTime = 0;
  let deliveredCount = 0;

  orders.forEach(order => {
    order.storeOrders.forEach(store => {
      if (store.status === 'delivered' && store.trackingInfo?.statusHistory) {
        const startDate = new Date(store.trackingInfo.statusHistory
          .find(h => h.status === 'processing')?.timestamp);
        const deliveryDate = new Date(store.trackingInfo.statusHistory
          .find(h => h.status === 'delivered')?.timestamp);
        
        if (startDate && deliveryDate) {
          totalTime += deliveryDate - startDate;
          deliveredCount++;
        }
      }
    });
  });

  return deliveredCount > 0 ? Math.round(totalTime / deliveredCount / (1000 * 60 * 60 * 24)) : 0; // Average in days
};

module.exports = {
  getProviderPayments,
  getProviderOrders
};