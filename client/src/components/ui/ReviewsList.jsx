import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axios';
import ReportReviewModal from './ReportReviewModal';

const ReviewsList = ({ placeId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingReviewId, setReportingReviewId] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [placeId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/reviews/place/${placeId}`, {
        params: { page, limit: 5 },
      });
      setReviews(response.data.reviews);
      setStats(response.data.stats);
    } catch (error) {
      console.log(error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reviewId, voteType) => {
    try {
      const response = await axiosInstance.post(`/reviews/${reviewId}/vote`, {
        voteType,
      });

      setReviews(
        reviews.map((r) =>
          r._id === reviewId
            ? {
                ...r,
                helpfulVotes: response.data.review.helpfulVotes,
              }
            : r
        )
      );

      setUserVotes({
        ...userVotes,
        [reviewId]: voteType,
      });
    } catch (error) {
      toast.error('Unable to vote');
      console.log(error);
    }
  };

  const handleReport = (reviewId) => {
    setReportingReviewId(reviewId);
    setReportModalOpen(true);
  };

  const RatingBar = ({ label, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-600">{count}</span>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      {stats && stats.totalReviews > 0 && (
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 text-xl font-bold">Guest Reviews</h3>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Average Rating */}
            <div>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{stats.averageRating}</div>
                <div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(stats.averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Based on {stats.totalReviews} reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <RatingBar
                  key={rating}
                  label={`${rating} star`}
                  count={stats.ratingDistribution[rating]}
                  total={stats.totalReviews}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">
              No published reviews yet. Reviews become public once both guest and host have completed their feedback.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-lg border border-gray-200 p-4"
            >
              {/* Review Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      review.reviewer.picture ||
                      'https://via.placeholder.com/48'
                    }
                    alt={review.reviewer.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{review.reviewer.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {review.isBlind && (
                    <span className="text-xs rounded-full bg-blue-100 px-2 py-1 text-blue-700">
                      Blind Review
                    </span>
                  )}
                </div>
              </div>

              {/* Review Text */}
              <p className="mb-3 text-gray-700">{review.text}</p>

              {/* Photos */}
              {review.photos.length > 0 && (
                <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {review.photos.slice(0, 3).map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Review photo ${idx + 1}`}
                      className="h-20 w-full rounded object-cover"
                    />
                  ))}
                  {review.photos.length > 3 && (
                    <div className="flex h-20 items-center justify-center rounded bg-gray-100">
                      <span className="text-sm font-semibold text-gray-600">
                        +{review.photos.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Category Ratings */}
              {review.categories && Object.keys(review.categories).length > 0 && (
                <div className="mb-3 grid grid-cols-2 gap-2 rounded p-2 text-xs sm:grid-cols-5">
                  {Object.entries(review.categories).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-gray-600 capitalize">{key}</p>
                      <p className="font-semibold">{value}/5</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful Votes & Report */}
              <div className="flex items-center gap-4 border-t pt-3 text-sm">
                <button
                  onClick={() => handleVote(review._id, 'upvote')}
                  className={`flex items-center gap-1 ${
                    userVotes[review._id] === 'upvote'
                      ? 'text-green-600'
                      : 'text-gray-500 hover:text-green-600'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{review.helpfulVotes.upvotes}</span>
                </button>
                <button
                  onClick={() => handleVote(review._id, 'downvote')}
                  className={`flex items-center gap-1 ${
                    userVotes[review._id] === 'downvote'
                      ? 'text-red-600'
                      : 'text-gray-500 hover:text-red-600'
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>{review.helpfulVotes.downvotes}</span>
                </button>
                <button
                  onClick={() => handleReport(review._id)}
                  className="ml-auto flex items-center gap-1 text-gray-500 hover:text-red-600"
                >
                  <Flag className="h-4 w-4" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {stats && stats.totalReviews > 5 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="rounded border px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">{page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={reviews.length < 5}
            className="rounded border px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Report Review Modal */}
      <ReportReviewModal
        isOpen={reportModalOpen}
        reviewId={reportingReviewId}
        onClose={() => {
          setReportModalOpen(false);
          setReportingReviewId(null);
        }}
      />
    </div>
  );
};

export default ReviewsList;
