import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  LogOut,
  Bell,
  Navigation,
  Settings,
  BarChart3,
  DollarSign
} from 'lucide-react';
import Notifications from './Notifications';
import UnitsManagement from './UnitsManagement';
import AgencySettings from './AgencySettings';
// import RevenueSettings from './RevenueSettings'; // Replaced by AgencySettings
// import EMSAnalytics from './EMSAnalytics'; // Moved to backup - will move to Admin later

interface EMSDashboardProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    agencyName?: string;
  };
  onLogout: () => void;
}

const EMSDashboard: React.FC<EMSDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('available'); // Default to Available Trips (new landing page)
  
  // Settings state
  const [settingsData, setSettingsData] = useState({
    agencyName: user.agencyName || '',
    email: user.email || '',
    serviceType: 'BLS/ALS', // Default value
    contactName: user.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  
  // Revenue calculation settings
  const [revenueSettings, setRevenueSettings] = useState({
    baseRates: {
      BLS: 150.0,
      ALS: 250.0,
      CCT: 400.0
    },
    perMileRates: {
      BLS: 2.50,
      ALS: 3.75,
      CCT: 5.00
    },
    priorityMultipliers: {
      LOW: 1.0,
      MEDIUM: 1.1,
      HIGH: 1.25,
      URGENT: 1.5
    },
    specialSurcharge: 50.0,
    insuranceRates: {
      medicare: { BLS: 120.0, ALS: 200.0, CCT: 350.0 },
      medicaid: { BLS: 100.0, ALS: 180.0, CCT: 300.0 },
      private: { BLS: 180.0, ALS: 300.0, CCT: 450.0 },
      selfPay: { BLS: 200.0, ALS: 350.0, CCT: 500.0 }
    }
  });
  const [revenuePreview, setRevenuePreview] = useState<any>(null);
  
  // Trip management state
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [acceptedTrips, setAcceptedTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load trips from API
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      // Load available trips (PENDING status)
      const availableResponse = await fetch('/api/trips?status=PENDING', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        if (availableData.success && availableData.data) {
               const transformedAvailable = availableData.data.map((trip: any) => ({
                 id: trip.id,
                 patientId: trip.patientId,
                 origin: trip.originFacility?.name || 'Unknown Origin',
                 destination: trip.destinationFacility?.name || 'Unknown Destination',
                 transportLevel: trip.transportLevel || 'BLS',
                 urgencyLevel: trip.urgencyLevel || 'Routine',
                 distance: '12.5 miles', // Mock data
                 estimatedTime: '25 minutes', // Mock data
                 requestTime: new Date(trip.createdAt).toLocaleString(),
                 scheduledTime: trip.scheduledTime
               }));
          setAvailableTrips(transformedAvailable);
        }
      }

      // Load accepted trips (ACCEPTED, IN_PROGRESS, COMPLETED status)
      const acceptedResponse = await fetch('/api/trips?status=ACCEPTED,IN_PROGRESS,COMPLETED', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (acceptedResponse.ok) {
        const acceptedData = await acceptedResponse.json();
        if (acceptedData.success && acceptedData.data) {
               const transformedAccepted = acceptedData.data.map((trip: any) => ({
                 id: trip.id,
                 patientId: trip.patientId,
                 origin: trip.originFacility?.name || 'Unknown Origin',
                 destination: trip.destinationFacility?.name || 'Unknown Destination',
                 transportLevel: trip.transportLevel || 'BLS',
                 urgencyLevel: trip.urgencyLevel || 'Routine',
                 status: trip.status,
                 pickupTime: trip.actualStartTime ? new Date(trip.actualStartTime).toLocaleString() : 'Not started',
                 scheduledTime: trip.scheduledTime
               }));
          setAcceptedTrips(transformedAccepted);
        }
      }
    } catch (error) {
      console.error('Error loading trips:', error);
      setError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRevenueSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [category, subcategory] = name.split('.');
    
    if (subcategory) {
      setRevenueSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category as keyof typeof prev],
          [subcategory]: parseFloat(value) || 0
        }
      }));
    } else {
      setRevenueSettings(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    }
    
    // Update revenue preview
    calculateRevenuePreview();
  };

  const calculateRevenuePreview = () => {
    const sampleTrip = {
      transportLevel: 'ALS',
      priority: 'MEDIUM',
      distanceMiles: 15.0,
      specialRequirements: false,
      insuranceCompany: 'medicare'
    };

    const baseRate = revenueSettings.baseRates[sampleTrip.transportLevel as keyof typeof revenueSettings.baseRates];
    const perMileRate = revenueSettings.perMileRates[sampleTrip.transportLevel as keyof typeof revenueSettings.perMileRates];
    const priorityMultiplier = revenueSettings.priorityMultipliers[sampleTrip.priority as keyof typeof revenueSettings.priorityMultipliers];
    const insuranceRate = revenueSettings.insuranceRates[sampleTrip.insuranceCompany as keyof typeof revenueSettings.insuranceRates][sampleTrip.transportLevel as keyof typeof revenueSettings.insuranceRates.medicare];
    
    const specialSurcharge = sampleTrip.specialRequirements ? revenueSettings.specialSurcharge : 0;
    
    // Calculate different revenue scenarios
    const standardRevenue = (baseRate * priorityMultiplier + specialSurcharge);
    const mileageRevenue = (baseRate + (perMileRate * sampleTrip.distanceMiles) + specialSurcharge) * priorityMultiplier;
    const insuranceRevenue = (insuranceRate + (perMileRate * sampleTrip.distanceMiles) + specialSurcharge) * priorityMultiplier;

    setRevenuePreview({
      sampleTrip,
      standardRevenue: Math.round(standardRevenue * 100) / 100,
      mileageRevenue: Math.round(mileageRevenue * 100) / 100,
      insuranceRevenue: Math.round(insuranceRevenue * 100) / 100
    });
  };

  // Calculate revenue preview on component mount
  useEffect(() => {
    calculateRevenuePreview();
  }, [revenueSettings]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError(null);

    try {
      console.log('TCC_DEBUG: Frontend sending EMS agency update:', settingsData);
      console.log('TCC_DEBUG: Frontend token:', localStorage.getItem('token'));
      
      const response = await fetch('/api/auth/ems/agency/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      console.log('TCC_DEBUG: Frontend response status:', response.status);
      console.log('TCC_DEBUG: Frontend response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('TCC_DEBUG: Frontend error response:', errorData);
        throw new Error(errorData.error || 'Failed to update agency information');
      }

      const responseData = await response.json();
      console.log('TCC_DEBUG: Frontend success response:', responseData);

      setSettingsSuccess(true);
      // Navigate back to overview tab after successful save
      setActiveTab('overview');
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (error: any) {
      console.error('TCC_DEBUG: Frontend error updating agency:', error);
      setSettingsError(error.message || 'Failed to update agency information');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSettingsCancel = () => {
    setSettingsData({
      agencyName: user.agencyName || '',
      email: user.email || '',
      serviceType: 'BLS/ALS',
      contactName: user.name || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    });
    setSettingsError(null);
    setSettingsSuccess(false);
    // Navigate back to overview tab
    setActiveTab('overview');
  };

  const handleAcceptTrip = async (tripId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ACCEPTED',
          assignedAgencyId: user.id, // Using user ID as agency ID for now
          acceptedTimestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept trip');
      }

      // Reload trips to get updated data
      await loadTrips();
    } catch (error: any) {
      console.error('Error accepting trip:', error);
      setError(error.message || 'Failed to accept trip');
    }
  };

  const handleDeclineTrip = async (tripId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to decline trip');
      }

      // Reload trips to get updated data
      await loadTrips();
    } catch (error: any) {
      console.error('Error declining trip:', error);
      setError(error.message || 'Failed to decline trip');
    }
  };

  const handleUpdateTripStatus = async (tripId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === 'IN_PROGRESS' && { pickupTimestamp: new Date().toISOString() }),
          ...(newStatus === 'COMPLETED' && { completionTimestamp: new Date().toISOString() })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update trip status');
      }

      // Reload trips to get updated data
      await loadTrips();
    } catch (error: any) {
      console.error('Error updating trip status:', error);
      setError(error.message || 'Failed to update trip status');
    }
  };

  const getUrgencyLevelStyle = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'Routine':
        return 'text-black bg-transparent';
      case 'Urgent':
        return 'text-black bg-orange-200';
      case 'Emergent':
        return 'text-black bg-red-200';
      default:
        return 'text-black bg-transparent';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'text-green-600 bg-green-100';
      case 'EN_ROUTE': return 'text-blue-600 bg-blue-100';
      case 'PICKUP': return 'text-purple-600 bg-purple-100';
      case 'COMPLETED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {user.agencyName || 'EMS Agency'}
                </h1>
                <p className="text-sm text-gray-500">EMS Agency Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Notifications user={user} />
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'available', name: 'Available Trips', icon: MapPin },
              { id: 'accepted', name: 'My Trips', icon: CheckCircle },
              { id: 'units', name: 'Units', icon: Settings },
              { id: 'revenue-settings', name: 'Agency Settings', icon: DollarSign }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    console.log('🔍 EMSDashboard: Tab clicked:', tab.id);
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview tab removed - Available Trips is now the landing page */}

        {activeTab === 'available' && (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Available Transport Requests</h3>
                  <p className="text-sm text-gray-500">Accept or decline available transport requests</p>
                </div>
                <button
                  onClick={loadTrips}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {availableTrips.map((trip) => (
                  <div key={trip.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">Patient {trip.patientId}</h4>
                            <p className="text-sm text-gray-500">
                              {trip.origin} → {trip.destination}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Level:</span> {trip.transportLevel}
                          </div>
                          <div>
                            <span className="font-medium">Distance:</span> {trip.distance}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span> {trip.estimatedTime}
                          </div>
                          <div>
                            <span className="font-medium">Priority:</span> {trip.urgencyLevel}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleAcceptTrip(trip.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineTrip(trip.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {availableTrips.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No available transport requests at this time.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accepted' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">My Accepted Trips</h3>
              <button
                onClick={loadTrips}
                disabled={loading}
                className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {acceptedTrips.map((trip) => (
                <div key={trip.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <h4 className="text-lg font-medium text-gray-900">Patient {trip.patientId}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                          {trip.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {trip.origin} → {trip.destination}
                      </p>
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Pickup Time:</span> {trip.pickupTime}
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      {trip.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateTripStatus(trip.id, 'IN_PROGRESS')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                          Start Trip
                        </button>
                      )}
                      {trip.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleUpdateTripStatus(trip.id, 'COMPLETED')}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
                        >
                          Complete Trip
                        </button>
                      )}
                      {trip.status === 'COMPLETED' && (
                        <span className="text-sm text-gray-500">Completed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {acceptedTrips.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No accepted trips at this time.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics tab removed - moved to TCC Admin dashboard */}

        {activeTab === 'revenue-settings' && (
          <AgencySettings user={user} />
        )}

        {activeTab === 'units' && (
          <>
            {console.log('🔍 EMSDashboard: Rendering UnitsManagement component, activeTab:', activeTab)}
            <UnitsManagement user={user} />
          </>
        )}

        {/* Settings tab removed - moved to TCC Admin dashboard */}
        {false && activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Agency Information Settings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Agency Settings</h3>
                <p className="text-sm text-gray-500">Update your agency information</p>
              </div>
            <div className="p-6">
              {settingsSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Agency information updated successfully!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {settingsError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {settingsError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Agency Name</label>
                    <input
                      type="text"
                      value={settingsData.agencyName}
                      onChange={handleSettingsChange}
                      name="agencyName"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <input
                      type="text"
                      value={settingsData.contactName}
                      onChange={handleSettingsChange}
                      name="contactName"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={settingsData.email}
                      onChange={handleSettingsChange}
                      name="email"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={settingsData.phone}
                      onChange={handleSettingsChange}
                      name="phone"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Type</label>
                  <select
                    value={settingsData.serviceType}
                    onChange={handleSettingsChange}
                    name="serviceType"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="BLS">BLS Only</option>
                    <option value="ALS">ALS Only</option>
                    <option value="BLS/ALS">BLS/ALS</option>
                    <option value="Critical Care">Critical Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={settingsData.address}
                    onChange={handleSettingsChange}
                    name="address"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={settingsData.city}
                      onChange={handleSettingsChange}
                      name="city"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      value={settingsData.state}
                      onChange={handleSettingsChange}
                      name="state"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                    <input
                      type="text"
                      value={settingsData.zipCode}
                      onChange={handleSettingsChange}
                      name="zipCode"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleSettingsCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {settingsLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Revenue Calculation Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Revenue Calculation Settings</h3>
              <p className="text-sm text-gray-500">Configure pricing rates and see real-time revenue projections</p>
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

                {/* Priority Multipliers */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Priority Multipliers</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Low Priority</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.priorityMultipliers.LOW}
                        onChange={handleRevenueSettingsChange}
                        name="priorityMultipliers.LOW"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Medium Priority</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.priorityMultipliers.MEDIUM}
                        onChange={handleRevenueSettingsChange}
                        name="priorityMultipliers.MEDIUM"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">High Priority</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.priorityMultipliers.HIGH}
                        onChange={handleRevenueSettingsChange}
                        name="priorityMultipliers.HIGH"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Urgent Priority</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.priorityMultipliers.URGENT}
                        onChange={handleRevenueSettingsChange}
                        name="priorityMultipliers.URGENT"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Surcharge */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Additional Fees</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Special Requirements Surcharge ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={revenueSettings.specialSurcharge}
                        onChange={handleRevenueSettingsChange}
                        name="specialSurcharge"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Preview */}
              {revenuePreview && (
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Revenue Preview</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Sample trip: {revenuePreview.sampleTrip.transportLevel} transport, {revenuePreview.sampleTrip.priority} priority, 
                    {revenuePreview.sampleTrip.distanceMiles} miles, {revenuePreview.sampleTrip.insuranceCompany} insurance
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-md border">
                      <h5 className="text-sm font-medium text-gray-700">Standard Rate</h5>
                      <p className="text-2xl font-bold text-gray-900">${revenuePreview.standardRevenue}</p>
                      <p className="text-xs text-gray-500">Base rate × priority</p>
                    </div>
                    <div className="bg-white p-4 rounded-md border">
                      <h5 className="text-sm font-medium text-gray-700">Mileage Rate</h5>
                      <p className="text-2xl font-bold text-gray-900">${revenuePreview.mileageRevenue}</p>
                      <p className="text-xs text-gray-500">Base + (per mile × distance)</p>
                    </div>
                    <div className="bg-white p-4 rounded-md border">
                      <h5 className="text-sm font-medium text-gray-700">Insurance Rate</h5>
                      <p className="text-2xl font-bold text-gray-900">${revenuePreview.insuranceRevenue}</p>
                      <p className="text-xs text-gray-500">Insurance rate + mileage</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    // Save revenue settings to localStorage
                    localStorage.setItem('ems_revenue_settings', JSON.stringify(revenueSettings));
                    alert('Revenue settings saved!');
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Save Revenue Settings
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default EMSDashboard;