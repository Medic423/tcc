import React, { useState, useEffect } from 'react';
import { DollarSign, Save, RefreshCw, Calculator, Users, Truck, Clock, MapPin, CreditCard, Settings } from 'lucide-react';

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

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    loadSavedSettings();
  }, []);

  // Calculate preview when settings change
  useEffect(() => {
    calculatePreview();
  }, [settings]);

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

  const updateSetting = (category: keyof RevenueSettings, field: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
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
        </div>

        {/* Revenue Preview */}
        <div className="space-y-6">
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
    </div>
  );
};

export default RevenueSettings;
