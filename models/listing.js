// models/listing.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String
});

ImageSchema.virtual("thumb").get(function () {
  if (!this.url) return "";
  return this.url.replace("/upload/", "/upload/w_400,c_fill,q_auto,f_auto/");
});

const ListingSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, min: 0, required: true },
  location: { type: String, required: true },
  description: String,

  // Multi-image gallery
  images: [ImageSchema],

  // Legacy single image (kept for backward compatibility)
  image: { url: String, filename: String },

  owner: { type: Schema.Types.ObjectId, ref: "User" },
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],

  // Rating summary (maintained when reviews change)
  avgRating: { type: Number, default: 0 },      // 0..5
  ratingsCount: { type: Number, default: 0 },

  // Mapbox GeoJSON
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: undefined
    }
  }
}, { timestamps: true });

ListingSchema.index({ geometry: "2dsphere" });
ListingSchema.index({ title: "text", location: "text" });

ListingSchema.set("toObject", { virtuals: true });
ListingSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Listing", ListingSchema);



