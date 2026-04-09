import { useState } from 'react';
import { Star, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axios';

const ReviewForm = ({ bookingId, placeTitle, onReviewSubmitted, revieweeType = 'place', revieweeId }) => {
  const [step, setStep] = useState(1); // 1: overall rating, 2: categories, 3: text & photos
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  // Define categories based on reviewee type
  const getCategoryLabels = () => {
    if (revieweeType === 'guest') {
      return {
        cleanliness: 'How clean did they keep the place?',
        communication: 'Communication',
        respect: 'Respect for Property',
        reliability: 'Reliability',
        experience: 'Overall Experience',
      };
    }
    return {
      cleanliness: 'Cleanliness',
      communication: 'Communication',
      accuracy: 'Accuracy',
      location: 'Location',
      value: 'Value for Money',
    };
  };

  const categoryLabels = getCategoryLabels();
  const defaultCategories = Object.keys(categoryLabels).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

  const [categories, setCategories] = useState(defaultCategories);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategoryRating = (category, rating) => {
    setCategories({
      ...categories,
      [category]: rating,
    });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + photos.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('photos', file));

      const response = await axiosInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPhotos([...photos, ...response.data]);
      toast.success('Photos uploaded');
    } catch (error) {
      toast.error('Failed to upload photos');
      console.log(error);
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!overallRating) {
      toast.error('Please select an overall rating');
      return;
    }

    if (reviewText.length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        bookingId,
        rating: overallRating,
        categories,
        text: reviewText,
        photos,
      };

      // Add reviewee info if reviewing a guest
      if (revieweeType === 'guest' && revieweeId) {
        payload.revieweeId = revieweeId;
        payload.revieweeType = 'guest';
      }

      const response = await axiosInstance.post('/reviews', payload);

      toast.success('Review submitted successfully!');
      setStep(1);
      setOverallRating(0);
      setCategories(defaultCategories);
      setReviewText('');
      setPhotos([]);

      if (onReviewSubmitted) {
        onReviewSubmitted(response.data.review);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRate, onHover, onHoverLeave }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onHoverLeave}
          onClick={() => onRate(star)}
          className="bg-transparent transition focus:outline-none"
        >
          <Star
            className={`h-10 w-10 ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-xl font-bold">
        {revieweeType === 'guest' 
          ? 'Review This Guest' 
          : 'Share Your Experience'}
      </h3>

      {/* Step 1: Overall Rating */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-gray-600">
            {revieweeType === 'guest' 
              ? 'How would you rate your experience with this guest?' 
              : `How would you rate ${placeTitle}?`}
          </p>
          <StarRating
            rating={overallRating}
            onRate={setOverallRating}
            onHover={setHoverRating}
            onHoverLeave={() => setHoverRating(0)}
          />
          <button
            onClick={() => setStep(2)}
            disabled={!overallRating}
            className="mt-4 w-full rounded bg-primary px-4 py-2 text-white hover:bg-red-500 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Category Ratings */}
      {step === 2 && (
        <div className="space-y-6">
          <p className="text-gray-600">
            {revieweeType === 'guest' 
              ? 'Tell us more about your experience' 
              : 'Rate specific aspects:'}
          </p>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700">{label}</label>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleCategoryRating(key, star)}
                    className="bg-transparent transition"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= categories[key]
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 rounded border border-primary px-4 py-2 text-primary hover:bg-red-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 rounded bg-primary px-4 py-2 text-white hover:bg-red-500"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Text & Photos */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Your Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience... (minimum 10 characters)"
              className="mt-2 h-32 w-full rounded border border-gray-300 p-3 focus:border-primary focus:outline-none"
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {reviewText.length}/2000 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Add Photos (Optional)
            </label>
            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded border-2 border-dashed border-gray-300 p-4 hover:border-primary">
              <Upload className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">Click to upload photos</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={photo}
                      alt={`Review photo ${idx + 1}`}
                      className="h-20 w-full rounded object-cover"
                    />
                    <button
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 rounded border border-primary px-4 py-2 text-primary hover:bg-red-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || reviewText.length < 10}
              className="flex-1 rounded bg-primary px-4 py-2 text-white hover:bg-red-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;
