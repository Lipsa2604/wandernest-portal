const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Place = require("../models/Place");

// Create a review for a booking
exports.createReview = async (req, res) => {
  try {
    const userData = req.user;
    const { bookingId, rating, categories, text, photos } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
        success: false,
      });
    }

    // Validate text
    if (!text || text.length < 10 || text.length > 2000) {
      return res.status(400).json({
        message: "Review text must be between 10 and 2000 characters",
        success: false,
      });
    }

    // Get booking
    const booking = await Booking.findById(bookingId).populate("user place");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
        success: false,
      });
    }

    // Check if user is part of this booking
    const isGuest = booking.user._id.toString() === userData.id;
    const isHost = booking.place.owner.toString() === userData.id;

    if (!isGuest && !isHost) {
      return res.status(403).json({
        message: "You are not authorized to review this booking",
        success: false,
      });
    }

    // Check if review already exists for this user and booking
    const existingReview = await Review.findOne({
      booking: bookingId,
      reviewer: userData.id,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this booking",
        success: false,
      });
    }

    // Determine reviewee (the other party)
    const reviewee = isGuest ? booking.place.owner : booking.user._id;

    // Create review (blind until both parties review)
    const review = await Review.create({
      booking: bookingId,
      place: booking.place._id,
      reviewer: userData.id,
      reviewee,
      rating,
      categories: categories || {},
      text,
      photos: photos || [],
      isBlind: true,
    });

    // Check if both parties have now reviewed
    const otherReview = await Review.findOne({
      booking: bookingId,
      reviewer: reviewee,
    });

    if (otherReview) {
      // Both have reviewed - make both visible
      review.isBlind = false;
      otherReview.isBlind = false;
      await review.save();
      await otherReview.save();
    }

    await review.populate("reviewer reviewee");

    res.status(201).json({
      message: "Review created successfully",
      success: true,
      review,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error creating review",
      error: err,
      success: false,
    });
  }
};

// Get reviews for a place
exports.getPlaceReviews = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { page = 1, limit = 10, showBlind = false } = req.query;

    const skip = (page - 1) * limit;

    // Build query - showBlind for development/testing only
    const query = {
      place: placeId,
      isVisible: true,
    };

    // In production, only show non-blind reviews
    // In development (showBlind=true), show all reviews
    if (showBlind !== 'true') {
      query.isBlind = false;
    }

    // Get visible reviews
    const reviews = await Review.find(query)
      .populate("reviewer", "name picture")
      .populate("reviewee", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get review statistics
    const allReviews = await Review.find(query);

    const stats = {
      totalReviews: allReviews.length,
      averageRating:
        allReviews.length > 0
          ? (
              allReviews.reduce((sum, r) => sum + r.rating, 0) /
              allReviews.length
            ).toFixed(1)
          : 0,
      ratingDistribution: {
        5: allReviews.filter((r) => r.rating === 5).length,
        4: allReviews.filter((r) => r.rating === 4).length,
        3: allReviews.filter((r) => r.rating === 3).length,
        2: allReviews.filter((r) => r.rating === 2).length,
        1: allReviews.filter((r) => r.rating === 1).length,
      },
    };

    res.status(200).json({
      success: true,
      reviews,
      stats,
      pagination: { page: parseInt(page), limit: parseInt(limit) },
      debug: {
        showBlind: showBlind === 'true',
        totalBlindReviews: (
          await Review.find({ place: placeId, isBlind: true })
        ).length,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error fetching reviews",
      error: err,
      success: false,
    });
  }
};

// Get review for a booking
exports.getBookingReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userData = req.user;

    const review = await Review.findOne({ booking: bookingId })
      .populate("reviewer reviewee")
      .populate({
        path: "booking",
        populate: { path: "user place" },
      });

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
        success: false,
      });
    }

    // Check authorization - can view if you're the reviewer or booking participant
    const isAuthorized =
      review.reviewer._id.toString() === userData.id ||
      review.reviewee._id.toString() === userData.id;

    if (!isAuthorized) {
      return res.status(403).json({
        message: "Unauthorized to view this review",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error fetching review",
      error: err,
      success: false,
    });
  }
};

