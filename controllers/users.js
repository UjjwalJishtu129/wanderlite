// controllers/users.js
const User = require("../models/user");
const passport = require("passport");

module.exports.renderRegister = (req, res) => {
  // pass a sticky object so the view never breaks
  res.render("users/register", { title: "Register", sticky: {} });
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password, passwordConfirm } = req.body;

    // Server-side confirm check
    if (password !== passwordConfirm) {
      req.flash("error", "Passwords do not match.");
      return res.status(400).render("users/register", {
        title: "Register",
        sticky: { username, email }
      });
    }

    const user = new User({ username, email });
    const registeredUser = await User.register(user, password); // passport-local-mongoose

    // Auto-login then redirect to welcome page
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      return res.redirect("/welcome");
    });
  } catch (e) {
    // If we have posted values, keep them sticky; else pass empty object
    const { username = "", email = "" } = req.body || {};
    req.flash("error", e.message);
    return res.status(400).render("users/register", {
      title: "Register",
      sticky: { username, email }
    });
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login", { title: "Login" });
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = req.session.returnTo || "/listings";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "Logged out.");
    res.redirect("/listings");
  });
};

module.exports.welcome = (req, res) => {
  res.render("users/verify-success", { title: "Welcome" });
};



