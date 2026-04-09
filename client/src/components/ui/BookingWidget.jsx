import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';
import { toast } from 'react-toastify';

import { useAuth } from '../../../hooks';
import axiosInstance from '@/utils/axios';
import DatePickerWithRange from './DatePickerWithRange';
import MockPaymentModal from './MockPaymentModal';

const BookingWidget = ({ place }) => {
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [bookingData, setBookingData] = useState({
    noOfGuests: 1,
    name: '',
    phone: '',
  });
  const [redirect, setRedirect] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMockPayment, setShowMockPayment] = useState(false);
  const [currentOrderDetails, setCurrentOrderDetails] = useState(null);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const { user } = useAuth();

  const { noOfGuests, name, phone } = bookingData;
  const { _id: id, price } = place;

  useEffect(() => {
    if (user) {
      setBookingData({ ...bookingData, name: user.name });
    }
  }, [user]);

  const numberOfNights =
    dateRange.from && dateRange.to
      ? differenceInDays(
          new Date(dateRange.to).setHours(0, 0, 0, 0),
          new Date(dateRange.from).setHours(0, 0, 0, 0),
        )
      : 0;

  // handle booking form
  const handleBookingData = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBooking = async () => {
    // User must be signed in to book place
    if (!user) {
      return setRedirect(`/login`);
    }

    // BOOKING DATA VALIDATION
    if (numberOfNights < 1) {
      return toast.error('Please select valid dates');
    } else if (noOfGuests < 1) {
      return toast.error("No. of guests can't be less than 1");
    } else if (noOfGuests > place.maxGuests) {
      return toast.error(`Allowed max. no. of guests: ${place.maxGuests}`);
    } else if (name.trim() === '') {
      return toast.error("Name can't be empty");
    } else if (phone.trim() === '') {
      return toast.error("Phone can't be empty");
    }

    setIsProcessing(true);

    try {
      // Check availability before booking
      const availabilityCheck = await axiosInstance.get(
        '/bookings/check-availability',
        {
          params: {
            place: id,
            checkIn: dateRange.from,
            checkOut: dateRange.to,
          },
        },
      );

      if (!availabilityCheck.data.available) {
        setIsProcessing(false);
        return toast.error(
          'These dates are not available. Please select different dates.',
        );
      }

      // Create booking first
      const bookingResponse = await axiosInstance.post('/bookings', {
        checkIn: dateRange.from,
        checkOut: dateRange.to,
        noOfGuests,
        name,
        phone,
        place: id,
        price: numberOfNights * price * noOfGuests,
      });

      const bookingId = bookingResponse.data.booking._id;
      const totalPrice = numberOfNights * price * noOfGuests;

      // Create payment order with Razorpay
      const paymentOrderResponse = await axiosInstance.post(
        '/bookings/create-payment-order',
        { bookingId },
      );

      const { order } = paymentOrderResponse.data;

      // Show mock payment modal instead of Razorpay
      setCurrentOrderDetails(order);
      setCurrentBookingId(bookingId);
      setShowMockPayment(true);
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(
          'These dates are already booked. Please choose different dates.',
        );
      } else {
        toast.error('Something went wrong!');
      }
      console.log('Error: ', error);
      setIsProcessing(false);
    }
  };

  const handleMockPaymentSuccess = async (paymentData) => {
    try {
      // Verify payment on backend
      const verifyResponse = await axiosInstance.post('/bookings/verify-payment', {
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature,
        bookingId: currentBookingId,
      });

      if (verifyResponse.data.success) {
        setRedirect(`/account/bookings/${currentBookingId}`);
        toast.success('Payment successful! Enjoy your trip.');
      } else {
        toast.error('Payment verification failed');
      }
    } catch (error) {
      toast.error('Payment verification failed');
      console.log('Verification Error: ', error);
    } finally {
      setIsProcessing(false);
      setShowMockPayment(false);
    }
  };

  const handleMockPaymentClose = async () => {
    // Cancel the booking if payment is not completed
    if (currentBookingId) {
      try {
        await axiosInstance.delete(`/bookings/${currentBookingId}`);
        toast.info('Booking cancelled. Payment was not completed.');
      } catch (error) {
        console.log('Error cancelling booking:', error);
        toast.warn('Payment cancelled but could not delete pending booking. Please contact support.');
      }
    }
    setShowMockPayment(false);
    setIsProcessing(false);
    setCurrentBookingId(null);
    setCurrentOrderDetails(null);
  };

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-xl">
      <div className="text-center text-xl">
        Price: <span className="font-semibold">₹{place.price * noOfGuests}</span> / per night per {noOfGuests} {noOfGuests === 1 ? 'guest' : 'guests'}
      </div>
      <div className="mt-4 rounded-2xl border">
        <div className="flex w-full ">
          <DatePickerWithRange setDateRange={setDateRange} />
        </div>
        <div className="border-t px-4 py-3">
          <label>Number of guests: </label>
          <input
            type="number"
            name="noOfGuests"
            placeholder={`Max. guests: ${place.maxGuests}`}
            min={1}
            max={place.maxGuests}
            value={noOfGuests}
            onChange={handleBookingData}
          />
        </div>
        <div className="border-t px-4 py-3">
          <label>Your full name: </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={handleBookingData}
          />
          <label>Phone number: </label>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={handleBookingData}
          />
        </div>
      </div>
      <button 
        onClick={handleBooking} 
        className="primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Book this place'}
        {numberOfNights > 0 && !isProcessing && <span> ₹{numberOfNights * place.price * noOfGuests}</span>}
      </button>

      <MockPaymentModal
        isOpen={showMockPayment}
        orderDetails={currentOrderDetails}
        onPaymentSuccess={handleMockPaymentSuccess}
        onClose={handleMockPaymentClose}
      />
    </div>
  );
};

export default BookingWidget;
