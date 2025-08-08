import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectUser, 
  selectPermissions, 
  simulateAction, 
  selectAuth,
  clearSimulationResult 
} from '../redux/slices/authSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const permissions = useSelector(selectPermissions);
  const { simulationResult } = useSelector(selectAuth);

  const [simulationForm, setSimulationForm] = useState({
    moduleName: '',
    action: '',
    userId: ''
  });

  // Get unique modules from permissions
  const availableModules = [...new Set(permissions.map(p => p.module_name))];
  const actions = ['create', 'read', 'update', 'delete'];

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    if (!acc[permission.module_name]) {
      acc[permission.module_name] = [];
    }
    acc[permission.module_name].push(permission);
    return acc;
  }, {});

  const handleSimulationSubmit = (e) => {
    e.preventDefault();
    if (simulationForm.moduleName && simulationForm.action) {
      // Fixed: Pass the correct parameter names that match the backend
      dispatch(simulateAction({
        moduleName: simulationForm.moduleName,
        action: simulationForm.action,
        userId: simulationForm.userId || undefined
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSimulationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    return () => {
      dispatch(clearSimulationResult());
    };
  }, [dispatch]);

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Welcome Section */}
      <section className="flex flex-col gap-4 p-6 shadow rounded-xl bg-gradient-to-r from-indigo-50 to-white md:p-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-indigo-700">Welcome back, <span className="text-indigo-900">{user?.username}</span>!</h1>
          <p className="text-base text-gray-500">Here's an overview of your permissions and access control capabilities.</p>
        </div>
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-indigo-600">{permissions.length}</span>
            <span className="text-xs text-gray-500">Total Permissions</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-green-600">{availableModules.length}</span>
            <span className="text-xs text-gray-500">Accessible Modules</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base font-semibold text-blue-600">{user?.email}</span>
            <span className="text-xs text-gray-500">Current User</span>
          </div>
        </div>
      </section>

      {/* Permissions Overview */}
      <section className="p-6 bg-white shadow rounded-xl">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Your Permissions</h2>
        {Object.keys(permissionsByModule).length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(permissionsByModule).map(([moduleName, modulePermissions]) => (
              <div key={moduleName} className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                <h3 className="mb-2 font-medium text-indigo-700">{moduleName}</h3>
                <div className="flex flex-wrap gap-2">
                  {modulePermissions.map((permission) => (
                    <span
                      key={permission.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200"
                    >
                      {permission.action}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="mt-2 text-gray-500">No permissions assigned yet</p>
            <p className="mt-1 text-sm text-gray-400">Contact your administrator to get access to system modules</p>
          </div>
        )}
      </section>

      {/* Action Simulation */}
      <section className="p-6 bg-white shadow rounded-xl">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Test Permissions</h2>
        <p className="mb-4 text-gray-600">Simulate whether you (or another user) can perform specific actions on modules.</p>
        <form onSubmit={handleSimulationSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="moduleName" className="block mb-1 text-sm font-medium text-gray-700">Module</label>
              <select
                id="moduleName"
                name="moduleName"
                value={simulationForm.moduleName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Module</option>
                {['Users', 'Groups', 'Roles', 'Modules', 'Permissions'].map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="action" className="block mb-1 text-sm font-medium text-gray-700">Action</label>
              <select
                id="action"
                name="action"
                value={simulationForm.action}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Action</option>
                {actions.map(action => (
                  <option key={action} value={action}>{action.charAt(0).toUpperCase() + action.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="userId" className="block mb-1 text-sm font-medium text-gray-700">User ID (optional)</label>
              <input
                id="userId"
                name="userId"
                type="number"
                value={simulationForm.userId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Leave empty for current user"
              />
            </div>
          </div>
          <button type="submit" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Test Permission</button>
        </form>
        {simulationResult && (
          <div className={`mt-4 p-4 rounded-md ${simulationResult.hasPermission ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2">
              {simulationResult.hasPermission ? (
                <svg className="w-5 h-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className={`text-sm font-medium ${simulationResult.hasPermission ? 'text-green-800' : 'text-red-800'}`}>{simulationResult.message}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;