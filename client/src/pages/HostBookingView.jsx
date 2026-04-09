import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MessageCircle, AlertCircle } from 'lucide-react';

import AccountNav from '../components/ui/AccountNav';
import BookingDates from '../components/ui/BookingDates';
import PlaceGallery from '../components/ui/PlaceGallery';
import Spinner from '../components/ui/Spinner';
import ReviewForm from '../components/ui/ReviewForm';
import axiosInstance from '../utils/axios';

const HostBookingView = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState({});
  const [guestReview, setGuestReview] = useState(null);
  const [hostReviewStatus, setHostReviewStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/bookings/${id}`);
        setBooking(data.booking);
      } catch (error) {
        console.log('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  // Fetch guest's review
  useEffect(() => {
    const fetchGuestReview = async () => {
      if (!id) return;
      try {
        const { data } = await axiosInstance.get(`/reviews/booking/${id}`);
        setGuestReview(data.review);
      } catch (error) {
        console.log('Error fetching guest review:', error);
      }
    };
    fetchGuestReview();
  }, [id]);

  // Check host's review status
  useEffect(() => {
    const checkHostReview = async () => {
      if (!id) return;
      try {
        const { data } = await axiosInstance.get(`/reviews/booking/${id}/pending`);
        setHostReviewStatus(data);
      } catch (error) {
        console.log('Error checking host review:', error);
      }
    };
    checkHostReview();
  }, [id]);

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    // Refresh data
    const checkHostReview = async () => {
      try {
        const { data } = await axiosInstance.get(`/reviews/booking/${id}/pending`);
        setHostReviewStatus(data);
      } catch (error) {
        console.log('Error:', error);
      }
    };
    checkHostReview();
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <AccountNav />
      {booking?.place && booking?.user ? (
        <div className="space-y-8 p-4">
          {/* Header - Property Info */}
          <div>
            <h1 className="text-4xl font-bold">{booking?.place?.title}</h1>
            <p className="mt-2 text-lg text-gray-600">{booking?.place?.address}</p>
          </div>

          {/* Guest Info Card */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
              <MessageCircle className="h-6 w-6" />
              Guest Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <img
                  src={booking.user.picture || 'https://via.placeholder.com/60'}
                  alt={booking.user.name}
                  className="h-16 w-16 rounded-full"
                />
                <div>
                  <p className="text-xl font-semibold">{booking.user.name}</p>
                  <p className="text-gray-600">{booking.user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Booking Details</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-600">Check-in & Check-out</h3>
                <BookingDates booking={booking} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-600">Total Price</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">₹{booking?.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <PlaceGallery place={booking?.place} />

          {/* Guest's Review Section */}
          <div className="rounded-lg border border-gray-200 p-6">
            <h2 className="mb-6 text-2xl font-semibold">Guest's Review</h2>

            {guestReview ? (
              <div className="space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{guestReview.rating}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= guestReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {guestReview.isBlind && (
                    <span className="ml-auto text-xs rounded-full bg-blue-100 px-2 py-1 text-blue-700">
                      Pending Your Review
                    </span>
                  )}
                </div>

                {/* Category Ratings */}
                {guestReview.categoryRatings && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {Object.entries(guestReview.categoryRatings).map(([category, rating]) => (
                      <div key={category} className="text-sm">
                        <div className="flex items-center justify-between">
                          <span className="capitalize text-gray-700">{category}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Text */}
                {guestReview.text && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-gray-700">{guestReview.text}</p>
                  </div>
                )}

                {/* Photos */}
                {guestReview.photos && guestReview.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {guestReview.photos.slice(0, 3).map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Review ${idx + 1}`}
                        className="h-32 w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* Review Date */}
                <p className="text-xs text-gray-500">
                  {new Date(guestReview.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-100 p-4 text-center text-gray-600">
                <AlertCircle className="mx-auto mb-2 h-6 w-6" />
                <p>Guest has not left a review yet</p>
              </div>
            )}
          </div>

          {/* Host's Review Section */}
          <div className="rounded-lg border border-gray-200 p-6">
            <h2 className="mb-6 text-2xl font-semibold">Your Review of Guest</h2>

            {hostReviewStatus && hostReviewStatus.reviewExists ? (
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-semibold text-green-900">
                      You have reviewed this guest
                    </p>
                    <p className="text-sm text-green-800">
                      {new Date(hostReviewStatus.review?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!showReviewForm ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8">
                    <p className="mb-4 text-center text-gray-600">
                      Share your experience with this guest
                    </p>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-opacity-90"
                    >
                      Write a Review
                    </button>
                  </div>
                ) : (
                  <ReviewForm
                    bookingId={id}
                    revieweeId={booking.user._id}
                    revieweeType="guest"
                    placeTitle={`Review of ${booking.user.name}`}
                    onReviewSubmitted={handleReviewSubmitted}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 text-center">
          <h1 className="text-2xl font-semibold">Booking not found</h1>
        </div>
      )}
    </div>
  );
};

export default HostBookingView;
