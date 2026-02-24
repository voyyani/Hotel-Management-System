/**
 * OnboardingModal Component
 * 
 * First-time setup modal for configuring hotel information.
 * Shown to admins who haven't configured the system yet.
 * 
 * @module components/OnboardingModal
 * @author Grace Mawia Kamami
 * @date 2026-02-17
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSystemSettings, SystemSettingsInput } from '@/hooks/useSystemSettings';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { updateSettings, isUpdating } = useSystemSettings();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SystemSettingsInput>({
    hotel_name: '',
    hotel_email: '',
    hotel_phone: '',
    hotel_address: '',
    hotel_city: '',
    hotel_state: '',
    hotel_country: '',
    hotel_postal_code: '',
    hotel_website: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.hotel_name.trim()) {
      setError('Hotel name is required');
      return;
    }

    try {
      await updateSettings(formData);
      setStep(3); // Success step
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome to Your Hotel Management System!</h2>
              <p className="text-indigo-100 mt-1">Let's get your property set up in just 2 minutes</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </div>

        {/* Content */}
        {step === 1 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tell us about your property</h3>
              <p className="text-gray-600">This information will appear throughout your system</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel / Property Name *
                </label>
                <Input
                  type="text"
                  value={formData.hotel_name}
                  onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })}
                  placeholder="Grand Plaza Hotel"
                  className="text-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={formData.hotel_email}
                    onChange={(e) => setFormData({ ...formData, hotel_email: e.target.value })}
                    placeholder="info@grandplaza.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.hotel_phone}
                    onChange={(e) => setFormData({ ...formData, hotel_phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Website (Optional)
                </label>
                <Input
                  type="url"
                  value={formData.hotel_website}
                  onChange={(e) => setFormData({ ...formData, hotel_website: e.target.value })}
                  placeholder="https://www.grandplaza.com"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-lg py-6"
                disabled={!formData.hotel_name.trim()}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Where are you located?</h3>
              <p className="text-gray-600">This helps with invoices and guest communications</p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <Input
                  type="text"
                  value={formData.hotel_address}
                  onChange={(e) => setFormData({ ...formData, hotel_address: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    type="text"
                    value={formData.hotel_city}
                    onChange={(e) => setFormData({ ...formData, hotel_city: e.target.value })}
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State / Province
                  </label>
                  <Input
                    type="text"
                    value={formData.hotel_state}
                    onChange={(e) => setFormData({ ...formData, hotel_state: e.target.value })}
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <Input
                    type="text"
                    value={formData.hotel_country}
                    onChange={(e) => setFormData({ ...formData, hotel_country: e.target.value })}
                    placeholder="United States"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <Input
                    type="text"
                    value={formData.hotel_postal_code}
                    onChange={(e) => setFormData({ ...formData, hotel_postal_code: e.target.value })}
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                type="button"
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 text-lg py-6"
                disabled={isUpdating}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-lg py-6"
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">All Set!</h3>
            <p className="text-gray-600 mb-6">
              Your hotel information has been saved successfully.
            </p>
            <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2">{formData.hotel_name}</h4>
              <p className="text-sm text-indigo-700">
                {formData.hotel_email && <span className="block">{formData.hotel_email}</span>}
                {formData.hotel_phone && <span className="block">{formData.hotel_phone}</span>}
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-6">Redirecting to your dashboard...</p>
          </div>
        )}
      </Card>
    </div>
  );
}
