const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/user");

const {
  createBookings,
  getBookings,
  getHostBookings,
  getBookingById,
  cancelBooking,
  checkAvailability,
  getBookedDates,
  createPaymentOrder,
  verifyPayment,
} = require('../controllers/bookingController');

// Public routes (no login required)
router.get('/check-availability', checkAvailability);
router.get('/booked-dates/:place', getBookedDates);

// Payment routes (protected - user must be logged in)
router.post('/create-payment-order', isLoggedIn, createPaymentOrder);
router.post('/verify-payment', isLoggedIn, verifyPayment);

// Protected routes (user must be logged in)
router.route("/").get(isLoggedIn, getBookings).post(isLoggedIn, createBookings);
router.get("/host/listings", isLoggedIn, getHostBookings);
router.get("/:bookingId", isLoggedIn, getBookingById);
router.delete("/:bookingId", isLoggedIn, cancelBooking);

module.exports = router;
