import React, { useState } from 'react';
import RevenueSettings from './RevenueSettings';

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
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
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

      <RevenueSettings />
    </div>
  );
};

export default EMSAnalytics;
