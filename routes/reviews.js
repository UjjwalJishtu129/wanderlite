// routes/reviews.js
const express = require("express");
const router = express.Router({ mergeParams: true }); // <-- needed to see :id from parent
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");

// Create a review
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.create));

// Delete a review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.delete));

module.exports = router;



