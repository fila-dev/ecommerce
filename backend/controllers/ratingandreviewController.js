const mongoose = require("mongoose");
const RatingAndReview = require("../models/ratingAndReview");

// Create a new rating and review
const createRatingAndReview = async (req, res) => {
  try {
    const { itemId, reportType, rating, comment } = req.body;

    // Validate required fields
    if (!rating || !comment || !reportType || !itemId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate rating is between 1-5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if itemId is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    // Check if user has already reviewed this item
    const existingReview = await RatingAndReview.findOne({
      user: req.user._id,
      card: itemId
    });

    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this item" });
    }

    const ratingAndReview = await RatingAndReview.create({
      user: req.user._id,
      card: itemId,
      reportType,
      rating: Number(rating),
      comment,
    });

    // Populate user details before sending response
    const populatedReview = await RatingAndReview.findById(ratingAndReview._id)
      .populate('user', 'email')
      .lean();

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all ratings and reviews
const getAllRatingsAndReviews = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid card ID format' });
    }

    const ratingsAndReviews = await RatingAndReview.find({ card: id })
      .populate('user', 'email')
      .sort({ createdAt: -1 });

    if (!ratingsAndReviews) {
      return res.status(404).json({ error: 'No ratings found for this card' });
    }

    res.status(200).json(ratingsAndReviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get ratings and reviews for a specific provider
const getProviderRatingsAndReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    const ratingsAndReviews = await RatingAndReview.find({
      provider: providerId,
    })
      .populate("user", "firstName lastName")
      .populate("provider", "firstName lastName")
      .sort({ createdAt: -1 });
    res.status(200).json(ratingsAndReviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a rating and review
const updateRatingAndReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const updatedRatingAndReview = await RatingAndReview.findByIdAndUpdate(
      id,
      { rating, review },
      { new: true }
    );
    if (!updatedRatingAndReview) {
      return res.status(404).json({ error: "Rating and review not found" });
    }
    res.status(200).json(updatedRatingAndReview);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a rating and review
const deleteRatingAndReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRatingAndReview = await RatingAndReview.findByIdAndDelete(id);
    if (!deletedRatingAndReview) {
      return res.status(404).json({ error: "Rating and review not found" });
    }
    res.status(200).json(deletedRatingAndReview);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get card rating statistics
const getCardRatingStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid card ID format' });
    }

    // Get all ratings for this card
    const ratings = await RatingAndReview.find({ card: id });

    if (!ratings || ratings.length === 0) {
      return res.status(404).json({ error: 'No ratings found for this card' });
    }

    // Calculate statistics
    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings;
    
    // Count ratings by star level
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    ratings.forEach(rating => {
      ratingDistribution[rating.rating]++;
    });

    res.status(200).json({
      totalRatings,
      averageRating,
      ratingDistribution
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createRatingAndReview,
  getAllRatingsAndReviews,
  getProviderRatingsAndReviews,
  updateRatingAndReview,
  deleteRatingAndReview,
  getCardRatingStats
};
