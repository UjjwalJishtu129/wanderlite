// models/review.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    rating: { type: Number, required: true, min: 1, max: 5 }, // enforce 1..5
    body:   { type: String, required: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);

