import React, { useState, useEffect } from 'react';
import { Bell, Mail, Settings, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  newTripAlerts: boolean;
  statusUpdates: boolean;
  emailAddress: string | null;
  phoneNumber: string | null;
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    newTripAlerts: true,
    statusUpdates: true,
    emailAddress: null,
    phoneNumber: null
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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/trips/notifications/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
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
      const token = localStorage.getItem('token');
      console.log('TCC_DEBUG: Sending settings to API:', settings);
      
      const response = await fetch('/api/trips/notifications/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      console.log('TCC_DEBUG: API response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('TCC_DEBUG: Settings saved successfully:', responseData);
        setMessage({ type: 'success', text: 'Notification settings saved successfully!' });
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await response.json();
        console.log('TCC_DEBUG: Save failed:', errorData);
        setMessage({ type: 'error', text: errorData.error || 'Failed to save settings' });
        // Clear error message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error saving notification settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/trips/test-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setEmailTestStatus('success');
        setMessage({ type: 'success', text: 'Email service connection successful!' });
      } else {
        setEmailTestStatus('error');
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Email service connection failed' });
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error testing email connection:', error);
      setEmailTestStatus('error');
      setMessage({ type: 'error', text: 'Email service connection failed' });
    }
  };

  const testSMSConnection = async () => {
    setSmsTestStatus('testing');
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/trips/test-sms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSmsTestStatus('success');
        setMessage({ type: 'success', text: 'SMS service connection successful!' });
      } else {
        setSmsTestStatus('error');
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'SMS service connection failed' });
      }
    } catch (error) {
      console.error('TCC_DEBUG: Error testing SMS connection:', error);
      setSmsTestStatus('error');
      setMessage({ type: 'error', text: 'SMS service connection failed' });
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
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </div>
          )}

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
                  value={settings.emailAddress ?? ''}
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
                  value={settings.phoneNumber ?? ''}
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
