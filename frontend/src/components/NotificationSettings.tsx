import React, { useState, useEffect } from 'react';
import { Bell, Mail, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  newTripAlerts: boolean;
  statusUpdates: boolean;
  emailAddress: string;
  phoneNumber: string;
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    newTripAlerts: true,
    statusUpdates: true,
    emailAddress: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailTestStatus, setEmailTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [smsTestStatus, setSmsTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchSettings();
  }, []);

  // Force re-render when component mounts to ensure fresh state
  useEffect(() => {
    console.log('TCC_DEBUG: NotificationSettings component mounted with settings:', settings);
  }, [settings]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/trips/notifications/settings');
      
      if (response.data.success) {
        // Ensure emailAddress and phoneNumber are always strings, not null
        const settingsData = {
          ...response.data.data,
          emailAddress: response.data.data.emailAddress || '',
          phoneNumber: response.data.data.phoneNumber || ''
        };
        console.log('TCC_DEBUG: Fetched settings for user:', settingsData);
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error fetching notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    console.log('TCC_DEBUG: Save button clicked with settings:', settings);
    setSaving(true);
    setMessage(null);

    try {
      console.log('TCC_DEBUG: Sending settings to API:', settings);
      
      const response = await api.put('/api/trips/notifications/settings', settings);

      console.log('TCC_DEBUG: API response status:', response.status);
      console.log('TCC_DEBUG: Settings saved successfully:', response.data);
      
      const successMessage = { type: 'success' as const, text: 'Notification settings saved successfully!' };
      console.log('TCC_DEBUG: Setting message to:', successMessage);
      setMessage(successMessage);
      // Clear message after 3 seconds
      setTimeout(() => {
        console.log('TCC_DEBUG: Clearing message after timeout');
        setMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('TCC_DEBUG: Error saving notification settings:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save settings';
      setMessage({ type: 'error', text: errorMessage });
      // Clear error message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const testEmailConnection = async () => {
    setEmailTestStatus('testing');
    setMessage(null);

    try {
      const response = await api.post('/api/trips/test-email');

      if (response.data.success) {
        setEmailTestStatus('success');
        setMessage({ type: 'success', text: 'Email service connection successful!' });
      } else {
        setEmailTestStatus('error');
        setMessage({ type: 'error', text: response.data.error || 'Email service connection failed' });
      }
    } catch (error: any) {
      console.error('TCC_DEBUG: Error testing email connection:', error);
      setEmailTestStatus('error');
      const errorMessage = error.response?.data?.error || 'Email service connection failed';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const testSMSConnection = async () => {
    setSmsTestStatus('testing');
    setMessage(null);

    try {
      const response = await api.post('/api/trips/test-sms');

      if (response.data.success) {
        setSmsTestStatus('success');
        setMessage({ type: 'success', text: 'SMS service connection successful!' });
      } else {
        setSmsTestStatus('error');
        setMessage({ type: 'error', text: response.data.error || 'SMS service connection failed' });
      }
    } catch (error: any) {
      console.error('TCC_DEBUG: Error testing SMS connection:', error);
      setSmsTestStatus('error');
      const errorMessage = error.response?.data?.error || 'SMS service connection failed';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | string) => {
    console.log('TCC_DEBUG: Setting change:', { key, value, currentSettings: settings });
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [key]: value
      };
      console.log('TCC_DEBUG: New settings after change:', newSettings);
      return newSettings;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading notification settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
          </div>
          <p className="text-gray-600 mt-2">
            Configure how you receive notifications about transport requests and updates.
          </p>
        </div>

        <div className="p-6">
          {(() => {
            console.log('TCC_DEBUG: Rendering message section, message state:', message);
            console.log('TCC_DEBUG: Message truthy check:', !!message);
            if (message) {
              console.log('TCC_DEBUG: Rendering message with type:', message.type, 'text:', message.text);
              return (
                <div 
                  className={`mb-6 p-6 rounded-lg flex items-center border-4 ${
                    message.type === 'success' 
                      ? 'bg-green-200 text-green-900 border-green-600 shadow-2xl' 
                      : 'bg-red-200 text-red-900 border-red-600 shadow-2xl'
                  }`} 
                  style={{
                    zIndex: 9999, 
                    position: 'relative',
                    minHeight: '60px',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="h-8 w-8 mr-4 text-green-700" />
                  ) : (
                    <AlertCircle className="h-8 w-8 mr-4 text-red-700" />
                  )}
                  <span className="text-xl font-bold">{message.text}</span>
                </div>
              );
            }
            return null;
          })()}

          <div className="space-y-6">
            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive email notifications for transport request updates
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Email Address */}
            {settings.emailNotifications && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.emailAddress}
                  onChange={(e) => handleSettingChange('emailAddress', e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">
                  This email will receive notifications about transport requests
                </p>
              </div>
            )}

            {/* SMS Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive SMS text messages for urgent transport requests
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Phone Number */}
            {settings.smsNotifications && (
              <div className="p-4 bg-green-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.phoneNumber}
                  onChange={(e) => handleSettingChange('phoneNumber', e.target.value)}
                  placeholder="Enter your phone number (e.g., +1234567890)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">
                  This phone number will receive SMS notifications for urgent transport requests
                </p>
              </div>
            )}

            {/* New Trip Alerts */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">New Trip Alerts</h3>
                  <p className="text-sm text-gray-600">
                    Get notified when new transport requests are created
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.newTripAlerts}
                  onChange={(e) => handleSettingChange('newTripAlerts', e.target.checked)}
                  className="sr-only peer"
                  disabled={!settings.emailNotifications}
                />
                <div className={`w-11 h-6 rounded-full peer ${
                  !settings.emailNotifications 
                    ? 'bg-gray-100 cursor-not-allowed' 
                    : 'bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300'
                } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
              </label>
            </div>

            {/* Status Updates */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Status Updates</h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications when transport request status changes
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.statusUpdates}
                  onChange={(e) => handleSettingChange('statusUpdates', e.target.checked)}
                  className="sr-only peer"
                  disabled={!settings.emailNotifications}
                />
                <div className={`w-11 h-6 rounded-full peer ${
                  !settings.emailNotifications 
                    ? 'bg-gray-100 cursor-not-allowed' 
                    : 'bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300'
                } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
              </label>
            </div>
          </div>

          {/* Service Tests */}
          <div className="mt-8 space-y-4">
            {/* Email Service Test */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email Service Test</h3>
              <p className="text-sm text-gray-600 mb-4">
                Test the email service connection to ensure notifications are working properly.
              </p>
              <button
                onClick={testEmailConnection}
                disabled={emailTestStatus === 'testing'}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  emailTestStatus === 'testing'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : emailTestStatus === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : emailTestStatus === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {emailTestStatus === 'testing' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    Testing...
                  </>
                ) : emailTestStatus === 'success' ? (
                  <>
                    <CheckCircle className="h-4 w-4 inline-block mr-2" />
                    Connection Successful
                  </>
                ) : emailTestStatus === 'error' ? (
                  <>
                    <AlertCircle className="h-4 w-4 inline-block mr-2" />
                    Connection Failed
                  </>
                ) : (
                  'Test Email Connection'
                )}
              </button>
            </div>

            {/* SMS Service Test */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">SMS Service Test</h3>
              <p className="text-sm text-gray-600 mb-4">
                Test the SMS service connection (placeholder for future Twilio integration).
              </p>
              <button
                onClick={testSMSConnection}
                disabled={smsTestStatus === 'testing'}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  smsTestStatus === 'testing'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : smsTestStatus === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : smsTestStatus === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {smsTestStatus === 'testing' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    Testing...
                  </>
                ) : smsTestStatus === 'success' ? (
                  <>
                    <CheckCircle className="h-4 w-4 inline-block mr-2" />
                    Connection Successful
                  </>
                ) : smsTestStatus === 'error' ? (
                  <>
                    <AlertCircle className="h-4 w-4 inline-block mr-2" />
                    Connection Failed
                  </>
                ) : (
                  'Test SMS Connection'
                )}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
