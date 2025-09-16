import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Settings,
  TrendingUp,
  Clock,
  MapPin,
  DollarSign,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import optimizationApi from '../services/optimizationApi';
import {
  Unit,
  TransportRequest,
  OptimizationResponse,
  BackhaulAnalysisResponse,
  RevenueAnalyticsResponse,
  PerformanceMetricsResponse,
  OptimizationWeights,
  OptimizationSettings
} from '../types/optimization';

interface RouteOptimizerProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    agencyName?: string;
  };
}

const RouteOptimizer: React.FC<RouteOptimizerProps> = ({ user }) => {
  // State management
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TransportRequest[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResponse | null>(null);
  const [backhaulAnalysis, setBackhaulAnalysis] = useState<BackhaulAnalysisResponse | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalyticsResponse | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetricsResponse | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  
  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    weights: {
      deadheadMiles: 0.5,
      waitTime: 0.1,
      backhaulBonus: 25.0,
      overtimeRisk: 2.0,
      baseRevenue: 1.0
    },
    constraints: {
      maxDeadheadMiles: 50,
      maxWaitTime: 120,
      maxOvertimeHours: 2,
      maxBackhaulDistance: 15,
      maxBackhaulTimeWindow: 90
    },
    autoOptimize: false,
    refreshInterval: 30
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto-refresh when enabled
  useEffect(() => {
    if (optimizationSettings.autoOptimize && selectedUnit && selectedRequests.length > 0) {
      const interval = setInterval(() => {
        runOptimization();
      }, optimizationSettings.refreshInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [optimizationSettings.autoOptimize, selectedUnit, selectedRequests, optimizationSettings.refreshInterval]);

  const loadInitialData = async () => {
    await Promise.all([
      loadAvailableUnits(),
      loadPendingRequests(),
      loadAnalytics()
    ]);
  };

  const loadAvailableUnits = async () => {
    setLoadingUnits(true);
    try {
      const units = await optimizationApi.getAvailableUnits();
      setAvailableUnits(units);
      if (units.length > 0 && !selectedUnit) {
        setSelectedUnit(units[0].id);
      }
    } catch (error) {
      console.error('Error loading units:', error);
      setError('Failed to load available units');
    } finally {
      setLoadingUnits(false);
    }
  };

  const loadPendingRequests = async () => {
    setLoadingRequests(true);
    try {
      const requests = await optimizationApi.getPendingRequests();
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error loading requests:', error);
      setError('Failed to load pending requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const [revenue, performance] = await Promise.all([
        optimizationApi.getRevenueAnalytics('24h'),
        optimizationApi.getPerformanceMetrics('24h')
      ]);
      
      setRevenueAnalytics(revenue);
      setPerformanceMetrics(performance);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const runOptimization = async () => {
    if (!selectedUnit || selectedRequests.length === 0) {
      setError('Please select a unit and at least one request');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [optimization, backhaul] = await Promise.all([
        optimizationApi.optimizeRoutes({
          unitId: selectedUnit,
          requestIds: selectedRequests,
          weights: optimizationSettings.weights,
          constraints: optimizationSettings.constraints
        }),
        optimizationApi.analyzeBackhaul(selectedRequests)
      ]);

      setOptimizationResults(optimization);
      setBackhaulAnalysis(backhaul);
    } catch (error) {
      console.error('Error running optimization:', error);
      setError('Failed to run optimization');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSelection = (requestId: string, selected: boolean) => {
    if (selected) {
      setSelectedRequests(prev => [...prev, requestId]);
    } else {
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleSelectAllRequests = () => {
    if (selectedRequests.length === pendingRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(pendingRequests.map(req => req.id));
    }
  };

  const handleSettingsChange = (field: string, value: any) => {
    setOptimizationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWeightsChange = (field: keyof OptimizationWeights, value: number) => {
    setOptimizationSettings(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [field]: value
      }
    }));
  };

  const handleConstraintsChange = (field: string, value: number) => {
    setOptimizationSettings(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      const success = await optimizationApi.saveOptimizationSettings(optimizationSettings);
      if (success) {
        setShowSettings(false);
        // Re-run optimization with new settings
        if (selectedUnit && selectedRequests.length > 0) {
          runOptimization();
        }
      } else {
        setError('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Route Optimization</h2>
          <p className="text-gray-600">Optimize routes for maximum efficiency and revenue</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
          <button
            onClick={runOptimization}
            disabled={loading || !selectedUnit || selectedRequests.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Optimizing...' : 'Run Optimization'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Optimization Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Optimization Weights */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Optimization Weights</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600">Deadhead Miles Penalty (α)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={optimizationSettings.weights.deadheadMiles}
                    onChange={(e) => handleWeightsChange('deadheadMiles', parseFloat(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Wait Time Penalty (β)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={optimizationSettings.weights.waitTime}
                    onChange={(e) => handleWeightsChange('waitTime', parseFloat(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Backhaul Bonus (γ)</label>
                  <input
                    type="number"
                    step="1"
                    value={optimizationSettings.weights.backhaulBonus}
                    onChange={(e) => handleWeightsChange('backhaulBonus', parseFloat(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Overtime Risk Penalty (δ)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={optimizationSettings.weights.overtimeRisk}
                    onChange={(e) => handleWeightsChange('overtimeRisk', parseFloat(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Constraints */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Constraints</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600">Max Deadhead Miles</label>
                  <input
                    type="number"
                    value={optimizationSettings.constraints.maxDeadheadMiles}
                    onChange={(e) => handleConstraintsChange('maxDeadheadMiles', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Max Wait Time (minutes)</label>
                  <input
                    type="number"
                    value={optimizationSettings.constraints.maxWaitTime}
                    onChange={(e) => handleConstraintsChange('maxWaitTime', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Max Overtime Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={optimizationSettings.constraints.maxOvertimeHours}
                    onChange={(e) => handleConstraintsChange('maxOvertimeHours', parseFloat(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Auto-Optimize</label>
                  <input
                    type="checkbox"
                    checked={optimizationSettings.autoOptimize}
                    onChange={(e) => handleSettingsChange('autoOptimize', e.target.checked)}
                    className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveSettings}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Unit Selection and Request Selection */}
        <div className="lg:col-span-1 space-y-6">
          {/* Unit Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Unit Selection</h3>
            {loadingUnits ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
                <span className="ml-2 text-gray-600">Loading units...</span>
              </div>
            ) : (
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select a unit</option>
                {availableUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.unitNumber} - {unit.type} ({unit.currentStatus})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Request Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Available Requests</h3>
              <button
                onClick={handleSelectAllRequests}
                className="text-sm text-orange-600 hover:text-orange-700"
              >
                {selectedRequests.length === pendingRequests.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            {loadingRequests ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
                <span className="ml-2 text-gray-600">Loading requests...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRequests.includes(request.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleRequestSelection(request.id, !selectedRequests.includes(request.id))}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Patient {request.patientId}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTransportLevelColor(request.transportLevel)}`}>
                            {request.transportLevel}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {request.originLocation.lat.toFixed(4)}, {request.originLocation.lng.toFixed(4)} → {request.destinationLocation.lat.toFixed(4)}, {request.destinationLocation.lng.toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Ready: {new Date(request.readyStart).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="ml-2">
                        {selectedRequests.includes(request.id) ? (
                          <CheckCircle className="h-5 w-5 text-orange-600" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {pendingRequests.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No pending requests available</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Results and Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Optimization Results */}
          {optimizationResults && optimizationResults.success && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Optimization Results</h3>
              
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${optimizationResults.data?.totalRevenue.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {optimizationResults.data?.totalDeadheadMiles.toFixed(1)} mi
                  </div>
                  <div className="text-sm text-gray-600">Deadhead Miles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {optimizationResults.data?.totalWaitTime.toFixed(1)} min
                  </div>
                  <div className="text-sm text-gray-600">Wait Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {optimizationResults.data?.averageScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </div>
              </div>

              {/* Optimized Requests */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-700">Optimized Request Assignments</h4>
                {optimizationResults.data?.optimizedRequests.map((result, index) => {
                  const request = pendingRequests.find(req => req.id === result.requestId);
                  if (!request) return null;
                  
                  return (
                    <div key={result.requestId} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              #{index + 1} Patient {request.patientId}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                              {request.priority}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTransportLevelColor(request.transportLevel)}`}>
                              {request.transportLevel}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Score:</span> {result.score.toFixed(1)}
                            </div>
                            <div>
                              <span className="font-medium">Revenue:</span> ${result.revenue.toFixed(2)}
                            </div>
                            <div>
                              <span className="font-medium">Deadhead:</span> {result.deadheadMiles.toFixed(1)} mi
                            </div>
                            <div>
                              <span className="font-medium">Wait:</span> {result.waitTime.toFixed(1)} min
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {result.canHandle ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <AlertCircle className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Backhaul Analysis */}
          {backhaulAnalysis && backhaulAnalysis.success && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Backhaul Opportunities</h3>
              
              {backhaulAnalysis.data?.statistics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {backhaulAnalysis.data.statistics.validPairs}
                    </div>
                    <div className="text-sm text-gray-600">Valid Pairs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {backhaulAnalysis.data.statistics.averageEfficiency.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${backhaulAnalysis.data.statistics.potentialRevenueIncrease.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Revenue Increase</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {((backhaulAnalysis.data.statistics.validPairs / backhaulAnalysis.data.statistics.possiblePairs) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Pairing Rate</div>
                  </div>
                </div>
              )}

              {/* Top Backhaul Pairs */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-700">Top Backhaul Recommendations</h4>
                {backhaulAnalysis.data?.recommendations.slice(0, 5).map((recommendation, index) => (
                  <div key={recommendation.pairId} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Pair #{index + 1}
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Efficiency: {recommendation.efficiency.toFixed(2)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Distance:</span> {recommendation.distance.toFixed(1)} mi
                          </div>
                          <div>
                            <span className="font-medium">Time Window:</span> {recommendation.timeWindow.toFixed(0)} min
                          </div>
                          <div>
                            <span className="font-medium">Revenue Bonus:</span> ${recommendation.revenueBonus.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Potential Revenue:</span> ${recommendation.potentialRevenue.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Dashboard */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Analytics</h3>
            
            {loadingAnalytics ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
                <span className="ml-2 text-gray-600">Loading analytics...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Analytics */}
                {revenueAnalytics && revenueAnalytics.success && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Revenue Analytics (24h)</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Revenue:</span>
                        <span className="text-sm font-medium">${revenueAnalytics.data?.totalRevenue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Revenue per Hour:</span>
                        <span className="text-sm font-medium">${revenueAnalytics.data?.revenuePerHour.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Loaded Mile Ratio:</span>
                        <span className="text-sm font-medium">{(revenueAnalytics.data?.loadedMileRatio * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Trips:</span>
                        <span className="text-sm font-medium">{revenueAnalytics.data?.totalTrips}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                {performanceMetrics && performanceMetrics.success && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Performance Metrics (24h)</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Completed Trips:</span>
                        <span className="text-sm font-medium">{performanceMetrics.data?.completedTrips}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Response Time:</span>
                        <span className="text-sm font-medium">{performanceMetrics.data?.averageResponseTime.toFixed(1)} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Trip Time:</span>
                        <span className="text-sm font-medium">{performanceMetrics.data?.averageTripTime.toFixed(1)} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Efficiency:</span>
                        <span className="text-sm font-medium">{(performanceMetrics.data?.efficiency * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizer;
