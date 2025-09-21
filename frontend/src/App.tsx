import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import TCCDashboard from './components/TCCDashboard';
import HealthcareDashboard from './components/HealthcareDashboard';
import EMSDashboard from './components/EMSDashboard';
import PublicLogin from './components/PublicLogin';
import HealthcareRegistration from './components/HealthcareRegistration';
import EMSRegistration from './components/EMSRegistration';
import HealthcareLogin from './components/HealthcareLogin';
import EMSLogin from './components/EMSLogin';
import { authAPI } from './services/api';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS';
  facilityName?: string;
  facilityType?: string;
  agencyName?: string;
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'public' | 'healthcare-register' | 'ems-register' | 'login' | 'healthcare-login' | 'ems-login'>('public');

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

    // Check for URL parameters to automatically show registration forms
    const urlParams = new URLSearchParams(window.location.search);
    const registerParam = urlParams.get('register');
    if (registerParam === 'healthcare') {
      setCurrentView('healthcare-register');
    } else if (registerParam === 'ems') {
      setCurrentView('ems-register');
    }

    checkAuth();
  }, []);

  const handleLogin = (userData: User, token: string) => {
    console.log('TCC_DEBUG: handleLogin called with userData:', userData);
    console.log('TCC_DEBUG: handleLogin called with token:', token ? 'present' : 'missing');
    
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('TCC_DEBUG: User state set, localStorage updated');
    
    // Only redirect for ADMIN/USER types, healthcare/EMS show their dashboards directly
    if (userData.userType === 'ADMIN' || userData.userType === 'USER') {
      console.log('TCC_DEBUG: Redirecting to dashboard for admin/user');
      window.location.href = '/dashboard';
    } else {
      console.log('TCC_DEBUG: No redirect needed for healthcare/EMS - component should re-render');
    }
    // No redirect needed for healthcare/EMS - component re-renders with new user state
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('public');
  };

  const handleRoleSelect = (role: 'healthcare' | 'ems' | 'tcc') => {
    if (role === 'tcc') {
      setCurrentView('login');
    } else if (role === 'healthcare') {
      setCurrentView('healthcare-login');
    } else if (role === 'ems') {
      setCurrentView('ems-login');
    }
  };

  const handleShowRegistration = (role: 'healthcare' | 'ems') => {
    if (role === 'healthcare') {
      setCurrentView('healthcare-register');
    } else {
      setCurrentView('ems-register');
    }
  };

  const handleRegistrationSuccess = () => {
    setCurrentView('public');
  };

  const handleBackToPublic = () => {
    setCurrentView('public');
  };

  const handleClearSession = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('public');
  };

  console.log('TCC_DEBUG: App render - user:', user, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If user is logged in, show appropriate dashboard based on user type
  if (user) {
    // Show different dashboards based on user type
    if (user.userType === 'HEALTHCARE') {
      return <HealthcareDashboard user={user} onLogout={handleLogout} />;
    } else if (user.userType === 'EMS') {
      return <EMSDashboard user={user} onLogout={handleLogout} />;
    } else {
      // ADMIN and USER types go to TCC Dashboard
      return (
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/dashboard/*"
              element={<TCCDashboard user={user} onLogout={handleLogout} />}
            />
            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </div>
      );
    }
  }

  // If not logged in, show public interface
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="*" element={
          <>
            {currentView === 'public' && (
              <PublicLogin 
                onRoleSelect={handleRoleSelect}
                onShowRegistration={handleShowRegistration}
                onClearSession={handleClearSession}
              />
            )}
            {currentView === 'healthcare-register' && (
              <HealthcareRegistration 
                onBack={handleBackToPublic}
                onSuccess={handleRegistrationSuccess}
              />
            )}
            {currentView === 'ems-register' && (
              <EMSRegistration 
                onBack={handleBackToPublic}
                onSuccess={handleRegistrationSuccess}
              />
            )}
            {currentView === 'login' && (
              <Login onLogin={handleLogin} onBack={handleBackToPublic} />
            )}
            {currentView === 'healthcare-login' && (
              <HealthcareLogin 
                onBack={handleBackToPublic}
                onLogin={handleLogin}
              />
            )}
            {currentView === 'ems-login' && (
              <EMSLogin 
                onBack={handleBackToPublic}
                onLogin={handleLogin}
              />
            )}
          </>
        } />
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
