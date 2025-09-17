import React, { useState, useEffect } from 'react';
import { DollarSign, Save, RefreshCw, Calculator, Users, Truck, Clock } from 'lucide-react';

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
