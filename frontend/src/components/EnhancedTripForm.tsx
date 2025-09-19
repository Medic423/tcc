import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  X,
  ChevronRight,
  ChevronLeft,
  QrCode,
  MapPin,
  Clock,
  User,
  Stethoscope,
  Truck
} from 'lucide-react';
import { tripsAPI } from '../services/api';

interface EnhancedTripFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    facilityName?: string;
    facilityType?: string;
  };
  onTripCreated: () => void;
  onCancel?: () => void;
}

interface FormData {
  // Patient Information
  patientId: string;
  patientWeight: string;
  specialNeeds: string;
  insuranceCompany: string;
  generateQRCode: boolean;
  
  // Trip Details
  fromLocation: string;
  pickupLocationId: string;
  toLocation: string;
  scheduledTime: string;
  transportLevel: string;
  urgencyLevel: string;
  
  // Clinical Details
  diagnosis: string;
  mobilityLevel: string;
  oxygenRequired: boolean;
  monitoringRequired: boolean;
  
  // Agency Selection
  selectedAgencies: string[];
  notificationRadius: number;
  
  // Additional Notes
  notes: string;
}

interface PickupLocation {
  id: string;
  hospitalId: string;
  name: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  floor?: string;
  room?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hospital?: {
    id: string;
    name: string;
  };
}

interface FormOptions {
  diagnosis: string[];
  mobility: string[];
  transportLevel: string[];
  urgency: string[];
  insurance: string[];
  facilities: any[];
  agencies: any[];
  pickupLocations: PickupLocation[];
}

