// schemas.js
const Joi = require("joi");

const listingInner = Joi.object({
  title: Joi.string().min(2).max(140).required(),
  price: Joi.number().min(0).required(),
  location: Joi.string().min(2).max(140).required(),
  description: Joi.string().allow("").max(2000),
  geometry: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2)
  }).optional()
}).required();

module.exports.listingSchema = Joi.object({
  listing: listingInner,
  // allowing deleteImages to come from edit form (checkboxes)
  deleteImages: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    body: Joi.string().min(1).max(1000).required()
  }).required()
});

