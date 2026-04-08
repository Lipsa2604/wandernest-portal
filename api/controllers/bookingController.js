const Booking = require("../models/Booking");

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
