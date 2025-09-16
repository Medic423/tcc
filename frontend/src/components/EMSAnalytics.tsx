import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, DollarSign } from 'lucide-react';
import RevenueOptimizationPanel from './RevenueOptimizationPanel';
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
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'units', name: 'Unit Management', icon: Activity },
  ];

  // Load agency-specific analytics data
  useEffect(() => {
    loadAgencyAnalytics();
  }, []);

  const loadAgencyAnalytics = async () => {
    setLoading(true);
    try {
      // TODO: Implement agency-specific analytics API calls
      // This will be implemented in Phase 6
      console.log('Loading analytics for agency:', user.agencyName);
      
      // Placeholder API calls - will be implemented in Phase 6
      // const overview = await emsAnalyticsAPI.getOverview();
      // const trips = await emsAnalyticsAPI.getTrips();
      // const units = await emsAnalyticsAPI.getUnits();
      // const performance = await emsAnalyticsAPI.getPerformance();
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics loading error:', err);
    } finally {
      setLoading(false);
    }
  };

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
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Agency Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Agency Revenue (24h)
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : '$0.00'}
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
                    <Activity className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Trips
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : '0'}
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
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Efficiency
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : '0%'}
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
                    <BarChart3 className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completed Trips
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : '0'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agency Performance Chart Placeholder */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Agency Performance</h3>
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h4 className="mt-2 text-sm font-medium text-gray-900">Performance Dashboard</h4>
              <p className="mt-1 text-sm text-gray-500">
                Agency-specific performance metrics will be displayed here.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-2 text-sm font-medium text-gray-900">Performance Dashboard</h4>
            <p className="mt-1 text-sm text-gray-500">
              Agency performance metrics and historical data will be displayed here.
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
    </div>
  );
};

export default EMSAnalytics;
