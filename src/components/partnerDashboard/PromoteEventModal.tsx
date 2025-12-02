import React, { useState, useEffect } from 'react';
import { X, Sparkles, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { promoteEvent } from '../../services/partnerService';
import { checkPaymentStatus } from '../../services/paymentService';

interface PromoteEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onSuccess: () => void;
}

export default function PromoteEventModal({
  isOpen,
  onClose,
  event,
  onSuccess,
}: PromoteEventModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'paid'>('free');
  const [daysCount, setDaysCount] = useState(7);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');

  // Initialize with current date/time when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].slice(0, 5); // HH:MM format
      setStartDate(dateStr);
      setStartTime(timeStr);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const costPerDay = 400;
  const totalCost = selectedPlan === 'free' ? 0 : daysCount * costPerDay;

  const handlePromote = async () => {
    if (selectedPlan === 'paid' && !phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      // Prepare promotion data
      let promotionData: any = {
        days_count: daysCount,
        is_free: selectedPlan === 'free',
      };

      // Calculate start and end dates
      let startDateTime: Date;
      let endDateTime: Date;
      
      if (startDate && startTime) {
        // Use selected start date/time
        startDateTime = new Date(`${startDate}T${startTime}`);
        
        if (startDateTime < new Date()) {
          setError('Start date/time cannot be in the past');
          return;
        }
        
        // Calculate end date based on start date + days_count
        endDateTime = new Date(startDateTime);
        endDateTime.setDate(endDateTime.getDate() + daysCount);
      } else {
        // Default to start now
        startDateTime = new Date();
        endDateTime = new Date();
        endDateTime.setDate(endDateTime.getDate() + daysCount);
      }
      
      promotionData.start_date = startDateTime.toISOString();
      promotionData.end_date = endDateTime.toISOString();

      if (selectedPlan === 'paid' && phoneNumber) {
        promotionData.phone_number = phoneNumber;
      }

      const result = await promoteEvent(
        event.id,
        promotionData.days_count,
        promotionData.is_free,
        promotionData.phone_number,
        promotionData.start_date,
        promotionData.end_date
      );

      if (selectedPlan === 'free') {
        // Free promotion - success immediately
        onSuccess();
        onClose();
      } else {
        // Paid promotion - payment initiated, poll for status
        setPaymentId(result.payment_id);
        setCheckoutRequestId(result.checkout_request_id);
        setPaymentInitiated(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to promote event');
    } finally {
      setIsProcessing(false);
    }
  };

  // Poll payment status if payment was initiated
  useEffect(() => {
    if (!paymentInitiated || !paymentId) return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(paymentId);
        
        if (result.payment?.status === 'completed') {
          clearInterval(pollInterval);
          setPaymentInitiated(false);
          onSuccess();
          onClose();
        } else if (result.payment?.status === 'failed') {
          clearInterval(pollInterval);
          setPaymentInitiated(false);
          setError('Payment failed. Please try again.');
        }
      } catch (err: any) {
        console.error('Error checking payment status:', err);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [paymentInitiated, paymentId, onSuccess, onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-[#27aae2]" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Promote Event
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Event Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Promote this event to the "Can't Miss" section for increased visibility
              </p>
            </div>

            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Promotion Plan
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Free Plan */}
                <button
                  onClick={() => setSelectedPlan('free')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPlan === 'free'
                      ? 'border-[#27aae2] bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-5 h-5 text-[#27aae2]" />
                    {selectedPlan === 'free' && (
                      <CheckCircle className="w-5 h-5 text-[#27aae2]" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    Free Promotion
                  </h3>
                  <p className="text-2xl font-bold text-[#27aae2] mb-2">KES 0</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Perfect for testing
                  </p>
                </button>

                {/* Paid Plan */}
                <button
                  onClick={() => setSelectedPlan('paid')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPlan === 'paid'
                      ? 'border-[#27aae2] bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-5 h-5 text-[#27aae2]" />
                    {selectedPlan === 'paid' && (
                      <CheckCircle className="w-5 h-5 text-[#27aae2]" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    Paid Promotion
                  </h3>
                  <p className="text-2xl font-bold text-[#27aae2] mb-2">
                    KES {costPerDay}/day
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Maximum visibility
                  </p>
                </button>
              </div>
            </div>

            {/* Start Date & Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Promotion Start Date & Time
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#27aae2] dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#27aae2] dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Leave empty or set to current date/time to start immediately. The promotion will end after the duration period.
              </p>
            </div>

            {/* Promotion Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Promotion Duration
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={daysCount}
                  onChange={(e) => setDaysCount(parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-20 text-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {daysCount}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    days
                  </span>
                </div>
              </div>
              {selectedPlan === 'paid' && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Total Cost: <span className="font-semibold">KES {totalCost.toLocaleString()}</span>
                </p>
              )}
              {startDate && startTime && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Promotion will run from {new Date(`${startDate}T${startTime}`).toLocaleString()} for {daysCount} day{daysCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Phone Number (for paid) */}
            {selectedPlan === 'paid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number (for payment)
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254712345678"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#27aae2] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter your M-Pesa phone number
                </p>
              </div>
            )}

            {/* Payment Status */}
            {paymentInitiated && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      M-Pesa STK Push sent! Please check your phone to complete payment.
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      Enter your M-Pesa PIN when prompted. Waiting for payment confirmation...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !paymentInitiated && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            {!paymentInitiated && (
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePromote}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-[#27aae2] text-white rounded-lg font-medium hover:bg-[#1e8bc3] transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : selectedPlan === 'paid' ? (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Proceed to Payment</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Promote Event (Free)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

