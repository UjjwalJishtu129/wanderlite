// routes/users.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const users = require("../controllers/users");
const catchAsync = require("../utils/catchAsync");

// Register
router.route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

// Login
router.route("/login")
  .get(users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login"
    }),
    users.login
  );

// Logout
router.get("/logout", users.logout);

// Welcome (post-registration success page)
router.get("/welcome", users.welcome);

module.exports = router;


