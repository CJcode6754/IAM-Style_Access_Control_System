import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout, selectUser, selectHasPermission } from '../../redux/slices/authSlice';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  
  // Check permissions for navigation items
  const canReadUsers = useSelector(state => selectHasPermission(state, 'Users', 'read'));
  const canReadGroups = useSelector(state => selectHasPermission(state, 'Groups', 'read'));
  const canReadRoles = useSelector(state => selectHasPermission(state, 'Roles', 'read'));
  const canReadModules = useSelector(state => selectHasPermission(state, 'Modules', 'read'));
  const canReadPermissions = useSelector(state => selectHasPermission(state, 'Permissions', 'read'));

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    return location.pathname.startsWith(path);
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', show: true },
    { path: '/users', label: 'Users', show: canReadUsers },
    { path: '/groups', label: 'Groups', show: canReadGroups },
    { path: '/roles', label: 'Roles', show: canReadRoles },
    { path: '/modules', label: 'Modules', show: canReadModules },
    { path: '/permissions', label: 'Permissions', show: canReadPermissions },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">IAM System</h1>
          <p className="text-sm text-gray-600 mt-1">Access Control</p>
        </div>

        <nav className="mt-8">
          {navigationItems.map((item) => 
            item.show ? (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActiveRoute(item.path)
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ) : null
          )}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {navigationItems.find(item => isActiveRoute(item.path))?.label || 'Dashboard'}
            </h2>
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;