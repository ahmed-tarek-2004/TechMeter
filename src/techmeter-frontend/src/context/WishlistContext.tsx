import React, { createContext, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '../services/wishlistService';
import { cartService } from '../services/cartService';
import { courseService } from '../services/courseService';
import { useAuth } from './AuthContext';
import { WishlistItem, Course } from '../types';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  isLoading: boolean;
  isWishlisted: (courseId: string) => boolean;
  getWishlistItem: (courseId: string) => WishlistItem | undefined;
  addToWishlist: (course: Course | { id: string; title?: string }) => Promise<void>;
  removeFromWishlist: (courseIdOrWishlistItemId: string) => Promise<void>;
  toggleWishlist: (course: Course | { id: string; title?: string; price?: number; courseProfileImageUrl?: string }) => Promise<void>;
  clearWishlist: () => Promise<void>;
  moveToCart: (courseId: string, wishlistItemId?: string) => Promise<void>;
  moveAllToCart: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const isStudent = isAuthenticated && user?.role === 'student';

  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist(),
    enabled: isStudent,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  const { data: studentCoursesData } = useQuery({
    queryKey: ['student-courses'],
    queryFn: () => courseService.getStudentCourses(),
    enabled: isStudent,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const enrolledCourseIds = useMemo(() => {
    const list = studentCoursesData?.data || [];
    return new Set(list.map((c) => c.id));
  }, [studentCoursesData]);

  const wishlist = useMemo(() => {
    return wishlistData?.data || [];
  }, [wishlistData]);

  const isWishlisted = (courseId: string): boolean => {
    if (!courseId) return false;
    return wishlist.some((item) => item.courseId === courseId || item.id === courseId);
  };

  const getWishlistItem = (courseId: string): WishlistItem | undefined => {
    return wishlist.find((item) => item.courseId === courseId || item.id === courseId);
  };

  // Add Mutation
  const addMutation = useMutation({
    mutationFn: (courseId: string) => wishlistService.addToWishlist(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Course added to wishlist');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to add to wishlist';
      toast.error(msg);
    },
  });

  // Remove Mutation
  const removeMutation = useMutation({
    mutationFn: (wishlistItemId: string) => wishlistService.removeFromWishlist(wishlistItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Course removed from wishlist');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to remove from wishlist';
      toast.error(msg);
    },
  });

  // Clear Mutation
  const clearMutation = useMutation({
    mutationFn: () => wishlistService.clearWishlist(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Wishlist cleared');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to clear wishlist';
      toast.error(msg);
    },
  });

  const addToWishlist = async (course: Course | { id: string; title?: string }) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save courses to your wishlist');
      return;
    }
    if (user?.role !== 'student') {
      toast.error('Only students can add courses to their wishlist');
      return;
    }
    await addMutation.mutateAsync(course.id);
  };

  const removeFromWishlist = async (courseIdOrWishlistItemId: string) => {
    if (!isAuthenticated || user?.role !== 'student') return;

    const foundItem = getWishlistItem(courseIdOrWishlistItemId);
    const idToDelete = foundItem ? foundItem.id : courseIdOrWishlistItemId;

    await removeMutation.mutateAsync(idToDelete);
  };

  const toggleWishlist = async (course: Course | { id: string; title?: string; price?: number; courseProfileImageUrl?: string }) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to manage your wishlist');
      return;
    }
    if (user?.role !== 'student') {
      toast.error('Only students can use the wishlist');
      return;
    }

    if (isWishlisted(course.id)) {
      await removeFromWishlist(course.id);
    } else {
      await addToWishlist(course);
    }
  };

  const clearWishlist = async () => {
    if (!isAuthenticated || user?.role !== 'student') return;
    await clearMutation.mutateAsync();
  };

  const moveToCart = async (courseId: string, wishlistItemId?: string) => {
    if (!isAuthenticated || user?.role !== 'student') {
      toast.error('Please sign in as a student to add items to cart');
      return;
    }

    if (enrolledCourseIds.has(courseId)) {
      toast.error('You are already enrolled in this course!');
      return;
    }

    try {
      const res = await cartService.addToCart(courseId);
      queryClient.invalidateQueries({ queryKey: ['cart'] });

      const itemId = wishlistItemId || getWishlistItem(courseId)?.id;
      if (itemId) {
        await wishlistService.removeFromWishlist(itemId);
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      }

      const msg = res?.message || 'Course moved to cart!';
      if (msg.toLowerCase().includes('already')) {
        toast(msg, { icon: 'ℹ️' });
      } else {
        toast.success(msg);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Could not move course to cart';
      if (msg.toLowerCase().includes('already')) {
        toast(msg, { icon: 'ℹ️' });
      } else {
        toast.error(msg);
      }
    }
  };

  const moveAllToCart = async () => {
    if (!wishlist.length) return;

    const availableItems = wishlist.filter((item) => !enrolledCourseIds.has(item.courseId));
    if (availableItems.length === 0) {
      toast('All courses in your wishlist are already in your enrolled courses.', {
        icon: 'ℹ️',
      });
      return;
    }

    try {
      const addPromises = availableItems.map((item) => cartService.addToCart(item.courseId));
      await Promise.allSettled(addPromises);
      queryClient.invalidateQueries({ queryKey: ['cart'] });

      for (const item of availableItems) {
        await wishlistService.removeFromWishlist(item.id);
      }
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });

      toast.success(`Moved ${availableItems.length} course${availableItems.length > 1 ? 's' : ''} to cart!`);
    } catch {
      toast.error('Failed to move items to cart');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: isStudent ? wishlist.length : 0,
        isLoading: isStudent ? isLoading : false,
        isWishlisted,
        getWishlistItem,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        moveToCart,
        moveAllToCart,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
