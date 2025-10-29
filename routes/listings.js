// routes/listings.js
const express = require("express");
const router = express.Router();
const multer = require("multer");

const listings = require("../controllers/listings");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const { storage } = require("../utils/cloudinary");

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpeg|jpg|png|webp)$/i.test(file.mimetype);
    if (!ok) return cb(new Error("Only JPG, PNG or WEBP images allowed"));
    cb(null, true);
  }
});

// Index + Create
router.route("/")
  .get(catchAsync(listings.index))
  .post(isLoggedIn, upload.array("images", 8), validateListing, catchAsync(listings.create));

// New
router.get("/new", isLoggedIn, listings.renderNew);

// Show + Update + Delete
router.route("/:id")
  .get(catchAsync(listings.show))
  .put(isLoggedIn, isOwner, upload.array("images", 8), validateListing, catchAsync(listings.update))
  .delete(isLoggedIn, isOwner, catchAsync(listings.delete));

// Edit
router.get("/:id/edit", isLoggedIn, isOwner, catchAsync(listings.renderEdit));

module.exports = router;





