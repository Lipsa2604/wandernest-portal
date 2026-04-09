const Booking = require("../models/Booking");
const crypto = require("crypto");

// MOCK RAZORPAY - For testing only (not real payment gateway)
// Generate mock order ID
const generateMockOrderId = () => {
  return `order_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate mock payment ID
const generateMockPaymentId = () => {
  return `pay_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create Mock Payment Order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userData = req.user;

    // Get existing booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
        success: false,
      });
    }

    if (booking.user.toString() !== userData.id.toString()) {
      return res.status(403).json({
        message: "Unauthorized to pay for this booking",
        success: false,
      });
    }

    // Generate mock order
    const mockOrderId = generateMockOrderId();
    const amount = Math.round(booking.price * 100); // Amount in paise

    // Save order ID to booking
    booking.razorpayOrderId = mockOrderId;
    await booking.save();

    console.log(
      "[MOCK PAYMENT] Order created:",
      mockOrderId,
      "Amount:",
      amount / 100,
      "INR"
    );

    res.status(200).json({
      success: true,
      order: {
        id: mockOrderId,
        amount: amount,
        currency: "INR",
      },
      keyId: "rzp_test_mock_key",
      mock: true,
      message: "[MOCK MODE] Use any card details to test payment",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error creating payment order",
      error: err,
      success: false,
    });
  }
};

// Verify Mock Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } =
      req.body;
    const userData = req.user;

    // For mock payment, always verify successfully (90% success rate for demo)
    const shouldSucceed = Math.random() > 0.1; // 90% success

    if (shouldSucceed) {
      // Payment verified successfully (mock)
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({
          message: "Booking not found",
          success: false,
        });
      }

      if (booking.user.toString() !== userData.id.toString()) {
        return res.status(403).json({
          message: "Unauthorized to verify this payment",
          success: false,
        });
      }

      // Update booking with payment details
      booking.paymentStatus = "completed";
      booking.razorpayPaymentId = razorpay_payment_id;
      booking.razorpaySignature = razorpay_signature;
      await booking.save();

      console.log(
        "[MOCK PAYMENT] Payment verified successfully:",
        razorpay_payment_id
      );

      res.status(200).json({
        message: "Payment verified successfully",
        success: true,
        booking,
        mock: true,
      });
    } else {
      // Simulate payment failure (10% chance)
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.paymentStatus = "failed";
        await booking.save();
      }

      console.log("[MOCK PAYMENT] Payment verification failed (simulated)");

      res.status(400).json({
        message: "Payment verification failed",
        success: false,
        mock: true,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error verifying payment",
      error: err,
      success: false,
    });
  }
};

// Check if dates are available for a place
exports.checkAvailability = async (req, res) => {
  try {
    const { place, checkIn, checkOut } = req.query;

    console.log("Checking availability for:", { place, checkIn, checkOut });

    if (!place || !checkIn || !checkOut) {
      return res.status(400).json({
        message: "Missing required fields: place, checkIn, checkOut",
        available: false,
      });
    }

    // Check for overlapping bookings
    // A booking overlaps if:
    // - New checkIn < existing checkOut AND
    // - New checkOut > existing checkIn
    const overlappingBooking = await Booking.findOne({
      place,
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) },
    });

    const available = !overlappingBooking;

    res.status(200).json({
      available,
      message: available ? "Dates are available" : "Dates are not available",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
      error: err,
    });
  }
};

// Get booked dates for a place (useful for calendar display)
exports.getBookedDates = async (req, res) => {
  try {
    const { place } = req.params;

    if (!place) {
      return res.status(400).json({
        message: "Place ID is required",
        bookedDates: [],
      });
    }

    const bookings = await Booking.find({ place }).select("checkIn checkOut");

    const bookedDates = bookings.map((booking) => ({
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
    }));

    res.status(200).json({
      bookedDates,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
      error: err,
    });
  }
};

// Books a place
exports.createBookings = async (req, res) => {
  try {
    const userData = req.user;
    const { place, checkIn, checkOut, numOfGuests, name, phone, price } =
      req.body;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date",
        success: false,
      });
    }

    // Check for overlapping bookings (Double Booking Prevention)
    const overlappingBooking = await Booking.findOne({
      place,
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (overlappingBooking) {
      return res.status(409).json({
        message:
          "This place is already booked for the selected dates. Please choose different dates.",
        success: false,
      });
    }

    const booking = await Booking.create({
      user: userData.id,
      place,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numOfGuests,
      name,
      phone,
      price,
    });

    res.status(201).json({
      booking,
      success: true,
      message: "Booking created successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
      error: err,
      success: false,
    });
  }
};

// Returns user specific bookings
exports.getBookings = async (req, res) => {
  try {
    const userData = req.user;
    if (!userData) {
      return res
        .status(401)
        .json({ error: "You are not authorized to access this page!" });
    }

    const booking = await Booking.find({ user: userData.id })
      .populate("place")
      .sort({ createdAt: -1 });

    res.status(200).json({ booking, success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
      error: err,
      success: false,
    });
  }
};

// Get bookings for host's properties
exports.getHostBookings = async (req, res) => {
  try {
    const userData = req.user;
    if (!userData) {
      return res
        .status(401)
        .json({ error: "You are not authorized to access this page!" });
    }

    // Find all places owned by this user
    const Place = require("../models/Place");
    const userPlaces = await Place.find({ owner: userData.id }).select("_id");
    const placeIds = userPlaces.map(place => place._id);

    // Find all bookings for those places
    const booking = await Booking.find({ place: { $in: placeIds } })
      .populate("place")
      .populate("user", "name email picture")
      .sort({ createdAt: -1 });

    res.status(200).json({ booking, success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
      error: err,
      success: false,
    });
  }
};

// Get single booking by ID (for guest or host viewing)
exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userData = req.user;

    if (!userData) {
      return res
        .status(401)
        .json({ error: "You are not authorized to access this page!" });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate("place")
      .populate("user", "name email picture");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
        success: false,
      });
    }

    // Check if user is the guest (who made the booking)
    const isGuest = booking.user._id.toString() === userData.id.toString();

    // Check if user is the host (owner of the property)
    const isHost = booking.place.owner.toString() === userData.id.toString();

    if (!isGuest && !isHost) {
      return res.status(403).json({
        message: "You are not authorized to view this booking",
        success: false,
      });
    }

    res.status(200).json({
      booking,
      userRole: isGuest ? "guest" : "host",
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
      error: err,
      success: false,
    });
  }
};

// Cancel pending booking (used when payment is cancelled)
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userData = req.user;

    if (!userData) {
      return res
        .status(401)
        .json({ error: "You are not authorized to access this page!" });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
        success: false,
      });
    }

    // Check if user is the one who made the booking
    if (booking.user.toString() !== userData.id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to cancel this booking",
        success: false,
      });
    }

    // Only allow cancellation if payment is not completed
    if (booking.paymentStatus === 'completed' || booking.paymentStatus === 'verified') {
      return res.status(400).json({
        message: "Cannot cancel a confirmed booking",
        success: false,
      });
    }

    // Delete the booking
    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({
      message: "Booking cancelled successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
      error: err,
      success: false,
    });
  }
};
