import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, TrendingUp, DollarSign, Building2, Truck } from 'lucide-react';
import { emsAnalyticsAPI, tccAnalyticsAPI } from '../services/api';

interface OverviewProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    agencyName?: string;
  };
}

const Overview: React.FC<OverviewProps> = ({ user }) => {
  const [loading, setLoading] = useState(false); // Start as false, will be set to true when user is available
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [trips, setTrips] = useState<any>(null);

  // Debug logging
  console.log('TCC_DEBUG: Overview component render - user:', user);

  const loadAgencyAnalytics = async () => {
    console.log('TCC_DEBUG: loadAgencyAnalytics called with user:', user);
    
    // Safety check - don't proceed if user is not available
    if (!user || !user.userType) {
      console.warn('TCC_DEBUG: Cannot load analytics - user not available:', user);
      setError('User information not available');
      setLoading(false);
      return;
    }

    console.log('TCC_DEBUG: Starting analytics load for user type:', user.userType);
    setLoading(true);
    setError(null);
    try {
      let ovr, trs;
      
      // Use appropriate API based on user type
      if (user.userType === 'EMS') {
        console.log('TCC_DEBUG: Calling EMS analytics API');
        [ovr, trs] = await Promise.all([
          emsAnalyticsAPI.getOverview(),
          emsAnalyticsAPI.getTrips(),
        ]);
      } else {
        console.log('TCC_DEBUG: Calling TCC analytics API');
        // For ADMIN and other user types, use TCC analytics
        [ovr, trs] = await Promise.all([
          tccAnalyticsAPI.getOverview(),
          tccAnalyticsAPI.getTrips(),
        ]);
      }

      console.log('TCC_DEBUG: Analytics API responses - overview:', ovr.data, 'trips:', trs.data);
      setOverview(ovr.data?.data || null);
      setTrips(trs.data?.data || null);
      console.log('TCC_DEBUG: Analytics data set - overview:', ovr.data?.data, 'trips:', trs.data?.data);
    } catch (err) {
      console.error('TCC_DEBUG: Analytics loading error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Load analytics data when user is available
  useEffect(() => {
    console.log('TCC_DEBUG: Overview useEffect triggered with user:', user);
    if (user && user.userType) {
      console.log('TCC_DEBUG: User available, calling loadAgencyAnalytics');
      loadAgencyAnalytics();
    } else {
      console.log('TCC_DEBUG: User not available, skipping analytics load');
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {(!user || !user.userType) && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading user information...</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading analytics data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && user && user.userType && (
        <>
          {/* Header */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.userType === 'EMS' 
                    ? (overview?.agencyName || user.agencyName || 'Your Agency')
                    : 'TCC System Overview'
                  }
                </h2>
                <p className="text-sm text-gray-500">
                  {user.userType === 'EMS' 
                    ? 'Agency Performance Dashboard'
                    : 'Transportation Coordination Center Analytics'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="text-sm font-medium text-gray-900">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {user.userType === 'EMS' ? (
              // EMS User Metrics
              <>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Trips</dt>
                          <dd className="text-lg font-medium text-gray-900">{overview?.totalTrips || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Activity className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                          <dd className="text-lg font-medium text-gray-900">{overview?.completedTrips || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Efficiency</dt>
                          <dd className="text-lg font-medium text-gray-900">{overview?.efficiency ? `${(overview.efficiency * 100).toFixed(1)}%` : '0%'}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Avg Response</dt>
                          <dd className="text-lg font-medium text-gray-900">{overview?.averageResponseTime ? `${overview.averageResponseTime.toFixed(1)} min` : '0 min'}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // TCC Admin Metrics
              <>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Healthcare Facilities</dt>
                          <dd className="text-lg font-medium text-gray-900">{overview?.totalFacilities || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Truck className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">EMS Agencies</dt>
                          <dd className="text-lg font-medium text-gray-900">{overview?.totalAgencies || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Units</dt>
                          <dd className="text-lg font-medium text-gray-900">{overview?.totalUnits || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Units</dt>
                          <dd className="text-lg font-medium text-gray-900">{overview?.activeUnits || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Trip Statistics - Only for EMS users */}
          {user.userType === 'EMS' && trips && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Trip Status Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Completed</span>
                    <span className="text-sm font-medium text-gray-900">{trips.completedTrips || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Pending</span>
                    <span className="text-sm font-medium text-gray-900">{trips.pendingTrips || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Cancelled</span>
                    <span className="text-sm font-medium text-gray-900">{trips.cancelledTrips || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transport Level Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">BLS</span>
                    <span className="text-sm font-medium text-gray-900">{trips.tripsByLevel?.BLS || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">ALS</span>
                    <span className="text-sm font-medium text-gray-900">{trips.tripsByLevel?.ALS || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">CCT</span>
                    <span className="text-sm font-medium text-gray-900">{trips.tripsByLevel?.CCT || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State Message */}
          {user.userType === 'EMS' && overview && overview.totalTrips === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-blue-400" />
                <h3 className="mt-2 text-sm font-medium text-blue-900">No Trips Yet</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Your agency hasn't been assigned any trips yet. Once trips are assigned, 
                  you'll see detailed analytics and performance metrics here.
                </p>
              </div>
            </div>
          )}
          {user.userType !== 'EMS' && overview && overview.totalFacilities === 0 && overview.totalAgencies === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
              <div className="text-center">
                <Building2 className="mx-auto h-12 w-12 text-blue-400" />
                <h3 className="mt-2 text-sm font-medium text-blue-900">No Facilities or Agencies Yet</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Healthcare facilities and EMS agencies will appear here once they register with the system.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Overview;