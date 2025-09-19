import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Truck, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  DollarSign,
  Navigation,
  ChevronDown,
  Plus,
  Activity,
  TrendingUp,
  FileText,
  Users,
  Settings,
  Database,
  AlertCircle,
  CheckCircle,
  BarChart2,
  PieChart,
  DollarSign as DollarIcon,
  CreditCard,
  UserPlus,
  Shield,
  Bell as BellIcon,
  HardDrive
} from 'lucide-react';
import Overview from './Overview';
import TripsView from './TripsView';
import Hospitals from './Hospitals';
import Agencies from './Agencies';
import HealthcarePortal from './HealthcarePortal';
import EMSDashboard from './EMSDashboard';
import NotificationSettings from './NotificationSettings';
import UserManagement from './UserManagement';
import BackupManagement from './BackupManagement';
import TCCUnitsManagement from './TCCUnitsManagement';
import TCCRouteOptimizer from './TCCRouteOptimizer';
import Analytics from './Analytics';
import FinancialDashboard from './FinancialDashboard';
import TCCCreateTrip from './TCCCreateTrip';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS';
  facilityName?: string;
  facilityType?: string;
  agencyName?: string;
}

interface TCCDashboardProps {
  user: User;
  onLogout: () => void;
}

const TCCDashboard: React.FC<TCCDashboardProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const getNavigation = () => {
    // Core Operations (Left) - Always visible
    const coreOperations = [
      { name: 'Status', href: '/dashboard', icon: Home, category: 'core' },
      { name: 'Trips', href: '/dashboard/trips', icon: Truck, category: 'core' },
      { name: 'Hospitals', href: '/dashboard/hospitals', icon: Building2, category: 'core' },
      { name: 'Agencies', href: '/dashboard/agencies', icon: Truck, category: 'core' },
    ];

    // Analysis & Reporting (Center)
    const analysisReporting = [
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, category: 'analysis' },
      { name: 'Financial', href: '/dashboard/financial', icon: DollarSign, category: 'analysis' },
    ];

    // Administration (Right) - Admin only
    const administration = [
      { name: 'Settings', href: '/dashboard/settings', icon: Menu, category: 'admin' },
    ];

    // Additional features
    const additionalFeatures = [
      // Notifications moved to Settings dropdown
    ];

    // Admin users see all sections
    if (user.userType === 'ADMIN') {
      return {
        coreOperations,
        analysisReporting,
        administration,
        additionalFeatures
      };
    } 
    
    // Regular users see core operations, analysis, and additional features (no admin)
    return {
      coreOperations,
      analysisReporting,
      administration: [],
      additionalFeatures
    };
  };

  const navigation = getNavigation();

  // Dropdown menu configurations
  const dropdownMenus = {
    settings: {
      title: 'Settings',
      icon: Settings,
      items: [
        { name: 'User Management', href: '/dashboard/settings', icon: Users },
        { name: 'Notifications', href: '/dashboard/settings/notifications', icon: BellIcon },
        { name: 'Backup', href: '/dashboard/settings/backup', icon: HardDrive },
      ]
    }
  };


  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && dropdownRefs.current[activeDropdown]) {
        const dropdownElement = dropdownRefs.current[activeDropdown];
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Flatten all navigation items for current page detection
  const allNavItems = [
    ...navigation.coreOperations,
    ...navigation.analysisReporting,
    ...navigation.administration,
    ...navigation.additionalFeatures
  ];

  const currentPage = allNavItems.find(item => 
    location.pathname === item.href || 
    (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
  )?.name || 'Dashboard';

  // Dropdown Menu Component
  const DropdownMenu = ({ menuKey, menu }: { menuKey: string; menu: any }) => {
    const isActive = activeDropdown === menuKey;
    const hasActiveItem = menu.items.some((item: any) => 
      location.pathname === item.href || 
      (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
    );

    return (
      <div className="relative" ref={el => dropdownRefs.current[menuKey] = el}>
        <button
          onClick={() => setActiveDropdown(isActive ? null : menuKey)}
          className={`${
            hasActiveItem
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
          } flex items-center px-1 py-2 text-sm font-medium border-b-2 border-transparent transition-colors`}
        >
          <menu.icon className="mr-2 h-4 w-4" />
          {menu.title}
          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isActive ? 'rotate-180' : ''}`} />
        </button>
        
        {isActive && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              {menu.items.map((item: any, index: number) => {
                const isItemActive = location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={index}
                    to={item.href}
                    className={`${
                      isItemActive
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-4 py-2 text-sm`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    <item.icon className={`mr-3 h-4 w-4 ${item.color || 'text-gray-400 group-hover:text-gray-500'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">TCC</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 border-t border-gray-200">
              {/* Core Operations */}
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Core Operations</h3>
              </div>
              {navigation.coreOperations.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                
                // Use dropdown for items that have dropdowns, otherwise use regular link
                if (item.hasDropdown) {
                  const menuKey = item.name.toLowerCase();
                  const menu = dropdownMenus[menuKey as keyof typeof dropdownMenus];
                  return (
                    <div key={item.name}>
                      <div className="px-3 py-2">
                        <div className="flex items-center text-gray-600 font-medium">
                          <menu.icon className="mr-3 h-5 w-5 text-gray-400" />
                          {menu.title}
                        </div>
                      </div>
                      {menu.items.map((dropdownItem: any, index: number) => {
                        const isItemActive = location.pathname === dropdownItem.href || 
                          (dropdownItem.href !== '/dashboard' && location.pathname.startsWith(dropdownItem.href));
                        return (
                          <Link
                            key={index}
                            to={dropdownItem.href}
                            className={`${
                              isItemActive
                                ? 'bg-primary-100 text-primary-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            } group flex items-center px-6 py-2 text-sm font-medium rounded-md ml-4`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <dropdownItem.icon
                              className={`${
                                isItemActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                              } mr-3 flex-shrink-0 h-4 w-4`}
                            />
                            {dropdownItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-base font-medium rounded-md`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Analysis & Reporting */}
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Analysis</h3>
              </div>
              {navigation.analysisReporting.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-base font-medium rounded-md`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Additional Features */}
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Additional</h3>
              </div>
              {navigation.additionalFeatures.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-3 py-2 text-base font-medium rounded-md`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Administration */}
              {navigation.administration.length > 0 && (
                <div>
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Administration</h3>
                  </div>
                  <div className="px-3 py-2">
                    <div className="flex items-center text-gray-600 font-medium">
                      <dropdownMenus.settings.icon className="mr-3 h-5 w-5 text-gray-400" />
                      {dropdownMenus.settings.title}
                    </div>
                  </div>
                  {dropdownMenus.settings.items.map((item: any, index: number) => {
                    const isActive = location.pathname === item.href || 
                      (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                    return (
                      <Link
                        key={index}
                        to={item.href}
                        className={`${
                          isActive
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-6 py-2 text-sm font-medium rounded-md ml-4`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon
                          className={`${
                            isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                          } mr-3 flex-shrink-0 h-4 w-4`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo and Logout */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">TCC</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Menu */}
              <nav className="flex space-x-8">
                {/* Core Operations */}
                <div className="flex space-x-6">
                  {navigation.coreOperations.map((item) => {
                    const isActive = location.pathname === item.href || 
                      (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                    
                    // Use dropdown for items that have dropdowns, otherwise use regular link
                    if (item.hasDropdown) {
                      const menuKey = item.name.toLowerCase();
                      return (
                        <DropdownMenu 
                          key={item.name} 
                          menuKey={menuKey} 
                          menu={dropdownMenus[menuKey as keyof typeof dropdownMenus]} 
                        />
                      );
                    }
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          isActive
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                        } flex items-center px-1 py-2 text-sm font-medium border-b-2 border-transparent transition-colors`}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                {/* Analysis & Reporting - Direct Links */}
                <div className="flex space-x-6">
                  {navigation.analysisReporting.map((item) => {
                    const isActive = location.pathname === item.href || 
                      (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          isActive
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                        } flex items-center px-1 py-2 text-sm font-medium border-b-2 border-transparent transition-colors`}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                {/* Additional Features */}
                <div className="flex space-x-6">
                  {navigation.additionalFeatures.map((item) => {
                    const isActive = location.pathname === item.href || 
                      (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          isActive
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                        } flex items-center px-1 py-2 text-sm font-medium border-b-2 border-transparent transition-colors`}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                {/* Administration - Settings Dropdown */}
                {navigation.administration.length > 0 && (
                  <div className="flex space-x-6">
                    <DropdownMenu menuKey="settings" menu={dropdownMenus.settings} />
                  </div>
                )}
              </nav>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/trips" element={<TripsView user={user} />} />
                <Route path="/trips/create" element={<TCCCreateTrip user={user} />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/units" element={<TCCUnitsManagement />} />
                <Route path="/hospitals/*" element={<Hospitals />} />
                <Route path="/agencies/*" element={<Agencies />} />
                <Route path="/route-optimization" element={<TCCRouteOptimizer />} />
                <Route path="/healthcare-portal" element={<HealthcarePortal />} />
                <Route path="/ems-dashboard" element={<EMSDashboard user={user} onLogout={onLogout} />} />
                <Route path="/settings" element={<UserManagement />} />
                <Route path="/settings/users" element={<UserManagement />} />
                <Route path="/settings/notifications" element={<NotificationSettings />} />
                <Route path="/settings/backup" element={<BackupManagement />} />
                <Route path="/financial" element={<FinancialDashboard />} />
                <Route path="/my-trips" element={<div className="text-center py-12"><h3 className="text-lg font-medium text-gray-900">My Trips</h3><p className="text-gray-500">Coming soon...</p></div>} />
                <Route path="/my-assignments" element={<div className="text-center py-12"><h3 className="text-lg font-medium text-gray-900">My Assignments</h3><p className="text-gray-500">Coming soon...</p></div>} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TCCDashboard;
