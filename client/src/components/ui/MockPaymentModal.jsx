import { useState } from 'react';
import { X, Check } from 'lucide-react';

const MockPaymentModal = ({ isOpen, orderDetails, onPaymentSuccess, onClose }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit / Debit Card',
      icon: '💳',
      description: '4111 1111 1111 1111',
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: '📱',
      description: 'Pay using any UPI app',
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      icon: '📲',
      description: 'Fast & secure payment',
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: '🏦',
      description: 'All major banks supported',
    },
  ];

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Generate mock payment data
    const mockPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockSignature = `sig_mock_${Math.random().toString(36).substr(2, 9)}`;

    // Show success animation
    setShowSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onPaymentSuccess({
      razorpay_payment_id: mockPaymentId,
      razorpay_order_id: orderDetails.id,
      razorpay_signature: mockSignature,
    });

    setIsProcessing(false);
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-xl">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <Check className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-green-600">Payment Successful!</h2>
          <p className="text-gray-600">Your booking is confirmed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 border-b bg-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Payment Options</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded hover:bg-gray-100 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Amount */}
        <div className="border-b bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Amount to pay</span>
            <span className="text-2xl font-bold text-primary">₹{orderDetails.amount / 100}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Order ID: <span className="font-mono">{orderDetails.id.substring(0, 20)}...</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="px-6 py-4">
          <p className="mb-3 text-sm font-semibold text-gray-700">Select Payment Method</p>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex cursor-pointer items-center rounded-lg border-2 p-3 transition ${
                  selectedPaymentMethod === method.id
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedPaymentMethod === method.id}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="ml-3 text-xl">{method.icon}</span>
                <div className="ml-3 flex-1">
                  <p className="font-semibold text-gray-800">{method.name}</p>
                  <p className="text-xs text-gray-500">{method.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Card Details (if card selected) */}
        {selectedPaymentMethod === 'card' && (
          <div className="border-t bg-gray-50 px-6 py-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">Card Details</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Card Number</label>
                <input
                  type="text"
                  value="4111 1111 1111 1111"
                  readOnly
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Expiry</label>
                  <input
                    type="text"
                    value="12/25"
                    readOnly
                    className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">CVV</label>
                  <input
                    type="text"
                    value="123"
                    readOnly
                    className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UPI Details (if UPI selected) */}
        {selectedPaymentMethod === 'upi' && (
          <div className="border-t bg-gray-50 px-6 py-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">UPI ID</p>
            <input
              type="text"
              value="user@okhdfcbank"
              readOnly
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        )}

        {/* PhonePe Details (if PhonePe selected) */}
        {selectedPaymentMethod === 'phonepe' && (
          <div className="border-t bg-gray-50 px-6 py-4">
            <p className="mb-3 text-xs font-semibold text-gray-700">
              📲 You will be redirected to PhonePe app
            </p>
            <div className="rounded bg-yellow-50 px-3 py-2">
              <p className="text-xs text-yellow-800">
                Make sure PhonePe app is installed on your device
              </p>
            </div>
          </div>
        )}

        {/* Netbanking Details (if Netbanking selected) */}
        {selectedPaymentMethod === 'netbanking' && (
          <div className="border-t bg-gray-50 px-6 py-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">Select Your Bank</p>
            <select className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm">
              <option>HDFC Bank</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
              <option>SBI Bank</option>
              <option>Kotak Bank</option>
            </select>
          </div>
        )}

        {/* Info Message */}
        <div className="border-t bg-blue-50 px-6 py-3">
          <p className="text-xs text-blue-800">
            ℹ️ <strong>[MOCK MODE]</strong> - This is a test payment. Click "Pay ₹{orderDetails.amount / 100}" to
            simulate a successful payment.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="border-t bg-white px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 rounded border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 rounded bg-primary px-4 py-3 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Processing...
              </span>
            ) : (
              `Pay ₹${orderDetails.amount / 100}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockPaymentModal;
