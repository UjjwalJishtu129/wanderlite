// ============================
// Wanderlite - Main App File
// ============================

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");

const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");

// ============================
// MongoDB Connection (using NON-SRV URL in .env)
// ============================

const dbUrl = (process.env.DB_URL || "").trim();
if (!dbUrl) {
  console.error("❌ DB Error: DB_URL missing in .env");
  process.exit(1);
}
if (dbUrl.startsWith("mongodb+srv://")) {
  console.error("❌ DB Error: Use NON-SRV mongodb:// URL in .env (we built this earlier).");
  process.exit(1);
}

mongoose
  .connect(dbUrl)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ DB Error:", err);
    process.exit(1);
  });

// ============================
// Express App Setup
// ============================

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());

// ============================
// Session Configuration
// ============================

const rawSecret =
  process.env.SESSION_SECRET ||
  process.env.SECRET ||
  "thisshouldbeabettersecret";
const sessionSecret = String(rawSecret);
const isProd = process.env.NODE_ENV === "production";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: sessionSecret },
  touchAfter: 24 * 3600,
});
store.on("error", (e) => console.log("❌ SESSION STORE ERROR", e));

const sessionConfig = {
  store,
  name: "wanderliteSession",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
if (isProd) app.set("trust proxy", 1);

// ============================
// Passport Auth
// ============================

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ============================
// Locals (globals for all views)
// ============================

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success = req.flash("success") || [];
  res.locals.error = req.flash("error") || [];
  res.locals.title = "Wanderlite";
  res.locals.mapToken = process.env.MAPBOX_TOKEN || "";
  next();
});

// ============================
// Routes
// ============================

const listingsRoutes = require("./routes/listings");
const reviewsRoutes = require("./routes/reviews");
const usersRoutes = require("./routes/users");

app.use("/", usersRoutes);
app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);

// Home
app.get("/", (req, res) => res.render("home", { title: "Home" }));

// 404 + Error handler
app.all("*", (req, res, next) => next(new ExpressError("Page Not Found", 404)));
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error", { err, title: "Error" });
});

// ============================
// Server Start
// ============================

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});



