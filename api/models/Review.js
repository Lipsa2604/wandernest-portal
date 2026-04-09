const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // One review per booking
    },
    place: {
      type: mongoose.Schema.ObjectId,
      ref: "Place",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    // Blind review flag - true until both guest and host have submitted reviews
    isBlind: {
      type: Boolean,
      default: true,
    },
    // Rating (1-5 stars)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // Review categories
    categories: {
      cleanliness: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      accuracy: { type: Number, min: 1, max: 5 },
      location: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
    },
    // Written review
    text: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
    },
    // Photos in review
    photos: [{
      type: String, // Cloudinary URLs
    }],
    // Helpful votes
    helpfulVotes: {
      upvotes: { type: Number, default: 0 },
      downvotes: { type: Number, default: 0 },
      voters: [
        {
          userId: mongoose.Schema.ObjectId,
          voteType: { type: String, enum: ["upvote", "downvote"] },
        },
      ],
    },
    // Reports for inappropriate content
    reports: [
      {
        reportedBy: mongoose.Schema.ObjectId,
        reason: String,
        description: String,
        reportedAt: Date,
        status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
      },
    ],
    // Visibility
    isVisible: {
      type: Boolean,
      default: true,
    },
    flaggedAsInappropriate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for querying reviews by place and reviewer
reviewSchema.index({ place: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, booking: 1 });
reviewSchema.index({ booking: 1 });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
