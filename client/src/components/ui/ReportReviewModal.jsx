import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axios';

const ReportReviewModal = ({ isOpen, reviewId, onClose }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    { id: '1', label: 'Inappropriate content', description: 'Contains offensive or harmful content' },
    { id: '2', label: 'Spam', description: 'Not a genuine review' },
    { id: '3', label: 'Offensive language', description: 'Contains abusive or hate speech' },
    { id: '4', label: 'Other', description: 'Something else' },
  ];

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason');
      return;
    }

    setIsSubmitting(true);

    try {
      await axiosInstance.post(`/reviews/${reviewId}/report`, {
        reason: selectedReason,
        description: description || 'User reported review',
      });

      toast.success('Review reported. Our team will review it shortly.');
      // Reset form
      setSelectedReason('');
      setDescription('');
      onClose();
    } catch (error) {
      toast.error('Failed to report review');
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-xs rounded-lg bg-white p-5 shadow-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <h2 className="mb-1 pr-8 text-lg font-bold text-gray-900">Report Review</h2>
        <p className="mb-4 text-xs text-gray-600">
          Help us maintain quality by reporting inappropriate reviews
        </p>

        {/* Reason Selection */}
        <div className="mb-4 space-y-2">
          <label className="block text-xs font-semibold text-gray-700">
            Reason for reporting
          </label>
          {reasons.map((reason) => (
            <div
              key={reason.id}
              onClick={() => setSelectedReason(reason.id)}
              className={`cursor-pointer rounded border p-2 transition ${
                selectedReason === reason.id
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border transition ${
                    selectedReason === reason.id
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}
                />
                <div>
                  <p className="text-xs font-medium text-gray-900">{reason.label}</p>
                  <p className="text-xs text-gray-500">{reason.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Additional details (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more context..."
            className="w-full rounded border border-gray-300 p-2 text-xs focus:border-primary focus:outline-none"
            rows="2"
            maxLength={300}
          />
          <p className="mt-0.5 text-xs text-gray-500">{description.length}/300 characters</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded border border-gray-300 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className="flex-1 rounded bg-primary py-1.5 text-xs font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportReviewModal;
