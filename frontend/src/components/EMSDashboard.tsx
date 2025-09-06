import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Filter,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { tripsAPI } from '../services/api';

interface TransportRequest {
  id: string;
  patientId: string;
  transportLevel: string;
  priority: string;
  status: string;
  specialRequirements?: string;
  requestTimestamp: string;
  acceptedTimestamp?: string;
  pickupTimestamp?: string;
  completionTimestamp?: string;
  assignedAgencyId?: string;
  assignedUnitId?: string;
  readyStart?: string;
  readyEnd?: string;
  isolation: boolean;
  bariatric: boolean;
  originFacility?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  destinationFacility?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  createdBy?: {
    id: string;
    name: string;
    hospitalName: string;
  };
}

interface Filters {
  status: string;
  transportLevel: string;
  priority: string;
}

const EMSDashboard: React.FC = () => {
  const [trips, setTrips] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    status: '',
    transportLevel: '',
    priority: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTrips();
  }, [filters]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tripsAPI.getAll(filters);
      
      if (response.data.success) {
        setTrips(response.data.data || []);
      } else {
        setError(response.data.error || 'Failed to load transport requests');
      }
    } catch (error: any) {
      console.error('TCC_DEBUG: Error loading trips:', error);
      setError(error.response?.data?.error || 'Failed to load transport requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStatusUpdate = async (tripId: string, status: string, eta?: string) => {
    try {
      setUpdating(tripId);
      setError(null);
      
      const updateData: any = { status };
      
      if (status === 'ACCEPTED' && eta) {
        updateData.acceptedTimestamp = new Date().toISOString();
        updateData.assignedAgencyId = 'temp-agency-id'; // TODO: Get from authenticated user
      }
      
      if (status === 'IN_PROGRESS') {
        updateData.pickupTimestamp = new Date().toISOString();
      }
      
      if (status === 'COMPLETED') {
        updateData.completionTimestamp = new Date().toISOString();
      }

      const response = await tripsAPI.updateStatus(tripId, updateData);
      
      if (response.data.success) {
        // Reload trips to get updated data
        await loadTrips();
      } else {
        setError(response.data.error || 'Failed to update transport request');
      }
    } catch (error: any) {
      console.error('TCC_DEBUG: Error updating trip status:', error);
      setError(error.response?.data?.error || 'Failed to update transport request');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'ACCEPTED': return 'text-blue-600 bg-blue-100';
      case 'IN_PROGRESS': return 'text-purple-600 bg-purple-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransportLevelColor = (level: string) => {
    switch (level) {
      case 'CCT': return 'text-purple-600 bg-purple-100';
      case 'ALS': return 'text-blue-600 bg-blue-100';
      case 'BLS': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTimeWindow = (start?: string, end?: string) => {
    if (!start || !end) return 'Not specified';
    return `${formatDateTime(start)} - ${formatDateTime(end)}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Truck className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Transport Requests</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button
                onClick={loadTrips}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transport Level</label>
                <select
                  value={filters.transportLevel}
                  onChange={(e) => handleFilterChange('transportLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Levels</option>
                  <option value="BLS">BLS</option>
                  <option value="ALS">ALS</option>
                  <option value="CCT">CCT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Trips List */}
      {!loading && (
        <div className="space-y-4">
          {trips.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transport requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                {Object.values(filters).some(f => f) ? 'No requests match your filters.' : 'No transport requests available.'}
              </p>
            </div>
          ) : (
            trips.map((trip) => (
              <div key={trip.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(trip.priority)}`}>
                        {trip.priority}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransportLevelColor(trip.transportLevel)}`}>
                        {trip.transportLevel}
                      </span>
                      {trip.isolation && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Isolation
                        </span>
                      )}
                      {trip.bariatric && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                          <User className="h-3 w-3 mr-1" />
                          Bariatric
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Patient ID: {trip.patientId}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="font-medium">From:</span>
                            <span className="ml-1">
                              {trip.originFacility?.name} - {trip.originFacility?.city}, {trip.originFacility?.state}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="font-medium">To:</span>
                            <span className="ml-1">
                              {trip.destinationFacility?.name} - {trip.destinationFacility?.city}, {trip.destinationFacility?.state}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="font-medium">Ready Window:</span>
                            <span className="ml-1">{formatTimeWindow(trip.readyStart, trip.readyEnd)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="font-medium">Requested:</span>
                            <span className="ml-1">{formatDateTime(trip.requestTimestamp)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {trip.specialRequirements && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Special Requirements:</h4>
                            <p className="text-sm text-gray-600">{trip.specialRequirements}</p>
                          </div>
                        )}
                        
                        {trip.createdBy && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Requested by:</span> {trip.createdBy.name} ({trip.createdBy.hospitalName})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {trip.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(trip.id, 'ACCEPTED')}
                          disabled={updating === trip.id}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {updating === trip.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(trip.id, 'CANCELLED')}
                          disabled={updating === trip.id}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline
                        </button>
                      </>
                    )}
                    
                    {trip.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleStatusUpdate(trip.id, 'IN_PROGRESS')}
                        disabled={updating === trip.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {updating === trip.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Truck className="h-4 w-4 mr-2" />
                        )}
                        Start Transport
                      </button>
                    )}
                    
                    {trip.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusUpdate(trip.id, 'COMPLETED')}
                        disabled={updating === trip.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {updating === trip.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EMSDashboard;
