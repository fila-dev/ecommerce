const mongoose = require("mongoose");
const Order = require('./orderModel');

const purchaseHistorySchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  items: [
    {
      id: String,
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
      store: {
        type: String,
        required: true,
      },
      image: String,
    },
  ],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  }, 
  shippingAddress: {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    phone: { type: String, required: true },
},
}, { timestamps: true });

// Add the post-save hook BEFORE creating the model
purchaseHistorySchema.post("save", async function (doc, next) {
  try {
    console.log("🚀 New purchase detected, creating order...");

    // Group items by store and include shipping city
    const storeOrders = doc.items.reduce((acc, item) => {
      const storeName = item.store;
      if (!acc[storeName]) {
        acc[storeName] = { 
          storeName, 
          items: [],
          city: doc.shippingAddress.city  // Only include the city
        };
      }
      acc[storeName].items.push({
        id: new mongoose.Types.ObjectId(item.id),
        quantity: item.quantity,
        price: item.price,
      });
      return acc;
    }, {});

    console.log("Grouped store orders:", JSON.stringify(storeOrders, null, 2));
    const storeOrdersArray = Object.values(storeOrders);

    // Create the new order with explicit city field
    const newOrder = new Order({
      userId: doc.userId,
      purchaseHistoryId: doc._id,
      orderId: doc.orderId,
      storeOrders: storeOrdersArray.map(storeOrder => ({
        storeName: storeOrder.storeName,
        city: storeOrder.city,  // Explicitly include city
        items: storeOrder.items.map(item => ({
          id: new mongoose.Types.ObjectId(item.id),
          quantity: item.quantity,
          price: item.price
        }))
      })),
      totalAmount: doc.total,
    });

    console.log("About to save order:", JSON.stringify(newOrder, null, 2));
    await newOrder.save();
    console.log("✅ Order created automatically!");

    next();
  } catch (error) {
    console.error("❌ Error creating order:", error);
    console.error("Error stack:", error.stack);
    next(error);
  }
});

// Create the model AFTER defining the hook
const PurchaseHistory = mongoose.model("PurchaseHistory", purchaseHistorySchema);

module.exports = PurchaseHistory;
