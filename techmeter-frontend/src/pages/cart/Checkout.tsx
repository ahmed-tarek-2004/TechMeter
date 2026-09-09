import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { cartService } from '../../services/cartService';
import { paymentService } from '../../services/paymentService';
import { Loader2, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { coursePlaceholder } from '../../utils/placeholders';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    enabled: !!user,
  });

  const checkoutMutation = useMutation({
    mutationFn: () => paymentService.checkout('usd'),
    onSuccess: () => {
      toast.success('Payment successful!');
      navigate('/profile');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Payment failed.');
    },
  });

  const cart = cartData?.data;

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await checkoutMutation.mutateAsync();
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />Back to cart
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-3">Checkout</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">Payment Method</h2>
              <label
                className={`flex items-center p-4 border rounded-2xl cursor-pointer transition ${
                  paymentMethod === 'card'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-800/30'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <CreditCard className="h-5 w-5 ml-3 text-indigo-600 dark:text-indigo-400" />
                <span className="ml-3 text-xs font-bold text-gray-900 dark:text-white">Credit / Debit Card (Stripe)</span>
              </label>
              <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  You will be securely processed through our certified gateway. All credit and debit transactions are encrypted end-to-end.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-6 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <img
                      src={item.courseImageUrl || coursePlaceholder}
                      alt={item.courseName}
                      className="w-14 h-10 object-cover rounded-xl border border-gray-100 dark:border-gray-800 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = coursePlaceholder;
                      }}
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.courseName}</p>
                      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">${item.unitPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>${cart.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center justify-center"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Complete Purchase
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
