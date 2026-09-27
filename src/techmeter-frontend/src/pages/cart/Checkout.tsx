import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {
  Loader2,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Sparkles,
  ShoppingBag,
  Award,
  Clock,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cartService } from '../../services/cartService';
import { useAuth } from '../../context/AuthContext';
import { StripeCheckoutForm } from '../../components/checkout/StripeCheckoutForm';
import { PaymentSuccessModal } from '../../components/checkout/PaymentSuccessModal';
import { coursePlaceholder } from '../../utils/placeholders';

// Stripe public key provided for TechMeter platform
const STRIPE_PUBLIC_KEY =
  'pk_test_51Refs3HJcL0NP7zy4wejQxgBKaFjdkwaDDKljK5s91SMNtRnCnHTypoE9L0makKilyZxCDqApQM2MTP8pS64ihXc00j3YjPLLP';

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const PROMO_CODES: Record<string, number> = {
  TECHMETER20: 20,
  TECHMETER10: 10,
  WELCOME10: 10,
  DEV25: 25,
  SAVE50: 50,
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Promo code state
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  // Success modal state
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    transactionId: string;
    amount: number;
  }>({
    isOpen: false,
    transactionId: '',
    amount: 0,
  });

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    enabled: !!user,
  });

  const cart = cartData?.data;

  const handleApplyPromo = (code: string) => {
    const uppercaseCode = code.toUpperCase().trim();
    if (PROMO_CODES[uppercaseCode]) {
      setPromoCode(uppercaseCode);
      setDiscountPercentage(PROMO_CODES[uppercaseCode]);
      toast.success(`Promo code applied! You saved ${PROMO_CODES[uppercaseCode]}%`);
    } else {
      toast.error('Invalid promo code. Try TECHMETER20 or WELCOME10');
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setDiscountPercentage(0);
    toast('Promo code removed', { icon: 'ℹ️' });
  };

  const handlePaymentSuccess = (transactionId: string, finalTotal: number) => {
    // Invalidate react-query caches
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['student-courses'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['wishlist'] });

    setSuccessModalData({
      isOpen: true,
      transactionId,
      amount: finalTotal,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Loading secure checkout...
        </p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 transition-colors duration-200">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Your Cart is Empty
          </h2>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Add courses to your cart before proceeding to checkout.
          </p>
          <Link
            to="/courses"
            className="mt-6 inline-flex items-center px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
          >
            Explore Courses
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.totalPrice;
  const discountAmount = (subtotal * discountPercentage) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Breadcrumb */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Cart
          </button>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Secure Checkout
              </h1>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Complete your transaction securely with encrypted Stripe processing.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>

        {/* Checkout Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Stripe Card Payment Form */}
          <div className="lg:col-span-7 xl:col-span-8">
            <Elements stripe={stripePromise}>
              <StripeCheckoutForm
                cart={cart}
                discountPercentage={discountPercentage}
                promoCode={promoCode}
                onApplyPromo={handleApplyPromo}
                onRemovePromo={handleRemovePromo}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          </div>

          {/* Right Column: Order Summary & Guarantee Highlights */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 sticky top-24">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-6 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Order Summary</span>
                </h2>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Itemized Courses List */}
              <div className="my-4 max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 pr-1">
                {cart.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <img
                      src={item.courseImageUrl || item.courseProfileImageUrl || coursePlaceholder}
                      alt={item.courseName}
                      className="w-14 h-10 object-cover rounded-xl border border-gray-100 dark:border-gray-800 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = coursePlaceholder;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {item.courseName}
                      </p>
                      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                        Lifetime Access
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white flex-shrink-0">
                      ${item.unitPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {discountPercentage > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Discount ({discountPercentage}%)
                    </span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    $0.00 (Free)
                  </span>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between text-base font-extrabold text-gray-900 dark:text-white">
                  <span>Total Amount</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ${finalTotal.toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Why Buy from TechMeter Box */}
            <div className="bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 rounded-3xl p-5 border border-indigo-100/80 dark:border-indigo-900/30 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                Included with every purchase
              </h3>

              <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                  </div>
                  <span>Full Lifetime Access & Free Updates</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    <Award className="w-3 h-3" />
                  </div>
                  <span>Verified Certificate of Completion</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <span>Direct Instructor Q&A and Chat Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celebratory Post-Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={successModalData.isOpen}
        transactionId={successModalData.transactionId}
        amount={successModalData.amount}
        items={cart.items}
        onClose={() => setSuccessModalData({ isOpen: false, transactionId: '', amount: 0 })}
      />
    </div>
  );
};

export default Checkout;
