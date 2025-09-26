import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Edit, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Truck,
  MapPin,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Plus,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import { tripsAPI } from '../services/api';

interface Trip {
  id: string;
  tripNumber: string;
  patientId: string;
  fromLocation: string;
  toLocation: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  transportLevel: 'BLS' | 'ALS' | 'CCT' | 'Other';
  scheduledTime: string;
  assignedAgencyId?: string;
  assignedAgency?: {
    name: string;
  };
  urgencyLevel: 'Routine' | 'Urgent' | 'Emergent';
  diagnosis?: string;
  mobilityLevel?: string;
  oxygenRequired: boolean;
  monitoringRequired: boolean;
  pickupLocationId?: string;
  pickupLocation?: {
    id: string;
    name: string;
    description?: string;
    contactPhone?: string;
    contactEmail?: string;
    floor?: string;
    room?: string;
    hospital?: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface TripsViewProps {
  user: {
    id: string;
    userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS';
    facilityName?: string;
  };
}

interface TripTimelineEvent {
  event: string;
  timestamp: string;
  description: string;
}

// Trip Card Component
const TripCard: React.FC<{ 
  trip: Trip; 
  user: User; 
  onEditTrip: (trip: Trip) => void;
  onDeleteTrip: (trip: Trip) => void;
  onAcceptTrip: (trip: Trip) => void;
  onDeclineTrip: (trip: Trip) => void;
}> = ({ trip, user, onEditTrip, onDeleteTrip, onAcceptTrip, onDeclineTrip }) => {
  const [expanded, setExpanded] = useState(false);
  const [timeline, setTimeline] = useState<TripTimelineEvent[]>([]);

  // Build timeline for this trip
  useEffect(() => {
    const buildTimeline = () => {
      const events: TripTimelineEvent[] = [];
      
      if (trip.createdAt) {
        events.push({ 
          event: 'Trip Created', 
          timestamp: trip.createdAt,
          description: ''
        });
      }
      
      if (trip.requestTimestamp) {
        events.push({ 
          event: 'Request Sent', 
          timestamp: trip.requestTimestamp,
          description: ''
        });
      }
      
      if (trip.transferRequestTime) {
        events.push({ 
          event: 'Transfer Requested', 
          timestamp: trip.transferRequestTime,
          description: ''
        });
      }
      
      if (trip.acceptedTimestamp) {
        events.push({ 
          event: 'Accepted by EMS', 
          timestamp: trip.acceptedTimestamp,
          description: ''
        });
      }
      
      if (trip.emsArrivalTime) {
        events.push({ 
          event: 'EMS Arrived', 
          timestamp: trip.emsArrivalTime,
          description: ''
        });
      }
      
      if (trip.pickupTimestamp) {
        events.push({ 
          event: 'Patient Picked Up', 
          timestamp: trip.pickupTimestamp,
          description: ''
        });
      }
      
      if (trip.actualStartTime) {
        events.push({ 
          event: 'Trip Started', 
          timestamp: trip.actualStartTime,
          description: ''
        });
      }
      
      if (trip.actualEndTime) {
        events.push({ 
          event: 'Trip Ended', 
          timestamp: trip.actualEndTime,
          description: ''
        });
      }
      
      if (trip.completionTimestamp) {
        events.push({ 
          event: 'Trip Completed', 
          timestamp: trip.completionTimestamp,
          description: ''
        });
      }
      
      // Sort timeline by timestamp
      return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    };

    setTimeline(buildTimeline());
  }, [trip]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'EMERGENT':
        return 'bg-red-100 text-red-800';
      case 'URGENT':
        return 'bg-orange-100 text-orange-800';
      case 'ROUTINE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPriority = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'EMERGENT';
      case 'HIGH':
        return 'URGENT';
      case 'MEDIUM':
      case 'LOW':
        return 'ROUTINE';
      default:
        return priority;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg border">
      {/* Header Row */}
      <div className="bg-gray-50 px-6 py-3 border-b">
        <div className="grid grid-cols-5 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div>PATIENT</div>
          <div>ROUTE</div>
          <div>PICKUP LOCATION</div>
          <div>PRIORITY</div>
          <div>ACTIONS</div>
        </div>
      </div>

      {/* Main Information Row */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-5 gap-4">
          {/* Patient Column */}
          <div>
            <div className="font-bold text-gray-900">{trip.patientId}</div>
            <div className="text-sm text-gray-500">{formatDateTime(trip.scheduledTime)}</div>
          </div>

          {/* Route Column */}
          <div>
            <div className="text-sm text-gray-900">{trip.fromLocation}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <ChevronRight className="w-3 h-3 mr-1" />
              {trip.toLocation}
            </div>
          </div>

          {/* Pickup Location Column */}
          <div>
            {trip.pickupLocation ? (
              <div>
                <div className="font-bold text-gray-900">{trip.pickupLocation.name}</div>
                {trip.pickupLocation.floor && (
                  <div className="text-xs text-gray-500">Floor: {trip.pickupLocation.floor}</div>
                )}
                {trip.pickupLocation.room && (
                  <div className="text-xs text-gray-500">Room: {trip.pickupLocation.room}</div>
                )}
                <div className="text-xs text-blue-600 mt-1">
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    <span>Contact:</span>
                  </div>
                  <div className="text-blue-600">{trip.pickupLocation.contactPhone}</div>
                  <div className="text-blue-600">{trip.pickupLocation.contactEmail}</div>
                </div>
              </div>
            ) : (
              <span className="text-gray-400 italic">No specific location</span>
            )}
          </div>

          {/* Priority Column */}
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(formatPriority(trip.priority))}`}>
              {formatPriority(trip.priority)}
            </span>
          </div>

          {/* Actions Column */}
          <div className="flex flex-col space-y-1">
            <div className="flex space-x-1">
              <button 
                onClick={() => onAcceptTrip(trip)}
                className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-green-700"
              >
                Accept
              </button>
              <button 
                onClick={() => onDeclineTrip(trip)}
                className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-red-700"
              >
                Decline
              </button>
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => onEditTrip(trip)}
                className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-blue-700"
              >
                Edit
              </button>
              <button 
                onClick={() => onDeleteTrip(trip)}
                className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-gray-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details Row */}
      <div className="bg-gray-50 px-6 py-3 border-t">
        <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
          <div>Level: {trip.transportLevel}</div>
          <div>Distance: {trip.distanceMiles ? `${trip.distanceMiles} miles` : 'N/A'}</div>
          <div>Time: {trip.estimatedTripTimeMinutes ? `${trip.estimatedTripTimeMinutes} minutes` : 'N/A'}</div>
          <div>Revenue: {trip.tripCost ? `$${Number(trip.tripCost).toFixed(2)}` : 'N/A'}</div>
        </div>
      </div>

      {/* Timeline Section */}
      {timeline.length > 0 && (
        <div className="border-t">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-6 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between"
          >
            <span>Trip Timeline ({timeline.length} events)</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expanded && (
            <div className="px-6 pb-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                {timeline.map((event, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    <div className="flex-1 flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{event.event}</p>
                      <p className="text-xs text-gray-400">{formatDateTime(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TripsView: React.FC<TripsViewProps> = ({ user }) => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [transportFilter, setTransportFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [sortField, setSortField] = useState<keyof Trip>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Edit modal states
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [pickupLocations, setPickupLocations] = useState<any[]>([]);
  const [loadingPickupLocations, setLoadingPickupLocations] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Fetch all locations (hospitals and facilities)
  const fetchAllLocations = async () => {
    try {
      setLoadingLocations(true);
      const [hospitalsResponse, facilitiesResponse] = await Promise.all([
        fetch('/api/tcc/hospitals', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/tcc/facilities', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })
      ]);
      
      if (hospitalsResponse.ok) {
        const hospitalsData = await hospitalsResponse.json();
        setHospitals(hospitalsData.data || []);
      } else {
        console.error('Failed to fetch hospitals');
        setHospitals([]);
      }
      
      if (facilitiesResponse.ok) {
        const facilitiesData = await facilitiesResponse.json();
        setFacilities(facilitiesData.data || []);
      } else {
        console.error('Failed to fetch facilities');
        setFacilities([]);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setHospitals([]);
      setFacilities([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Fetch pickup locations for a hospital
  const fetchPickupLocations = async (hospitalId: string) => {
    try {
      setLoadingPickupLocations(true);
      const response = await fetch(`/api/tcc/pickup-locations/hospital/${hospitalId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPickupLocations(data.data || []);
      } else {
        console.error('Failed to fetch pickup locations');
        setPickupLocations([]);
      }
    } catch (error) {
      console.error('Error fetching pickup locations:', error);
      setPickupLocations([]);
    } finally {
      setLoadingPickupLocations(false);
    }
  };

  // Handler functions
  const handleEditTrip = async (trip: Trip) => {
    setEditingTrip(trip);
    setEditModalOpen(true);
    
    // Fetch all locations and pickup locations
    await Promise.all([
      fetchAllLocations(),
      trip.hospitalId ? fetchPickupLocations(trip.hospitalId) : Promise.resolve()
    ]);
  };

  const handleDeleteTrip = async (trip: Trip) => {
    if (window.confirm(`Are you sure you want to delete trip ${trip.tripNumber}?`)) {
      try {
        console.log('Deleting trip:', trip.id);
        await tripsAPI.delete(trip.id);
        
        // Remove the trip from the local state
        setTrips(prevTrips => prevTrips.filter(t => t.id !== trip.id));
        setFilteredTrips(prevTrips => prevTrips.filter(t => t.id !== trip.id));
        
        console.log('Trip deleted successfully');
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete trip. Please try again.');
      }
    }
  };

  const handleAcceptTrip = async (trip: Trip) => {
    try {
      console.log('Accepting trip:', trip.id);
      await tripsAPI.update(trip.id, {
        status: 'ACCEPTED',
        acceptedTimestamp: new Date().toISOString()
      });
      
      // Update the trip in local state
      setTrips(prevTrips => 
        prevTrips.map(t => 
          t.id === trip.id 
            ? { ...t, status: 'ACCEPTED' as const, acceptedTimestamp: new Date().toISOString() }
            : t
        )
      );
      setFilteredTrips(prevTrips => 
        prevTrips.map(t => 
          t.id === trip.id 
            ? { ...t, status: 'ACCEPTED' as const, acceptedTimestamp: new Date().toISOString() }
            : t
        )
      );
      
      console.log('Trip accepted successfully');
    } catch (error) {
      console.error('Error accepting trip:', error);
      alert('Failed to accept trip. Please try again.');
    }
  };

  const handleDeclineTrip = async (trip: Trip) => {
    if (window.confirm(`Are you sure you want to decline trip ${trip.tripNumber}?`)) {
      try {
        console.log('Declining trip:', trip.id);
        await tripsAPI.update(trip.id, {
          status: 'DECLINED'
        });
        
        // Update the trip in local state
        setTrips(prevTrips => 
          prevTrips.map(t => 
            t.id === trip.id 
              ? { ...t, status: 'DECLINED' as const }
              : t
          )
        );
        setFilteredTrips(prevTrips => 
          prevTrips.map(t => 
            t.id === trip.id 
              ? { ...t, status: 'DECLINED' as const }
              : t
          )
        );
        
        console.log('Trip declined successfully');
      } catch (error) {
        console.error('Error declining trip:', error);
        alert('Failed to decline trip. Please try again.');
      }
    }
  };

  // Fetch trips data
  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripsAPI.getAll();
      if (response.data.success) {
        // Transform API data to match component expectations
        const transformedTrips = response.data.data.map((trip: any) => ({
          ...trip,
          // Backend already has the correct field names, no transformation needed
          // Just ensure urgencyLevel is properly set
          urgencyLevel: trip.urgencyLevel || trip.priority, // Fallback to priority
          // Transform pickup_locations to pickupLocation for frontend compatibility
          pickupLocation: trip.pickup_locations ? {
            id: trip.pickup_locations.id,
            name: trip.pickup_locations.name,
            description: trip.pickup_locations.description,
            contactPhone: trip.pickup_locations.contactPhone,
            contactEmail: trip.pickup_locations.contactEmail,
            floor: trip.pickup_locations.floor,
            room: trip.pickup_locations.room,
            hospital: trip.pickup_locations.hospitals ? {
              id: trip.pickup_locations.hospitals.id,
              name: trip.pickup_locations.hospitals.name
            } : undefined
          } : undefined
        }));
        setTrips(transformedTrips);
        setFilteredTrips(transformedTrips);
        setLastRefresh(new Date());
      } else {
        setError(response.data.error || 'Failed to fetch trips');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTrips();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchTrips, 30000);
    return () => clearInterval(interval);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...trips];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(trip => 
        trip.tripNumber.toLowerCase().includes(term) ||
        trip.patientId.toLowerCase().includes(term) ||
        trip.fromLocation.toLowerCase().includes(term) ||
        trip.toLocation.toLowerCase().includes(term) ||
        (trip.assignedAgency?.name || '').toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(trip => trip.priority === priorityFilter);
    }

