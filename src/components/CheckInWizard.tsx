import { useState } from 'react';
import { 
  CheckCircle2, 
  CreditCard, 
  FileCheck, 
  Key, 
  User, 
  MapPin,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { useCheckIn } from '@/hooks/useReservations';
import type { ReservationWithDetails } from '@/types/database';

interface CheckInWizardProps {
  reservation: ReservationWithDetails;
  onComplete: () => void;
  onCancel: () => void;
}

type WizardStep = 'verify' | 'id' | 'room' | 'payment' | 'signature' | 'complete';

export function CheckInWizard({ reservation, onComplete, onCancel }: CheckInWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('verify');
  const [wizardData, setWizardData] = useState({
    idVerified: false,
    idType: '',
    idNumber: '',
    roomConfirmed: reservation.room_id ? true : false,
    selectedRoomId: reservation.room_id || '',
    paymentMethod: '',
    cardLastFour: '',
    depositAmount: 0,
    signatureProvided: false,
    notes: '',
  });
  
  const checkInMutation = useCheckIn();

  const steps: { id: WizardStep; label: string; icon: typeof User }[] = [
    { id: 'verify', label: 'Verify Guest', icon: User },
    { id: 'id', label: 'ID Verification', icon: FileCheck },
    { id: 'room', label: 'Room Assignment', icon: MapPin },
    { id: 'payment', label: 'Payment Method', icon: CreditCard },
    { id: 'signature', label: 'Signature', icon: CheckCircle2 },
    { id: 'complete', label: 'Complete', icon: Key },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'verify':
        return true; // Always can proceed from verification
      case 'id':
        return wizardData.idVerified && wizardData.idType && wizardData.idNumber;
      case 'room':
        return wizardData.roomConfirmed && wizardData.selectedRoomId;
      case 'payment':
        return wizardData.paymentMethod;
      case 'signature':
        return true; // Signature is optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length && steps[nextStepIndex]) {
      setCurrentStep(steps[nextStepIndex].id);
    }
  };

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0 && steps[prevStepIndex]) {
      setCurrentStep(steps[prevStepIndex].id);
    }
  };

  const handleComplete = async () => {
    try {
      await checkInMutation.mutateAsync(reservation.id);
      setCurrentStep('complete');
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'verify':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {reservation.guest?.first_name} {reservation.guest?.last_name}!
              </h3>
              <p className="text-gray-600">
                Please verify the guest information below
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900">
                    {reservation.guest?.first_name} {reservation.guest?.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{reservation.guest?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{reservation.guest?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Guests</label>
                  <p className="text-gray-900">
                    {reservation.num_adults} Adult{reservation.num_adults !== 1 ? 's' : ''}
                    {reservation.num_children > 0 && `, ${reservation.num_children} Child${reservation.num_children !== 1 ? 'ren' : ''}`}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Check-in Date</label>
                  <p className="text-gray-900">
                    {new Date(reservation.check_in_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Check-out Date</label>
                  <p className="text-gray-900">
                    {new Date(reservation.check_out_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {reservation.special_requests && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-700">Special Requests</label>
                  <p className="text-gray-900 mt-1">{reservation.special_requests}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'id':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <FileCheck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ID Verification
              </h3>
              <p className="text-gray-600">
                Please verify the guest's identification document
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Type *
                </label>
                <select
                  value={wizardData.idType}
                  onChange={(e) => setWizardData({ ...wizardData, idType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select ID Type</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="national_id">National ID</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Number *
                </label>
                <input
                  type="text"
                  value={wizardData.idNumber}
                  onChange={(e) => setWizardData({ ...wizardData, idNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter ID number"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wizardData.idVerified}
                    onChange={(e) => setWizardData({ ...wizardData, idVerified: e.target.checked })}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    I have verified that the ID matches the guest and is valid
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'room':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Room Assignment
              </h3>
              <p className="text-gray-600">
                Confirm the room assignment for this guest
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Assigned Room</label>
                  <p className="text-2xl font-bold text-gray-900">
                    Room {reservation.room?.room_number}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {reservation.room?.room_type?.name} • Floor {reservation.room?.floor}
                  </p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wizardData.roomConfirmed}
                    onChange={(e) => setWizardData({ ...wizardData, roomConfirmed: e.target.checked })}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Room is ready and confirmed for check-in
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={wizardData.notes}
                onChange={(e) => setWizardData({ ...wizardData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special notes about the room or guest preferences..."
              />
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
                <CreditCard className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Method
              </h3>
              <p className="text-gray-600">
                Capture the payment method for incidental charges
              </p>
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
                      onClick={() => setWizardData({ ...wizardData, paymentMethod: method })}
                      className={`px-4 py-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                        wizardData.paymentMethod === method
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {(wizardData.paymentMethod === 'Credit Card' || wizardData.paymentMethod === 'Debit Card') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last 4 Digits of Card
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={wizardData.cardLastFour}
                    onChange={(e) => setWizardData({ ...wizardData, cardLastFour: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="****"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Deposit (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={wizardData.depositAmount || ''}
                    onChange={(e) => setWizardData({ ...wizardData, depositAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'signature':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
                <CheckCircle2 className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Guest Signature
              </h3>
              <p className="text-gray-600">
                Capture guest signature for registration (optional)
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
              <p className="text-gray-500 mb-4">
                Signature capture would go here
              </p>
              <label className="flex items-center justify-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wizardData.signatureProvided}
                  onChange={(e) => setWizardData({ ...wizardData, signatureProvided: e.target.checked })}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">
                  Signature captured (or skip if not required)
                </span>
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Digital signature capture can be implemented with a signature pad library in the future.
              </p>
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
              Check-in Complete!
            </h3>
            <p className="text-lg text-gray-600 mb-2">
              {reservation.guest?.first_name} {reservation.guest?.last_name} is now checked in
            </p>
            <p className="text-gray-500">
              Room {reservation.room?.room_number} • {reservation.room?.room_type?.name}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Express Check-in</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        {currentStep !== 'complete' && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              {steps.slice(0, -1).map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStepIndex > index;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-full border-2 transition-colors ${
                          isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : isActive
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 2 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        {currentStep !== 'complete' && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>

              {currentStepIndex === steps.length - 2 ? (
                <button
                  onClick={handleComplete}
                  disabled={!canProceed() || checkInMutation.isPending}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {checkInMutation.isPending ? 'Processing...' : 'Complete Check-in'}
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
