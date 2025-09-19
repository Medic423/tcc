import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  FileText, 
  Download,
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Truck,
  MapPin
} from 'lucide-react';
import { analyticsAPI } from '../services/api';

interface CostAnalysisSummary {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  averageProfitMargin: number;
  totalTrips: number;
  averageRevenuePerMile: number;
  averageCostPerMile: number;
  averageLoadedMileRatio: number;
  averageDeadheadMileRatio: number;
  averageUtilizationRate: number;
  tripsByTransportLevel: {
    BLS: { count: number; revenue: number; cost: number; profit: number; margin: number };
    ALS: { count: number; revenue: number; cost: number; profit: number; margin: number };
    CCT: { count: number; revenue: number; cost: number; profit: number; margin: number };
  };
  tripsByPriority: {
    LOW: { count: number; revenue: number; cost: number; profit: number; margin: number };
    MEDIUM: { count: number; revenue: number; cost: number; profit: number; margin: number };
    HIGH: { count: number; revenue: number; cost: number; profit: number; margin: number };
    URGENT: { count: number; revenue: number; cost: number; profit: number; margin: number };
  };
  costCenterBreakdown: Array<{
    costCenterId: string;
    costCenterName: string;
    tripCount: number;
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    profitMargin: number;
  }>;
}

interface TripCostBreakdown {
  id: string;
  tripId: string;
  baseRevenue: number;
  mileageRevenue: number;
  priorityRevenue: number;
  specialRequirementsRevenue: number;
  insuranceAdjustment: number;
  totalRevenue: number;
  crewLaborCost: number;
  vehicleCost: number;
  fuelCost: number;
  maintenanceCost: number;
  overheadCost: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  revenuePerMile: number;
  costPerMile: number;
  loadedMileRatio: number;
  deadheadMileRatio: number;
  utilizationRate: number;
  tripDistance: number;
  loadedMiles: number;
  deadheadMiles: number;
  tripDurationHours: number;
  transportLevel: string;
  priorityLevel: string;
  costCenterId?: string;
  costCenterName?: string;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ProfitabilityAnalysis {
  period: string;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  tripCount: number;
  averageRevenuePerTrip: number;
  averageCostPerTrip: number;
  trends: {
    revenue: number[];
    cost: number[];
    profit: number[];
    margin: number[];
  };
  monthlyBreakdown: Array<{
    month: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
    tripCount: number;
  }>;
}

const FinancialDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysisSummary | null>(null);
  const [profitabilityAnalysis, setProfitabilityAnalysis] = useState<ProfitabilityAnalysis | null>(null);
  const [tripCostBreakdowns, setTripCostBreakdowns] = useState<TripCostBreakdown[]>([]);
  
  // Filter states
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const tabs = [
    { id: 'overview', name: 'Financial Overview', icon: BarChart3 },
    { id: 'revenue', name: 'Revenue Analysis', icon: TrendingUp },
    { id: 'costs', name: 'Cost Analysis', icon: TrendingDown },
    { id: 'profitability', name: 'Profitability', icon: PieChart },
    { id: 'billing', name: 'Billing & Reports', icon: FileText },
  ];

