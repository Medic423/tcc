import React, { useState, useEffect } from 'react';
import { Edit, Trash2, XCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface Unit {
  id: string;
  agencyId: string;
  unitNumber: string;
  type: string;
  capabilities: string[];
  currentStatus: string;
  currentLocation: string | null;
  isActive: boolean;
  assignedTripId: string | null;
  lastStatusUpdate: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    reason: string;
  }>;
  currentTripDetails: any;
  lastKnownLocation: any;
  locationUpdatedAt: string | null;
  totalTripsCompleted: number;
  averageResponseTime: number | null;
  lastMaintenanceDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Agency {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea: string[];
  capabilities: string[];
  totalUnits: number;
  availableUnits: number;
  isActive: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const TCCUnitsManagement: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Edit modal state
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editFormData, setEditFormData] = useState({
    unitNumber: '',
    type: '',
    capabilities: [] as string[],
    currentStatus: '',
    isActive: true
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Fetch agencies first
      const agenciesResponse = await api.get('/api/tcc/agencies');

      if (!agenciesResponse.data?.success) {
        throw new Error(`Failed to fetch agencies: ${agenciesResponse.data?.message || 'Unknown error'}`);
      }

      const agenciesData = agenciesResponse.data;
      console.log('🔍 TCCUnitsManagement: Agencies response:', agenciesData);
      
      if (agenciesData.success) {
        setAgencies(agenciesData.data || []);
      }

      // Fetch units from all agencies
      const unitsResponse = await api.get('/api/tcc/units');

      if (!unitsResponse.data?.success) {
        throw new Error(`Failed to fetch units: ${unitsResponse.data?.message || 'Unknown error'}`);
      }

      const unitsData = unitsResponse.data;
      console.log('🔍 TCCUnitsManagement: Units response:', unitsData);
      
      if (unitsData.success) {
        setUnits(unitsData.data || []);
        console.log('🔍 TCCUnitsManagement: Units count:', unitsData.data?.length || 0);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getAgencyName = (agencyId: string) => {
    const agency = agencies.find(a => a.id === agencyId);
    return agency ? agency.name : `Agency ${agencyId}`;
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setEditFormData({
      unitNumber: unit.unitNumber,
      type: unit.type,
      capabilities: unit.capabilities,
      currentStatus: unit.currentStatus,
      isActive: unit.isActive
    });
    setEditError(null);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'capabilities') {
      // Handle capabilities as a multi-select
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions, option => option.value);
      setEditFormData(prev => ({
        ...prev,
        capabilities: selectedOptions
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const response = await api.put(`/api/tcc/units/${editingUnit.id}`, editFormData);
      
      if (response.data.success) {
        // Update the units list
        setUnits(units.map(unit => 
          unit.id === editingUnit.id 
            ? { ...unit, ...editFormData, updatedAt: new Date().toISOString() }
            : unit
        ));
        setEditingUnit(null);
      } else {
        setEditError(response.data.error || 'Failed to update unit');
      }
    } catch (error: any) {
      console.error('Error updating unit:', error);
      setEditError(error.response?.data?.error || 'Failed to update unit');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingUnit(null);
    setEditFormData({
      unitNumber: '',
      type: '',
      capabilities: [],
      currentStatus: '',
      isActive: true
    });
    setEditError(null);
  };

  const handleDelete = async (unitId: string) => {
    if (!window.confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/api/tcc/units/${unitId}`);
      
      if (response.data.success) {
        // Remove the unit from the list
        setUnits(units.filter(unit => unit.id !== unitId));
      } else {
        setError(response.data.error || 'Failed to delete unit');
      }
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      setError(error.response?.data?.error || 'Failed to delete unit');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'COMMITTED': return 'bg-blue-100 text-blue-800';
      case 'OUT_OF_SERVICE': return 'bg-red-100 text-red-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'AMBULANCE': return 'bg-red-100 text-red-800';
      case 'WHEELCHAIR_VAN': return 'bg-blue-100 text-blue-800';
      case 'CRITICAL_CARE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUnits = units.filter(unit => {
    const agencyMatch = selectedAgency === 'all' || unit.agencyId === selectedAgency;
    const statusMatch = statusFilter === 'all' || unit.currentStatus === statusFilter;
    return agencyMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchData}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Units Management</h2>
          <p className="text-gray-600">Manage and monitor all EMS units across agencies</p>
        </div>
        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Units</p>
              <p className="text-2xl font-semibold text-gray-900">{units.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-semibold text-gray-900">
                {units.filter(u => u.currentStatus === 'AVAILABLE').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Committed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {units.filter(u => u.currentStatus === 'COMMITTED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Service</p>
              <p className="text-2xl font-semibold text-gray-900">
                {units.filter(u => u.currentStatus === 'OUT_OF_SERVICE').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Agency
            </label>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Agencies</option>
              {agencies.map(agency => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="COMMITTED">Committed</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Units ({filteredUnits.length})
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            All EMS units across all agencies
          </p>
        </div>
        <div className="border-t border-gray-200">
          {filteredUnits.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No units found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedAgency === 'all' && statusFilter === 'all' 
                  ? 'No units have been created yet.' 
                  : 'No units match the current filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capabilities
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trips Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Update
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {unit.unitNumber}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {unit.unitNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {unit.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getAgencyName(unit.agencyId)}</div>
                        <div className="text-sm text-gray-500">{unit.agencyId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(unit.type)}`}>
                          {unit.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(unit.currentStatus)}`}>
                          {unit.currentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {unit.capabilities.map((capability, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                            >
                              {capability}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {unit.totalTripsCompleted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(unit.lastStatusUpdate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(unit)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit unit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(unit.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete unit"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Unit Modal */}
      {editingUnit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Unit</h3>
                <button
                  onClick={handleEditCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              {editError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{editError}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Number *</label>
                  <input
                    type="text"
                    name="unitNumber"
                    value={editFormData.unitNumber}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Type *</label>
                  <select
                    name="type"
                    value={editFormData.type}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="AMBULANCE">Ambulance</option>
                    <option value="WHEELCHAIR_VAN">Wheelchair Van</option>
                    <option value="CRITICAL_CARE">Critical Care</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Capabilities</label>
                  <select
                    name="capabilities"
                    multiple
                    value={editFormData.capabilities}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    size={4}
                  >
                    <option value="BLS">BLS</option>
                    <option value="ALS">ALS</option>
                    <option value="CCT">Critical Care Transport</option>
                    <option value="WHEELCHAIR">Wheelchair</option>
                    <option value="STRETCHER">Stretcher</option>
                    <option value="VENTILATOR">Ventilator</option>
                    <option value="CARDIAC">Cardiac Monitoring</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple capabilities</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Status *</label>
                  <select
                    name="currentStatus"
                    value={editFormData.currentStatus}
                    onChange={handleEditInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="COMMITTED">Committed</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editFormData.isActive}
                    onChange={handleEditInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Unit is active
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {editLoading ? 'Updating...' : 'Update Unit'}
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

export default TCCUnitsManagement;
