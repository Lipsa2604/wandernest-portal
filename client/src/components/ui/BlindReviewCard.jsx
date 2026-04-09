import { Eye, EyeOff } from 'lucide-react';

const BlindReviewCard = ({ bookingId, isBlind, reviewExists, onReviewClick }) => {
  return (
    <div
      className={`rounded-lg border-2 p-4 ${
        isBlind
          ? 'border-blue-300 bg-blue-50'
          : 'border-green-300 bg-green-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isBlind ? (
            <>
              <div className="mb-2 flex items-center gap-2">
                <EyeOff className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Blind Review Pending</h3>
              </div>
              <p className="text-sm text-blue-800">
                Your review is hidden until the host completes their review. This ensures unbiased
                feedback from both parties.
              </p>
            </>
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Review Visible</h3>
              </div>
              <p className="text-sm text-green-800">
                Both reviews have been submitted. Your review is now visible to other guests.
              </p>
            </>
          )}
        </div>
        {!reviewExists && (
          <button
            onClick={() => onReviewClick(bookingId)}
            className="ml-4 rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            Leave Review
          </button>
        )}
      </div>
    </div>
  );
};

export default BlindReviewCard;
