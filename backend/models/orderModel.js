const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purchaseHistoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseHistory',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  storeOrders: [{
    storeName: { type: String, required: true },
    city: { type: String, required: true },
    items: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 }
    }],
    packingId: {
      type: String,
      default: function() {
        const storePrefix = this.storeName.toUpperCase().substring(0, 3);
        const cityPrefix = this.city.toUpperCase().substring(0, 3);
        const timestamp = this.parent().createdAt || Date.now();
        const hash = require('crypto')
          .createHash('md5')
          .update(`${storePrefix}-${cityPrefix}`)
          .digest('hex')
          .substring(0, 4);
        
        return `PKG-${storePrefix}-${cityPrefix}-${timestamp}-${hash}`.toUpperCase();
      }
    },
    packingStatus: {
      type: String,
      enum: ['pending', 'packed', 'in_transit', 'delivered'],
      default: 'pending'
    },
    packingDeliveredAt: {
      type: Date
    },
    packingLocation: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending'
    },
    trackingInfo: {
      carrier: String,
      trackingNumber: String,
      currentLocation: String,
      lastUpdated: { type: Date, default: Date.now },
      estimatedDelivery: Date,
      statusHistory: [{
        status: {
          type: String,
          enum: ['pending', 'processing', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
          required: true
        },
        location: String,
        timestamp: { type: Date, default: Date.now },
        description: String
      }]
    }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  notes: [{
    message: String,
    type: { type: String, enum: ['system', 'user', 'admin'] },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