  // Load financial data
  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod, selectedDateRange]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [costAnalysisResponse, profitabilityResponse, breakdownsResponse] = await Promise.all([
        analyticsAPI.getCostAnalysis(selectedDateRange.start, selectedDateRange.end),
        analyticsAPI.getProfitability(selectedPeriod),
        analyticsAPI.getTripCostBreakdowns()
      ]);

      if (costAnalysisResponse.data?.success) {
        setCostAnalysis(costAnalysisResponse.data.data);
      }

      if (profitabilityResponse.data?.success) {
        setProfitabilityAnalysis(profitabilityResponse.data.data);
      }

      if (breakdownsResponse.data?.success) {
        setTripCostBreakdowns(breakdownsResponse.data.data);
      }
    } catch (err: any) {
      console.error('Error loading financial data:', err);
      setError(err.response?.data?.error || 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 20) return 'text-green-600';
    if (margin >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfitMarginBgColor = (margin: number) => {
    if (margin >= 20) return 'bg-green-100';
    if (margin >= 10) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading financial data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={loadFinancialData}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Try again
            </button>
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
          <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600">Comprehensive financial analysis and reporting</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={loadFinancialData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {costAnalysis ? formatCurrency(costAnalysis.totalRevenue) : '$0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Costs</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {costAnalysis ? formatCurrency(costAnalysis.totalCost) : '$0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Gross Profit</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {costAnalysis ? formatCurrency(costAnalysis.grossProfit) : '$0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Profit Margin</p>
                  <p className={`text-2xl font-semibold ${getProfitMarginColor(costAnalysis?.averageProfitMargin || 0)}`}>
                    {costAnalysis ? formatPercentage(costAnalysis.averageProfitMargin) : '0.0%'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Truck className="h-6 w-6 text-gray-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Trips</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {costAnalysis?.totalTrips || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-gray-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Revenue per Mile</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {costAnalysis ? formatCurrency(costAnalysis.averageRevenuePerMile) : '$0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-gray-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Utilization Rate</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {costAnalysis ? formatPercentage(costAnalysis.averageUtilizationRate * 100) : '0.0%'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue vs Cost Chart Placeholder */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue vs Cost Trend</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization would go here</p>
                <p className="text-sm text-gray-400">Integration with charting library needed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Revenue Analysis</h2>
          
          {/* Revenue by Transport Level */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Transport Level</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trips</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {costAnalysis?.tripsByTransportLevel && Object.entries(costAnalysis.tripsByTransportLevel).map(([level, data]) => (
                    <tr key={level}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{level}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(data.revenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(data.cost)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(data.profit)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProfitMarginBgColor(data.margin)} ${getProfitMarginColor(data.margin)}`}>
                          {formatPercentage(data.margin)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue by Priority */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Priority Level</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trips</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {costAnalysis?.tripsByPriority && Object.entries(costAnalysis.tripsByPriority).map(([priority, data]) => (
                    <tr key={priority}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{priority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(data.revenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(data.cost)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(data.profit)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProfitMarginBgColor(data.margin)} ${getProfitMarginColor(data.margin)}`}>
                          {formatPercentage(data.margin)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'costs' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Cost Analysis</h2>
          
          {/* Cost Breakdown Chart Placeholder */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Cost breakdown chart would go here</p>
                <p className="text-sm text-gray-400">Shows crew, vehicle, fuel, maintenance, overhead costs</p>
              </div>
            </div>
          </div>

          {/* Recent Trip Cost Breakdowns */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Trip Cost Breakdowns</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tripCostBreakdowns.slice(0, 10).map((breakdown) => (
                    <tr key={breakdown.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {breakdown.tripId.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{breakdown.transportLevel}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(breakdown.totalRevenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(breakdown.totalCost)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(breakdown.grossProfit)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProfitMarginBgColor(breakdown.profitMargin)} ${getProfitMarginColor(breakdown.profitMargin)}`}>
                          {formatPercentage(breakdown.profitMargin)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(breakdown.calculatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profitability' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Profitability Analysis</h2>
          
          {/* Profitability Trends */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profitability Trends</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Profitability trend chart would go here</p>
                <p className="text-sm text-gray-400">Shows profit margins over time</p>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown */}
          {profitabilityAnalysis?.monthlyBreakdown && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trips</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {profitabilityAnalysis.monthlyBreakdown.map((month, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{month.tripCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(month.revenue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(month.cost)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(month.profit)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProfitMarginBgColor(month.margin)} ${getProfitMarginColor(month.margin)}`}>
                            {formatPercentage(month.margin)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Billing & Reports</h2>
          
          {/* Report Generation */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FileText className="h-6 w-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Financial Summary</p>
                  <p className="text-sm text-gray-500">Complete financial overview</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <DollarSign className="h-6 w-6 text-green-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Revenue Report</p>
                  <p className="text-sm text-gray-500">Detailed revenue analysis</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <TrendingDown className="h-6 w-6 text-red-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Cost Report</p>
                  <p className="text-sm text-gray-500">Detailed cost breakdown</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <PieChart className="h-6 w-6 text-purple-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Profitability Report</p>
                  <p className="text-sm text-gray-500">Profit margin analysis</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Users className="h-6 w-6 text-indigo-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Client Billing</p>
                  <p className="text-sm text-gray-500">Generate client invoices</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Download className="h-6 w-6 text-gray-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Export Data</p>
                  <p className="text-sm text-gray-500">Export to CSV/Excel</p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h3>
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p>No reports generated yet</p>
              <p className="text-sm text-gray-400">Generate your first report using the options above</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialDashboard;
