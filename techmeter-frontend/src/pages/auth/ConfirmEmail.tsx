import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Mail,
  ArrowRight,
  LogIn,
  Home,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../utils/errorUtils';

type VerificationStatus = 'loading' | 'success' | 'already_verified' | 'error';

const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId =
    searchParams.get('userId') ||
    searchParams.get('userid') ||
    searchParams.get('UserId') ||
    '';
  const token = searchParams.get('token') || searchParams.get('Token') || '';

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(5);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const verificationAttempted = useRef<boolean>(false);

  const verifyEmail = async (uid: string, tok: string) => {
    if (!uid || !tok) {
      setStatus('error');
      setErrorMessage(
        'The confirmation link is invalid or incomplete. Missing user ID or confirmation token.'
      );
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await authService.confirmEmail({ userId: uid, token: tok });

      if (response && response.succeeded === false) {
        const msg = response.message || 'Email confirmation failed.';
        if (msg.toLowerCase().includes('already verified')) {
          setStatus('already_verified');
          setSuccessMessage(msg);
        } else {
          setStatus('error');
          setErrorMessage(msg);
        }
        return;
      }

      const msg = response?.message || 'Email confirmed successfully!';
      if (msg.toLowerCase().includes('already verified')) {
        setStatus('already_verified');
        setSuccessMessage(msg);
      } else {
        setStatus('success');
        setSuccessMessage(msg);
        toast.success('Email confirmed successfully!');
      }
    } catch (error: any) {
      const msg = getApiErrorMessage(error, 'Email confirmation failed.');
      if (msg.toLowerCase().includes('already verified')) {
        setStatus('already_verified');
        setSuccessMessage(msg);
      } else {
        setStatus('error');
        setErrorMessage(msg);
      }
    }
  };

  useEffect(() => {
    if (verificationAttempted.current) return;
    verificationAttempted.current = true;

    verifyEmail(userId, token);
  }, [userId, token]);

  // Countdown timer for automatic redirect on success
  useEffect(() => {
    if (status !== 'success') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await verifyEmail(userId, token);
    setIsRetrying(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-3xl shadow-sm dark:shadow-2xl border border-gray-100 dark:border-gray-800 text-center transition-all">
        {/* State 1: Verifying / Loading */}
        {status === 'loading' && (
          <div className="space-y-6 animate-fade-in">
            <div className="relative mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <Loader2 className="h-10 w-10 animate-spin" />
              <div className="absolute inset-0 rounded-3xl animate-ping opacity-20 bg-indigo-400 dark:bg-indigo-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Verifying Your Email
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                Please hold on while we validate your confirmation token and activate your TechMeter account...
              </p>
            </div>

            <div className="pt-2">
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-2/3 animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* State 2: Success */}
        {status === 'success' && (
          <div className="space-y-6 animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Email Verified!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto leading-relaxed">
                {successMessage || 'Your email address has been successfully verified.'} Your account is now fully active.
              </p>
            </div>

            {/* Countdown notice */}
            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/30 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              Redirecting to sign in page in <span className="font-bold text-emerald-600 dark:text-emerald-400">{countdown}</span>s...
            </div>

            <div className="pt-2 space-y-3">
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center py-3 px-5 border border-transparent text-xs sm:text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md transition-all group"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In Now
                <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Already Verified */}
        {status === 'already_verified' && (
          <div className="space-y-6 animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Already Verified
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto leading-relaxed">
                {successMessage || 'Your email address has already been confirmed.'} You can proceed directly to your account.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center py-3 px-5 border border-transparent text-xs sm:text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md transition-all group"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Continue to Sign In
                <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Home className="h-3.5 w-3.5 mr-1.5" />
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* State 4: Error / Invalid link */}
        {status === 'error' && (
          <div className="space-y-6 animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400">
              {userId && token ? (
                <XCircle className="h-10 w-10" />
              ) : (
                <AlertCircle className="h-10 w-10" />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Verification Failed
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                {errorMessage ||
                  'The confirmation link is invalid, has expired, or has already been used.'}
              </p>
            </div>

            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-left">
              <div className="flex items-start">
                <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 mr-2.5 flex-shrink-0" />
                <div className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                  Confirmation links expire for security purposes. If you need a new confirmation link, you can request one or contact support.
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              {userId && token && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 border border-gray-200 dark:border-gray-700 text-xs font-semibold rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition shadow-sm disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 mr-2 ${isRetrying ? 'animate-spin' : ''}`}
                  />
                  {isRetrying ? 'Retrying...' : 'Try Again'}
                </button>
              )}

              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center py-3 px-5 border border-transparent text-xs sm:text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md transition-all"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>

              <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 pt-1">
                <Link
                  to="/register"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Create New Account
                </Link>
                <span>•</span>
                <Link
                  to="/contact"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
