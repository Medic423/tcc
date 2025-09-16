import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  LogOut,
  Bell,
  X
} from 'lucide-react';
import Notifications from './Notifications';
import EnhancedTripForm from './EnhancedTripForm';
import HospitalSettings from './HospitalSettings';

interface HealthcareDashboardProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    facilityName?: string;
    facilityType?: string;
  };
  onLogout: () => void;
}


const HealthcareDashboard: React.FC<HealthcareDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [trips, setTrips] = useState([
    {
      id: '1',
      patientId: 'P001',
      destination: 'General Hospital',
      transportLevel: 'BLS',
      status: 'PENDING',
      requestTime: '2025-09-07 10:30 AM',
      priority: 'MEDIUM'
    },
    {
      id: '2',
      patientId: 'P002',
      destination: 'Rehabilitation Center',
      transportLevel: 'ALS',
      status: 'ACCEPTED',
      requestTime: '2025-09-07 09:15 AM',
      priority: 'HIGH'
    }
  ]);

  // Load trips from API
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const response = await fetch('/api/trips', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Transform API data to match component expectations
          const transformedTrips = data.data.map((trip: any) => ({
            id: trip.id,
            patientId: trip.patientName,
            destination: trip.toLocation,
            transportLevel: 'BLS', // Default since not in current schema
            status: trip.status,
            requestTime: new Date(trip.createdAt).toLocaleString(),
            priority: trip.priority
          }));
          setTrips(transformedTrips);
        }
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  // Settings state
  const [settingsData, setSettingsData] = useState({
    facilityName: user.facilityName || '',
    facilityType: user.facilityType || '',
    email: user.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError(null);

    try {
      console.log('TCC_DEBUG: Frontend sending facility update:', settingsData);
      console.log('TCC_DEBUG: Frontend token:', localStorage.getItem('token'));
      
      const response = await fetch('/api/auth/healthcare/facility/update', {
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
        throw new Error(errorData.error || 'Failed to update facility information');
      }

      const responseData = await response.json();
      console.log('TCC_DEBUG: Frontend success response:', responseData);

      setSettingsSuccess(true);
      // Navigate back to overview tab after successful save
      setActiveTab('overview');
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (error: any) {
      console.error('TCC_DEBUG: Frontend error updating facility:', error);
      setSettingsError(error.message || 'Failed to update facility information');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSettingsCancel = () => {
    setSettingsData({
      facilityName: user.facilityName || '',
      facilityType: user.facilityType || '',
      email: user.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    });
    setSettingsError(null);
    // Navigate back to overview tab
    setActiveTab('overview');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'ACCEPTED': return 'text-green-600 bg-green-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'COMPLETED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
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
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {user.facilityName || 'Healthcare Facility'}
                </h1>
                <p className="text-sm text-gray-500 capitalize">
                  {user.facilityType?.toLowerCase() || 'Healthcare'} • Healthcare Portal
                </p>
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
              { id: 'overview', name: 'Overview', icon: Building2 },
              { id: 'trips', name: 'Transport Requests', icon: Clock },
              { id: 'create', name: 'Create Request', icon: Plus },
              { id: 'settings', name: 'Settings', icon: User },
              { id: 'hospital-settings', name: 'Hospital Settings', icon: Building2 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {trips.filter(trip => trip.status === 'PENDING').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed Today</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {trips.filter(trip => trip.status === 'COMPLETED').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">High Priority</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {trips.filter(trip => trip.priority === 'HIGH' || trip.priority === 'CRITICAL').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {trips.length > 0 ? (
                  <div className="space-y-4">
                    {trips.slice(0, 5).map((trip) => (
                      <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            trip.status === 'PENDING' ? 'bg-yellow-400' :
                            trip.status === 'ACCEPTED' ? 'bg-green-400' :
                            trip.status === 'IN_PROGRESS' ? 'bg-blue-400' :
                            trip.status === 'COMPLETED' ? 'bg-gray-400' : 'bg-gray-400'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Patient {trip.patientId} - {trip.destination}
                            </p>
                            <p className="text-xs text-gray-500">
                              {trip.transportLevel} • {trip.priority} Priority • {trip.requestTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                            {trip.status}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(trip.priority)}`}>
                            {trip.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                    {trips.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        Showing 5 of {trips.length} recent requests
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent transport requests found.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Transport Requests</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trips.map((trip) => (
                    <tr key={trip.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {trip.patientId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trip.destination}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trip.transportLevel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(trip.priority)}`}>
                          {trip.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trip.requestTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div>
            <EnhancedTripForm 
              user={user} 
              onTripCreated={() => {
                // Refresh trips list and go to overview to see the new trip
                loadTrips();
                setActiveTab('overview');
              }}
              onCancel={() => {
                // Go back to overview tab when cancel is clicked
                setActiveTab('overview');
              }}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
            </div>
            <div className="p-6">
              {settingsSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Facility information updated successfully!
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {settingsError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Facility Name</label>
                  <input
                    type="text"
                    value={settingsData.facilityName}
                    onChange={handleSettingsChange}
                    name="facilityName"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Facility Type</label>
                  <input
                    type="text"
                    value={settingsData.facilityType}
                    onChange={handleSettingsChange}
                    name="facilityType"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <input
                    type="email"
                    value={settingsData.email}
                    onChange={handleSettingsChange}
                    name="email"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={settingsData.phone || ''}
                    onChange={handleSettingsChange}
                    name="phone"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    value={settingsData.address || ''}
                    onChange={handleSettingsChange}
                    name="address"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={settingsData.city || ''}
                      onChange={handleSettingsChange}
                      name="city"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      value={settingsData.state || ''}
                      onChange={handleSettingsChange}
                      name="state"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                  <input
                    type="text"
                    value={settingsData.zipCode || ''}
                    onChange={handleSettingsChange}
                    name="zipCode"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleSettingsCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {settingsLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'hospital-settings' && (
          <HospitalSettings />
        )}
      </main>
    </div>
  );
};

export default HealthcareDashboard;
