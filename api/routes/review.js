const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/user');

const {
  createReview,
  getPlaceReviews,
  getBookingReview,
  updateReview,
  deleteReview,
  voteHelpful,
  reportReview,
  getPendingReview,
} = require('../controllers/reviewController');

// Public routes
router.get('/place/:placeId', getPlaceReviews); // Get all reviews for a place
router.get('/booking/:bookingId/pending', isLoggedIn, getPendingReview); // Check if review is pending

// Protected routes (user must be logged in)
router.post('/', isLoggedIn, createReview); // Create a review
router.get('/booking/:bookingId', isLoggedIn, getBookingReview); // Get review for a booking
router.put('/:reviewId', isLoggedIn, updateReview); // Update a review
router.delete('/:reviewId', isLoggedIn, deleteReview); // Delete a review
router.post('/:reviewId/vote', isLoggedIn, voteHelpful); // Vote helpful/unhelpful
router.post('/:reviewId/report', isLoggedIn, reportReview); // Report inappropriate review

module.exports = router;
