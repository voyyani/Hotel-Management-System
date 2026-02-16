import { useState } from 'react';
import { 
  X, 
  LogOut, 
  Receipt, 
  CreditCard, 
  CheckCircle2,
  Star,
  DollarSign,
  User
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useCheckOut } from '@/hooks/useReservations';
import type { ReservationWithDetails } from '@/types/database';

interface CheckOutWizardProps {
  reservation: ReservationWithDetails;
  onComplete: () => void;
  onCancel: () => void;
}

type CheckOutStep = 'review' | 'payment' | 'feedback' | 'complete';

export function CheckOutWizard({ reservation, onComplete, onCancel }: CheckOutWizardProps) {
  const [currentStep, setCurrentStep] = useState<CheckOutStep>('review');
  const [paymentInfo, setPaymentInfo] = useState({
    method: '',
    amountPaid: 0,
    outstandingBalance: 0,
  });
  const [feedback, setFeedback] = useState({
    rating: 0,
    comments: '',
  });
  
  const checkOutMutation = useCheckOut();

  // Calculate billing
  const actualCheckIn = reservation.actual_check_in || reservation.check_in_date;
  const actualCheckOut = new Date().toISOString();
  const nights = Math.max(
    1,
    differenceInDays(new Date(actualCheckOut), new Date(actualCheckIn))
  );
  
  const roomRate = reservation.room?.room_type?.base_price || 0;
  const roomCharges = nights * roomRate;
  const additionalCharges = 0; // Placeholder for future implementation
  const subtotal = roomCharges + additionalCharges;
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + tax;

  const handleCompleteCheckOut = async () => {
    try {
      await checkOutMutation.mutateAsync(reservation.id);
      setCurrentStep('complete');
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Check-out failed:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <Receipt className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Bill Summary
              </h3>
              <p className="text-gray-600">
                Review the final bill for {reservation.guest?.first_name} {reservation.guest?.last_name}
              </p>
            </div>

            {/* Guest & Stay Info */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {reservation.guest?.first_name} {reservation.guest?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Room {reservation.room?.room_number} • {reservation.room?.room_type?.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Check-in</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(actualCheckIn), 'MMM dd, yyyy')}
                    <span className="text-gray-500 ml-1 text-xs">
                      ({format(new Date(actualCheckIn), 'h:mm a')})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Check-out</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(), 'MMM dd, yyyy')}
                    <span className="text-gray-500 ml-1 text-xs">
                      ({format(new Date(), 'h:mm a')})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Nights</p>
                  <p className="font-medium text-gray-900">{nights} night{nights !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-gray-600">Guests</p>
                  <p className="font-medium text-gray-900">
                    {reservation.num_adults} Adult{reservation.num_adults !== 1 ? 's' : ''}
                    {reservation.num_children > 0 && `, ${reservation.num_children} Child${reservation.num_children !== 1 ? 'ren' : ''}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Bill Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Charges
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-900">Room Charges</p>
                    <p className="text-sm text-gray-500">
                      {nights} night{nights !== 1 ? 's' : ''} × ${roomRate.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">${roomCharges.toFixed(2)}</p>
                </div>

                {additionalCharges > 0 && (
                  <div className="flex justify-between">
                    <p className="text-gray-900">Additional Charges</p>
                    <p className="font-medium text-gray-900">${additionalCharges.toFixed(2)}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <p className="text-gray-900">Subtotal</p>
                  <p className="font-medium text-gray-900">${subtotal.toFixed(2)}</p>
                </div>

                <div className="flex justify-between text-gray-600">
                  <p>Tax (16%)</p>
                  <p>${tax.toFixed(2)}</p>
                </div>

                <div className="border-t-2 border-gray-300 pt-3 flex justify-between">
                  <p className="text-lg font-bold text-gray-900">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Additional service charges and minibar items will be added in future implementation.
              </p>
            </div>

            <button
              onClick={() => setCurrentStep('payment')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              Continue to Payment
              <CreditCard className="h-5 w-5" />
            </button>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Payment
              </h3>
              <p className="text-gray-600">
                Process the payment for the outstanding balance
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">Amount Due</p>
                <p className="text-3xl font-bold text-gray-900">${total.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentInfo({ ...paymentInfo, method })}
                      className={`px-4 py-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                        paymentInfo.method === method
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentInfo.amountPaid || ''}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      setPaymentInfo({ 
                        ...paymentInfo, 
                        amountPaid: amount,
                        outstandingBalance: Math.max(0, total - amount)
                      });
                    }}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {paymentInfo.amountPaid > 0 && (
                <div className={`p-4 rounded-lg ${
                  paymentInfo.amountPaid >= total 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-amber-50 border border-amber-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      {paymentInfo.amountPaid >= total ? 'Fully Paid' : 'Outstanding Balance'}
                    </span>
                    <span className={`text-lg font-bold ${
                      paymentInfo.amountPaid >= total ? 'text-green-700' : 'text-amber-700'
                    }`}>
                      ${(total - paymentInfo.amountPaid).toFixed(2)}
                    </span>
                  </div>
                  {paymentInfo.amountPaid > total && (
                    <p className="text-sm text-green-700 mt-2">
                      Change to return: ${(paymentInfo.amountPaid - total).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('review')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('feedback')}
                disabled={!paymentInfo.method || paymentInfo.amountPaid < total}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Guest Feedback
              </h3>
              <p className="text-gray-600">
                Would the guest like to share their experience? (Optional)
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Overall Rating
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      className="p-2 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= feedback.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {feedback.rating > 0 && (
                  <p className="text-center text-gray-600 mt-2">
                    {feedback.rating === 5 ? 'Excellent!' : 
                     feedback.rating === 4 ? 'Great!' :
                     feedback.rating === 3 ? 'Good' :
                     feedback.rating === 2 ? 'Fair' : 'Needs Improvement'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={feedback.comments}
                  onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Any additional comments about the stay..."
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Email Receipt:</strong> A receipt will be automatically sent to {reservation.guest?.email}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('payment')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
              <button
                onClick={handleCompleteCheckOut}
                disabled={checkOutMutation.isPending}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkOutMutation.isPending ? (
                  'Processing...'
                ) : (
                  <>
                    Complete Check-out
                    <LogOut className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-pulse">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Check-out Complete!
            </h3>
            <p className="text-lg text-gray-600 mb-2">
              Thank you for staying with us, {reservation.guest?.first_name}!
            </p>
            <p className="text-gray-500">
              Receipt has been sent to {reservation.guest?.email}
            </p>
            {feedback.rating > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg inline-block">
                <div className="flex items-center gap-2 text-yellow-700">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-medium">Rated {feedback.rating} out of 5 stars</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Guest Check-out</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        {currentStep !== 'complete' && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className={currentStep === 'review' ? 'font-semibold text-blue-600' : 'text-gray-500'}>
                1. Review Bill
              </span>
              <span className={currentStep === 'payment' ? 'font-semibold text-blue-600' : 'text-gray-500'}>
                2. Payment
              </span>
              <span className={currentStep === 'feedback' ? 'font-semibold text-blue-600' : 'text-gray-500'}>
                3. Feedback
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
