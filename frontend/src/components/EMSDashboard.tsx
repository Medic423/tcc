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
  Calendar,
  TrendingUp,
  Link,
  DollarSign,
  Activity
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

interface BackhaulPair {
  request1: TransportRequest;
  request2: TransportRequest;
  distance: number;
  timeWindow: number;
  revenueBonus: number;
  efficiency: number;
}

interface OptimizationMetrics {
  totalRevenue: number;
  loadedMileRatio: number;
  revenuePerHour: number;
  backhaulPairs: number;
  averageEfficiency: number;
  potentialRevenueIncrease: number;
}

interface Unit {
  id: string;
  unitNumber: string;
  status: string;
  capabilities: string[];
  currentLocation: {
    lat: number;
    lng: number;
  };
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
  
  // Optimization state
  const [showOptimization, setShowOptimization] = useState(false);
  const [backhaulPairs, setBackhaulPairs] = useState<BackhaulPair[]>([]);
  const [optimizationMetrics, setOptimizationMetrics] = useState<OptimizationMetrics | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    loadTrips();
    loadOptimizationData();
  }, [filters]);

  // Mock optimization data - in production this would come from API
  const loadOptimizationData = () => {
    // Mock backhaul pairs
    const mockBackhaulPairs: BackhaulPair[] = [
      {
        request1: trips[0],
        request2: trips[1],
        distance: 3.2,
        timeWindow: 15,
        revenueBonus: 25.0,
        efficiency: 0.85
      },
      {
        request1: trips[2],
        request2: trips[3],
        distance: 5.1,
        timeWindow: 30,
        revenueBonus: 25.0,
        efficiency: 0.72
      }
    ].filter(pair => pair.request1 && pair.request2);

    // Mock optimization metrics
    const mockMetrics: OptimizationMetrics = {
      totalRevenue: 1250.0,
      loadedMileRatio: 0.82,
      revenuePerHour: 45.5,
      backhaulPairs: mockBackhaulPairs.length,
      averageEfficiency: 0.78,
      potentialRevenueIncrease: 150.0
    };

    // Mock units
    const mockUnits: Unit[] = [
      {
        id: 'unit-001',
        unitNumber: 'A-101',
        status: 'AVAILABLE',
        capabilities: ['BLS', 'ALS'],
        currentLocation: { lat: 40.7128, lng: -74.0060 }
      },
      {
        id: 'unit-002',
        unitNumber: 'A-102',
        status: 'ON_CALL',
        capabilities: ['BLS'],
        currentLocation: { lat: 40.7589, lng: -73.9851 }
      },
      {
        id: 'unit-003',
        unitNumber: 'C-201',
        status: 'AVAILABLE',
        capabilities: ['BLS', 'ALS', 'CCT'],
        currentLocation: { lat: 40.7505, lng: -73.9934 }
      }
    ];

    setBackhaulPairs(mockBackhaulPairs);
    setOptimizationMetrics(mockMetrics);
    setUnits(mockUnits);
  };

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
                onClick={() => setShowOptimization(!showOptimization)}
                className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  showOptimization 
                    ? 'border-primary-500 text-primary-700 bg-primary-50 focus:ring-primary-500' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary-500'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Optimization
              </button>
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

        {/* Optimization Panel */}
        {showOptimization && (
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Analytics */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                {optimizationMetrics && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Revenue:</span>
                      <span className="text-sm font-medium text-gray-900">${optimizationMetrics.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue/Hour:</span>
                      <span className="text-sm font-medium text-gray-900">${optimizationMetrics.revenuePerHour.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Loaded Mile Ratio:</span>
                      <span className="text-sm font-medium text-gray-900">{(optimizationMetrics.loadedMileRatio * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Backhaul Opportunities */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Backhaul Opportunities</h3>
                  <Link className="h-5 w-5 text-blue-600" />
                </div>
                {optimizationMetrics && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Available Pairs:</span>
                      <span className="text-sm font-medium text-gray-900">{optimizationMetrics.backhaulPairs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Efficiency:</span>
                      <span className="text-sm font-medium text-gray-900">{(optimizationMetrics.averageEfficiency * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Potential Increase:</span>
                      <span className="text-sm font-medium text-green-600">+${optimizationMetrics.potentialRevenueIncrease.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Unit Management */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Unit Management</h3>
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Available Units:</span>
                    <span className="text-sm font-medium text-gray-900">{units.filter(u => u.status === 'AVAILABLE').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">On Call:</span>
                    <span className="text-sm font-medium text-gray-900">{units.filter(u => u.status === 'ON_CALL').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Units:</span>
                    <span className="text-sm font-medium text-gray-900">{units.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Backhaul Pairs List */}
            {backhaulPairs.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Recommended Backhaul Pairs</h4>
                <div className="space-y-3">
                  {backhaulPairs.slice(0, 3).map((pair, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Link className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">Pair #{index + 1}</span>
                          <span className="text-xs text-gray-500">Efficiency: {(pair.efficiency * 100).toFixed(1)}%</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">+${pair.revenueBonus.toFixed(2)} bonus</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Request 1:</span> {pair.request1?.patientId || 'N/A'} ({pair.request1?.transportLevel || 'N/A'})
                        </div>
                        <div>
                          <span className="font-medium">Request 2:</span> {pair.request2?.patientId || 'N/A'} ({pair.request2?.transportLevel || 'N/A'})
                        </div>
                        <div>
                          <span className="font-medium">Distance:</span> {pair.distance.toFixed(1)} miles
                        </div>
                        <div>
                          <span className="font-medium">Time Window:</span> {pair.timeWindow} minutes
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
