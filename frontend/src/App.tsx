import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import TCCDashboard from './components/TCCDashboard';
import { authAPI } from './services/api';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'ADMIN' | 'HOSPITAL' | 'EMS';
  hospitalName?: string;
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.verify();
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: User, token: string) => {
    console.log('TCC_DEBUG: handleLogin called with:', { userData, token });
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('TCC_DEBUG: User state updated, redirecting to dashboard');
    // Force redirect to dashboard
    window.location.href = '/dashboard';
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  console.log('TCC_DEBUG: App render - user:', user, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <TCCDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