// Update or edit a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userData = req.user;
    const { rating, categories, text, photos } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
        success: false,
      });
    }

    // Check if user is the reviewer
    if (review.reviewer.toString() !== userData.id) {
      return res.status(403).json({
        message: "You can only edit your own reviews",
        success: false,
      });
    }

    // Check if review is not blind (can't edit blind reviews)
    if (review.isBlind) {
      return res.status(400).json({
        message: "Cannot edit a review that is still blind",
        success: false,
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (categories) review.categories = categories;
    if (text) review.text = text;
    if (photos) review.photos = photos;

    await review.save();

    res.status(200).json({
      message: "Review updated successfully",
      success: true,
      review,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error updating review",
      error: err,
      success: false,
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userData = req.user;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
        success: false,
      });
    }

    // Check if user is the reviewer
    if (review.reviewer.toString() !== userData.id) {
      return res.status(403).json({
        message: "You can only delete your own reviews",
        success: false,
      });
    }

    await review.deleteOne();

    res.status(200).json({
      message: "Review deleted successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error deleting review",
      error: err,
      success: false,
    });
  }
};

// Mark review as helpful/unhelpful
exports.voteHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { voteType } = req.body; // "upvote" or "downvote"
    const userData = req.user;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
        success: false,
      });
    }

    // Check if user already voted
    const existingVote = review.helpfulVotes.voters.find(
      (v) => v.userId.toString() === userData.id
    );

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote
        if (voteType === "upvote") {
          review.helpfulVotes.upvotes--;
        } else {
          review.helpfulVotes.downvotes--;
        }
        review.helpfulVotes.voters = review.helpfulVotes.voters.filter(
          (v) => v.userId.toString() !== userData.id
        );
      } else {
        // Change vote
        if (existingVote.voteType === "upvote") {
          review.helpfulVotes.upvotes--;
          review.helpfulVotes.downvotes++;
        } else {
          review.helpfulVotes.downvotes--;
          review.helpfulVotes.upvotes++;
        }
        existingVote.voteType = voteType;
      }
    } else {
      // Add new vote
      if (voteType === "upvote") {
        review.helpfulVotes.upvotes++;
      } else {
        review.helpfulVotes.downvotes++;
      }
      review.helpfulVotes.voters.push({
        userId: userData.id,
        voteType,
      });
    }

    await review.save();

    res.status(200).json({
      message: "Vote recorded",
      success: true,
      review,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error voting on review",
      error: err,
      success: false,
    });
  }
};

// Report inappropriate review
exports.reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description } = req.body;
    const userData = req.user;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
        success: false,
      });
    }

    // Check if already reported by this user
    const alreadyReported = review.reports.some(
      (r) => r.reportedBy.toString() === userData.id
    );

    if (alreadyReported) {
      return res.status(400).json({
        message: "You have already reported this review",
        success: false,
      });
    }

    // Add report
    review.reports.push({
      reportedBy: userData.id,
      reason,
      description,
      reportedAt: new Date(),
      status: "pending",
    });

    // If multiple reports, flag as inappropriate
    if (review.reports.length >= 3) {
      review.flaggedAsInappropriate = true;
      review.isVisible = false;
    }

    await review.save();

    res.status(200).json({
      message: "Review reported successfully",
      success: true,
      review,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error reporting review",
      error: err,
      success: false,
    });
  }
};

// Get reviews pending from user for a booking
exports.getPendingReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userData = req.user;

    const booking = await Booking.findById(bookingId).populate("user place");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
        success: false,
      });
    }

    // Check if user is part of this booking
    const isGuest = booking.user._id.toString() === userData.id;
    const isHost = booking.place.owner.toString() === userData.id;

    if (!isGuest && !isHost) {
      return res.status(403).json({
        message: "Unauthorized",
        success: false,
      });
    }

    // Check if review already exists for this user
    const existingReview = await Review.findOne({
      booking: bookingId,
      reviewer: userData.id,
    });

    if (existingReview) {
      return res.status(200).json({
        success: true,
        reviewExists: true,
        review: existingReview,
      });
    }

    res.status(200).json({
      success: true,
      reviewExists: false,
      booking: {
        id: booking._id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        place: {
          title: booking.place.title,
          photos: booking.place.photos,
        },
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error checking pending review",
      error: err,
      success: false,
    });
  }
};
