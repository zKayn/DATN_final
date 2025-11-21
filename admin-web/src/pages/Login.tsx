// admin-web/src/pages/Login.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, checkAuth, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('admin@sportshop.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    console.log('🔍 Login page: Checking if already authenticated...');
    console.log('  - isAuthenticated:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('✅ Already authenticated, redirecting to /admin');
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔵 Login page: Attempting login...');
      console.log('  - Email:', email);
      
      // Call login and wait for it to complete
      await login(email, password);
      
      console.log('✅ Login page: Login function completed');
      
      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Force check auth again
      checkAuth();
      
      // Wait a bit more
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get current auth state
      const currentState = useAuthStore.getState();
      console.log('📊 Login page: Current state:');
      console.log('  - isAuthenticated:', currentState.isAuthenticated);
      console.log('  - user:', currentState.user);
      
      // Check storage directly
      const token = localStorage.getItem('adminToken');
      const userStr = localStorage.getItem('adminUser');
      
      console.log('📦 Login page: Storage check:');
      console.log('  - Token exists:', !!token);
      console.log('  - User exists:', !!userStr);
      
      if (token && userStr) {
        console.log('✅ Login page: Auth data confirmed, navigating...');
        navigate('/admin', { replace: true });
      } else {
        console.error('❌ Login page: Auth data not found in storage');
        setError('Authentication failed. Please try again.');
      }
    } catch (err: any) {
      console.error('❌ Login page: Login error:', err);
      console.error('  - Error message:', err.message);
      console.error('  - Error response:', err.response?.data);
      
      // Show user-friendly error
      const errorMessage = err.response?.data?.message || err.message || 'Invalid email or password';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SportShop Admin</h1>
          <p className="text-white/80">Sign in to your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@sportshop.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4" disabled={isLoading} />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-2">Demo Credentials:</p>
            <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600">
              <div>Email: admin@sportshop.com</div>
              <div>Password: admin123</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-8">
          © 2024 SportShop. All rights reserved.
        </p>
      </div>
    </div>
  );
}