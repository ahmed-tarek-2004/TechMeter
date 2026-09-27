import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, X, Lock, Eye, EyeOff, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

interface ChangePasswordModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string; confirmNewPassword: string }) =>
      authService.changePassword(data),
    onSuccess: (response) => {
      if (response.succeeded || response.statusCode === 200) {
        toast.success(response.message || 'Password changed successfully!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const msg =
          response.message ||
          (response.errors && response.errors.join(', ')) ||
          'Failed to change password';
        toast.error(msg);
      }
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        error?.message ||
        'An error occurred while changing password';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!currentPassword.trim()) {
      setValidationError('Please enter your current password');
      return;
    }

    if (!newPassword.trim()) {
      setValidationError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setValidationError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setValidationError('New password and confirm password do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setValidationError('New password must be different from current password');
      return;
    }

    mutation.mutate({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
  };

  const isMatching = newPassword && confirmNewPassword && newPassword === confirmNewPassword;
  const isMismatch = newPassword && confirmNewPassword && newPassword !== confirmNewPassword;

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
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
                Change Password
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Update your account security password
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                required
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className={`w-full pl-4 pr-10 py-2.5 rounded-xl border ${
                  isMismatch
                    ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500'
                    : isMatching
                    ? 'border-emerald-300 dark:border-emerald-700 focus:ring-emerald-500'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500'
                } bg-gray-50/50 dark:bg-gray-800/60 text-gray-900 dark:text-white text-xs focus:ring-2 focus:outline-none transition`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isMatching && (
              <p className="mt-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Passwords match
              </p>
            )}
            {isMismatch && (
              <p className="mt-1.5 text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Passwords do not match
              </p>
            )}
          </div>

          {/* Security Note */}
          <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-500" />
            <span>
              Use at least 6 characters with a combination of uppercase, lowercase, numbers, and symbols for high security.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
