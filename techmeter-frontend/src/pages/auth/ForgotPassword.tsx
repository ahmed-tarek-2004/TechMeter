import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
      toast.success('Reset link sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 transition-colors duration-200">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm dark:shadow-2xl border border-gray-100 dark:border-gray-800 text-center">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl inline-block text-emerald-600 dark:text-emerald-400 mb-4">
            <CheckCircle className="h-10 w-10 mx-auto" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Check your email</h2>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">We've sent a password reset link to <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span></p>
          <Link to="/login" className="mt-6 inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
            <ArrowLeft className="h-4 w-4 mr-1.5" />Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm dark:shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Forgot your password?</h2>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            Enter your email and we'll send you a reset link.
          </p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Email address</label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                placeholder="name@example.com"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 shadow-md transition"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
            </button>
          </div>
          <div className="text-center pt-2">
            <Link to="/login" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
              <ArrowLeft className="h-3.5 w-3.5 inline mr-1" />Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
