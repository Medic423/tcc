import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  type: string;
  capabilities: string[];
  region: string;
  isActive: boolean;
  requiresReview: boolean;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

const Hospitals: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tcc/hospitals', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hospitals');
      }

      const data = await response.json();
      setHospitals(data.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hospitalId: string) => {
    try {
      const response = await fetch(`/api/tcc/hospitals/${hospitalId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve hospital');
      }

      const data = await response.json();
      console.log('Hospital approved:', data);
      
      // Refresh the hospitals list
      await fetchHospitals();
    } catch (err) {
      console.error('Error approving hospital:', err);
      setError('Failed to approve hospital');
    }
  };

  const handleReject = async (hospitalId: string) => {
    try {
      const response = await fetch(`/api/tcc/hospitals/${hospitalId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reject hospital');
      }

      const data = await response.json();
      console.log('Hospital rejected:', data);
      
      // Refresh the hospitals list
      await fetchHospitals();
    } catch (err) {
      console.error('Error rejecting hospital:', err);
      setError('Failed to reject hospital');
    }
  };

  const handleEdit = (hospitalId: string) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (hospital) {
      // For now, redirect to registration page with a note about editing
      // In the future, this could open a dedicated edit modal
      alert(`To edit "${hospital.name}", you'll be redirected to the registration form. This will be improved in the next update.`);
      // Clear the current session and redirect to main page for registration
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/?register=healthcare';
    }
  };

  const handleDelete = async (hospitalId: string) => {
    if (!window.confirm('Are you sure you want to delete this hospital? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/tcc/hospitals/${hospitalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete hospital');
      }

      const data = await response.json();
      console.log('Hospital deleted:', data);
      
      // Refresh the hospitals list
      await fetchHospitals();
    } catch (err) {
      console.error('Error deleting hospital:', err);
      setError('Failed to delete hospital');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading hospitals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <XCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading hospitals</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Healthcare Facilities</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage healthcare facilities in the system. {hospitals.length} facilities found.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Healthcare Facilities List</h3>
            <button 
              onClick={() => {
                // Clear the current session and redirect to main page for registration
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Redirect to main page with healthcare registration parameter
                window.location.href = '/?register=healthcare';
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Healthcare Facility
            </button>
          </div>
        </div>

        {hospitals.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hospitals found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new hospital.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hospitals.map((hospital) => (
                  <tr key={hospital.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                        <div className="text-sm text-gray-500">{hospital.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {hospital.city}, {hospital.state} {hospital.zipCode}
                      </div>
                      <div className="text-sm text-gray-500">{hospital.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {hospital.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {hospital.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : hospital.requiresReview ? (
                          <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          hospital.isActive 
                            ? 'text-green-800' 
                            : hospital.requiresReview 
                            ? 'text-yellow-800' 
                            : 'text-red-800'
                        }`}>
                          {hospital.isActive 
                            ? 'Active' 
                            : hospital.requiresReview 
                            ? 'Pending Review' 
                            : 'Inactive'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {hospital.requiresReview && (
                          <>
                            <button
                              onClick={() => handleApprove(hospital.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(hospital.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleEdit(hospital.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit hospital"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(hospital.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete hospital"
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
  );
};

export default Hospitals;
