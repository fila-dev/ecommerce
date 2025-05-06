const Order = require('../models/orderModel');
const PurchaseHistory = require('../models/purchaseHistory');
const Card = require('../models/cardModel');

// Create a new order

const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify the requesting user matches the userId parameter
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to view these orders' });
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .select('orderId storeOrders totalAmount status createdAt')
      .lean();

    // Format the orders to match the frontend requirements
    const formattedOrders = orders.map(order => {
      return order.storeOrders.map(storeOrder => ({
        _id: order._id,
        orderId: order.orderId,
        storeName: storeOrder.storeName,
        city: storeOrder.city,
        status: storeOrder.status || 'pending',
        items: storeOrder.items,
        packingId: storeOrder.packingId,
        // Ensure packingStatus is included in the response
        packingStatus: storeOrder.packingStatus || 'pending',
        packingDeliveredAt: storeOrder.packingDeliveredAt,
        packingLocation: storeOrder.packingLocation,
        trackingInfo: storeOrder.trackingInfo || {},
        createdAt: order.createdAt
      }));
    }).flat();

    // Double check delivery status
    formattedOrders.forEach(order => {
      if (order.status === 'delivered') {
        order.packingStatus = 'delivered';
      }
    });

    res.status(200).json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify the requesting user owns the order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

const updateTrackingInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { storeIndex, currentLocation, status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const storeOrder = order.storeOrders[storeIndex];
    if (!storeOrder) {
      return res.status(404).json({ error: 'Store order not found' });
    }

    // Check if already delivered
    if (storeOrder.status === 'delivered' || storeOrder.packingStatus === 'delivered') {
      return res.status(400).json({ 
        error: 'Order is already delivered',
        deliveryDetails: {
          deliveredAt: storeOrder.trackingInfo?.deliveredAt,
          deliveryLocation: storeOrder.packingLocation,
          packingId: storeOrder.packingId,
          packingStatus: 'delivered' // Ensure delivered status is returned
        }
      });
    }

    const now = new Date();
    
    // Update both status and packingStatus together
    storeOrder.status = status;
    switch(status) {
      case 'pending':
        storeOrder.packingStatus = 'pending';
        break;
      case 'processing':
        storeOrder.packingStatus = 'packed';
        break;
      case 'in_transit':
      case 'out_for_delivery':
        storeOrder.packingStatus = 'in_transit';
        break;
      case 'delivered':
        storeOrder.packingStatus = 'delivered';
        storeOrder.packingDeliveredAt = now;
        break;
    }

    // Update tracking info
    storeOrder.trackingInfo = {
      ...storeOrder.trackingInfo,
      currentLocation,
      lastUpdated: now,
      statusHistory: [
        ...(storeOrder.trackingInfo?.statusHistory || []),
        {
          status,
          location: currentLocation,
          timestamp: now,
          packingStatus: storeOrder.packingStatus // Include packing status in history
        }
      ]
    };

    if (status === 'delivered') {
      storeOrder.trackingInfo.deliveredAt = now;
      // Update all items as delivered
      await Promise.all(storeOrder.items.map(item => 
        Card.findByIdAndUpdate(item.id, {
          $set: {
            deliveryStatus: 'delivered',
            deliveredAt: now,
            deliveryLocation: currentLocation,
            packingId: storeOrder.packingId
          }
        })
      ));
    }

    await order.save();
    res.status(200).json({
      orderId: order.orderId,
      currentLocation,
      status,
      packingStatus: storeOrder.packingStatus,
      lastUpdated: now,
      packingId: storeOrder.packingId
    });

  } catch (error) {
    console.error('Error updating tracking:', error);
    res.status(500).json({ error: 'Failed to update tracking info' });
  }
};

module.exports = {
    
    getUserOrders,
    getOrderById,
    updateTrackingInfo,
    // getAllOrders,
    // getOrderStats,
    // cancelOrder,
    // addOrderNote
};
