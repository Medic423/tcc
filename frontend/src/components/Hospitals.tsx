import React from 'react';
import { Building2 } from 'lucide-react';

const Hospitals: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage hospitals in the system.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Hospitals Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            Hospital management interface will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hospitals;
