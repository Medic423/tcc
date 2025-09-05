import React from 'react';
import { BarChart3 } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          View system analytics and performance metrics.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">
            Analytics dashboard will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
