import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import AccountNav from '../components/ui/AccountNav';
import AddressLink from '../components/ui/AddressLink';
import BookingDates from '../components/ui/BookingDates';
import PlaceGallery from '../components/ui/PlaceGallery';
import Spinner from '../components/ui/Spinner';
import ReviewForm from '../components/ui/ReviewForm';
import BlindReviewCard from '../components/ui/BlindReviewCard';
import HostBookingView from './HostBookingView';
import axiosInstance from '../utils/axios';

const SingleBookedPlace = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const getBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/bookings/${id}`);
      setBooking(data.booking);
      setUserRole(data.userRole);
    } catch (error) {
      console.log('Error: ', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPendingReview = async () => {
    if (!id) return;
    try {
      setReviewLoading(true);
      const { data } = await axiosInstance.get(
        `/reviews/booking/${id}/pending`
      );
      setReviewStatus(data);
    } catch (error) {
      console.log('Error checking review status:', error);
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    getBookings();
    checkPendingReview();
  }, [id]);

  if (loading) {
    return <Spinner />;
  }

  // If user is a host, show the host view
  if (userRole === 'host') {
    return <HostBookingView />;
  }

  return (
    <div>
      <AccountNav />
      {booking?.place ? (
        <div className="p-4">
          <h1 className="text-3xl">{booking?.place?.title}</h1>

          <AddressLink
            className="my-2 block"
            placeAddress={booking.place?.address}
          />
          <div className="my-6 flex flex-col items-center justify-between rounded-2xl bg-gray-200 p-6 sm:flex-row">
            <div className=" ">
              <h2 className="mb-4 text-2xl md:text-2xl">
                Your booking information
              </h2>
              <BookingDates booking={booking} />
            </div>
            <div className="mt-5 w-full rounded-2xl bg-primary p-6 text-white sm:mt-0 sm:w-auto">
              <div className="hidden md:block">Total price</div>
              <div className="flex justify-center text-3xl">
                <span>₹{booking?.price}</span>
              </div>
            </div>
          </div>
          <PlaceGallery place={booking?.place} />

          {/* Review Section */}
          {reviewStatus && !reviewLoading && (
            <div className="my-8 space-y-6">
              <BlindReviewCard
                bookingId={id}
                isBlind={!reviewStatus.reviewExists || reviewStatus.review?.isBlind}
                reviewExists={reviewStatus.reviewExists}
                onReviewClick={() => setShowReviewForm(true)}
              />

              {showReviewForm && (
                <ReviewForm
                  bookingId={id}
                  placeTitle={booking?.place?.title}
                  onReviewSubmitted={(review) => {
                    setShowReviewForm(false);
                    checkPendingReview();
                  }}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <h1> No data</h1>
      )}
    </div>
  );
};

export default SingleBookedPlace;
