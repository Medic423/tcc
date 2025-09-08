import React, { useState } from 'react';
import { ArrowLeft, Truck, AlertCircle } from 'lucide-react';

interface EMSLoginProps {
  onBack: () => void;
  onLogin: (user: any, token: string) => void;
}

const EMSLogin: React.FC<EMSLoginProps> = ({ onBack, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Import authAPI dynamically to avoid circular imports
      const { authAPI } = await import('../services/api');
      
      const response = await authAPI.emsLogin({
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        onLogin(response.data.user, response.data.token);
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err: any) {
      console.error('EMS login error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Network error. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login Options
          </button>
          
          <div className="flex justify-center">
            <div className="bg-orange-100 p-3 rounded-full">
              <Truck className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            EMS Agency Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your EMS agency account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Demo Credentials:</p>
              <p><strong>Email:</strong> admin@duncansvilleems.org</p>
              <p><strong>Password:</strong> duncansville123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EMSLogin;
