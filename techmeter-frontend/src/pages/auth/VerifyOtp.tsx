import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Shield, Loader2, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email, password, and userId from location state or sessionStorage
  const email = (location.state as any)?.email || sessionStorage.getItem('otp_email') || '';
  const password = (location.state as any)?.password || sessionStorage.getItem('otp_password') || '';
  const userId = (location.state as any)?.userId || sessionStorage.getItem('otp_userId') || '';
  const from = (location.state as any)?.from || '/';

  // Redirect if session expired
  useEffect(() => {
    if (!email && !sessionStorage.getItem('otp_email')) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
    }
  }, [email, navigate]);

  // Focus first input once on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (!canResend) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [canResend]);

  const handleChange = (index: number, value: string) => {
    const digitsOnly = value.replace(/\D/g, '');

    if (!digitsOnly) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    if (digitsOnly.length > 1) {
      // Handle paste or typing multiple characters
      const chars = digitsOnly.slice(0, 6).split('');
      const newOtp = [...otp];
      chars.forEach((c, i) => {
        if (index + i < 6) {
          newOtp[index + i] = c;
        }
      });
      setOtp(newOtp);

      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Single digit
    const newOtp = [...otp];
    newOtp[index] = digitsOnly;
    setOtp(newOtp);

    // Auto-focus next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = ['', '', '', '', '', ''];
    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Current box is empty, move back and clear previous
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpString = otp.join('');
    if (!otpString || otpString.length < 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      // Call login with email, password, and OTP
      await login({ email, password, otp: otpString });
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error: any) {
      const msg = error.message || 'OTP verification failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    const targetUserId = userId || sessionStorage.getItem('otp_userId');
    if (!targetUserId) {
      toast.error('User ID not found. Please try logging in again.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Calling POST /Account/resend-otp with Id:', targetUserId);
      const response = await authService.resendOtp(targetUserId);
      console.log('Resend OTP response:', response);

      if (response && response.succeeded === false) {
        toast.error(response.message || 'Failed to resend OTP.');
        return;
      }

      toast.success(response?.message || 'New OTP sent to your email');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error('Error in resendOtp:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to resend OTP. Please try logging in again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm dark:shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Verify Your Email
          </h2>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            We've sent a verification code to
          </p>
          <p className="mt-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {email}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
              Enter 6-Digit OTP Code
            </label>
            <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  className="w-11 h-13 text-center text-xl font-bold border-2 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  disabled={isSubmitting}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">
              Enter the 6-digit code sent to your inbox
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || otp.some(d => !d)}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Verify & Continue'
              )}
            </button>
          </div>

          <div className="text-center space-y-3 pt-2">
            <div className="text-xs">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isSubmitting || (!canResend && countdown > 0)}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed inline-flex items-center transition-colors"
              >
                <Mail className="h-3.5 w-3.5 mr-1" />
                {canResend || countdown === 0 ? 'Resend OTP' : `Resend OTP in ${countdown}s`}
              </button>
            </div>

            <div className="text-xs">
              <Link
                to="/login"
                className="font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 inline-flex items-center transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back to Login
              </Link>
            </div>
          </div>
        </form>

        <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex">
            <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Didn't receive the code?
              </h3>
              <p className="mt-0.5 text-[11px] text-indigo-700 dark:text-indigo-300/80 leading-relaxed">
                Check your spam folder or click the resend button after the countdown.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
