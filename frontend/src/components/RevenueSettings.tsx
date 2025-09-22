import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Calculator, Users, Truck, Clock, MapPin, CreditCard, Settings, Route, Target, Zap, BarChart3, TrendingUp, PieChart, Activity, DollarSign as DollarIcon } from 'lucide-react';
import api from '../services/api';

interface RevenueSettings {
  baseRates: {
    BLS: number;
    ALS: number;
    CCT: number;
  };
  perMileRates: {
    BLS: number;
    ALS: number;
    CCT: number;
  };
  priorityMultipliers: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
  specialRequirementsSurcharge: number;
  insuranceRates: {
    medicare: number;
    medicaid: number;
    private: number;
  };
  // Crew Cost Management
  crewRoles: {
    EMT: number;
    Paramedic: number;
    RN: number;
    CCTSpecialist: number;
    CriticalCareParamedic: number;
  };
  overtimeMultiplier: number;
  shiftLengthHours: number;
  maxOvertimeHours: number;
  // Vehicle & Operational Costs
  vehicleCostPerMile: number;
  fuelCostPerMile: number;
  maintenanceCostPerMile: number;
  // Crew Composition by Transport Level
  crewComposition: {
    BLS: string[];
    ALS: string[];
    CCT: string[];
  };
  // Advanced Pricing Models (Phase 2)
  timeBasedPricing: {
    peakHourMultipliers: { [key: string]: number };
    weekendMultipliers: { [key: string]: number };
    seasonalMultipliers: { [key: string]: number };
  };
  geographicPricing: {
    zoneMultipliers: { [key: string]: number };
    distanceTiers: { [key: string]: number };
  };
  serviceSpecificPricing: {
    specialRequirements: { [key: string]: number };
    isolationPricing: number;
    bariatricPricing: number;
    oxygenPricing: number;
    monitoringPricing: number;
  };
  insuranceSpecificRates: {
    [key: string]: number;
  };
  // Route Optimization Parameters (Phase 3)
  routeOptimization: {
    // Optimization Weights (α, β, γ, δ parameters)
    deadheadMileWeight: number;
    waitTimeWeight: number;
    backhaulBonusWeight: number;
    overtimeRiskWeight: number;
    revenueWeight: number;
    crewAvailabilityWeight: number;
    equipmentCompatibilityWeight: number;
    patientPriorityWeight: number;
    // Constraint Settings
    maxDeadheadMiles: number;
    maxWaitTimeMinutes: number;
    maxOvertimeHours: number;
    maxResponseTimeMinutes: number;
    maxServiceDistance: number;
    // Backhaul Optimization
    backhaulTimeWindow: number;
    backhaulDistanceLimit: number;
    backhaulRevenueBonus: number;
    enableBackhaulOptimization: boolean;
    // Performance Targets
    targetLoadedMileRatio: number;
    targetRevenuePerHour: number;
    targetResponseTime: number;
    targetEfficiency: number;
    // Algorithm Settings
    optimizationAlgorithm: string;
    maxOptimizationTime: number;
    enableRealTimeOptimization: boolean;
  };
}

interface RevenuePreview {
  standardRate: number;
  mileageRate: number;
  insuranceRate: number;
  crewCost: number;
  vehicleCost: number;
  totalCost: number;
  netProfit: number;
  profitMargin: number;
}

interface OptimizationPreview {
  totalRevenue: number;
  totalDeadheadMiles: number;
  totalWaitTime: number;
  totalOvertimeRisk: number;
  backhaulPairs: number;
  loadedMileRatio: number;
  averageEfficiency: number;
  averageResponseTime: number;
  totalMiles: number;
  loadedMiles: number;
  optimizationResults: any[];
  backhaulOpportunities: any[];
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
  costCenterBreakdown: {
    costCenterId: string;
    costCenterName: string;
    tripCount: number;
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    profitMargin: number;
  }[];
}

interface ProfitabilityAnalysis {
  period: string;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  revenueGrowth: number;
  costGrowth: number;
  profitGrowth: number;
  efficiencyMetrics: {
    loadedMileRatio: number;
    deadheadMileRatio: number;
    utilizationRate: number;
    revenuePerHour: number;
    costPerHour: number;
  };
  trends: {
    revenue: { current: number; previous: number; change: number };
    costs: { current: number; previous: number; change: number };
    profit: { current: number; previous: number; change: number };
    margin: { current: number; previous: number; change: number };
  };
}

