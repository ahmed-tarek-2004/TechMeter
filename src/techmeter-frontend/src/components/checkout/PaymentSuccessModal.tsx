import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Download,
} from 'lucide-react';
import { CartItemResponse } from '../../types';
import { coursePlaceholder } from '../../utils/placeholders';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  transactionId: string;
  amount: number;
  currency?: string;
  items: CartItemResponse[];
  onClose: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  transactionId,
  amount,
  currency = 'USD',
  items,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 text-center overflow-hidden">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full" />

        {/* Animated Check & Celebration Icon */}
        <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-950/60 rounded-full animate-ping opacity-30" />
          <div className="relative w-16 h-16 bg-emerald-50 dark:bg-emerald-900/40 rounded-full flex items-center justify-center border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-lg">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="absolute -top-1 -right-1 text-amber-500 dark:text-amber-400 animate-bounce">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* Title & Congratulations */}
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Payment Successful!
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Thank you for your purchase. You now have full lifetime access to your enrolled courses.
        </p>

        {/* Receipt Box */}
        <div className="mt-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Receipt className="w-3.5 h-3.5 text-indigo-500" /> Reference ID:
            </span>
            <span className="font-mono text-[11px] font-semibold text-gray-900 dark:text-white select-all">
              {transactionId || 'TXN-SUCCESS'}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="font-medium">Total Paid:</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              ${amount.toFixed(2)} {currency.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="font-medium">Payment Gateway:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Stripe Card Secure
            </span>
          </div>
        </div>

        {/* Enrolled Courses Preview List */}
        {items && items.length > 0 && (
          <div className="mt-5 text-left">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2.5">
              Enrolled Courses ({items.length})
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {items.map((item) => (
                <div
                  key={item.id || item.courseId}
                  className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                >
                  <img
                    src={item.courseImageUrl || item.courseProfileImageUrl || coursePlaceholder}
                    alt={item.courseName}
                    className="w-10 h-8 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = coursePlaceholder;
                    }}
                  />
                  <span className="text-xs font-semibold text-gray-900 dark:text-white truncate flex-1">
                    {item.courseName}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              onClose();
              navigate('/my-learning');
            }}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Go to My Learning</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/orders');
            }}
            className="sm:w-auto bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>View Orders</span>
          </button>
        </div>
      </div>
    </div>
  );
};
