import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../../services/cartService';
import { Loader2, Trash2, ShoppingCart, ArrowRight, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import { coursePlaceholder } from '../../utils/placeholders';

const Cart: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const { addToWishlist } = useWishlist();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ id: string; name: string } | null>(null);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    enabled: isAuthenticated && user?.role === 'student',
    retry: false,
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (cartItemId: string) => cartService.removeFromCart(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart cleared');
    },
  });

  const handleSaveForLater = async (item: {
    id: string;
    courseId: string;
    courseName: string;
    courseImageUrl?: string;
    courseProfileImageUrl?: string;
    unitPrice?: number;
  }) => {
    try {
      setMovingItemId(item.id);
      await addToWishlist({
        id: item.courseId,
        title: item.courseName,
        courseProfileImageUrl: item.courseImageUrl || item.courseProfileImageUrl,
        price: item.unitPrice,
      });
      await cartService.removeFromCart(item.id);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Moved to wishlist!');
    } catch {
      toast.error('Failed to move item to wishlist');
    } finally {
      setMovingItemId(null);
    }
  };

  const cart = cartData?.data;

  if (!isAuthenticated || user?.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Please login as a student</h2>
          <Link to="/login" className="mt-4 inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Sign in</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Your cart is empty</h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Looks like you haven't added any courses yet.</p>
          <Link
            to="/courses"
            className="mt-6 inline-flex items-center px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
          >
            Browse Courses <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  {cart.items.length} course{cart.items.length !== 1 ? 's' : ''} in cart
                </h2>
                <button
                  onClick={() => setIsClearModalOpen(true)}
                  disabled={clearCartMutation.isPending}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition"
                >
                  Clear cart
                </button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-6 flex items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <img
                      src={item.courseImageUrl || coursePlaceholder}
                      alt={item.courseName}
                      className="w-28 h-18 object-cover rounded-xl border border-gray-100 dark:border-gray-800 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = coursePlaceholder;
                      }}
                    />
                    <div className="ml-4 flex-1">
                      <Link
                        to={`/courses/${item.courseId}`}
                        className="text-sm font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                      >
                        {item.courseName}
                      </Link>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right ml-4 flex flex-col items-end">
                      <span className="text-base font-extrabold text-gray-900 dark:text-white">
                        ${item.unitPrice.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleSaveForLater(item)}
                          disabled={movingItemId === item.id || removeFromCartMutation.isPending}
                          className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center transition"
                          title="Save for later"
                        >
                          <Heart className="h-3.5 w-3.5 mr-1 text-rose-500" />
                          Save for later
                        </button>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <button
                          onClick={() => setItemToRemove({ id: item.id, name: item.courseName })}
                          disabled={removeFromCartMutation.isPending || movingItemId === item.id}
                          className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-6 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${cart.totalPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                  <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>${cart.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Link
                to="/checkout"
                className="mt-6 block w-full bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-semibold text-center hover:bg-indigo-700 shadow-xs transition"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/courses"
                className="mt-3 block text-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={() => {
          clearCartMutation.mutate();
          setIsClearModalOpen(false);
        }}
        title="Clear Shopping Cart"
        message="Are you sure you want to remove all items from your cart?"
        confirmText="Clear Cart"
        variant="danger"
        isLoading={clearCartMutation.isPending}
      />

      {/* Remove Item Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        onConfirm={() => {
          if (itemToRemove) {
            removeFromCartMutation.mutate(itemToRemove.id);
            setItemToRemove(null);
          }
        }}
        title="Remove Item from Cart"
        message={`Remove "${itemToRemove?.name}" from your shopping cart?`}
        confirmText="Remove"
        variant="danger"
        isLoading={removeFromCartMutation.isPending}
      />
    </div>
  );
};

export default Cart;
