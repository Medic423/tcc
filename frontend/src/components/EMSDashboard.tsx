import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  LogOut,
  Bell,
  Navigation
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [availableTrips, setAvailableTrips] = useState([
    {
      id: '1',
      patientId: 'P001',
      origin: 'General Hospital',
      destination: 'Rehabilitation Center',
      transportLevel: 'BLS',
      priority: 'MEDIUM',
      distance: '12.5 miles',
      estimatedTime: '25 minutes',
      revenue: '$150',
      requestTime: '2025-09-07 10:30 AM'
    },
    {
      id: '2',
      patientId: 'P002',
      origin: 'Urgent Care',
      destination: 'General Hospital',
      transportLevel: 'ALS',
      priority: 'HIGH',
      distance: '8.2 miles',
      estimatedTime: '18 minutes',
      revenue: '$275',
      requestTime: '2025-09-07 09:15 AM'
    }
  ]);

  const [acceptedTrips, setAcceptedTrips] = useState([
    {
      id: '3',
      patientId: 'P003',
      origin: 'Clinic',
      destination: 'Hospital',
      transportLevel: 'CCT',
      priority: 'LOW',
      status: 'EN_ROUTE',
      pickupTime: '2025-09-07 11:00 AM'
    }
  ]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const handleAcceptTrip = (tripId: string) => {
    const trip = availableTrips.find(t => t.id === tripId);
    if (trip) {
      setAvailableTrips(availableTrips.filter(t => t.id !== tripId));
      setAcceptedTrips([...acceptedTrips, { 
        ...trip, 
        status: 'ACCEPTED',
        pickupTime: new Date().toLocaleString()
      }]);
    }
  };

  const handleDeclineTrip = (tripId: string) => {
    setAvailableTrips(availableTrips.filter(t => t.id !== tripId));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
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
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
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
              { id: 'overview', name: 'Overview', icon: Truck },
              { id: 'available', name: 'Available Trips', icon: MapPin },
              { id: 'accepted', name: 'My Trips', icon: CheckCircle },
              { id: 'optimization', name: 'Route Optimization', icon: Navigation },
              { id: 'settings', name: 'Settings', icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
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
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-500">Recent trip assignments and completions will appear here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'available' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Available Transport Requests</h3>
                <p className="text-sm text-gray-500">Accept or decline available transport requests</p>
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
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(trip.priority)}`}>
                            {trip.priority}
                          </span>
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
                            <span className="font-medium">Revenue:</span> {trip.revenue}
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
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">My Accepted Trips</h3>
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
                    <div className="ml-4">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                        Update Status
                      </button>
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

        {activeTab === 'optimization' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Route Optimization</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Route Optimization</h3>
                <p className="text-gray-500 mb-6">
                  Advanced route optimization and revenue maximization features will be available here.
                </p>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Agency Name</label>
                  <input
                    type="text"
                    value={user.agencyName}
                    disabled
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Area</label>
                  <input
                    type="text"
                    value="50 mile radius"
                    disabled
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                  />
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