const EnhancedTripForm: React.FC<EnhancedTripFormProps> = ({ user, onTripCreated, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formOptions, setFormOptions] = useState<FormOptions>({
    diagnosis: [],
    mobility: [],
    transportLevel: [],
    urgency: [],
    insurance: [],
    facilities: [],
    agencies: [],
    pickupLocations: []
  });

  const [formData, setFormData] = useState<FormData>({
    patientId: '',
    patientWeight: '',
    specialNeeds: '',
    insuranceCompany: '',
    generateQRCode: false,
    fromLocation: user.facilityName || '',
    pickupLocationId: '',
    toLocation: '',
    scheduledTime: new Date().toISOString().slice(0, 16), // Default to current time in datetime-local format
    transportLevel: 'BLS',
    urgencyLevel: 'Routine',
    diagnosis: '',
    mobilityLevel: 'Ambulatory',
    oxygenRequired: false,
    monitoringRequired: false,
    selectedAgencies: [],
    notificationRadius: 100,
    notes: ''
  });

  const [destinationMode, setDestinationMode] = useState<'select' | 'manual'>('select');
  const [loadingPickupLocations, setLoadingPickupLocations] = useState(false);

  const steps = [
    { id: 1, name: 'Patient Info', icon: User },
    { id: 2, name: 'Trip Details', icon: MapPin },
    { id: 3, name: 'Clinical Info', icon: Stethoscope },
    { id: 4, name: 'Agency Selection', icon: Truck },
    { id: 5, name: 'Review & Submit', icon: CheckCircle }
  ];

  useEffect(() => {
    loadFormOptions();
  }, []);

  // Load pickup locations when fromLocation is set (including pre-selected facility)
  useEffect(() => {
    if (formData.fromLocation && formOptions.facilities.length > 0) {
      const selectedFacility = formOptions.facilities.find(f => f.name === formData.fromLocation);
      if (selectedFacility) {
        loadPickupLocationsForHospital(selectedFacility.id);
      }
    }
  }, [formData.fromLocation, formOptions.facilities]);

  // Load agencies when reaching step 4 (Agency Selection)
  useEffect(() => {
    console.log('TCC_DEBUG: Agency loading useEffect triggered', {
      currentStep,
      fromLocation: formData.fromLocation,
      facilitiesCount: formOptions.facilities.length
    });
    
    if (currentStep === 4 && formData.fromLocation && formOptions.facilities.length > 0) {
      const selectedFacility = formOptions.facilities.find(f => f.name === formData.fromLocation);
      console.log('TCC_DEBUG: Selected facility:', selectedFacility);
      if (selectedFacility) {
        loadAgenciesForHospital(selectedFacility.id);
      }
    }
  }, [currentStep, formData.fromLocation, formOptions.facilities]);

  const loadFormOptions = async () => {
    try {
      const [diagnosisRes, mobilityRes, transportRes, urgencyRes, insuranceRes, facilitiesRes] = await Promise.all([
        tripsAPI.getOptions.diagnosis(),
        tripsAPI.getOptions.mobility(),
        tripsAPI.getOptions.transportLevel(),
        tripsAPI.getOptions.urgency(),
        tripsAPI.getOptions.insurance(),
        fetch('/api/tcc/facilities', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }).then(res => res.json())
      ]);

      setFormOptions({
        diagnosis: diagnosisRes.data.data || [],
        mobility: mobilityRes.data.data || [],
        transportLevel: transportRes.data.data || [],
        urgency: urgencyRes.data.data || [],
        insurance: insuranceRes.data.data || [],
        facilities: facilitiesRes.data || [],
        agencies: []
      });
    } catch (error) {
      console.error('Error loading form options:', error);
    }
  };

  const loadAgenciesForHospital = async (hospitalId: string) => {
    try {
      console.log('TCC_DEBUG: Loading agencies for hospital:', hospitalId, 'with radius:', formData.notificationRadius);
      const response = await tripsAPI.getAgenciesForHospital(hospitalId, formData.notificationRadius);
      console.log('TCC_DEBUG: Agencies response:', response.data);
      setFormOptions(prev => ({
        ...prev,
        agencies: response.data.data || []
      }));
    } catch (error) {
      console.error('Error loading agencies:', error);
    }
  };

  const loadPickupLocationsForHospital = async (hospitalId: string) => {
    try {
      setLoadingPickupLocations(true);
      const response = await fetch(`/api/tcc/pickup-locations/hospital/${hospitalId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFormOptions(prev => ({
            ...prev,
            pickupLocations: data.data || []
          }));
        }
      }
    } catch (error) {
      console.error('Error loading pickup locations:', error);
    } finally {
      setLoadingPickupLocations(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Load pickup locations when fromLocation changes
    if (name === 'fromLocation' && value) {
      const selectedFacility = formOptions.facilities.find(f => f.name === value);
      if (selectedFacility) {
        loadPickupLocationsForHospital(selectedFacility.id);
      } else {
        // Clear pickup locations if facility not found
        setFormOptions(prev => ({
          ...prev,
          pickupLocations: []
        }));
        setFormData(prev => ({
          ...prev,
          pickupLocationId: ''
        }));
      }
    }

    // Load agencies when destination changes (only for selected facilities)
    if (name === 'toLocation' && value && destinationMode === 'select') {
      const selectedFacility = formOptions.facilities.find(f => f.name === value);
      if (selectedFacility) {
        loadAgenciesForHospital(selectedFacility.id);
      }
    }
  };

  const handleDestinationModeChange = (mode: 'select' | 'manual') => {
    setDestinationMode(mode);
    // Clear destination when switching modes
    setFormData(prev => ({
      ...prev,
      toLocation: ''
    }));
    // Clear agencies when switching to manual mode
    if (mode === 'manual') {
      setFormOptions(prev => ({
        ...prev,
        agencies: []
      }));
    }
  };

  const handleAgencyToggle = (agencyId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAgencies: prev.selectedAgencies.includes(agencyId)
        ? prev.selectedAgencies.filter(id => id !== agencyId)
        : [...prev.selectedAgencies, agencyId]
    }));
  };

  const generatePatientId = () => {
    // Generate a random patient ID (in real app, this would be more sophisticated)
    const randomId = 'P' + Math.random().toString(36).substr(2, 8).toUpperCase();
    setFormData(prev => ({
      ...prev,
      patientId: randomId
    }));
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const tripData = {
        ...formData,
        patientWeight: formData.patientWeight ? parseFloat(formData.patientWeight) : null,
        notificationRadius: formData.notificationRadius || 100,
        scheduledTime: formData.scheduledTime || new Date().toISOString()
      };

      const response = await tripsAPI.createEnhanced(tripData);

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onTripCreated();
        }, 2000);
      } else {
        throw new Error(response.data.error || 'Failed to create transport request');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || error.message || 'Failed to create transport request');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-sm font-medium text-blue-800">Patient Information</h3>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Enter patient details. No names or ages for HIPAA compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient ID *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter patient ID"
                  />
                  <button
                    type="button"
                    onClick={generatePatientId}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Generate ID
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Weight (kgs)
                </label>
                <input
                  type="number"
                  name="patientWeight"
                  value={formData.patientWeight}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter weight in kilograms"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Company
                </label>
                <select
                  name="insuranceCompany"
                  value={formData.insuranceCompany}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select insurance company</option>
                  {formOptions.insurance.map((insurance) => (
                    <option key={insurance} value={insurance}>{insurance}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Needs
                </label>
                <input
                  type="text"
                  name="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter special needs"
                />
              </div>
            </div>

            {/* QR Code generation temporarily disabled for first version */}
            {/* <div className="flex items-center">
              <input
                type="checkbox"
                name="generateQRCode"
                checked={formData.generateQRCode}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Generate QR Code for patient tracking
              </label>
            </div> */}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-sm font-medium text-green-800">Trip Details</h3>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Specify origin, destination, and transport requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Location *
                </label>
                <select
                  name="fromLocation"
                  value={formData.fromLocation}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select origin facility</option>
                  {formOptions.facilities.map((facility) => (
                    <option key={facility.id} value={facility.name}>
                      {facility.name} - {facility.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location *
                </label>
                <select
                  name="pickupLocationId"
                  value={formData.pickupLocationId}
                  onChange={handleChange}
                  required
                  disabled={loadingPickupLocations}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingPickupLocations ? 'Loading pickup locations...' : 'Select pickup location'}
                  </option>
                  {formOptions.pickupLocations && formOptions.pickupLocations.length > 0 ? (
                    formOptions.pickupLocations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name} {location.floor && `(${location.floor})`}
                      </option>
                    ))
                  ) : (
                    !loadingPickupLocations && formData.fromLocation && (
                      <option value="" disabled>
                        No pickup locations available for this facility
                      </option>
                    )
                  )}
                </select>
                {formData.pickupLocationId && formOptions.pickupLocations && (
                  <div className="mt-2 text-sm text-gray-600">
                    {(() => {
                      const selectedLocation = formOptions.pickupLocations.find(loc => loc.id === formData.pickupLocationId);
                      return selectedLocation ? (
                        <div>
                          {selectedLocation.contactPhone && (
                            <p><strong>Contact:</strong> {selectedLocation.contactPhone}</p>
                          )}
                          {selectedLocation.contactEmail && (
                            <p><strong>Email:</strong> {selectedLocation.contactEmail}</p>
                          )}
                          {selectedLocation.room && (
                            <p><strong>Room:</strong> {selectedLocation.room}</p>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Location *
                </label>
                
                {/* Destination Mode Toggle */}
                <div className="flex space-x-4 mb-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="destinationMode"
                      value="select"
                      checked={destinationMode === 'select'}
                      onChange={(e) => handleDestinationModeChange(e.target.value as 'select' | 'manual')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Select from list</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="destinationMode"
                      value="manual"
                      checked={destinationMode === 'manual'}
                      onChange={(e) => handleDestinationModeChange(e.target.value as 'select' | 'manual')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Enter manually</span>
                  </label>
                </div>

                {/* Destination Input */}
                {destinationMode === 'select' ? (
                  <select
                    name="toLocation"
                    value={formData.toLocation}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select destination</option>
                    {formOptions.facilities.map((facility) => (
                      <option key={facility.id} value={facility.name}>
                        {facility.name} - {facility.type}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="toLocation"
                    value={formData.toLocation}
                    onChange={handleChange}
                    required
                    placeholder="Enter destination facility name and location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                )}
                
                {destinationMode === 'select' && formOptions.facilities.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">Loading facilities...</p>
                )}
                {destinationMode === 'manual' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the full facility name and location (e.g., "Johns Hopkins Hospital, Baltimore, MD")
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Time *
              </label>
              <input
                type="datetime-local"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transport Level *
                </label>
                <select
                  name="transportLevel"
                  value={formData.transportLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  {formOptions.transportLevel.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level *
                </label>
                <select
                  name="urgencyLevel"
                  value={formData.urgencyLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  {formOptions.urgency.map((urgency) => (
                    <option key={urgency} value={urgency}>{urgency}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <Stethoscope className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-sm font-medium text-purple-800">Clinical Details</h3>
              </div>
              <p className="text-sm text-purple-700 mt-1">
                Provide clinical information for appropriate transport planning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Diagnosis
                </label>
                <select
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select diagnosis</option>
                  {formOptions.diagnosis.map((diagnosis) => (
                    <option key={diagnosis} value={diagnosis}>{diagnosis}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobility Level
                </label>
                <select
                  name="mobilityLevel"
                  value={formData.mobilityLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  {formOptions.mobility.map((mobility) => (
                    <option key={mobility} value={mobility}>{mobility}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="oxygenRequired"
                  checked={formData.oxygenRequired}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Oxygen Required
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="monitoringRequired"
                  checked={formData.monitoringRequired}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Continuous Monitoring Required
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-orange-600 mr-2" />
                <h3 className="text-sm font-medium text-orange-800">EMS Agency Selection</h3>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Select agencies to notify within {formData.notificationRadius} miles.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Radius (miles)
              </label>
              <input
                type="number"
                name="notificationRadius"
                value={formData.notificationRadius}
                onChange={handleChange}
                min="10"
                max="200"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Agencies
              </label>
              
              {destinationMode === 'manual' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Manual Destination Selected:</strong> Agency selection is not available for manually entered destinations. 
                        The transport request will be broadcast to all available agencies in the region.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {console.log('TCC_DEBUG: Rendering agencies:', formOptions.agencies)}
                  {formOptions.agencies.length > 0 ? (
                  formOptions.agencies.map((agency) => (
                    <div
                      key={agency.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.selectedAgencies.includes(agency.id)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                      onClick={() => handleAgencyToggle(agency.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{agency.name}</h4>
                          <p className="text-sm text-gray-500">{agency.serviceType}</p>
                          <p className="text-xs text-gray-400">
                            {agency.availableUnits || 0}/{agency.totalUnits || 0} units available
                          </p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.selectedAgencies.includes(agency.id)}
                            onChange={() => {}}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No agencies available within the specified radius.
                  </p>
                )}
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-sm font-medium text-gray-800">Review & Submit</h3>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                Review all information before submitting the transport request.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                  <p className="text-sm text-gray-600">ID: {formData.patientId}</p>
                  {formData.patientWeight && <p className="text-sm text-gray-600">Weight: {formData.patientWeight} kgs</p>}
                  {formData.insuranceCompany && <p className="text-sm text-gray-600">Insurance: {formData.insuranceCompany}</p>}
                  {formData.specialNeeds && <p className="text-sm text-gray-600">Special Needs: {formData.specialNeeds}</p>}
                  {/* {formData.generateQRCode && <p className="text-sm text-blue-600">QR Code: Generated</p>} */}
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Trip Details</h4>
                  <p className="text-sm text-gray-600">From: {formData.fromLocation}</p>
                  {formData.pickupLocationId && formOptions.pickupLocations && (() => {
                    const selectedLocation = formOptions.pickupLocations.find(loc => loc.id === formData.pickupLocationId);
                    return selectedLocation ? (
                      <p className="text-sm text-gray-600">Pickup: {selectedLocation.name} {selectedLocation.floor && `(${selectedLocation.floor})`}</p>
                    ) : null;
                  })()}
                  <p className="text-sm text-gray-600">To: {formData.toLocation}</p>
                  <p className="text-sm text-gray-600">Level: {formData.transportLevel}</p>
                  <p className="text-sm text-gray-600">Urgency: {formData.urgencyLevel}</p>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Clinical Details</h4>
                  {formData.diagnosis && <p className="text-sm text-gray-600">Diagnosis: {formData.diagnosis}</p>}
                  <p className="text-sm text-gray-600">Mobility: {formData.mobilityLevel}</p>
                  {formData.oxygenRequired && <p className="text-sm text-red-600">Oxygen Required</p>}
                  {formData.monitoringRequired && <p className="text-sm text-red-600">Monitoring Required</p>}
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Agency Selection</h4>
                  <p className="text-sm text-gray-600">Selected: {formData.selectedAgencies.length} agencies</p>
                  <p className="text-sm text-gray-600">Radius: {formData.notificationRadius} miles</p>
                </div>
              </div>

              {formData.notes && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                  <p className="text-sm text-gray-600">{formData.notes}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive 
                    ? 'border-blue-500 bg-blue-500 text-white' 
                    : isCompleted 
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Enhanced Transport Request</h3>
          <p className="text-sm text-gray-500">Step {currentStep} of {steps.length}</p>
        </div>

        <div className="p-6">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Transport request created successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            <div className="flex justify-between mt-8">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>
              </div>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Request'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTripForm;
