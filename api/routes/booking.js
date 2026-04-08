const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/user");

const {
  createBookings,
  getBookings,
  checkAvailability,
  getBookedDates,
} = require("../controllers/bookingController");

// Public routes (no login required)
router.get("/check-availability", checkAvailability);
router.get("/booked-dates/:place", getBookedDates);

// Protected routes (user must be logged in)
router.route("/").get(isLoggedIn, getBookings).post(isLoggedIn, createBookings);

module.exports = router;
