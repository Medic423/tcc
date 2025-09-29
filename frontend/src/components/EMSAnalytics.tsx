import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, DollarSign, Settings } from 'lucide-react';
import RevenueSettings from './RevenueSettings';
import { emsAnalyticsAPI } from '../services/api';

interface EMSAnalyticsProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    agencyName?: string;
  };
}

const EMSAnalytics: React.FC<EMSAnalyticsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('performance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<any>(null);
  const [trips, setTrips] = useState<any>(null);
  const [units, setUnits] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);

  const tabs = [
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'revenue-settings', name: 'Revenue Settings', icon: Settings },
  ];

  const loadAgencyAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovr, trs, unt, perf] = await Promise.all([
        emsAnalyticsAPI.getOverview(),
        emsAnalyticsAPI.getTrips(),
        emsAnalyticsAPI.getUnits(),
        emsAnalyticsAPI.getPerformance(),
      ]);

      setOverview(ovr.data?.data || null);
      setTrips(trs.data?.data || null);
      setUnits(unt.data?.data || null);
      setPerformance(perf.data?.data || null);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load agency-specific analytics data
  useEffect(() => {
    loadAgencyAnalytics();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          View performance metrics and analytics for {user.agencyName || 'your agency'}.
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

          {!loading && !error && performance && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Avg Response Time</dt>
                          <dd className="text-lg font-medium text-gray-900">{performance.averageResponseTime ? `${performance.averageResponseTime.toFixed(1)} min` : '0 min'}</dd>
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
                          <dt className="text-sm font-medium text-gray-500 truncate">Avg Trip Time</dt>
                          <dd className="text-lg font-medium text-gray-900">{performance.averageTripTime ? `${performance.averageTripTime.toFixed(1)} min` : '0 min'}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BarChart3 className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                          <dd className="text-lg font-medium text-gray-900">{`${(performance.completionRate * 100).toFixed(1)}%`}</dd>
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
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                          <dd className="text-lg font-medium text-gray-900">${performance.totalRevenue ? performance.totalRevenue.toFixed(2) : '0.00'}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && !performance && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">No Performance Data</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Performance metrics will be displayed here when data is available.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Units tab removed as redundant */}

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

      {activeTab === 'revenue-settings' && (
        <RevenueSettings />
      )}
    </div>
  );
};

export default EMSAnalytics;
