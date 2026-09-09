import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access
  const from = (location.state as any)?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Attempt login without OTP first
      const result = await login({ email: formData.email, password: formData.password, otp: '' });

      if (result?.requiresOtp) {
        // Store in sessionStorage as fallback
        if (result.userId) {
          sessionStorage.setItem('otp_userId', result.userId);
        }
        sessionStorage.setItem('otp_email', formData.email);
        sessionStorage.setItem('otp_password', formData.password);

        // Backend generated and sent OTP - redirect to OTP verification page
        toast('Please enter the OTP code sent to your email', { icon: '📧' });
        navigate('/verify-otp', {
          state: {
            email: formData.email,
            password: formData.password,
            userId: result.userId,
            from: from,
          },
          replace: true,
        });
        return;
      }

      // If we reach here, login was successful with tokens
      toast.success('Login successful!');
      navigate(from, { replace: true });

    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';

      // Check if the error indicates OTP is required
      const needsOtpVerification =
        errorMessage.toLowerCase().includes('otp') ||
        errorMessage.toLowerCase().includes('not confirmed') ||
        errorMessage.toLowerCase().includes('verify') ||
        errorMessage.toLowerCase().includes('confirm your email');

      if (needsOtpVerification) {
        sessionStorage.setItem('otp_email', formData.email);
        sessionStorage.setItem('otp_password', formData.password);

        // Email not confirmed - redirect to OTP page
        toast('Please verify your email with the OTP code', { icon: '📧' });
        navigate('/verify-otp', {
          state: {
            email: formData.email,
            password: formData.password,
            from: from
          },
          replace: true
        });
      } else {
        // Other error - show error message
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm dark:shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Sign in to your account</h2>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            Or{' '}
            <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <Link to="/forgot-password" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                Forgot password?
              </Link>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
