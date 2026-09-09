import React from 'react';
import {
  AlertTriangle,
  Trash2,
  HelpCircle,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

const variantStyles = {
  danger: {
    iconBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50',
    icon: Trash2,
    confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-rose-200 dark:shadow-none',
  },
  warning: {
    iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50',
    icon: AlertTriangle,
    confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-amber-200 dark:shadow-none',
  },
  info: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50',
    icon: HelpCircle,
    confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-indigo-200 dark:shadow-none',
  },
  success: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50',
    icon: CheckCircle2,
    confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-emerald-200 dark:shadow-none',
  },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const currentVariant = variantStyles[variant];
  const IconComponent = currentVariant.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-150">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start space-x-4">
            {/* Pretty Icon Container */}
            <div className={`p-3 rounded-2xl flex-shrink-0 ${currentVariant.iconBg}`}>
              <IconComponent className="h-6 w-6" />
            </div>

            {/* Content */}
            <div className="flex-1 mt-0.5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                {title}
              </h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                onConfirm();
              }}
              className={`w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs focus:outline-none transition disabled:opacity-50 ${currentVariant.confirmBtn}`}
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
