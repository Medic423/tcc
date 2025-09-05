import React from 'react';
import { MapPin } from 'lucide-react';

const Facilities: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage healthcare facilities in the system.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Facilities Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            Facilities management interface will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Facilities;
