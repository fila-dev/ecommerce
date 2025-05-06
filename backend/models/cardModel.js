const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

const cardSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  
  price: {
    type: Number,
    required: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  discount: {
    type: String,
    default: '0', // Changed from '0%' to match form data
  },
  store: {
    type: String,
    required: true,
  },
  // rating: {
  //   type: Number,
  //   default: 0,
  // },
  reviews: {
    type: Number,
    default: 0,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  fastDelivery: {
    type: Boolean,
    default: false,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  user:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RatingAndReview',
   // required: true,
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered'],
    default: 'pending'
  },
  deliveredAt: {
    type: Date
  },
  deliveryLocation: {
    type: String
  }
}, {timestamps:true} );

module.exports = mongoose.model('Card', cardSchema); 