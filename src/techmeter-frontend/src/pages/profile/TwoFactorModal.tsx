import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Loader2,
  X,
  Shield,
  ShieldCheck,
  ShieldOff,
  AlertCircle,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

interface TwoFactorModalProps {
  onClose: () => void;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const isEnabled = user?.isTwoFactorEnabled ?? false;
  const [error, setError] = useState<string | null>(null);

  // ── Enable 2FA Mutation ─────────────────────────────────────────────────────

  const enableMutation = useMutation({
    mutationFn: () => authService.enable2FA(),
    onSuccess: (res) => {
      if (res.succeeded || res.statusCode === 200) {
        updateUser({ isTwoFactorEnabled: true });
        toast.success(res.message || 'Two-Factor Authentication Enabled Successfully!');
        onClose();
      } else {
        setError(res.message || 'Failed to enable Two-Factor Authentication');
      }
    },
    onError: (err: any) => {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to enable Two-Factor Authentication'
      );
    },
  });

  // ── Disable 2FA Mutation ────────────────────────────────────────────────────

  const disableMutation = useMutation({
    mutationFn: () => authService.disable2FA(),
    onSuccess: (res) => {
      if (res.succeeded || res.statusCode === 200) {
        updateUser({ isTwoFactorEnabled: false });
        toast.success(res.message || 'Two-Factor Authentication Disabled Successfully!');
        onClose();
      } else {
        setError(res.message || 'Failed to disable Two-Factor Authentication');
      }
    },
    onError: (err: any) => {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to disable Two-Factor Authentication'
      );
    },
  });

  const isPending = enableMutation.isPending || disableMutation.isPending;

  const handleToggle = () => {
    setError(null);
    if (isEnabled) {
      disableMutation.mutate();
    } else {
      enableMutation.mutate();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-2xl ${
                isEnabled
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Two-Factor Authentication
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isEnabled
                  ? 'Currently enabled on your account'
                  : 'Add an extra layer of security'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status Badge Card */}
          <div
            className={`flex items-start gap-3.5 p-4 rounded-2xl border ${
              isEnabled
                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
                : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
            }`}
          >
            {isEnabled ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldOff className="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p
                className={`text-xs font-extrabold ${
                  isEnabled
                    ? 'text-emerald-800 dark:text-emerald-300'
                    : 'text-gray-800 dark:text-gray-200'
                }`}
              >
                {isEnabled ? '2FA is Active' : '2FA is Disabled'}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                {isEnabled
                  ? 'Every time you log in, an OTP code will be sent to your email address for identity verification.'
                  : 'When enabled, you will be required to enter a 6-digit OTP code sent to your email each time you log in.'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Note */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-start gap-2.5">
            <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-500" />
            <span className="leading-relaxed">
              {isEnabled
                ? 'Disabling 2FA will allow logging into your account with password only.'
                : 'Protect your account against unauthorized access even if your password is compromised.'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleToggle}
              disabled={isPending}
              className={`inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition disabled:opacity-50 ${
                isEnabled
                  ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isEnabled ? (
                <>
                  <ShieldOff className="w-3.5 h-3.5" />
                  <span>Disable 2FA</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enable 2FA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorModal;
