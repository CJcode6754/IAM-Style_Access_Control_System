import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login, register, selectAuth, clearError } from '../redux/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(selectAuth);

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Show error toast when Redux error changes
  useEffect(() => {
    if (error) toast.error(error);
    return () => {
      dispatch(clearError());
    };
  }, [error, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password || (isRegisterMode && !formData.username)) {
      toast.error('Please fill out all required fields');
      return;
    }

    try {
      if (isRegisterMode) {
        await toast.promise(
          dispatch(register({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })).unwrap(),
          {
            loading: 'Creating your account...',
            success: 'Account created successfully!',
            error: (err) => err || 'Failed to create account'
          }
        );
      } else {
        await toast.promise(
          dispatch(login({
            email: formData.email,
            password: formData.password
          })).unwrap(),
          {
            loading: 'Signing in...',
            success: 'Welcome back!',
            error: (err) => err || 'Failed to sign in'
          }
        );
      }
    } catch {
      // Error already handled by toast.promise
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setFormData({ username: '', email: '', password: '' });
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              {isRegisterMode ? 'Create your account' : 'Sign in to your account'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              IAM Access Control System
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {isRegisterMode && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
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
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : isRegisterMode ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isRegisterMode 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Register"}
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-600">
            <strong>Demo Instructions:</strong> Register a new account to get started.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
