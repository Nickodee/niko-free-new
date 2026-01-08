import { useState, useEffect } from 'react';
import { X, Sparkles, CreditCard, CheckCircle, Loader2, Zap, Star } from 'lucide-react';
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
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [daysCount, setDaysCount] = useState(7);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  const boostTiers = [
    {
      id: 'cant-miss',
      name: "Can't Miss!",
      originalPrice: 1000,
      price: 400,
      duration: 'per day',
      description: 'Featured at the top of the homepage',
      features: [
        'Top homepage placement',
        'Priority in search results',
        'Highlighted in category listings',
        'Social media promotion',
        'Newsletter feature'
      ],
      badge: 'Most Popular',
      badgeColor: 'bg-pink-500',
      color: 'from-purple-600 to-pink-600',
      isSelectable: true
    },
    {
      id: 'category-featured',
      name: 'Category Featured',
      originalPrice: 500,
      price: 200,
      duration: 'per day',
      description: 'Featured within your event category',
      features: [
        'Category page prominence',
        'Enhanced search visibility',
        'Category newsletter inclusion',
        'Social media mentions'
      ],
      badge: 'Best Value',
      badgeColor: 'bg-blue-400',
      color: 'from-blue-600 to-teal-600',
      isSelectable: false
    },
    {
      id: 'homepage-banner',
      name: 'Homepage Banner',
      price: 50000,
      duration: 'per week',
      description: 'Exclusive homepage banner placement',
      features: [
        'Full-width banner on homepage',
        'Maximum visibility',
        'Priority support',
        'Dedicated account manager',
        'Custom creative design',
        'Performance analytics'
      ],
      badge: 'Premium',
      badgeColor: 'bg-red-700',
      color: 'from-orange-600 to-red-600',
      isSelectable: false
    }
  ];

  // Poll payment status if payment was initiated
  useEffect(() => {
    if (!paymentInitiated || !paymentId) return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(paymentId);
        
        if (result.payment?.status === 'completed') {
          clearInterval(pollInterval);
          setPaymentInitiated(false);
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            onSuccess();
            onClose();
          }, 3000);
        } else if (result.payment?.status === 'failed') {
          clearInterval(pollInterval);
          setPaymentInitiated(false);
          setError('Payment failed. Please try again.');
        }
      } catch (err: any) {
        console.error('Error checking payment status:', err);
      }
    }, 2000); // Poll every 2 seconds for faster payment confirmation

    return () => clearInterval(pollInterval);
  }, [paymentInitiated, paymentId, onSuccess, onClose]);

  if (!isOpen) return null;

  const selectedTierData = boostTiers.find(t => t.id === selectedTier);
  const totalCost = selectedTierData 
    ? (selectedTierData.duration === 'per week' 
        ? selectedTierData.price * Math.ceil(daysCount / 7)
        : selectedTierData.price * daysCount)
    : 0;

  const handlePromote = async () => {
    // Validate event
    if (!event || !event.id) {
      setError('Invalid event selected');
      return;
    }

    // Validate tier selection
    if (!selectedTier) {
      setError('Please select a promotion tier');
      return;
    }

    const tier = boostTiers.find(t => t.id === selectedTier);
    if (!tier) {
      setError('Invalid promotion tier selected');
      return;
    }

    // Phone number is required for all paid promotions
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number for payment');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');

      console.log('Promoting event:', {
        eventId: event.id,
        daysCount: daysCount,
        isFree: false,
        phoneNumber: phoneNumber || undefined
      });

      const result = await promoteEvent(
        event.id,
        daysCount,
        false, // All promotions are paid now
        phoneNumber || undefined
      );

      console.log('Promotion result:', result);

      // Paid promotion - payment initiated, poll for status
      if (result.payment_id) {
        setPaymentId(result.payment_id);
        setPaymentInitiated(true);
      } else {
        setError('Payment initiation failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Promotion error:', err);
      // Extract error message from response if available
      const errorMessage = err.message || err.error || 'Failed to promote event. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

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

            {/* Boost Tiers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Promotion Tier
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {boostTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all relative ${
                      selectedTier === tier.id ? 'ring-2 ring-[#27aae2]' : ''
                    }`}
                  >
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${tier.color} p-4 text-white relative`}>
                      {tier.badge && (
                        <div className="absolute top-2 right-2">
                          <span className={`${tier.badgeColor} text-white px-2 py-1 rounded-full text-xs font-semibold`}>
                            {tier.badge}
                          </span>
                        </div>
                      )}
                      <Zap className="w-8 h-8 mb-2" />
                      <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                      <p className="text-white/90 text-xs">{tier.description}</p>
                    </div>

                    <div className={`p-4 ${!tier.isSelectable ? 'blur-sm' : ''}`}>
                      {/* Price */}
                      <div className="mb-4">
                        {tier.originalPrice && (
                          <div className="mb-1">
                            <span className="text-gray-400 dark:text-gray-500 line-through text-sm">
                              Ksh {tier.originalPrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            Ksh {tier.price.toLocaleString()}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            {tier.duration}
                          </span>
                        </div>
                        {tier.originalPrice && (
                          <div className="mt-1">
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                              Save {Math.round(((tier.originalPrice - tier.price) / tier.originalPrice) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-4">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Star className="w-4 h-4 text-[#27aae2] flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300 text-xs">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Select Button */}
                      <button
                        onClick={() => { 
                          if (tier.isSelectable) {
                            setSelectedTier(tier.id);
                          }
                        }}
                        disabled={!tier.isSelectable || isProcessing || paymentInitiated}
                        className={`w-full py-2 rounded-lg font-semibold transition-all text-sm ${
                          !tier.isSelectable
                            ? 'bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed blur-sm'
                            : selectedTier === tier.id
                            ? 'bg-[#27aae2] text-white'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-500'
                        }`}
                      >
                        {selectedTier === tier.id ? 'Selected' : 'Select Plan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promotion Duration */}
            {selectedTier && (
              <>
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
                      disabled={isProcessing || paymentInitiated}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Total Cost: <span className="font-semibold">KES {totalCost.toLocaleString()}</span>
                  </p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number (Required for payment)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="254712345678"
                    disabled={isProcessing || paymentInitiated}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#27aae2] focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter your M-Pesa phone number
                  </p>
                </div>
              </>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-900 dark:text-green-300">
                    Event promoted successfully!
                  </p>
                </div>
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
            {error && !paymentInitiated && !success && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-3">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            {!paymentInitiated && !success && (
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
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Proceed to Payment</span>
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

