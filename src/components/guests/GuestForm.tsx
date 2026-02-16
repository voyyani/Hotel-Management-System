import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Database } from '@/types/database';
import type { GuestPreferences } from '@/hooks/useGuests';

type Guest = Database['public']['Tables']['guests']['Row'];
type GuestInsert = Database['public']['Tables']['guests']['Insert'];

interface GuestFormProps {
  guest?: Guest | null;
  onSubmit: (data: Omit<GuestInsert, 'created_by'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  duplicateWarning?: Guest[];
}

export function GuestForm({ guest, onSubmit, onCancel, isSubmitting, duplicateWarning }: GuestFormProps) {
  const [formData, setFormData] = useState<Partial<GuestInsert>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_type: null,
    id_number: '',
    nationality: '',
    date_of_birth: '',
    address: null,
    preferences: null,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<GuestPreferences>({});

  useEffect(() => {
    if (guest) {
      setFormData({
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone: guest.phone,
        id_type: guest.id_type,
        id_number: guest.id_number,
        nationality: guest.nationality,
        date_of_birth: guest.date_of_birth,
        address: guest.address,
        preferences: guest.preferences,
        is_active: guest.is_active,
      });

      if (guest.preferences) {
        setPreferences(guest.preferences as GuestPreferences);
        setShowPreferences(true);
      }
    }
  }, [guest]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) {
        newErrors.date_of_birth = 'Guest must be at least 18 years old';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Merge preferences into form data
    const submitData = {
      ...formData,
      preferences: showPreferences && Object.keys(preferences).length > 0 ? preferences : null,
    };

    onSubmit(submitData as Omit<GuestInsert, 'created_by'>);
  };

  const handleInputChange = (field: keyof GuestInsert, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePreferenceChange = (field: keyof GuestPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Duplicate Warning */}
      {duplicateWarning && duplicateWarning.length > 0 && (
        <Alert className="border-amber-500 bg-amber-50">
          <AlertDescription>
            <strong>Potential Duplicate Detected:</strong> {duplicateWarning.length} guest(s) with
            similar information already exist. Please verify before creating.
          </AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic guest details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="first_name">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_name"
                value={formData.first_name || ''}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className={errors.first_name ? 'border-red-500' : ''}
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="last_name">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="last_name"
                value={formData.last_name || ''}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className={errors.last_name ? 'border-red-500' : ''}
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className={errors.date_of_birth ? 'border-red-500' : ''}
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-sm text-red-500">{errors.date_of_birth}</p>
              )}
            </div>

            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality || ''}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identification */}
      <Card>
        <CardHeader>
          <CardTitle>Identification</CardTitle>
          <CardDescription>ID documents for verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="id_type">ID Type</Label>
              <Select
                value={formData.id_type || ''}
                onValueChange={(value) => handleInputChange('id_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="id_card">National ID Card</SelectItem>
                  <SelectItem value="driver_license">Driver's License</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="id_number">ID Number</Label>
              <Input
                id="id_number"
                value={formData.id_number || ''}
                onChange={(e) => handleInputChange('id_number', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={
                formData.address && typeof formData.address === 'object'
                  ? JSON.stringify(formData.address)
                  : (formData.address as string) || ''
              }
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Street, City, Country"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences (Optional) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Guest preferences and special needs (optional)</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreferences(!showPreferences)}
            >
              {showPreferences ? 'Hide' : 'Show'} Preferences
            </Button>
          </div>
        </CardHeader>
        {showPreferences && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="floor_preference">Floor Preference</Label>
                <Select
                  value={preferences.floor_preference || ''}
                  onValueChange={(value) => handlePreferenceChange('floor_preference', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Floor</SelectItem>
                    <SelectItem value="mid">Mid Floor</SelectItem>
                    <SelectItem value="high">High Floor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bed_type">Bed Type</Label>
                <Select
                  value={preferences.bed_type || ''}
                  onValueChange={(value) => handlePreferenceChange('bed_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bed type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="king">King</SelectItem>
                    <SelectItem value="twin">Twin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
              <Input
                id="dietary_restrictions"
                value={preferences.dietary_restrictions?.join(', ') || ''}
                onChange={(e) =>
                  handlePreferenceChange(
                    'dietary_restrictions',
                    e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  )
                }
                placeholder="Vegetarian, Gluten-free, etc. (comma separated)"
              />
            </div>

            <div>
              <Label htmlFor="special_amenities">Special Amenities</Label>
              <Input
                id="special_amenities"
                value={preferences.special_amenities?.join(', ') || ''}
                onChange={(e) =>
                  handlePreferenceChange(
                    'special_amenities',
                    e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  )
                }
                placeholder="Extra pillows, Iron, etc. (comma separated)"
              />
            </div>

            <div>
              <Label htmlFor="preference_notes">Additional Notes</Label>
              <Input
                id="preference_notes"
                value={preferences.notes || ''}
                onChange={(e) => handlePreferenceChange('notes', e.target.value)}
                placeholder="Any other preferences or special needs"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : guest ? 'Update Guest' : 'Create Guest'}
        </Button>
      </div>
    </form>
  );
}
