import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  LogOut,
  Settings,
  BarChart3
} from 'lucide-react';
import Notifications from './Notifications';
import UnitsManagement from './UnitsManagement';
import EMSAnalytics from './EMSAnalytics';

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
  const [activeTab, setActiveTab] = useState('available');
  
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
  
  // Trip management state
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [acceptedTrips, setAcceptedTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Editing state
  const [editingTrip, setEditingTrip] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    pickupTime: ''
  });
  const [updating, setUpdating] = useState(false);

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
            origin: trip.fromLocation,
            destination: trip.toLocation,
            pickupLocation: trip.pickupLocation,
            transportLevel: trip.transportLevel || 'BLS',
            priority: trip.urgencyLevel || trip.priority, // Use urgencyLevel if available, fallback to priority
            distance: '12.5 miles', // Mock data
            estimatedTime: '25 minutes', // Mock data
            revenue: '$150', // Mock data
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
            origin: trip.fromLocation,
            destination: trip.toLocation,
            pickupLocation: trip.pickupLocation,
            transportLevel: trip.transportLevel || 'BLS',
            priority: trip.urgencyLevel || trip.priority, // Use urgencyLevel if available, fallback to priority
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
      // Navigate back to available trips tab after successful save
      setActiveTab('available');
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
    // Navigate back to available trips tab
    setActiveTab('available');
  };

  const handleAcceptTrip = async (tripId: string) => {
    try {
      // Use new agency response system
      const response = await fetch('/api/agency-responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId: tripId,
          agencyId: user.id, // Using user ID as agency ID for now
          response: 'ACCEPTED',
          responseNotes: 'Agency accepted this transport request',
          estimatedArrival: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now
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
      // Use new agency response system
      const response = await fetch('/api/agency-responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId: tripId,
          agencyId: user.id, // Using user ID as agency ID for now
          response: 'DECLINED',
          responseNotes: 'Agency declined this transport request'
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

  const handleEditTrip = (trip: any) => {
    setEditingTrip(trip.id);
    setEditFormData({
      status: trip.status,
      pickupTime: trip.pickupTime === 'Not started' ? '' : trip.pickupTime
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async (tripId: string) => {
    setUpdating(true);
    try {
      const updateData: any = {
        status: editFormData.status
      };

      // If pickup time is provided and status is IN_PROGRESS or COMPLETED, add pickup timestamp
      if (editFormData.pickupTime && (editFormData.status === 'IN_PROGRESS' || editFormData.status === 'COMPLETED')) {
        updateData.pickupTimestamp = new Date(editFormData.pickupTime).toISOString();
      }

      // If status is COMPLETED, add completion timestamp
      if (editFormData.status === 'COMPLETED') {
        updateData.completionTimestamp = new Date().toISOString();
      }

      const response = await fetch(`/api/trips/${tripId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update trip');
      }

      // Reload trips to get updated data
      await loadTrips();
      setEditingTrip(null);
      setEditFormData({ status: '', pickupTime: '' });
    } catch (error: any) {
      console.error('Error updating trip:', error);
      setError(error.message || 'Failed to update trip');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTrip(null);
    setEditFormData({ status: '', pickupTime: '' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Emergent': return 'text-black bg-red-200';
      case 'Urgent': return 'text-black bg-orange-200';
      case 'Routine': return 'text-black bg-transparent';
      default: return 'text-gray-600 bg-gray-100';
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
              { id: 'analytics', name: 'Analytics', icon: BarChart3 },
              { id: 'settings', name: 'Settings', icon: User }
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
            
            {/* Summary Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Available Trips</p>
                    <p className="text-2xl font-semibold text-gray-900">{availableTrips.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Trips</p>
                    <p className="text-2xl font-semibold text-gray-900">{acceptedTrips.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed Today</p>
                    <p className="text-2xl font-semibold text-gray-900">8</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">$1,250</p>
                  </div>
                </div>
              </div>
            </div>
            
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableTrips.map((trip) => (
                      <React.Fragment key={trip.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">Patient {trip.patientId}</div>
                            <div className="text-sm text-gray-500">{trip.requestTime}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{trip.origin}</div>
                            <div className="text-sm text-gray-500">→ {trip.destination}</div>
                          </td>
                          <td className="px-6 py-4">
                            {trip.pickupLocation ? (
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{trip.pickupLocation.name}</div>
                                {trip.pickupLocation.floor && (
                                  <div className="text-gray-500">Floor: {trip.pickupLocation.floor}</div>
                                )}
                                {trip.pickupLocation.room && (
                                  <div className="text-gray-500">Room: {trip.pickupLocation.room}</div>
                                )}
                                {(trip.pickupLocation.contactPhone || trip.pickupLocation.contactEmail) && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    <div className="font-medium">Contact:</div>
                                    {trip.pickupLocation.contactPhone && (
                                      <div>{trip.pickupLocation.contactPhone}</div>
                                    )}
                                    {trip.pickupLocation.contactEmail && (
                                      <div>{trip.pickupLocation.contactEmail}</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">No specific location</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(trip.priority)}`}>
                              {trip.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAcceptTrip(trip.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-xs font-medium"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleDeclineTrip(trip.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-xs font-medium"
                              >
                                Decline
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="px-6 py-2 bg-gray-50">
                            <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                              <div><span className="font-medium">Level:</span> {trip.transportLevel}</div>
                              <div><span className="font-medium">Distance:</span> {trip.distance}</div>
                              <div><span className="font-medium">Time:</span> {trip.estimatedTime}</div>
                              <div><span className="font-medium">Revenue:</span> {trip.revenue}</div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {acceptedTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Patient {trip.patientId}</div>
                        <div className="text-sm text-gray-500">{trip.requestTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{trip.origin}</div>
                        <div className="text-sm text-gray-500">→ {trip.destination}</div>
                      </td>
                      <td className="px-6 py-4">
                        {trip.pickupLocation ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{trip.pickupLocation.name}</div>
                            {trip.pickupLocation.floor && (
                              <div className="text-gray-500">Floor: {trip.pickupLocation.floor}</div>
                            )}
                            {trip.pickupLocation.room && (
                              <div className="text-gray-500">Room: {trip.pickupLocation.room}</div>
                            )}
                            {(trip.pickupLocation.contactPhone || trip.pickupLocation.contactEmail) && (
                              <div className="text-xs text-blue-600 mt-1">
                                <div className="font-medium">Contact:</div>
                                {trip.pickupLocation.contactPhone && (
                                  <div>{trip.pickupLocation.contactPhone}</div>
                                )}
                                {trip.pickupLocation.contactEmail && (
                                  <div>{trip.pickupLocation.contactEmail}</div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No specific location</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTrip === trip.id ? (
                          <select
                            name="status"
                            value={editFormData.status}
                            onChange={handleEditFormChange}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={updating}
                          >
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                            {trip.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTrip === trip.id ? (
                          <input
                            type="datetime-local"
                            name="pickupTime"
                            value={editFormData.pickupTime}
                            onChange={handleEditFormChange}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={updating}
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{trip.pickupTime}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingTrip === trip.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSaveEdit(trip.id)}
                              disabled={updating}
                              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-xs font-medium disabled:opacity-50"
                            >
                              {updating ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={updating}
                              className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-xs font-medium disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditTrip(trip)}
                              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-xs font-medium"
                            >
                              Edit
                            </button>
                            {trip.status === 'ACCEPTED' && (
                              <button
                                onClick={() => handleUpdateTripStatus(trip.id, 'IN_PROGRESS')}
                                className="bg-orange-600 text-white px-3 py-1 rounded-md hover:bg-orange-700 text-xs font-medium"
                              >
                                Start Trip
                              </button>
                            )}
                            {trip.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleUpdateTripStatus(trip.id, 'COMPLETED')}
                                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-xs font-medium"
                              >
                                Complete Trip
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {acceptedTrips.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No accepted trips at this time.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <EMSAnalytics user={user} />
        )}


        {activeTab === 'units' && (
          <>
            {console.log('🔍 EMSDashboard: Rendering UnitsManagement component, activeTab:', activeTab)}
            <UnitsManagement user={user} />
          </>
        )}

        {activeTab === 'settings' && (
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
        )}
      </main>
    </div>
  );
};

export default EMSDashboard;