// controllers/reviews.js
const Listing = require("../models/listing");
const Review  = require("../models/review");

module.exports.create = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  const review = new Review(req.body.review);
  review.author = req.user._id;

  listing.reviews.push(review);
  await review.save();
  await listing.save();

  req.flash("success", "Review added!");
  res.redirect(`/listings/${id}`);
};

module.exports.delete = async (req, res) => {
  const { id, reviewId } = req.params;

  // remove ref from listing + delete review doc
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted.");
  res.redirect(`/listings/${id}`);
};



