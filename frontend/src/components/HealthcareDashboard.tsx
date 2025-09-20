import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  AlertTriangle,
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
  const [activeTab, setActiveTab] = useState('create');
  const [agencyResponses, setAgencyResponses] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [trips, setTrips] = useState([
    {
      id: '1',
      patientId: 'P001',
      destination: 'General Hospital',
      transportLevel: 'BLS',
      status: 'PENDING',
      requestTime: '2025-09-07 10:30 AM',
      priority: 'MEDIUM',
      urgencyLevel: 'Urgent'
    },
    {
      id: '2',
      patientId: 'P002',
      destination: 'Rehabilitation Center',
      transportLevel: 'ALS',
      status: 'ACCEPTED',
      requestTime: '2025-09-07 09:15 AM',
      priority: 'HIGH',
      urgencyLevel: 'Emergent'
    },
    {
      id: '3',
      patientId: 'P003',
      destination: 'Emergency Room',
      transportLevel: 'CCT',
      status: 'IN_PROGRESS',
      requestTime: '2025-09-07 08:45 AM',
      priority: 'HIGH',
      urgencyLevel: 'Emergent'
    },
    {
      id: '4',
      patientId: 'P004',
      destination: 'Outpatient Clinic',
      transportLevel: 'BLS',
      status: 'COMPLETED',
      requestTime: '2025-09-07 07:30 AM',
      priority: 'LOW',
      urgencyLevel: 'Routine'
    }
  ]);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [updating, setUpdating] = useState(false);

  // Load trips from API
  useEffect(() => {
    loadTrips();
  }, []);

  // Load agency responses when responses tab is active
  useEffect(() => {
    if (activeTab === 'responses') {
      loadAgencyResponses();
    }
  }, [activeTab]);

  // Function to get urgency level styling
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
            pickupLocation: trip.pickupLocation,
            transportLevel: trip.transportLevel || 'BLS',
            status: trip.status,
            requestTime: new Date(trip.createdAt).toLocaleString(),
            priority: trip.priority,
            urgencyLevel: trip.urgencyLevel
          }));
          setTrips(transformedTrips);
        }
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  const handleEditTrip = (trip: any) => {
    setEditingTrip(trip);
    setEditFormData({
      status: trip.status,
      transportLevel: trip.transportLevel,
      urgencyLevel: trip.urgencyLevel || trip.priority
    });
  };

  const handleUpdateTrip = async () => {
    if (!editingTrip) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/trips/${editingTrip.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editFormData.status,
          ...(editFormData.status === 'COMPLETED' && { completionTimestamp: new Date().toISOString() })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update trip');
      }

      // Reload trips to get updated data
      await loadTrips();
      setEditingTrip(null);
      setEditFormData({});
    } catch (error: any) {
      console.error('Error updating trip:', error);
      alert(error.message || 'Failed to update trip');
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to mark this trip as completed?')) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          completionTimestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete trip');
      }

      // Reload trips to get updated data
      await loadTrips();
    } catch (error: any) {
      console.error('Error completing trip:', error);
      alert(error.message || 'Failed to complete trip');
    } finally {
      setUpdating(false);
    }
  };

  // Settings state

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  // Agency Response Management Functions
  const loadAgencyResponses = async (tripId?: string) => {
    setLoadingResponses(true);
    try {
      const url = tripId ? `/api/agency-responses?tripId=${tripId}` : '/api/agency-responses';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAgencyResponses(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading agency responses:', error);
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleSelectAgency = async (tripId: string, agencyResponseId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/agency-responses/select/${tripId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agencyResponseId: agencyResponseId,
          selectionNotes: reason || 'Selected by healthcare provider'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to select agency');
      }

      // Reload responses and trips
      await loadAgencyResponses(tripId);
      await loadTrips();
    } catch (error: any) {
      console.error('Error selecting agency:', error);
      alert(error.message || 'Failed to select agency');
    }
  };

  const handleViewResponses = async (trip: any) => {
    setSelectedTrip(trip);
    await loadAgencyResponses(trip.id);
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
              { id: 'trips', name: 'Transport Requests', icon: Clock },
              { id: 'responses', name: 'Agency Responses', icon: Bell },
              { id: 'create', name: 'Create Request', icon: Plus },
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
        {activeTab === 'trips' && (
          <div className="space-y-6">
            {/* Summary Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-md bg-yellow-500">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pending Requests
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {trips.filter(trip => trip.status === 'PENDING').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-md bg-green-500">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Completed Today
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {trips.filter(trip => trip.status === 'COMPLETED').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-md bg-red-500">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          High Priority
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {trips.filter(trip => trip.urgencyLevel === 'Emergent' || trip.priority === 'HIGH').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transport Requests List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Transport Requests</h3>
              </div>
              <div className="p-6">
              {trips.length > 0 ? (
                <div className="space-y-4">
                  {trips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Patient ID: {trip.patientId} - {trip.destination}
                          </p>
                          {trip.pickupLocation && (
                            <p className="text-xs text-blue-600">
                              Pickup: {trip.pickupLocation.name}
                              {trip.pickupLocation.floor && ` (Floor ${trip.pickupLocation.floor})`}
                              {trip.pickupLocation.room && ` - Room ${trip.pickupLocation.room}`}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {trip.transportLevel} • {trip.urgencyLevel || trip.priority} • {trip.requestTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                          {trip.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyLevelStyle(trip.urgencyLevel || trip.priority)}`}>
                          {trip.urgencyLevel || trip.priority}
                        </span>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleViewResponses(trip)}
                            className="text-purple-600 hover:text-purple-900 text-xs px-2 py-1 rounded hover:bg-purple-50"
                          >
                            View Responses
                          </button>
                          <button
                            onClick={() => handleEditTrip(trip)}
                            className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 rounded hover:bg-blue-50"
                            disabled={updating}
                          >
                            Edit
                          </button>
                          {trip.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleCompleteTrip(trip.id)}
                              className="text-green-600 hover:text-green-900 text-xs px-2 py-1 rounded hover:bg-green-50"
                              disabled={updating}
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transport requests found</p>
                </div>
              )}
              </div>
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

        {activeTab === 'responses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Agency Responses</h2>
              <button
                onClick={() => loadAgencyResponses()}
                disabled={loadingResponses}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingResponses ? 'Loading...' : 'Refresh Responses'}
              </button>
            </div>

            {/* Response Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-md bg-blue-500">
                        <Bell className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Responses
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {agencyResponses.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-md bg-green-500">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Accepted
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {agencyResponses.filter(r => r.response === 'ACCEPTED').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-md bg-red-500">
                        <X className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Declined
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {agencyResponses.filter(r => r.response === 'DECLINED').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-md bg-yellow-500">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Selected
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {agencyResponses.filter(r => r.isSelected).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Response List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Agency Response Details
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  View and manage agency responses for transport requests
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {loadingResponses ? (
                  <li className="px-4 py-5 sm:px-6">
                    <div className="text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
                        Loading agency responses...
                      </div>
                    </div>
                  </li>
                ) : agencyResponses.length === 0 ? (
                  <li className="px-4 py-5 sm:px-6">
                    <div className="text-center text-gray-500">
                      No agency responses found. Create a transport request to see responses.
                    </div>
                  </li>
                ) : (
                  agencyResponses.map((response) => (
                    <li key={response.id} className="px-4 py-5 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-md ${
                              response.response === 'ACCEPTED' ? 'bg-green-100' : 
                              response.response === 'DECLINED' ? 'bg-red-100' : 'bg-gray-100'
                            }`}>
                              {response.response === 'ACCEPTED' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : response.response === 'DECLINED' ? (
                                <X className="h-5 w-5 text-red-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                Agency {response.agencyId}
                              </p>
                              {response.isSelected && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              Trip ID: {response.tripId}
                            </p>
                            {response.responseNotes && (
                              <p className="text-sm text-gray-600 mt-1">
                                {response.responseNotes}
                              </p>
                            )}
                            {response.estimatedArrival && (
                              <p className="text-sm text-gray-500 mt-1">
                                ETA: {new Date(response.estimatedArrival).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            response.response === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            response.response === 'DECLINED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {response.response}
                          </span>
                          {response.response === 'ACCEPTED' && !response.isSelected && (
                            <button
                              onClick={() => handleSelectAgency(response.tripId, response.id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                            >
                              Select Agency
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}


        {activeTab === 'hospital-settings' && (
          <HospitalSettings />
        )}
      </main>

      {/* Edit Trip Modal */}
      {editingTrip && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Trip Details</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateTrip(); }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transport Level
                  </label>
                  <select
                    value={editFormData.transportLevel}
                    onChange={(e) => setEditFormData({...editFormData, transportLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="BLS">BLS - Basic Life Support</option>
                    <option value="ALS">ALS - Advanced Life Support</option>
                    <option value="CCT">CCT - Critical Care Transport</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <select
                    value={editFormData.urgencyLevel}
                    onChange={(e) => setEditFormData({...editFormData, urgencyLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergent">Emergent</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTrip(null);
                      setEditFormData({});
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Trip'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthcareDashboard;
