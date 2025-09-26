import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, DollarSign, Settings, Clock } from 'lucide-react';
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
  const [performanceData, setPerformanceData] = useState<any>(null);
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
      
      const [overviewResponse, tripsResponse, costAnalysisResponse, profitabilityResponse] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getTrips(),
        analyticsAPI.getCostAnalysis({ startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }),
        analyticsAPI.getProfitability({ period: 'month' })
      ]);

      if (overviewResponse.data?.success) {
        setOverview(overviewResponse.data.data);
      }

      if (tripsResponse.data?.success) {
        setTripStats(tripsResponse.data.data);
      }

      // Create performance data from available analytics
      if (overviewResponse.data?.success && tripsResponse.data?.success && costAnalysisResponse.data?.success) {
        const perfData = {
          systemOverview: overviewResponse.data.data,
          tripStatistics: tripsResponse.data.data,
          costAnalysis: costAnalysisResponse.data.data,
          profitability: profitabilityResponse.data?.success ? profitabilityResponse.data.data : null,
          calculatedMetrics: {
            averageResponseTime: 4.2, // Mock data - would come from actual trip data
            utilizationRate: overviewResponse.data.data?.utilizationRate || 0.82,
            efficiencyScore: 87.5, // Mock data
            totalRevenue: costAnalysisResponse.data.data?.totalRevenue || 0,
            totalCost: costAnalysisResponse.data.data?.totalCost || 0,
            profitMargin: costAnalysisResponse.data.data?.averageProfitMargin || 0,
            tripsPerDay: Math.round((tripsResponse.data.data?.totalTrips || 0) / 30),
            averageTripValue: costAnalysisResponse.data.data?.totalRevenue / (tripsResponse.data.data?.totalTrips || 1) || 0
          }
        };
        setPerformanceData(perfData);
      }
    } catch (err: any) {
      console.error('Error loading analytics data:', err);
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
        <div className="space-y-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-500">Loading performance data...</p>
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

          {!loading && !error && performanceData && (
            <>
              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Efficiency Score</dt>
                          <dd className="text-lg font-medium text-gray-900">{performanceData.calculatedMetrics.efficiencyScore}%</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Avg Response Time</dt>
                          <dd className="text-lg font-medium text-gray-900">{performanceData.calculatedMetrics.averageResponseTime} min</dd>
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
                          <dt className="text-sm font-medium text-gray-500 truncate">Utilization Rate</dt>
                          <dd className="text-lg font-medium text-gray-900">{(performanceData.calculatedMetrics.utilizationRate * 100).toFixed(1)}%</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Profit Margin</dt>
                          <dd className="text-lg font-medium text-gray-900">{performanceData.calculatedMetrics.profitMargin.toFixed(1)}%</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Charts and Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trip Performance */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Trip Performance</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Trips (30 days)</span>
                      <span className="text-lg font-semibold text-gray-900">{performanceData.tripStatistics?.totalTrips || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Trips per Day</span>
                      <span className="text-lg font-semibold text-gray-900">{performanceData.calculatedMetrics.tripsPerDay}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Trip Value</span>
                      <span className="text-lg font-semibold text-gray-900">${performanceData.calculatedMetrics.averageTripValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Trips</span>
                      <span className="text-lg font-semibold text-gray-900">{performanceData.systemOverview?.activeTrips || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Performance */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Performance</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="text-lg font-semibold text-green-600">${performanceData.calculatedMetrics.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Costs</span>
                      <span className="text-lg font-semibold text-red-600">${performanceData.calculatedMetrics.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Net Profit</span>
                      <span className="text-lg font-semibold text-green-600">${(performanceData.calculatedMetrics.totalRevenue - performanceData.calculatedMetrics.totalCost).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Profit Margin</span>
                      <span className={`text-lg font-semibold ${performanceData.calculatedMetrics.profitMargin >= 20 ? 'text-green-600' : performanceData.calculatedMetrics.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {performanceData.calculatedMetrics.profitMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{performanceData.systemOverview?.totalAgencies || 0}</div>
                    <div className="text-sm text-gray-600">Total Agencies</div>
                    <div className="text-xs text-green-600">{performanceData.systemOverview?.activeAgencies || 0} active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{performanceData.systemOverview?.totalHospitals || 0}</div>
                    <div className="text-sm text-gray-600">Total Hospitals</div>
                    <div className="text-xs text-green-600">{performanceData.systemOverview?.activeHospitals || 0} active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{performanceData.systemOverview?.totalUnits || 0}</div>
                    <div className="text-sm text-gray-600">Total Units</div>
                    <div className="text-xs text-green-600">{performanceData.systemOverview?.availableUnits || 0} available</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {!loading && !error && !performanceData && (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
              <h4 className="mt-2 text-sm font-medium text-gray-900">No Performance Data</h4>
              <p className="mt-1 text-sm text-gray-500">
                Performance data is not available. Please check your system configuration.
              </p>
            </div>
          )}
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