    // Transport level filter
    if (transportFilter !== 'ALL') {
      filtered = filtered.filter(trip => trip.transportLevel === transportFilter);
    }

    // Date filter
    if (dateFilter !== 'ALL') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case '24H':
          filterDate.setHours(now.getHours() - 24);
          break;
        case '7D':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30D':
          filterDate.setDate(now.getDate() - 30);
          break;
      }
      
      if (dateFilter !== 'ALL') {
        filtered = filtered.filter(trip => new Date(trip.createdAt) >= filterDate);
      }
    }

    // Hospital filter (for non-admin users)
    if (user.userType !== 'ADMIN' && user.facilityName) {
      filtered = filtered.filter(trip => 
        trip.fromLocation.toLowerCase().includes(user.facilityName!.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTrips(filtered);
  }, [trips, searchTerm, statusFilter, priorityFilter, transportFilter, dateFilter, hospitalFilter, sortField, sortDirection, user]);

  // Handle sort
  const handleSort = (field: keyof Trip) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      ACCEPTED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      DECLINED: { color: 'bg-orange-100 text-orange-800', icon: X },
      IN_PROGRESS: { color: 'bg-purple-100 text-purple-800', icon: Truck },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: { color: 'bg-gray-100 text-gray-800' },
      MEDIUM: { color: 'bg-yellow-100 text-yellow-800' },
      HIGH: { color: 'bg-orange-100 text-orange-800' },
      CRITICAL: { color: 'bg-red-100 text-red-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.LOW;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {priority}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Trip Number',
      'Patient ID',
      'From Location',
      'Pickup Location',
      'Pickup Floor',
      'Pickup Room',
      'Pickup Contact',
      'To Location',
      'Status',
      'Priority',
      'Transport Level',
      'Scheduled Time',
      'Assigned Agency',
      'Created At'
    ];
    
    const csvData = filteredTrips.map(trip => [
      trip.tripNumber,
      trip.patientId,
      trip.fromLocation,
      trip.pickupLocation?.name || 'N/A',
      trip.pickupLocation?.floor || 'N/A',
      trip.pickupLocation?.room || 'N/A',
      trip.pickupLocation?.contactPhone || trip.pickupLocation?.contactEmail || 'N/A',
      trip.toLocation,
      trip.status,
      trip.priority,
      trip.transportLevel,
      formatDate(trip.scheduledTime),
      trip.assignedAgency?.name || 'Unassigned',
      formatDate(trip.createdAt)
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trips-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // View trip details
  const viewTripDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowTripModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all transport requests
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTrips}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <button
          onClick={() => navigate('/dashboard/trips/create')}
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-green-500">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Create Trip</dt>
                  <dd className="text-lg font-semibold text-gray-900">New Transport Request</dd>
                </dl>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => window.location.href = '/dashboard/units'}
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-500">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Units</dt>
                  <dd className="text-lg font-semibold text-gray-900">Manage Units</dd>
                </dl>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => window.location.href = '/dashboard/route-optimization'}
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-purple-500">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Route Optimization</dt>
                  <dd className="text-lg font-semibold text-gray-900">Optimize Routes</dd>
                </dl>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-500">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Trips</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{trips.length}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {trips.filter(t => t.status === 'PENDING').length}
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
                <div className="p-3 rounded-md bg-purple-500">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {trips.filter(t => t.status === 'IN_PROGRESS').length}
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {trips.filter(t => t.status === 'COMPLETED').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Search</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search trips..."
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              {/* Transport Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Transport Level</label>
                <select
                  value={transportFilter}
                  onChange={(e) => setTransportFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="ALL">All Levels</option>
                  <option value="BLS">BLS</option>
                  <option value="ALS">ALS</option>
                  <option value="CCT">CCT</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="ALL">All Time</option>
                  <option value="24H">Last 24 Hours</option>
                  <option value="7D">Last 7 Days</option>
                  <option value="30D">Last 30 Days</option>
                </select>
              </div>

              {/* Hospital Filter (Admin only) */}
              {user.userType === 'ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hospital</label>
                  <select
                    value={hospitalFilter}
                    onChange={(e) => setHospitalFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="ALL">All Hospitals</option>
                    {/* Add hospital options here */}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredTrips.length}</span> of{' '}
          <span className="font-medium">{trips.length}</span> trips
        </p>
        <p className="text-sm text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>

      {/* Trip Cards */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <TripCard 
            key={trip.id} 
            trip={trip} 
            user={user} 
            onEditTrip={handleEditTrip}
            onDeleteTrip={handleDeleteTrip}
            onAcceptTrip={handleAcceptTrip}
            onDeclineTrip={handleDeclineTrip}
          />
        ))}

        {filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No trips found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || transportFilter !== 'ALL' || dateFilter !== 'ALL'
                ? 'Try adjusting your filters to see more results.'
                : 'No trips have been created yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      {showTripModal && selectedTrip && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowTripModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Trip Details - {selectedTrip.tripNumber}
                  </h3>
                  <button
                    onClick={() => setShowTripModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.patientId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedTrip.status)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <div className="mt-1">{getPriorityBadge(selectedTrip.priority)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transport Level</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.transportLevel}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">From Location</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTrip.fromLocation}</p>
                  </div>
                  
                  {selectedTrip.pickupLocation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                      <div className="mt-1 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm font-medium text-gray-900">{selectedTrip.pickupLocation.name}</p>
                        {selectedTrip.pickupLocation.description && (
                          <p className="text-sm text-gray-600 mt-1">{selectedTrip.pickupLocation.description}</p>
                        )}
                        <div className="mt-2 space-y-1">
                          {selectedTrip.pickupLocation.floor && (
                            <p className="text-xs text-gray-500"><span className="font-medium">Floor:</span> {selectedTrip.pickupLocation.floor}</p>
                          )}
                          {selectedTrip.pickupLocation.room && (
                            <p className="text-xs text-gray-500"><span className="font-medium">Room:</span> {selectedTrip.pickupLocation.room}</p>
                          )}
                          {selectedTrip.pickupLocation.contactPhone && (
                            <p className="text-xs text-gray-500"><span className="font-medium">Phone:</span> {selectedTrip.pickupLocation.contactPhone}</p>
                          )}
                          {selectedTrip.pickupLocation.contactEmail && (
                            <p className="text-xs text-gray-500"><span className="font-medium">Email:</span> {selectedTrip.pickupLocation.contactEmail}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">To Location</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTrip.toLocation}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Scheduled Time</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTrip.scheduledTime)}</p>
                  </div>
                  
                  {selectedTrip.assignedAgency && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assigned Agency</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.assignedAgency.name}</p>
                    </div>
                  )}
                  
                  {selectedTrip.diagnosis && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.diagnosis}</p>
                    </div>
                  )}
                  
                  {selectedTrip.mobilityLevel && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mobility Level</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.mobilityLevel}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Oxygen Required</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.oxygenRequired ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Monitoring Required</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTrip.monitoringRequired ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowTripModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Trip Modal */}
      {editModalOpen && editingTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Trip: {editingTrip.tripNumber}
              </h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    value={editingTrip.patientId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trip Number
                  </label>
                  <input
                    type="text"
                    value={editingTrip.tripNumber}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Location
                  </label>
                  {loadingLocations ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                      Loading locations...
                    </div>
                  ) : (
                    <select
                      value={editingTrip.fromLocation}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setEditingTrip({
                        ...editingTrip,
                        fromLocation: e.target.value
                      })}
                    >
                      <option value="">Select from location</option>
                      {hospitals.map((hospital) => (
                        <option key={hospital.id} value={hospital.name}>
                          {hospital.name} - {hospital.city}, {hospital.state}
                        </option>
                      ))}
                      {facilities.map((facility) => (
                        <option key={facility.id} value={facility.name}>
                          {facility.name} - {facility.city}, {facility.state}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Location
                  </label>
                  {loadingLocations ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                      Loading locations...
                    </div>
                  ) : (
                    <select
                      value={editingTrip.toLocation}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setEditingTrip({
                        ...editingTrip,
                        toLocation: e.target.value
                      })}
                    >
                      <option value="">Select to location</option>
                      {hospitals.map((hospital) => (
                        <option key={hospital.id} value={hospital.name}>
                          {hospital.name} - {hospital.city}, {hospital.state}
                        </option>
                      ))}
                      {facilities.map((facility) => (
                        <option key={facility.id} value={facility.name}>
                          {facility.name} - {facility.city}, {facility.state}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pick-up Location
                </label>
                {loadingPickupLocations ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    Loading pickup locations...
                  </div>
                ) : (
                  <select
                    value={editingTrip.pickupLocationId || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setEditingTrip({
                      ...editingTrip,
                      pickupLocationId: e.target.value || undefined
                    })}
                  >
                    <option value="">Select a pickup location</option>
                    {pickupLocations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                        {location.floor && ` - Floor ${location.floor}`}
                        {location.room && `, Room ${location.room}`}
                      </option>
                    ))}
                  </select>
                )}
                {editingTrip.pickupLocation && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-gray-900">{editingTrip.pickupLocation.name}</p>
                    {editingTrip.pickupLocation.description && (
                      <p className="text-sm text-gray-600 mt-1">{editingTrip.pickupLocation.description}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {editingTrip.pickupLocation.floor && (
                        <p className="text-xs text-gray-500"><span className="font-medium">Floor:</span> {editingTrip.pickupLocation.floor}</p>
                      )}
                      {editingTrip.pickupLocation.room && (
                        <p className="text-xs text-gray-500"><span className="font-medium">Room:</span> {editingTrip.pickupLocation.room}</p>
                      )}
                      {editingTrip.pickupLocation.contactPhone && (
                        <p className="text-xs text-gray-500"><span className="font-medium">Phone:</span> {editingTrip.pickupLocation.contactPhone}</p>
                      )}
                      {editingTrip.pickupLocation.contactEmail && (
                        <p className="text-xs text-gray-500"><span className="font-medium">Email:</span> {editingTrip.pickupLocation.contactEmail}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingTrip.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setEditingTrip({
                      ...editingTrip,
                      status: e.target.value as Trip['status']
                    })}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="DECLINED">Declined</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={editingTrip.priority}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setEditingTrip({
                      ...editingTrip,
                      priority: e.target.value as Trip['priority']
                    })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transport Level
                  </label>
                  <select
                    value={editingTrip.transportLevel}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setEditingTrip({
                      ...editingTrip,
                      transportLevel: e.target.value as Trip['transportLevel']
                    })}
                  >
                    <option value="BLS">BLS</option>
                    <option value="ALS">ALS</option>
                    <option value="CCT">CCT</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="datetime-local"
                    value={new Date(editingTrip.scheduledTime).toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setEditingTrip({
                      ...editingTrip,
                      scheduledTime: new Date(e.target.value).toISOString()
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={editingTrip.urgencyLevel}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setEditingTrip({
                      ...editingTrip,
                      urgencyLevel: e.target.value as Trip['urgencyLevel']
                    })}
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergent">Emergent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    value={editingTrip.diagnosis || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setEditingTrip({
                      ...editingTrip,
                      diagnosis: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobility Level
                  </label>
                  <select
                    value={editingTrip.mobilityLevel || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setEditingTrip({
                      ...editingTrip,
                      mobilityLevel: e.target.value
                    })}
                  >
                    <option value="">Select mobility level</option>
                    <option value="Ambulatory">Ambulatory</option>
                    <option value="Wheelchair">Wheelchair</option>
                    <option value="Stretcher">Stretcher</option>
                    <option value="Bed">Bed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingTrip.oxygenRequired}
                    onChange={(e) => setEditingTrip({
                      ...editingTrip,
                      oxygenRequired: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Oxygen Required</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingTrip.monitoringRequired}
                    onChange={(e) => setEditingTrip({
                      ...editingTrip,
                      monitoringRequired: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Monitoring Required</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingTrip) return;
                  
                  try {
                    console.log('Saving trip changes:', editingTrip);
                    
                    // Update the trip via API
                    await tripsAPI.update(editingTrip.id, {
                      status: editingTrip.status,
                      priority: editingTrip.priority,
                      transportLevel: editingTrip.transportLevel,
                      scheduledTime: editingTrip.scheduledTime,
                      urgencyLevel: editingTrip.urgencyLevel,
                      diagnosis: editingTrip.diagnosis,
                      mobilityLevel: editingTrip.mobilityLevel,
                      oxygenRequired: editingTrip.oxygenRequired,
                      monitoringRequired: editingTrip.monitoringRequired,
                      pickupLocationId: editingTrip.pickupLocationId,
                      fromLocation: editingTrip.fromLocation,
                      toLocation: editingTrip.toLocation
                    });
                    
                    // Update the trip in local state
                    setTrips(prevTrips => 
                      prevTrips.map(t => 
                        t.id === editingTrip.id ? editingTrip : t
                      )
                    );
                    setFilteredTrips(prevTrips => 
                      prevTrips.map(t => 
                        t.id === editingTrip.id ? editingTrip : t
                      )
                    );
                    
                    setEditModalOpen(false);
                    console.log('Trip updated successfully');
                  } catch (error) {
                    console.error('Error updating trip:', error);
                    alert('Failed to update trip. Please try again.');
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsView;
