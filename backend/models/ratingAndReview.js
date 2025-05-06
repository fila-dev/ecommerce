const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Card",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reportType: {
    type: String,
    required: true,
    //enum: ['none', 'scam', 'missing', 'fake'] // Add validation for report types
  },
});

// Add index for better query performance
ratingAndReviewSchema.index({ card: 1, createdAt: -1 });
ratingAndReviewSchema.index({ user: 1, card: 1 }, { unique: true }); // Ensure one review per user per card

// Static method to get card statistics
ratingAndReviewSchema.statics.getCardStats = async function(cardId) {
  try {
    const stats = await this.aggregate([
      { 
        $match: { 
          card: new mongoose.Types.ObjectId(cardId) 
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
          total: { $sum: 1 },
          ratings: { $push: "$rating" }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    // Calculate distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats[0].ratings.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    return {
      average: parseFloat(stats[0].average.toFixed(1)),
      total: stats[0].total,
      distribution
    };
  } catch (error) {
    console.error('Error calculating card stats:', error);
    return {
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
};

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
