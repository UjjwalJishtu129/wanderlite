// controllers/listings.js
const Listing = require("../models/listing");
const { cloudinary } = require("../utils/cloudinary");
const { forwardGeocode } = require("../utils/geocode");

const toImgDoc = (file) => {
  if (!file) return null;
  return { url: file.path || file.secure_url, filename: file.filename };
};

exports.index = async (req, res) => {
  const q    = (req.query.q || "").trim();
  const minQ = req.query.min;
  const maxQ = req.query.max;
  const min  = (minQ === "" || minQ === undefined) ? undefined : Number(minQ);
  const max  = (maxQ === "" || maxQ === undefined) ? undefined : Number(maxQ);
  const sort = req.query.sort || "newest";

  const filter = {};
  if (q) filter.$text = { $search: q };

  if (min !== undefined || max !== undefined) {
    const price = {};
    if (typeof min === "number" && !Number.isNaN(min)) price.$gte = min;
    if (typeof max === "number" && !Number.isNaN(max)) price.$lte = max;
    if (Object.keys(price).length) filter.price = price;
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };

  const listings = await Listing.find(filter).sort(sortMap[sort] || sortMap.newest);
  res.render("listings/index", {
    title: q ? `Results for “${q}”` : "All Listings",
    listings, q,
    min: (typeof min === "number" && !Number.isNaN(min)) ? min : "",
    max: (typeof max === "number" && !Number.isNaN(max)) ? max : "",
    sort
  });
};

exports.renderNew = (req, res) => {
  res.render("listings/new", { title: "New Listing" });
};

exports.create = async (req, res) => {
  const listing = new Listing(req.body.listing);
  listing.owner = req.user._id;

  // Auto-geo from location
  if (listing.location) {
    const geom = await forwardGeocode(listing.location);
    if (geom) listing.geometry = geom;
  }

  // images from multer
  listing.images = (req.files || []).map(toImgDoc).filter(Boolean);

  await listing.save();
  req.flash("success", "Listing created!");
  res.redirect(`/listings/${listing._id}`);
};

exports.show = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }
  const gallery = Array.isArray(listing.images) ? listing.images : [];
  const isOwner = req.user && listing.owner && listing.owner.equals?.(req.user._id);
  const reviews = (listing.reviews || []).map((r) => {
    const canDelete = req.user && (isOwner || r.author?.equals?.(req.user._id));
    return { ...r.toObject(), canDelete: !!canDelete };
  });

  res.render("listings/show", {
    title: listing.title,
    listing,
    gallery,
    isOwner,
    reviews,
    geometry: listing.geometry,
    locText: listing.location || "",
    titleTxt: listing.title || ""
  });
};

exports.renderEdit = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }
  const gallery = Array.isArray(listing.images) ? listing.images : [];
  res.render("listings/edit", { title: `Edit: ${listing.title}`, listing, gallery });
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  // basic fields
  const prevLocation = listing.location;
  listing.title = req.body.listing.title;
  listing.price = req.body.listing.price;
  listing.location = req.body.listing.location;
  listing.description = req.body.listing.description;

  // If location changed, re-geocode
  if (listing.location && listing.location !== prevLocation) {
    const geom = await forwardGeocode(listing.location);
    listing.geometry = geom || undefined;
  }

  // add newly uploaded images
  const newImgs = (req.files || []).map(toImgDoc).filter(Boolean);
  listing.images = Array.isArray(listing.images) ? listing.images : [];
  listing.images.push(...newImgs);

  // delete selected images
  const toDelete = req.body.deleteImages
    ? (Array.isArray(req.body.deleteImages) ? req.body.deleteImages : [req.body.deleteImages])
    : [];
  if (toDelete.length) {
    for (const filename of toDelete) {
      try { await cloudinary.uploader.destroy(filename); } catch {}
    }
    listing.images = listing.images.filter((img) => !toDelete.includes(img.filename));
  }

  await listing.save();
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndDelete(id);
  if (listing) {
    const files = (listing.images || []).map((i) => i.filename);
    for (const f of files) {
      try { await cloudinary.uploader.destroy(f); } catch {}
    }
  }
  req.flash("success", "Listing deleted.");
  res.redirect("/listings");
};