const RevenueSettings: React.FC = () => {
  const [settings, setSettings] = useState<RevenueSettings>(() => {
    const savedSettings = localStorage.getItem('revenue_settings');
    return savedSettings ? JSON.parse(savedSettings) : {
      baseRates: {
        BLS: 150,
        ALS: 250,
        CCT: 400
      },
      perMileRates: {
        BLS: 2.5,
        ALS: 3.75,
        CCT: 5.0
      },
      priorityMultipliers: {
        LOW: 1.0,
        MEDIUM: 1.1,
        HIGH: 1.25,
        URGENT: 1.5
      },
      specialRequirementsSurcharge: 50,
      insuranceRates: {
        medicare: 0.85,
        medicaid: 0.80,
        private: 1.0
      },
      // Crew Cost Management
      crewRoles: {
        EMT: 25.00,
        Paramedic: 35.00,
        RN: 45.00,
        CCTSpecialist: 40.00,
        CriticalCareParamedic: 42.00
      },
      overtimeMultiplier: 1.5,
      shiftLengthHours: 12.0,
      maxOvertimeHours: 4.0,
      // Vehicle & Operational Costs
      vehicleCostPerMile: 0.75,
      fuelCostPerMile: 0.25,
      maintenanceCostPerMile: 0.15,
      // Crew Composition by Transport Level
      crewComposition: {
        BLS: ['EMT', 'EMT'],
        ALS: ['EMT', 'Paramedic'],
        CCT: ['RN', 'CriticalCareParamedic']
      },
      // Advanced Pricing Models (Phase 2)
      timeBasedPricing: {
        peakHourMultipliers: {
          '6-9AM': 1.3,
          '5-8PM': 1.4,
          'Other': 1.0
        },
        weekendMultipliers: {
          'Saturday': 1.2,
          'Sunday': 1.3,
          'Weekday': 1.0
        },
        seasonalMultipliers: {
          'Winter': 1.1,
          'Spring': 1.0,
          'Summer': 1.0,
          'Fall': 1.0
        }
      },
      geographicPricing: {
        zoneMultipliers: {
          'Urban': 1.0,
          'Suburban': 1.1,
          'Rural': 1.3,
          'Remote': 1.5
        },
        distanceTiers: {
          '0-10mi': 1.0,
          '10-25mi': 0.95,
          '25-50mi': 0.9,
          '50+mi': 0.85
        }
      },
      serviceSpecificPricing: {
        specialRequirements: {
          'Oxygen': 25,
          'Monitoring': 50,
          'Isolation': 75,
          'Bariatric': 100
        },
        isolationPricing: 75,
        bariatricPricing: 100,
        oxygenPricing: 25,
        monitoringPricing: 50
      },
      insuranceSpecificRates: {
        'Medicare': 0.85,
        'Medicaid': 0.80,
        'Private': 1.0,
        'SelfPay': 1.2
      },
      // Route Optimization Parameters (Phase 3)
      routeOptimization: {
        // Optimization Weights (α, β, γ, δ parameters)
        deadheadMileWeight: 1.0,
        waitTimeWeight: 1.0,
        backhaulBonusWeight: 1.0,
        overtimeRiskWeight: 1.0,
        revenueWeight: 1.0,
        crewAvailabilityWeight: 1.0,
        equipmentCompatibilityWeight: 1.0,
        patientPriorityWeight: 1.0,
        // Constraint Settings
        maxDeadheadMiles: 50.0,
        maxWaitTimeMinutes: 30,
        maxOvertimeHours: 4.0,
        maxResponseTimeMinutes: 15,
        maxServiceDistance: 100.0,
        // Backhaul Optimization
        backhaulTimeWindow: 60,
        backhaulDistanceLimit: 25.0,
        backhaulRevenueBonus: 50.0,
        enableBackhaulOptimization: true,
        // Performance Targets
        targetLoadedMileRatio: 0.75,
        targetRevenuePerHour: 200.0,
        targetResponseTime: 12,
        targetEfficiency: 0.85,
        // Algorithm Settings
        optimizationAlgorithm: 'HYBRID',
        maxOptimizationTime: 30,
        enableRealTimeOptimization: true
      }
    };
  });

  const [preview, setPreview] = useState<RevenuePreview>({
    standardRate: 0,
    mileageRate: 0,
    insuranceRate: 0,
    crewCost: 0,
    vehicleCost: 0,
    totalCost: 0,
    netProfit: 0,
    profitMargin: 0
  });

  const [optimizationPreview, setOptimizationPreview] = useState<OptimizationPreview>({
    totalRevenue: 0,
    totalDeadheadMiles: 0,
    totalWaitTime: 0,
    totalOvertimeRisk: 0,
    backhaulPairs: 0,
    loadedMileRatio: 0,
    averageEfficiency: 0,
    averageResponseTime: 0,
    totalMiles: 0,
    loadedMiles: 0,
    optimizationResults: [],
    backhaulOpportunities: []
  });

  const [loading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [optimizationLoading, setOptimizationLoading] = useState(false);

  // Cost Analysis State
  const [costAnalysisSummary, setCostAnalysisSummary] = useState<CostAnalysisSummary | null>(null);
  const [profitabilityAnalysis, setProfitabilityAnalysis] = useState<ProfitabilityAnalysis | null>(null);
  const [tripCostBreakdowns, setTripCostBreakdowns] = useState<TripCostBreakdown[]>([]);
  const [costAnalysisLoading, setCostAnalysisLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [realtimeMetrics, setRealtimeMetrics] = useState<{
    totalTrips: number;
    completedTrips: number;
    averageResponseTime: number;
    averageTripTime: number;
    totalRevenue: number;
    efficiency: number;
    customerSatisfaction?: number;
    lastUpdated?: string;
  }>({ totalTrips: 0, completedTrips: 0, averageResponseTime: 0, averageTripTime: 0, totalRevenue: 0, efficiency: 0 });
  const [streamConnected, setStreamConnected] = useState(false);
  const [streamPaused, setStreamPaused] = useState(false);
  const eventSourceRef = React.useRef<EventSource | null>(null);
  const [whatIfUnitIds, setWhatIfUnitIds] = useState<string>("");
  const [whatIfRequestIds, setWhatIfRequestIds] = useState<string>("");
  const [whatIfResult, setWhatIfResult] = useState<any>(null);

  // Load saved settings on mount
  useEffect(() => {
    loadSavedSettings();
  }, []);

  // Calculate preview when settings change
  useEffect(() => {
    calculatePreview();
    calculateOptimizationPreview();
  }, [settings]);

  // Load cost analysis data on mount
  useEffect(() => {
    loadCostAnalysisData();
  }, [selectedPeriod, selectedDateRange]);

  const startStream = async () => {
    if (eventSourceRef.current) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token available for SSE connection');
      return;
    }

    // Use token in URL for EventSource authentication
    const url = `${import.meta.env.VITE_BACKEND_URL || 'https://vercel-api-eta-nine.vercel.app'}/api/optimize/stream?token=${encodeURIComponent(token)}`;
    console.log('Creating EventSource connection to:', url);
    const es = new EventSource(url);
    eventSourceRef.current = es;
    
    es.addEventListener('connected', (event) => {
      console.log('SSE connected event received:', event);
      setStreamConnected(true);
    });
    
    es.addEventListener('metrics', (evt: MessageEvent) => {
      try {
        console.log('SSE metrics event received:', evt.data);
        const payload = JSON.parse((evt as any).data);
        const summary = payload.summary || payload;
        setRealtimeMetrics({
          totalTrips: summary.totalTrips || 0,
          completedTrips: summary.completedTrips || 0,
          averageResponseTime: summary.averageResponseTime || 0,
          averageTripTime: summary.averageTripTime || 0,
          totalRevenue: summary.totalRevenue || 0,
          efficiency: summary.efficiency || 0,
          customerSatisfaction: summary.customerSatisfaction || 4.2,
          lastUpdated: payload.timestamp || new Date().toISOString()
        });
      } catch (error) {
        console.error('Error parsing SSE metrics:', error);
      }
    });
    
    es.addEventListener('error', (error) => {
      console.error('SSE error event:', error);
      setStreamConnected(false);
    });
    
    es.onopen = () => {
      console.log('SSE connection opened successfully');
      setStreamConnected(true);
    };
    
    es.onerror = (error) => {
      console.error('SSE connection error:', error);
      console.error('EventSource readyState:', es.readyState);
      setStreamConnected(false);
    };
  };

  const stopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStreamConnected(false);
  };

  // Initialize SSE stream when component mounts and user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !streamPaused) {
      startStream().catch(console.error);
    }
    return () => {
      stopStream();
    };
  }, []);

  // Handle stream pause/resume
  useEffect(() => {
    if (!streamPaused) {
      startStream().catch(console.error);
    } else {
      stopStream();
    }
  }, [streamPaused]);

  const loadSavedSettings = () => {
    try {
      const saved = localStorage.getItem('revenue_settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Error loading saved settings:', error);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('revenue_settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const calculatePreview = () => {
    // Sample trip: ALS transport, MEDIUM priority, 15 miles, medicare insurance
    const transportLevel = 'ALS';
    const priority = 'MEDIUM';
    const distance = 15;
    const insurance = 'medicare';
    const tripDurationHours = 2.5; // Estimated trip duration

    const baseRate = settings.baseRates[transportLevel as keyof typeof settings.baseRates];
    const priorityMultiplier = settings.priorityMultipliers[priority as keyof typeof settings.priorityMultipliers];
    const perMileRate = settings.perMileRates[transportLevel as keyof typeof settings.perMileRates];
    const insuranceMultiplier = settings.insuranceRates[insurance as keyof typeof settings.insuranceRates];

    const standardRate = baseRate * priorityMultiplier;
    const mileageRate = standardRate + (perMileRate * distance);
    const insuranceRate = mileageRate * insuranceMultiplier;

    // Calculate crew costs
    const crewComposition = settings.crewComposition[transportLevel as keyof typeof settings.crewComposition];
    let crewCost = 0;
    crewComposition.forEach(role => {
      const hourlyRate = settings.crewRoles[role as keyof typeof settings.crewRoles];
      crewCost += hourlyRate * tripDurationHours;
    });

    // Calculate vehicle costs
    const vehicleCost = (settings.vehicleCostPerMile + settings.fuelCostPerMile + settings.maintenanceCostPerMile) * distance;

    const totalCost = crewCost + vehicleCost;
    const netProfit = insuranceRate - totalCost;
    const profitMargin = insuranceRate > 0 ? (netProfit / insuranceRate) * 100 : 0;

    setPreview({
      standardRate: Math.round(standardRate * 100) / 100,
      mileageRate: Math.round(mileageRate * 100) / 100,
      insuranceRate: Math.round(insuranceRate * 100) / 100,
      crewCost: Math.round(crewCost * 100) / 100,
      vehicleCost: Math.round(vehicleCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100
    });
  };

  const calculateOptimizationPreview = async () => {
    try {
      setOptimizationLoading(true);
      
      // Mock optimization preview data based on current settings
      
      const mockRequests = [
        { 
          id: 'req1', 
          transportLevel: 'ALS', 
          priority: 'MEDIUM',
          originLocation: { lat: 40.7500, lng: -73.9800 },
          destinationLocation: { lat: 40.7600, lng: -73.9900 },
          scheduledTime: new Date(Date.now() + 30 * 60 * 1000),
          tripCost: 275
        },
        { 
          id: 'req2', 
          transportLevel: 'BLS', 
          priority: 'LOW',
          originLocation: { lat: 40.7400, lng: -73.9700 },
          destinationLocation: { lat: 40.7700, lng: -74.0000 },
          scheduledTime: new Date(Date.now() + 60 * 60 * 1000),
          tripCost: 150
        }
      ];

      // Calculate mock optimization results
      const totalRevenue = mockRequests.reduce((sum, req) => sum + (req.tripCost || 0), 0);
      const totalDeadheadMiles = 25.5; // Mock calculation
      const totalWaitTime = 45; // Mock calculation
      const totalOvertimeRisk = 0.5; // Mock calculation
      const backhaulPairs = 1; // Mock calculation
      const loadedMileRatio = settings.routeOptimization.targetLoadedMileRatio;
      const averageEfficiency = settings.routeOptimization.targetEfficiency;
      const averageResponseTime = settings.routeOptimization.targetResponseTime;
      const totalMiles = totalDeadheadMiles / (1 - loadedMileRatio);
      const loadedMiles = totalMiles - totalDeadheadMiles;

      setOptimizationPreview({
        totalRevenue,
        totalDeadheadMiles,
        totalWaitTime,
        totalOvertimeRisk,
        backhaulPairs,
        loadedMileRatio,
        averageEfficiency,
        averageResponseTime,
        totalMiles,
        loadedMiles,
        optimizationResults: [],
        backhaulOpportunities: []
      });
    } catch (error) {
      console.error('Error calculating optimization preview:', error);
    } finally {
      setOptimizationLoading(false);
    }
  };

  const updateSetting = (category: keyof RevenueSettings, field: string, value: number) => {
    setSettings(prev => {
      const currentCategory = prev[category] as Record<string, any>;
      return {
        ...prev,
        [category]: {
          ...currentCategory,
          [field]: value
        }
      };
    });
  };

  const loadCostAnalysisData = async () => {
    try {
      console.log('Loading cost analysis data...');
      setCostAnalysisLoading(true);
      
      const token = localStorage.getItem('token');
      console.log('Token available for data loading:', !!token);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Load cost analysis summary
      const summaryResponse = await api.get(`/api/tcc/analytics/cost-analysis?startDate=${selectedDateRange.start}&endDate=${selectedDateRange.end}`);
      console.log('Summary response status:', summaryResponse.status);
      if (summaryResponse.data?.success) {
        console.log('Summary data received:', summaryResponse.data);
        setCostAnalysisSummary(summaryResponse.data.data);
      } else {
        console.error('Summary response error:', summaryResponse.data);
      }

      // Load profitability analysis
      const profitabilityResponse = await api.get(`/api/tcc/analytics/profitability?period=${selectedPeriod}`);
      if (profitabilityResponse.data?.success) {
        setProfitabilityAnalysis(profitabilityResponse.data.data);
      }

      // Load trip cost breakdowns
      const breakdownsResponse = await api.get(`/api/tcc/analytics/cost-breakdowns?limit=50`);
      if (breakdownsResponse.data?.success) {
        setTripCostBreakdowns(breakdownsResponse.data.data);
      }
    } catch (error) {
      console.error('Error loading cost analysis data:', error);
    } finally {
      setCostAnalysisLoading(false);
    }
  };

  const createSampleCostBreakdown = async () => {
    try {
      console.log('Starting sample cost breakdown creation...');
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      const sampleBreakdown = {
        baseRevenue: 250,
        mileageRevenue: 56.25,
        priorityRevenue: 27.5,
        specialRequirementsRevenue: 0,
        insuranceAdjustment: -50.625,
        totalRevenue: 283.125,
        crewLaborCost: 87.5,
        vehicleCost: 11.25,
        fuelCost: 3.75,
        maintenanceCost: 2.25,
        overheadCost: 15.0,
        totalCost: 119.75,
        grossProfit: 163.375,
        profitMargin: 57.7,
        revenuePerMile: 18.88,
        costPerMile: 7.98,
        loadedMileRatio: 0.8,
        deadheadMileRatio: 0.2,
        utilizationRate: 0.85,
        tripDistance: 15.0,
        loadedMiles: 12.0,
        deadheadMiles: 3.0,
        tripDurationHours: 2.5,
        transportLevel: 'ALS',
        priorityLevel: 'MEDIUM'
      };

      console.log('Creating sample cost breakdown...');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await api.post('/api/tcc/analytics/cost-breakdown', {
          tripId: `sample-trip-${Date.now()}`,
          breakdownData: sampleBreakdown
        });

      if (response.data?.success) {
        console.log('Sample cost breakdown created successfully');
        // Reload cost analysis data
        await loadCostAnalysisData();
      } else {
        console.error('Error creating sample cost breakdown:', response.data);
        alert(`Error creating sample data: ${response.data?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating sample cost breakdown:', error);
      alert(`Error creating sample data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Revenue Calculation Settings</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Configure pricing rates and see real-time revenue projections.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Base Rates */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Base Rates by Transport Level</h3>
            <div className="space-y-4">
              {Object.entries(settings.baseRates).map(([level, rate]) => (
                <div key={level} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {level} Base Rate ($):
                  </label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => updateSetting('baseRates', level, parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Per Mile Rates */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Per Mile Rates</h3>
            <div className="space-y-4">
              {Object.entries(settings.perMileRates).map(([level, rate]) => (
                <div key={level} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {level} Per Mile ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rate}
                    onChange={(e) => updateSetting('perMileRates', level, parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Priority Multipliers */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Multipliers</h3>
            <div className="space-y-4">
              {Object.entries(settings.priorityMultipliers).map(([priority, multiplier]) => (
                <div key={priority} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {priority} Priority:
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={multiplier}
                    onChange={(e) => updateSetting('priorityMultipliers', priority, parseFloat(e.target.value) || 1)}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Additional Fees */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Fees</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Special Requirements Surcharge ($):
                </label>
                <input
                  type="number"
                  value={settings.specialRequirementsSurcharge}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    specialRequirementsSurcharge: parseFloat(e.target.value) || 0
                  }))}
                  className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Insurance Rates */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Rate Multipliers</h3>
            <div className="space-y-4">
              {Object.entries(settings.insuranceRates).map(([insurance, rate]) => (
                <div key={insurance} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {insurance.charAt(0).toUpperCase() + insurance.slice(1)}:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="2"
                    value={rate}
                    onChange={(e) => updateSetting('insuranceRates', insurance, parseFloat(e.target.value) || 1)}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Crew Cost Management */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Crew Cost Management</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(settings.crewRoles).map(([role, rate]) => (
                <div key={role} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {role} Hourly Rate ($):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rate}
                    onChange={(e) => updateSetting('crewRoles', role, parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Overtime Multiplier:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.overtimeMultiplier}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    overtimeMultiplier: parseFloat(e.target.value) || 1.5
                  }))}
                  className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Shift Length (hours):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.shiftLengthHours}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    shiftLengthHours: parseFloat(e.target.value) || 12
                  }))}
                  className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Max Overtime (hours):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.maxOvertimeHours}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    maxOvertimeHours: parseFloat(e.target.value) || 4
                  }))}
                  className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Vehicle & Operational Costs */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Truck className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Vehicle & Operational Costs</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Vehicle Cost per Mile ($):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.vehicleCostPerMile}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    vehicleCostPerMile: parseFloat(e.target.value) || 0
                  }))}
                  className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Fuel Cost per Mile ($):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.fuelCostPerMile}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    fuelCostPerMile: parseFloat(e.target.value) || 0
                  }))}
                  className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Maintenance Cost per Mile ($):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.maintenanceCostPerMile}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    maintenanceCostPerMile: parseFloat(e.target.value) || 0
                  }))}
                  className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Crew Composition */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Crew Composition by Transport Level</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(settings.crewComposition).map(([level, crew]) => (
                <div key={level} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {level} Crew:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {crew.map((role, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Total crew cost: ${crew.reduce((sum, role) => sum + (settings.crewRoles[role as keyof typeof settings.crewRoles] || 0), 0).toFixed(2)}/hour
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 2: Advanced Pricing Models */}
          
          {/* Time-based Pricing */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Time-based Pricing</h3>
            </div>
            <div className="space-y-6">
              {/* Peak Hour Multipliers */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Peak Hour Multipliers</h4>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(settings.timeBasedPricing.peakHourMultipliers).map(([time, multiplier]) => (
                    <div key={time} className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">{time}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={multiplier}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          timeBasedPricing: {
                            ...prev.timeBasedPricing,
                            peakHourMultipliers: {
                              ...prev.timeBasedPricing.peakHourMultipliers,
                              [time]: parseFloat(e.target.value) || 1.0
                            }
                          }
                        }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekend Multipliers */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Weekend Multipliers</h4>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(settings.timeBasedPricing.weekendMultipliers).map(([day, multiplier]) => (
                    <div key={day} className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">{day}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={multiplier}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          timeBasedPricing: {
                            ...prev.timeBasedPricing,
                            weekendMultipliers: {
                              ...prev.timeBasedPricing.weekendMultipliers,
                              [day]: parseFloat(e.target.value) || 1.0
                            }
                          }
                        }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Seasonal Multipliers */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Seasonal Multipliers</h4>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(settings.timeBasedPricing.seasonalMultipliers).map(([season, multiplier]) => (
                    <div key={season} className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">{season}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={multiplier}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          timeBasedPricing: {
                            ...prev.timeBasedPricing,
                            seasonalMultipliers: {
                              ...prev.timeBasedPricing.seasonalMultipliers,
                              [season]: parseFloat(e.target.value) || 1.0
                            }
                          }
                        }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Geographic Pricing */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Geographic Pricing</h3>
            </div>
            <div className="space-y-6">
              {/* Zone Multipliers */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Zone Multipliers</h4>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(settings.geographicPricing.zoneMultipliers).map(([zone, multiplier]) => (
                    <div key={zone} className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">{zone}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={multiplier}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          geographicPricing: {
                            ...prev.geographicPricing,
                            zoneMultipliers: {
                              ...prev.geographicPricing.zoneMultipliers,
                              [zone]: parseFloat(e.target.value) || 1.0
                            }
                          }
                        }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Distance Tiers */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Distance Tiers</h4>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(settings.geographicPricing.distanceTiers).map(([distance, multiplier]) => (
                    <div key={distance} className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">{distance}</label>
                      <input
                        type="number"
                        step="0.05"
                        value={multiplier}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          geographicPricing: {
                            ...prev.geographicPricing,
                            distanceTiers: {
                              ...prev.geographicPricing.distanceTiers,
                              [distance]: parseFloat(e.target.value) || 1.0
                            }
                          }
                        }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Service-specific Pricing */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Service-specific Pricing</h3>
            </div>
            <div className="space-y-6">
              {/* Special Requirements */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Special Requirements Surcharges</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(settings.serviceSpecificPricing.specialRequirements).map(([requirement, surcharge]) => (
                    <div key={requirement} className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">{requirement}</label>
                      <input
                        type="number"
                        step="5"
                        value={surcharge}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          serviceSpecificPricing: {
                            ...prev.serviceSpecificPricing,
                            specialRequirements: {
                              ...prev.serviceSpecificPricing.specialRequirements,
                              [requirement]: parseFloat(e.target.value) || 0
                            }
                          }
                        }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Service Pricing */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Individual Service Pricing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Isolation Protocol</label>
                    <input
                      type="number"
                      step="5"
                      value={settings.serviceSpecificPricing.isolationPricing}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        serviceSpecificPricing: {
                          ...prev.serviceSpecificPricing,
                          isolationPricing: parseFloat(e.target.value) || 0
                        }
                      }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Bariatric Transport</label>
                    <input
                      type="number"
                      step="5"
                      value={settings.serviceSpecificPricing.bariatricPricing}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        serviceSpecificPricing: {
                          ...prev.serviceSpecificPricing,
                          bariatricPricing: parseFloat(e.target.value) || 0
                        }
                      }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Oxygen Therapy</label>
                    <input
                      type="number"
                      step="5"
                      value={settings.serviceSpecificPricing.oxygenPricing}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        serviceSpecificPricing: {
                          ...prev.serviceSpecificPricing,
                          oxygenPricing: parseFloat(e.target.value) || 0
                        }
                      }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Continuous Monitoring</label>
                    <input
                      type="number"
                      step="5"
                      value={settings.serviceSpecificPricing.monitoringPricing}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        serviceSpecificPricing: {
                          ...prev.serviceSpecificPricing,
                          monitoringPricing: parseFloat(e.target.value) || 0
                        }
                      }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance-specific Rates */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <CreditCard className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Insurance-specific Rates</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(settings.insuranceSpecificRates).map(([insurance, rate]) => (
                  <div key={insurance} className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">{insurance} Rate</label>
                    <input
                      type="number"
                      step="0.05"
                      value={rate}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        insuranceSpecificRates: {
                          ...prev.insuranceSpecificRates,
                          [insurance]: parseFloat(e.target.value) || 1.0
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500">
                      {rate < 1 ? `${((1 - rate) * 100).toFixed(1)}% discount` : 
                       rate > 1 ? `${((rate - 1) * 100).toFixed(1)}% surcharge` : 
                       'Standard rate'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phase 3: Route Optimization Parameters */}
          
          {/* Optimization Weights */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Route className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Route Optimization Weights</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Primary Weights */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Primary Optimization Weights</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Deadhead Miles Weight (α): {settings.routeOptimization.deadheadMileWeight}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={settings.routeOptimization.deadheadMileWeight}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          routeOptimization: {
                            ...prev.routeOptimization,
                            deadheadMileWeight: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-500">Penalty for empty return miles</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Wait Time Weight (β): {settings.routeOptimization.waitTimeWeight}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={settings.routeOptimization.waitTimeWeight}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          routeOptimization: {
                            ...prev.routeOptimization,
                            waitTimeWeight: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-500">Penalty for waiting time</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Backhaul Bonus Weight (γ): {settings.routeOptimization.backhaulBonusWeight}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={settings.routeOptimization.backhaulBonusWeight}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          routeOptimization: {
                            ...prev.routeOptimization,
                            backhaulBonusWeight: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-500">Bonus for backhaul pairs</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Overtime Risk Weight (δ): {settings.routeOptimization.overtimeRiskWeight}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={settings.routeOptimization.overtimeRiskWeight}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          routeOptimization: {
                            ...prev.routeOptimization,
                            overtimeRiskWeight: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-500">Penalty for overtime risk</p>
                    </div>
                  </div>
                </div>

                {/* Secondary Weights */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Secondary Weights</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Revenue Weight: {settings.routeOptimization.revenueWeight}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={settings.routeOptimization.revenueWeight}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          routeOptimization: {
                            ...prev.routeOptimization,
                            revenueWeight: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Crew Availability Weight: {settings.routeOptimization.crewAvailabilityWeight}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={settings.routeOptimization.crewAvailabilityWeight}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          routeOptimization: {
                            ...prev.routeOptimization,
                            crewAvailabilityWeight: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Equipment Compatibility Weight: {settings.routeOptimization.equipmentCompatibilityWeight}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={settings.routeOptimization.equipmentCompatibilityWeight}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          routeOptimization: {
                            ...prev.routeOptimization,
                            equipmentCompatibilityWeight: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Patient Priority Weight: {settings.routeOptimization.patientPriorityWeight}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.1"
                        value={settings.routeOptimization.patientPriorityWeight}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          routeOptimization: {
                            ...prev.routeOptimization,
                            patientPriorityWeight: parseFloat(e.target.value)
                          }
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Constraint Settings */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Target className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Constraint Settings</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Max Deadhead Miles:
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={settings.routeOptimization.maxDeadheadMiles}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      routeOptimization: {
                        ...prev.routeOptimization,
                        maxDeadheadMiles: parseFloat(e.target.value) || 50
                      }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Max Wait Time (min):
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={settings.routeOptimization.maxWaitTimeMinutes}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      routeOptimization: {
                        ...prev.routeOptimization,
                        maxWaitTimeMinutes: parseInt(e.target.value) || 30
                      }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Max Overtime (hrs):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={settings.routeOptimization.maxOvertimeHours}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      routeOptimization: {
                        ...prev.routeOptimization,
                        maxOvertimeHours: parseFloat(e.target.value) || 4
                      }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Max Response Time (min):
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={settings.routeOptimization.maxResponseTimeMinutes}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      routeOptimization: {
                        ...prev.routeOptimization,
                        maxResponseTimeMinutes: parseInt(e.target.value) || 15
                      }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Max Service Distance (mi):
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={settings.routeOptimization.maxServiceDistance}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      routeOptimization: {
                        ...prev.routeOptimization,
                        maxServiceDistance: parseFloat(e.target.value) || 100
                      }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Backhaul Optimization */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Zap className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Backhaul Optimization</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Enable Backhaul Optimization:
                </label>
                <input
                  type="checkbox"
                  checked={settings.routeOptimization.enableBackhaulOptimization}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    routeOptimization: {
                      ...prev.routeOptimization,
                      enableBackhaulOptimization: e.target.checked
                    }
                  }))}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Time Window (min):
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={settings.routeOptimization.backhaulTimeWindow}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      routeOptimization: {
                        ...prev.routeOptimization,
                        backhaulTimeWindow: parseInt(e.target.value) || 60
                      }
                    }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Distance Limit (mi):
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={settings.routeOptimization.backhaulDistanceLimit}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      routeOptimization: {
                        ...prev.routeOptimization,
                        backhaulDistanceLimit: parseFloat(e.target.value) || 25
                      }
                    }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Revenue Bonus ($):
                  </label>
                  <input
                    type="number"
                    step="5"
                    value={settings.routeOptimization.backhaulRevenueBonus}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      routeOptimization: {
                        ...prev.routeOptimization,
                        backhaulRevenueBonus: parseFloat(e.target.value) || 50
                      }
                    }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Targets */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Performance Targets</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Target Loaded Mile Ratio:
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={settings.routeOptimization.targetLoadedMileRatio}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      routeOptimization: {
                        ...prev.routeOptimization,
                        targetLoadedMileRatio: parseFloat(e.target.value) || 0.75
                      }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Target Revenue/Hour ($):
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={settings.routeOptimization.targetRevenuePerHour}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      routeOptimization: {
                        ...prev.routeOptimization,
                        targetRevenuePerHour: parseFloat(e.target.value) || 200
                      }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Target Response Time (min):
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={settings.routeOptimization.targetResponseTime}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      routeOptimization: {
                        ...prev.routeOptimization,
                        targetResponseTime: parseInt(e.target.value) || 12
                      }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Target Efficiency:
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={settings.routeOptimization.targetEfficiency}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      routeOptimization: {
                        ...prev.routeOptimization,
                        targetEfficiency: parseFloat(e.target.value) || 0.85
                      }
                    }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Algorithm Settings */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Algorithm Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Optimization Algorithm:
                </label>
                <select
                  value={settings.routeOptimization.optimizationAlgorithm}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    routeOptimization: {
                      ...prev.routeOptimization,
                      optimizationAlgorithm: e.target.value
                    }
                  }))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="HYBRID">Hybrid</option>
                  <option value="GREEDY">Greedy</option>
                  <option value="GENETIC">Genetic</option>
                  <option value="SIMULATED_ANNEALING">Simulated Annealing</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Max Optimization Time (sec):
                </label>
                <input
                  type="number"
                  step="5"
                  value={settings.routeOptimization.maxOptimizationTime}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    routeOptimization: {
                      ...prev.routeOptimization,
                      maxOptimizationTime: parseInt(e.target.value) || 30
                    }
                  }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Enable Real-time Optimization:
                </label>
                <input
                  type="checkbox"
                  checked={settings.routeOptimization.enableRealTimeOptimization}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    routeOptimization: {
                      ...prev.routeOptimization,
                      enableRealTimeOptimization: e.target.checked
                    }
                  }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Preview */}
        <div className="space-y-6">
          {/* Real-time Optimization (Phase 5) */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: streamConnected ? '#16a34a' : '#9ca3af' }} />
              <h3 className="text-lg font-semibold text-gray-900">Real-time Optimization</h3>
              <span className="ml-2 text-xs text-gray-500">{streamConnected ? 'Live' : 'Disconnected'}</span>
              <button
                onClick={() => setStreamPaused(p => !p)}
                className="ml-auto px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
              >{streamPaused ? 'Resume' : 'Pause'}</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Total Trips (5m)</div>
                <div className="text-lg font-semibold">{realtimeMetrics.totalTrips}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Completed Trips</div>
                <div className="text-lg font-semibold">{realtimeMetrics.completedTrips}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Avg Response (min)</div>
                <div className="text-lg font-semibold">{realtimeMetrics.averageResponseTime.toFixed(1)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Avg Trip Time (min)</div>
                <div className="text-lg font-semibold">{realtimeMetrics.averageTripTime.toFixed(1)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Revenue (est)</div>
                <div className="text-lg font-semibold">${realtimeMetrics.totalRevenue.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">Efficiency</div>
                <div className="text-lg font-semibold">{(realtimeMetrics.efficiency * 100).toFixed(0)}%</div>
              </div>
            </div>
            {realtimeMetrics.lastUpdated && (
              <div className="mt-2 text-xs text-gray-500">Updated {new Date(realtimeMetrics.lastUpdated).toLocaleTimeString()}</div>
            )}
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Calculator className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Revenue Preview</h3>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Sample trip:</strong> ALS transport, MEDIUM priority, 15 miles, medicare insurance
              </p>
            </div>

            <div className="space-y-4">
              {/* Revenue Breakdown */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Revenue Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Standard Rate:</span>
                    <span className="text-sm font-semibold text-gray-900">${preview.standardRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Mileage Rate:</span>
                    <span className="text-sm font-semibold text-gray-900">${preview.mileageRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Insurance Rate:</span>
                    <span className="text-lg font-semibold text-blue-600">${preview.insuranceRate}</span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-900 mb-3">Cost Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Crew Cost:</span>
                    <span className="text-sm font-semibold text-gray-900">${preview.crewCost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Vehicle Cost:</span>
                    <span className="text-sm font-semibold text-gray-900">${preview.vehicleCost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                    <span className="text-lg font-semibold text-red-600">${preview.totalCost}</span>
                  </div>
                </div>
              </div>

              {/* Profitability Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-900 mb-3">Profitability Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Net Profit:</span>
                    <span className={`text-lg font-semibold ${preview.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${preview.netProfit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Profit Margin:</span>
                    <span className={`text-lg font-semibold ${preview.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {preview.profitMargin}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What-if Scenario (Phase 5) */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What-if Scenario</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Deadhead Mile Weight</label>
                <input type="number" step="0.1" value={settings.routeOptimization.deadheadMileWeight} onChange={(e)=>setSettings(prev=>({...prev,routeOptimization:{...prev.routeOptimization,deadheadMileWeight: parseFloat(e.target.value)||0}}))} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Wait Time Weight</label>
                <input type="number" step="0.1" value={settings.routeOptimization.waitTimeWeight} onChange={(e)=>setSettings(prev=>({...prev,routeOptimization:{...prev.routeOptimization,waitTimeWeight: parseFloat(e.target.value)||0}}))} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Backhaul Bonus</label>
                <input type="number" step="5" value={settings.routeOptimization.backhaulRevenueBonus} onChange={(e)=>setSettings(prev=>({...prev,routeOptimization:{...prev.routeOptimization,backhaulRevenueBonus: parseFloat(e.target.value)||0}}))} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Unit IDs (comma-separated, optional)</label>
                  <input type="text" value={whatIfUnitIds} onChange={(e)=>setWhatIfUnitIds(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="leave blank to auto-select" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Request IDs (comma-separated, optional)</label>
                  <input type="text" value={whatIfRequestIds} onChange={(e)=>setWhatIfRequestIds(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="leave blank to auto-select" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={async ()=>{
                  try{
                    setOptimizationLoading(true);

                    // Resolve unitIds
                    let unitIds: string[] = whatIfUnitIds.split(',').map(s=>s.trim()).filter(Boolean);
                    if (unitIds.length === 0) {
                      try {
                        const r = await api.get('/api/units');
                        const j = r.data;
                        unitIds = (j?.data || []).slice(0,3).map((u:any)=>u.id);
                      } catch {}
                    }

                    // Resolve requestIds (pending trips)
                    let requestIds: string[] = whatIfRequestIds.split(',').map(s=>s.trim()).filter(Boolean);
                    if (requestIds.length === 0) {
                      try {
                        const r = await api.get('/api/trips?status=PENDING');
                        const j = r.data;
                        requestIds = (j?.data || []).slice(0,5).map((t:any)=>t.id);
                      } catch {}
                    }

                    const scenarioSettings = { ...settings.routeOptimization };
                    const baseSettings = { ...settings.routeOptimization };

                    const resp = await api.post('/api/optimize/what-if', {
                      unitIds, 
                      requestIds, 
                      scenarioSettings, 
                      baseSettings
                    });
                    const data = resp.data;
                    setWhatIfResult(data?.data || null);
                  } finally { setOptimizationLoading(false); }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                disabled={optimizationLoading}
              >{optimizationLoading? 'Running...' : 'Run What-if'}</button>
              {whatIfResult ? (
                <div className="text-sm text-gray-600">
                  Δ Revenue: ${((whatIfResult?.differences?.revenueDifference)||0).toFixed(2)} · Δ Deadhead: {((whatIfResult?.differences?.deadheadMilesDifference)||0).toFixed(1)} mi · Δ Efficiency: {(((whatIfResult?.differences?.efficiencyDifference)||0)*100).toFixed(0)}%
                </div>
              ) : (
                <div className="text-sm text-gray-600">Ready to simulate changes using current weights and constraints.</div>
              )}
            </div>
          </div>

          {/* Optimization Preview */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Route className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Optimization Preview</h3>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Sample scenario:</strong> 2 units, 2 requests with current optimization settings
              </p>
            </div>

            {optimizationLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-gray-600">Calculating optimization...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Optimization Metrics */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">Optimization Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Total Revenue:</span>
                        <span className="text-sm font-semibold text-gray-900">${optimizationPreview.totalRevenue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Loaded Mile Ratio:</span>
                        <span className="text-sm font-semibold text-gray-900">{(optimizationPreview.loadedMileRatio * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Backhaul Pairs:</span>
                        <span className="text-sm font-semibold text-gray-900">{optimizationPreview.backhaulPairs}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Total Miles:</span>
                        <span className="text-sm font-semibold text-gray-900">{optimizationPreview.totalMiles.toFixed(1)} mi</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Deadhead Miles:</span>
                        <span className="text-sm font-semibold text-gray-900">{optimizationPreview.totalDeadheadMiles.toFixed(1)} mi</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Avg Response Time:</span>
                        <span className="text-sm font-semibold text-gray-900">{optimizationPreview.averageResponseTime.toFixed(1)} min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance vs Targets */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-900 mb-3">Performance vs Targets</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Loaded Mile Ratio:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">{(optimizationPreview.loadedMileRatio * 100).toFixed(1)}%</span>
                        <span className="text-xs text-gray-500">/ {(settings.routeOptimization.targetLoadedMileRatio * 100).toFixed(1)}%</span>
                        <span className={`text-xs ${optimizationPreview.loadedMileRatio >= settings.routeOptimization.targetLoadedMileRatio ? 'text-green-600' : 'text-red-600'}`}>
                          {optimizationPreview.loadedMileRatio >= settings.routeOptimization.targetLoadedMileRatio ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Revenue/Hour:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">${(optimizationPreview.totalRevenue / 2).toFixed(2)}</span>
                        <span className="text-xs text-gray-500">/ ${settings.routeOptimization.targetRevenuePerHour}</span>
                        <span className={`text-xs ${(optimizationPreview.totalRevenue / 2) >= settings.routeOptimization.targetRevenuePerHour ? 'text-green-600' : 'text-red-600'}`}>
                          {(optimizationPreview.totalRevenue / 2) >= settings.routeOptimization.targetRevenuePerHour ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Response Time:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">{optimizationPreview.averageResponseTime.toFixed(1)} min</span>
                        <span className="text-xs text-gray-500">/ {settings.routeOptimization.targetResponseTime} min</span>
                        <span className={`text-xs ${optimizationPreview.averageResponseTime <= settings.routeOptimization.targetResponseTime ? 'text-green-600' : 'text-red-600'}`}>
                          {optimizationPreview.averageResponseTime <= settings.routeOptimization.targetResponseTime ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Efficiency:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">{(optimizationPreview.averageEfficiency * 100).toFixed(1)}%</span>
                        <span className="text-xs text-gray-500">/ {(settings.routeOptimization.targetEfficiency * 100).toFixed(1)}%</span>
                        <span className={`text-xs ${optimizationPreview.averageEfficiency >= settings.routeOptimization.targetEfficiency ? 'text-green-600' : 'text-red-600'}`}>
                          {optimizationPreview.averageEfficiency >= settings.routeOptimization.targetEfficiency ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optimization Weights Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Current Optimization Weights</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deadhead (α):</span>
                      <span className="font-medium">{settings.routeOptimization.deadheadMileWeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wait Time (β):</span>
                      <span className="font-medium">{settings.routeOptimization.waitTimeWeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Backhaul (γ):</span>
                      <span className="font-medium">{settings.routeOptimization.backhaulBonusWeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overtime (δ):</span>
                      <span className="font-medium">{settings.routeOptimization.overtimeRiskWeight}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSettings({
                    baseRates: { BLS: 150, ALS: 250, CCT: 400 },
                    perMileRates: { BLS: 2.5, ALS: 3.75, CCT: 5.0 },
                    priorityMultipliers: { LOW: 1.0, MEDIUM: 1.1, HIGH: 1.25, URGENT: 1.5 },
                    specialRequirementsSurcharge: 50,
                    insuranceRates: { medicare: 0.85, medicaid: 0.80, private: 1.0 },
                    crewRoles: {
                      EMT: 25.00,
                      Paramedic: 35.00,
                      RN: 45.00,
                      CCTSpecialist: 40.00,
                      CriticalCareParamedic: 42.00
                    },
                    overtimeMultiplier: 1.5,
                    shiftLengthHours: 12.0,
                    maxOvertimeHours: 4.0,
                    vehicleCostPerMile: 0.75,
                    fuelCostPerMile: 0.25,
                    maintenanceCostPerMile: 0.15,
                    crewComposition: {
                      BLS: ['EMT', 'EMT'],
                      ALS: ['EMT', 'Paramedic'],
                      CCT: ['RN', 'CriticalCareParamedic']
                    },
                    // Advanced Pricing Models (Phase 2)
                    timeBasedPricing: {
                      peakHourMultipliers: {
                        '6-9AM': 1.3,
                        '5-8PM': 1.4,
                        'Other': 1.0
                      },
                      weekendMultipliers: {
                        'Saturday': 1.2,
                        'Sunday': 1.3,
                        'Weekday': 1.0
                      },
                      seasonalMultipliers: {
                        'Winter': 1.1,
                        'Spring': 1.0,
                        'Summer': 1.0,
                        'Fall': 1.0
                      }
                    },
                    geographicPricing: {
                      zoneMultipliers: {
                        'Urban': 1.0,
                        'Suburban': 1.1,
                        'Rural': 1.3,
                        'Remote': 1.5
                      },
                      distanceTiers: {
                        '0-10mi': 1.0,
                        '10-25mi': 0.95,
                        '25-50mi': 0.9,
                        '50+mi': 0.85
                      }
                    },
                    serviceSpecificPricing: {
                      specialRequirements: {
                        'Oxygen': 25,
                        'Monitoring': 50,
                        'Isolation': 75,
                        'Bariatric': 100
                      },
                      isolationPricing: 75,
                      bariatricPricing: 100,
                      oxygenPricing: 25,
                      monitoringPricing: 50
                    },
                    insuranceSpecificRates: {
                      'Medicare': 0.85,
                      'Medicaid': 0.80,
                      'Private': 1.0,
                      'SelfPay': 1.2
                    },
                    // Route Optimization Parameters (Phase 3)
                    routeOptimization: {
                      // Optimization Weights (α, β, γ, δ parameters)
                      deadheadMileWeight: 1.0,
                      waitTimeWeight: 1.0,
                      backhaulBonusWeight: 1.0,
                      overtimeRiskWeight: 1.0,
                      revenueWeight: 1.0,
                      crewAvailabilityWeight: 1.0,
                      equipmentCompatibilityWeight: 1.0,
                      patientPriorityWeight: 1.0,
                      // Constraint Settings
                      maxDeadheadMiles: 50.0,
                      maxWaitTimeMinutes: 30,
                      maxOvertimeHours: 4.0,
                      maxResponseTimeMinutes: 15,
                      maxServiceDistance: 100.0,
                      // Backhaul Optimization
                      backhaulTimeWindow: 60,
                      backhaulDistanceLimit: 25.0,
                      backhaulRevenueBonus: 50.0,
                      enableBackhaulOptimization: true,
                      // Performance Targets
                      targetLoadedMileRatio: 0.75,
                      targetRevenuePerHour: 200.0,
                      targetResponseTime: 12,
                      targetEfficiency: 0.85,
                      // Algorithm Settings
                      optimizationAlgorithm: 'HYBRID',
                      maxOptimizationTime: 30,
                      enableRealTimeOptimization: true
                    }
                  });
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Reset to Defaults
              </button>
              <button
                onClick={loadSavedSettings}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Reload Saved Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 4: Cost Analysis & Profitability Dashboard */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Cost Analysis & Profitability Dashboard</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="quarter">Quarter</option>
                <option value="year">Year</option>
              </select>
            </div>
            <button
              onClick={createSampleCostBreakdown}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Activity className="h-4 w-4 mr-2" />
              Add Sample Data
            </button>
            <button
              onClick={loadCostAnalysisData}
              disabled={costAnalysisLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${costAnalysisLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {costAnalysisLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg text-gray-600">Loading cost analysis data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cost Analysis Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Metrics */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <DollarIcon className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Key Financial Metrics</h3>
                </div>
                
                {costAnalysisSummary ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-green-800">Total Revenue</div>
                      <div className="text-2xl font-bold text-green-900">${costAnalysisSummary.totalRevenue.toFixed(2)}</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-red-800">Total Cost</div>
                      <div className="text-2xl font-bold text-red-900">${costAnalysisSummary.totalCost.toFixed(2)}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-blue-800">Gross Profit</div>
                      <div className="text-2xl font-bold text-blue-900">${costAnalysisSummary.grossProfit.toFixed(2)}</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-purple-800">Profit Margin</div>
                      <div className="text-2xl font-bold text-purple-900">{costAnalysisSummary.averageProfitMargin.toFixed(1)}%</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No cost analysis data available. Click "Add Sample Data" to get started.
                  </div>
                )}
              </div>

              {/* Efficiency Metrics */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <Activity className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Efficiency Metrics</h3>
                </div>
                
                {costAnalysisSummary ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">Loaded Mile Ratio</div>
                      <div className="text-xl font-bold text-gray-900">{(costAnalysisSummary.averageLoadedMileRatio * 100).toFixed(1)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">Revenue per Mile</div>
                      <div className="text-xl font-bold text-gray-900">${costAnalysisSummary.averageRevenuePerMile.toFixed(2)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">Cost per Mile</div>
                      <div className="text-xl font-bold text-gray-900">${costAnalysisSummary.averageCostPerMile.toFixed(2)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No efficiency data available.
                  </div>
                )}
              </div>

              {/* Profitability Analysis */}
              {profitabilityAnalysis && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Profitability Trends ({profitabilityAnalysis.period})</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">Revenue Growth</div>
                      <div className={`text-xl font-bold ${profitabilityAnalysis.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitabilityAnalysis.revenueGrowth >= 0 ? '+' : ''}{profitabilityAnalysis.revenueGrowth.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">Cost Growth</div>
                      <div className={`text-xl font-bold ${profitabilityAnalysis.costGrowth >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {profitabilityAnalysis.costGrowth >= 0 ? '+' : ''}{profitabilityAnalysis.costGrowth.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">Profit Growth</div>
                      <div className={`text-xl font-bold ${profitabilityAnalysis.profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitabilityAnalysis.profitGrowth >= 0 ? '+' : ''}{profitabilityAnalysis.profitGrowth.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-600">Revenue/Hour</div>
                      <div className="text-xl font-bold text-gray-900">${profitabilityAnalysis.efficiencyMetrics.revenuePerHour.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trip Cost Breakdowns */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <PieChart className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Trip Breakdowns</h3>
                </div>
                
                {tripCostBreakdowns.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {tripCostBreakdowns.slice(0, 10).map((breakdown) => (
                      <div key={breakdown.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-sm text-gray-900">{breakdown.transportLevel} - {breakdown.priorityLevel}</div>
                            <div className="text-xs text-gray-500">{breakdown.tripDistance} miles</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-semibold ${breakdown.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${breakdown.grossProfit.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">{breakdown.profitMargin.toFixed(1)}% margin</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Revenue:</span>
                            <span className="font-medium">${breakdown.totalRevenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cost:</span>
                            <span className="font-medium">${breakdown.totalCost.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No trip breakdowns available.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueSettings;
