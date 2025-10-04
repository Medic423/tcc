import React, { useState, useEffect } from 'react';
import { DollarSign, Save, User, Bell, Phone, Mail, Calculator, RefreshCw } from 'lucide-react';

interface RevenueSettings {
  baseRates: {
    BLS: number;
    ALS: number;
    CCT: number;
  };
  perMileRates: {
    BLS: number;
    ALS: number;
    CCT: number;
  };
  priorityMultipliers: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
  specialRequirementsSurcharge: number;
  insuranceRates: {
    medicare: number;
    medicaid: number;
    private: number;
  };
}

interface AgencySettings {
  contactName: string;
  email: string;
  phone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface RevenuePreview {
  standardRate: number;
  mileageRate: number;
  insuranceRate: number;
}

interface AgencySettingsProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    agencyName?: string;
  };
}

const AgencySettings: React.FC<AgencySettingsProps> = ({ user }) => {
  // Revenue Settings State
  const [revenueSettings, setRevenueSettings] = useState<RevenueSettings>({
    baseRates: {
      BLS: 150,
      ALS: 250,
      CCT: 400
    },
    perMileRates: {
      BLS: 2.5,
      ALS: 3.75,
      CCT: 5.0
    },
    priorityMultipliers: {
      LOW: 1.0,
      MEDIUM: 1.1,
      HIGH: 1.25,
      URGENT: 1.5
    },
    specialRequirementsSurcharge: 50,
    insuranceRates: {
      medicare: 0.8,
      medicaid: 0.75,
      private: 1.0
    }
  });

  // Agency Settings State
  const [agencySettings, setAgencySettings] = useState<AgencySettings>({
    contactName: user.name || '',
    email: user.email || '',
    phone: '',
    emailNotifications: true,
    smsNotifications: false
  });

  const [revenuePreview, setRevenuePreview] = useState<RevenuePreview>({
    standardRate: 0,
    mileageRate: 0,
    insuranceRate: 0
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate revenue preview
  const calculateRevenuePreview = () => {
    const sampleTrip = {
      transportLevel: 'ALS' as keyof typeof revenueSettings.baseRates,
      priority: 'MEDIUM' as keyof typeof revenueSettings.priorityMultipliers,
      distanceMiles: 15,
      insuranceCompany: 'private' as keyof typeof revenueSettings.insuranceRates,
      specialRequirements: false
    };

    const baseRate = revenueSettings.baseRates[sampleTrip.transportLevel];
    const perMileRate = revenueSettings.perMileRates[sampleTrip.transportLevel];
    const priorityMultiplier = revenueSettings.priorityMultipliers[sampleTrip.priority];
    const insuranceRate = revenueSettings.insuranceRates[sampleTrip.insuranceCompany];
    const specialSurcharge = sampleTrip.specialRequirements ? revenueSettings.specialRequirementsSurcharge : 0;

    const standardRate = (baseRate * priorityMultiplier + specialSurcharge);
    const mileageRate = (baseRate + (perMileRate * sampleTrip.distanceMiles) + specialSurcharge) * priorityMultiplier;
    const insuranceRateAmount = standardRate * insuranceRate;

    setRevenuePreview({
      standardRate,
      mileageRate,
      insuranceRate: insuranceRateAmount
    });
  };

  useEffect(() => {
    calculateRevenuePreview();
  }, [revenueSettings]);

  const handleRevenueSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    setRevenueSettings(prev => ({
      ...prev,
      [keys[0]]: {
        ...prev[keys[0] as keyof typeof prev],
        [keys[1]]: parseFloat(value) || 0
      }
    }));
  };

  const handleAgencySettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setAgencySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Save agency settings
      const agencyResponse = await fetch('/api/ems/agency-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(agencySettings)
      });

      if (!agencyResponse.ok) {
        throw new Error('Failed to save agency settings');
      }

      // Save revenue settings
      const revenueResponse = await fetch('/api/ems/revenue-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(revenueSettings)
      });

      if (!revenueResponse.ok) {
        throw new Error('Failed to save revenue settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <Save className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Settings saved successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Agency Contact Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
          </div>
          <p className="text-sm text-gray-500">Update your agency contact details and notification preferences</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Contact Name
              </label>
              <input
                type="text"
                name="contactName"
                value={agencySettings.contactName}
                onChange={handleAgencySettingsChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter contact name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={agencySettings.email}
                onChange={handleAgencySettingsChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={agencySettings.phone}
                onChange={handleAgencySettingsChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Bell className="h-4 w-4 inline mr-1" />
                Notification Preferences
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={agencySettings.emailNotifications}
                    onChange={handleAgencySettingsChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Email notifications for new trip requests
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={agencySettings.smsNotifications}
                    onChange={handleAgencySettingsChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    SMS notifications for urgent trip requests
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Revenue Settings</h3>
          </div>
          <p className="text-sm text-gray-500">Configure basic pricing rates for transport services</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Base Rates */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Base Rates by Transport Level</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">BLS Base Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.baseRates.BLS}
                    onChange={handleRevenueSettingsChange}
                    name="baseRates.BLS"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ALS Base Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.baseRates.ALS}
                    onChange={handleRevenueSettingsChange}
                    name="baseRates.ALS"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CCT Base Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.baseRates.CCT}
                    onChange={handleRevenueSettingsChange}
                    name="baseRates.CCT"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Per Mile Rates */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Per Mile Rates</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">BLS Per Mile ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.perMileRates.BLS}
                    onChange={handleRevenueSettingsChange}
                    name="perMileRates.BLS"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ALS Per Mile ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.perMileRates.ALS}
                    onChange={handleRevenueSettingsChange}
                    name="perMileRates.ALS"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CCT Per Mile ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={revenueSettings.perMileRates.CCT}
                    onChange={handleRevenueSettingsChange}
                    name="perMileRates.CCT"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Preview */}
          {revenuePreview && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Calculator className="h-4 w-4 text-blue-600 mr-2" />
                <h4 className="text-md font-medium text-gray-900">Revenue Preview (Sample ALS Trip)</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Standard Rate:</span> ${revenuePreview.standardRate.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Mileage Rate:</span> ${revenuePreview.mileageRate.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Insurance Rate:</span> ${revenuePreview.insuranceRate.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="px-6 py-3 bg-orange-600 text-white rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AgencySettings;
