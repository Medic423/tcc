import React, { useState } from 'react';
import { 
  Building2, 
  ArrowLeft, 
  CheckCircle,
  XCircle
} from 'lucide-react';

interface HealthcareRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
}

const HealthcareRegistration: React.FC<HealthcareRegistrationProps> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    facilityName: '',
    facilityType: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // const [geocoding, setGeocoding] = useState(false);

  const facilityTypes = [
    'Hospital',
    'Clinic',
    'Urgent Care',
    'Rehabilitation Facility',
    'Doctor\'s Office',
    'Dialysis Center',
    'Nursing Home',
    'Assisted Living',
    'Other'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // Geocoding function using OpenStreetMap Nominatim API (free)
  // const geocodeAddress = async () => {
  //   if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
  //     setError('Please fill in address, city, state, and ZIP code before looking up coordinates');
  //     return;
  //   }

  //   setGeocoding(true);
  //   setError(null);

  //   try {
  //     const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
  //     const response = await fetch(
  //       `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
  //     );
      
  //     if (!response.ok) {
  //       throw new Error('Geocoding service unavailable');
  //     }

  //     const data = await response.json();
      
  //     if (data && data.length > 0) {
  //       const result = data[0];
  //       setFormData(prev => ({
  //         ...prev,
  //         latitude: result.lat,
  //         longitude: result.lon
  //       }));
  //       setError(null);
  //     } else {
  //       setError('Address not found. Please enter coordinates manually.');
  //     }
  //   } catch (err) {
  //     console.error('Geocoding error:', err);
  //     setError('Failed to lookup coordinates. Please enter them manually.');
  //   } finally {
  //     setGeocoding(false);
  //   }
  // };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    // Coordinate validation
    if (!formData.latitude || !formData.longitude) {
      setError('Location coordinates are required. Please lookup or enter latitude and longitude.');
      setLoading(false);
      return;
    }

    // Validate coordinate ranges
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid numeric coordinates.');
      setLoading(false);
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90 degrees.');
      setLoading(false);
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180 degrees.');
      setLoading(false);
      return;
    }

    try {
      // Import authAPI dynamically to avoid circular imports
      const { authAPI } = await import('../services/api');
      
      console.log('Registering healthcare facility:', formData);
      
      await authAPI.healthcareRegister({
        email: formData.email,
        password: formData.password,
        name: formData.contactName,
        facilityName: formData.facilityName,
        facilityType: formData.facilityType
      });
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error('Healthcare registration error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Registration Submitted!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a verification email to {formData.email}. 
              Please check your inbox and click the verification link to activate your account.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Your account will be reviewed by our team and approved within 24 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Healthcare Facility Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Register your healthcare facility to start using TCC
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility Name *
                </label>
                <input
                  type="text"
                  name="facilityName"
                  required
                  value={formData.facilityName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter facility name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility Type *
                </label>
                <select
                  name="facilityType"
                  required
                  value={formData.facilityType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select facility type</option>
                  {facilityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  name="contactName"
                  required
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  required
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ZIP"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password (min 8 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login Selection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthcareRegistration;
