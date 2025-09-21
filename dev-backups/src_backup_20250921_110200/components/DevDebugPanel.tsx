// Development Debug Panel
// Only visible in development environment

import React, { useState, useEffect } from 'react';
import { getEnvironmentInfo, devUtils, isDevelopment } from '../utils/environment';
import { healthCheck } from '../services/api';

const DevDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  // Only render in development
  if (!isDevelopment) {
    return null;
  }

  useEffect(() => {
    setEnvInfo(getEnvironmentInfo());
    checkHealth();
  }, []);

  const checkHealth = async () => {
    const result = await healthCheck();
    setHealthStatus(result);
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
    devUtils.log('Debug panel toggled', { isOpen: !isOpen });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={togglePanel}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
      >
        {isOpen ? 'Hide Debug' : 'Show Debug'}
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Debug Panel</h3>
          
          {/* Environment Info */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Environment</h4>
            <div className="text-xs space-y-1">
              <div>Mode: <span className="font-mono">{envInfo?.environment}</span></div>
              <div>API URL: <span className="font-mono break-all">{envInfo?.apiUrl}</span></div>
              <div>Debug: <span className="font-mono">{envInfo?.featureFlags?.LOGGING ? 'ON' : 'OFF'}</span></div>
            </div>
          </div>

          {/* Health Status */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">API Health</h4>
            <div className="text-xs">
              <div className={`inline-block px-2 py-1 rounded text-white ${
                healthStatus?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {healthStatus?.status || 'Unknown'}
              </div>
              <button
                onClick={checkHealth}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Feature Flags</h4>
            <div className="text-xs space-y-1">
              {Object.entries(envInfo?.featureFlags || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className={`font-mono ${value ? 'text-green-600' : 'text-red-600'}`}>
                    {value ? 'ON' : 'OFF'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  devUtils.log('Manual log test');
                  console.log('Manual console log test');
                }}
                className="w-full text-left px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              >
                Test Logging
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full text-left px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded text-red-700"
              >
                Clear Storage & Reload
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={togglePanel}
            className="w-full text-center px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
          >
            Close Panel
          </button>
        </div>
      )}
    </div>
  );
};

export default DevDebugPanel;
