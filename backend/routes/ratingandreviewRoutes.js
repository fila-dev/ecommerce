const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

const {
  getAllRatingsAndReviews,
  getProviderRatingsAndReviews,
  updateRatingAndReview,
  deleteRatingAndReview,
  createRatingAndReview,  

  getCardRatingStats,
} = require("../controllers/ratingandreviewController");

// Add authentication middleware to all routes
router.use(requireAuth);

// Routes for ratings and reviews
router.get("/:id", getAllRatingsAndReviews);
router.get("/provider/:providerId", getProviderRatingsAndReviews);
router.post("/:id", createRatingAndReview); // Simplified route
router.patch("/:id", updateRatingAndReview);
router.delete("/:id", deleteRatingAndReview);
router.get("/stats/:id", getCardRatingStats);


// Get rating statistics


module.exports = router;
