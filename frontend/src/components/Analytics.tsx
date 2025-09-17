import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, DollarSign, Settings } from 'lucide-react';
import RevenueOptimizationPanel from './RevenueOptimizationPanel';
import RevenueSettings from './RevenueSettings';
import { analyticsAPI } from '../services/api';

interface SystemOverview {
  totalHospitals: number;
  totalAgencies: number;
  totalFacilities: number;
  activeHospitals: number;
  activeAgencies: number;
  activeFacilities: number;
  totalUnits: number;
  activeUnits: number;
}

interface TripStatistics {
  totalTrips: number;
  pendingTrips: number;
  acceptedTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  tripsByLevel: {
    BLS: number;
    ALS: number;
    CCT: number;
  };
  tripsByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [tripStats, setTripStats] = useState<TripStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', name: 'System Overview', icon: BarChart3 },
    { id: 'revenue', name: 'Revenue Optimization', icon: DollarSign },
    { id: 'revenue-settings', name: 'Revenue Settings', icon: Settings },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'units', name: 'Unit Management', icon: Activity },
  ];

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Analytics: Loading analytics data...');
      
      const [overviewResponse, tripsResponse] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getTrips()
      ]);

      console.log('🔍 Analytics: Overview response:', overviewResponse);
      console.log('🔍 Analytics: Trips response:', tripsResponse);

      if (overviewResponse.data?.success) {
        console.log('🔍 Analytics: Setting overview data:', overviewResponse.data.data);
        setOverview(overviewResponse.data.data);
      } else {
        console.warn('🔍 Analytics: Overview response not successful:', overviewResponse.data);
      }

      if (tripsResponse.data?.success) {
        console.log('🔍 Analytics: Setting trip stats data:', tripsResponse.data.data);
        setTripStats(tripsResponse.data.data);
      } else {
        console.warn('🔍 Analytics: Trips response not successful:', tripsResponse.data);
      }
    } catch (err: any) {
      console.error('🔍 Analytics: Error loading analytics data:', err);
      setError(err.response?.data?.error || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          View system-wide analytics, performance metrics, and revenue optimization across all agencies.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800">{error}</div>
            </div>
          ) : (
            <>
              {/* System Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Healthcare Facilities</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {overview?.totalHospitals || 0}
                            <span className="text-sm text-green-600 ml-2">
                              ({overview?.activeHospitals || 0} active)
                            </span>
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
                        <Activity className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">EMS Agencies</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {overview?.totalAgencies || 0}
                            <span className="text-sm text-green-600 ml-2">
                              ({overview?.activeAgencies || 0} active)
                            </span>
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
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">EMS Units</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {overview?.totalUnits || 0}
                            <span className="text-sm text-green-600 ml-2">
                              ({overview?.activeUnits || 0} active)
                            </span>
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
                        <DollarSign className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Trips</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {tripStats?.totalTrips || 0}
                            <span className="text-sm text-blue-600 ml-2">
                              ({tripStats?.pendingTrips || 0} pending)
                            </span>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Statistics */}
              {tripStats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Trips by Transport Level</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">BLS</span>
                        <span className="text-sm font-medium text-gray-900">{tripStats.tripsByLevel?.BLS || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">ALS</span>
                        <span className="text-sm font-medium text-gray-900">{tripStats.tripsByLevel?.ALS || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">CCT</span>
                        <span className="text-sm font-medium text-gray-900">{tripStats.tripsByLevel?.CCT || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Trips by Priority</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Low</span>
                        <span className="text-sm font-medium text-gray-900">{tripStats.tripsByPriority?.LOW || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Medium</span>
                        <span className="text-sm font-medium text-gray-900">{tripStats.tripsByPriority?.MEDIUM || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">High</span>
                        <span className="text-sm font-medium text-gray-900">{tripStats.tripsByPriority?.HIGH || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Urgent</span>
                        <span className="text-sm font-medium text-gray-900">{tripStats.tripsByPriority?.URGENT || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'revenue' && (
        <RevenueOptimizationPanel 
          showBackhaulPairs={true}
          showUnitManagement={true}
          title="Revenue Optimization Analytics"
        />
      )}

      {activeTab === 'revenue-settings' && (
        <RevenueSettings />
      )}

      {activeTab === 'performance' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-2 text-sm font-medium text-gray-900">Performance Dashboard</h4>
            <p className="mt-1 text-sm text-gray-500">
              Performance metrics and historical data will be displayed here.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'units' && (
        <RevenueOptimizationPanel 
          showBackhaulPairs={false}
          showUnitManagement={true}
          title="Unit Management Analytics"
        />
      )}
    </div>
  );
};

export default Analytics;
