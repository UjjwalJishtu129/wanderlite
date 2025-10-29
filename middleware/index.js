// middleware/index.js
const { listingSchema, reviewSchema } = require("../schemas");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    req.flash("error", "You must be logged in.");
    return res.redirect("/login");
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing || !req.user || !listing.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission.");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId, id } = req.params;
  const review = await Review.findById(reviewId);
  if (!review || !req.user || !review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission.");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body, {
    allowUnknown: true,
    abortEarly: false,
  });
  if (error) {
    const msg = error.details.map((e) => e.message).join(", ");
    throw new ExpressError(msg, 400);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body, {
    allowUnknown: true,
    abortEarly: false,
  });
  if (error) {
    const msg = error.details.map((e) => e.message).join(", ");
    throw new ExpressError(msg, 400);
  }
  next();
};





