import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '../../services/wishlistService';
import { cartService } from '../../services/cartService';
import { Loader2, Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import { coursePlaceholder } from '../../utils/placeholders';

const Wishlist: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [itemToRemove, setItemToRemove] = useState<{ id: string; name: string } | null>(null);

  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist(),
    enabled: isAuthenticated && user?.role === 'student',
    retry: false,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (wishlistItemId: string) => wishlistService.removeFromWishlist(wishlistItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (courseId: string) => cartService.addToCart(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
    },
  });

  const wishlist = wishlistData?.data || [];

  if (!isAuthenticated || user?.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Heart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
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

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Your wishlist is empty</h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Save courses you're interested in for later.</p>
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
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">My Wishlist</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/60 transition"
            >
              <div>
                <img
                  src={item.courseImageUrl || coursePlaceholder}
                  alt={item.courseName}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = coursePlaceholder;
                  }}
                />
                <div className="p-5">
                  <Link to={`/courses/${item.courseId}`}>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 transition leading-snug">
                      {item.courseName}
                    </h3>
                  </Link>
                  <p className="mt-3 text-base font-extrabold text-gray-900 dark:text-white">
                    {!item.price || item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                  <button
                    onClick={() => addToCartMutation.mutate(item.courseId)}
                    disabled={addToCartMutation.isPending}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center justify-center transition"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1.5" />Add to Cart
                  </button>
                  <button
                    onClick={() => setItemToRemove({ id: item.id, name: item.courseName })}
                    disabled={removeFromWishlistMutation.isPending}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 transition"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remove from Wishlist Modal */}
      <ConfirmModal
        isOpen={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        onConfirm={() => {
          if (itemToRemove) {
            removeFromWishlistMutation.mutate(itemToRemove.id);
            setItemToRemove(null);
          }
        }}
        title="Remove from Wishlist"
        message={`Remove "${itemToRemove?.name}" from your wishlist?`}
        confirmText="Remove"
        variant="danger"
        isLoading={removeFromWishlistMutation.isPending}
      />
    </div>
  );
};

export default Wishlist;
