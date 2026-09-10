import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  CheckSquare,
  Square,
  Loader2,
  Calendar,
  X,
  Play,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useEnrolledCourses } from '../../hooks/useEnrolledCourses';
import { categoryService } from '../../services/categoryService';
import ConfirmModal from '../../components/common/ConfirmModal';
import { coursePlaceholder } from '../../utils/placeholders';
import { WishlistItem } from '../../types';

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'title-asc';
type PriceFilter = 'all' | 'free' | 'paid';
type ViewMode = 'grid' | 'list';

const Wishlist: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const {
    wishlist,
    isLoading: wishlistLoading,
    removeFromWishlist,
    clearWishlist,
    moveToCart,
    moveAllToCart,
  } = useWishlist();
  const { isEnrolled } = useEnrolledCourses();

  // Categories for filter tags
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Action / Modal states
  const [itemToRemove, setItemToRemove] = useState<WishlistItem | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isBatchRemoveModalOpen, setIsBatchRemoveModalOpen] = useState(false);
  const [isMovingAll, setIsMovingAll] = useState(false);
  const [isBatchMoving, setIsBatchMoving] = useState(false);
  const [movingItemIds, setMovingItemIds] = useState<Set<string>>(new Set());

  const categories = categoriesData?.data || [];

  // Filtered & Sorted Wishlist Items
  const filteredItems = useMemo(() => {
    let result = [...wishlist];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.courseName?.toLowerCase().includes(q) ||
          item.courseTitle?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.categoryName?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(
        (item) =>
          item.categoryId === selectedCategory ||
          item.categoryName?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Price filter
    if (priceFilter === 'free') {
      result = result.filter((item) => !item.price || item.price === 0);
    } else if (priceFilter === 'paid') {
      result = result.filter((item) => (item.price ?? 0) > 0);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOption === 'recent') {
        const dateA = new Date(a.addedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.addedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      }
      if (sortOption === 'price-asc') {
        return (a.price ?? 0) - (b.price ?? 0);
      }
      if (sortOption === 'price-desc') {
        return (b.price ?? 0) - (a.price ?? 0);
      }
      if (sortOption === 'title-asc') {
        const titleA = a.courseName || a.courseTitle || '';
        const titleB = b.courseName || b.courseTitle || '';
        return titleA.localeCompare(titleB);
      }
      return 0;
    });

    return result;
  }, [wishlist, searchTerm, selectedCategory, priceFilter, sortOption]);

  // Statistics
  const totalValue = useMemo(() => {
    return wishlist.reduce((sum, item) => sum + (item.price || 0), 0);
  }, [wishlist]);

  const freeCoursesCount = useMemo(() => {
    return wishlist.filter((item) => !item.price || item.price === 0).length;
  }, [wishlist]);

  // Selection handlers
  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Move individual item to cart
  const handleMoveToCart = async (item: WishlistItem) => {
    setMovingItemIds((prev) => new Set(prev).add(item.id));
    try {
      await moveToCart(item.courseId, item.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    } finally {
      setMovingItemIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  // Move all to cart
  const handleMoveAllToCart = async () => {
    setIsMovingAll(true);
    try {
      await moveAllToCart();
      clearSelection();
    } finally {
      setIsMovingAll(false);
    }
  };

  // Batch move selected to cart
  const handleBatchMoveToCart = async () => {
    if (selectedIds.size === 0) return;
    setIsBatchMoving(true);
    try {
      const selectedItems = wishlist.filter((item) => selectedIds.has(item.id));
      const unownedItems = selectedItems.filter((item) => !isEnrolled(item.courseId));
      if (unownedItems.length === 0) {
        toast('All selected courses are already in your enrolled courses.', { icon: 'ℹ️' });
        return;
      }
      for (const item of unownedItems) {
        await moveToCart(item.courseId, item.id);
      }
      clearSelection();
    } finally {
      setIsBatchMoving(false);
    }
  };

  // Batch remove selected
  const handleBatchRemove = async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await removeFromWishlist(id);
    }
    clearSelection();
    setIsBatchRemoveModalOpen(false);
  };

  // Single remove confirm
  const handleConfirmRemoveSingle = async () => {
    if (!itemToRemove) return;
    await removeFromWishlist(itemToRemove.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(itemToRemove.id);
      return next;
    });
    setItemToRemove(null);
  };

  // 1. Unauthenticated or non-student view
  if (!isAuthenticated || user?.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 transition-colors duration-200">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xs ring-8 ring-rose-50/50 dark:ring-rose-950/20">
            <Heart className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Your Learning Wishlist
          </h2>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Save courses you love, track pricing, and enroll whenever you're ready. Please sign in as a student to access your personal wishlist.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
            >
              Sign In to Your Account
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold transition"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading State (Skeleton)
  if (wishlistLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4 animate-pulse" />
          <div className="h-4 w-72 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8 animate-pulse" />

          {/* Grid Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xs animate-pulse"
              >
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/2" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-1/4 pt-2" />
                  <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty State (Wishlist is completely empty)
  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 transition-colors duration-200">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="relative w-24 h-24 bg-gradient-to-tr from-rose-100 to-pink-50 dark:from-rose-950/60 dark:to-pink-900/30 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xs ring-8 ring-rose-50/60 dark:ring-rose-950/20">
            <Heart className="h-12 w-12 stroke-[1.75]" />
            <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-amber-400 animate-bounce" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Your Wishlist is Empty
          </h2>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Explore our extensive catalog of technology and engineering courses. Tap the heart icon on any course to bookmark it for later!
          </p>

          <div className="mt-8">
            <Link
              to="/courses"
              className="inline-flex items-center px-6 py-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all hover:gap-3 gap-2"
            >
              <span>Explore Course Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Quick Categories Navigation */}
          {categories.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                Popular Categories
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/courses?category=${cat.id}`}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Main Wishlist View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title & Top Summary Card */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-xl">
                  <Heart className="h-6 w-6 fill-rose-500" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    My Wishlist
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {wishlist.length} saved course{wishlist.length !== 1 ? 's' : ''} in your collection
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Stats Card */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="hidden sm:flex items-center px-3.5 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 text-xs">
                <span className="text-gray-500 dark:text-gray-400 mr-2">Est. Total:</span>
                <span className="font-extrabold text-gray-900 dark:text-white">
                  ${totalValue.toFixed(2)}
                </span>
                {freeCoursesCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold">
                    {freeCoursesCount} Free
                  </span>
                )}
              </div>

              <button
                onClick={handleMoveAllToCart}
                disabled={isMovingAll || wishlist.length === 0}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition disabled:opacity-50"
              >
                {isMovingAll ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-1.5" />
                )}
                Move All to Cart
              </button>

              <button
                onClick={() => setIsClearModalOpen(true)}
                className="inline-flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 transition"
                title="Clear entire wishlist"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Search, Filters & Sorting Toolbar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search your saved courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter Pills */}
            <div className="md:col-span-2 flex gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200/60 dark:border-gray-700">
              {(['all', 'free', 'paid'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPriceFilter(filter)}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg capitalize transition ${
                    priceFilter === filter
                      ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Sort & View Mode */}
            <div className="md:col-span-2 flex items-center justify-end gap-2">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="flex-1 py-2 px-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="recent">Recently Added</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="title-asc">Title: A to Z</option>
              </select>

              <div className="flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition ${
                    viewMode === 'grid'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  }`}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition ${
                    viewMode === 'list'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  }`}
                  title="List View"
                  aria-label="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Selection & Batch Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 px-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="inline-flex items-center text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? (
                <CheckSquare className="h-4 w-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Square className="h-4 w-4 mr-1.5 text-gray-400" />
              )}
              <span>
                {selectedIds.size > 0
                  ? `${selectedIds.size} of ${filteredItems.length} selected`
                  : 'Select All'}
              </span>
            </button>

            {selectedIds.size > 0 && (
              <button
                onClick={clearSelection}
                className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2 underline"
              >
                Clear selection
              </button>
            )}
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-150">
              <button
                onClick={handleBatchMoveToCart}
                disabled={isBatchMoving}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition disabled:opacity-50"
              >
                {isBatchMoving ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                )}
                Move Selected to Cart ({selectedIds.size})
              </button>

              <button
                onClick={() => setIsBatchRemoveModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/60 dark:border-rose-900/50 transition"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Remove Selected
              </button>
            </div>
          )}
        </div>

        {/* No Filter Results Found */}
        {filteredItems.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-12 text-center my-6">
            <Search className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No matching courses found
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              We couldn't find any wishlisted courses matching your search or active filter settings.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && filteredItems.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const isMoving = movingItemIds.has(item.id);
              const enrolled = isEnrolled(item.courseId);
              const title = item.courseName || item.courseTitle || 'Untitled Course';
              const imageUrl = item.courseImageUrl || item.courseProfileImageUrl || coursePlaceholder;
              const formattedDate = item.addedAt || item.createdAt
                ? new Date(item.addedAt || item.createdAt!).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : null;

              return (
                <div
                  key={item.id}
                  className={`group bg-white dark:bg-gray-900 rounded-3xl shadow-xs border transition duration-200 flex flex-col justify-between overflow-hidden relative ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-500'
                      : 'border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/60'
                  }`}
                >
                  <div>
                    {/* Thumbnail & Overlays */}
                    <div className="relative overflow-hidden">
                      <Link to={`/courses/${item.courseId}`} className="block overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = coursePlaceholder;
                          }}
                        />
                      </Link>

                      {/* Select checkbox overlay */}
                      <button
                        onClick={() => toggleSelectItem(item.id)}
                        className={`absolute top-3 left-3 p-1.5 rounded-lg backdrop-blur-md transition shadow-xs z-10 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900'
                        }`}
                        title={isSelected ? 'Deselect item' : 'Select item'}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>

                      {/* Enrolled Badge */}
                      {enrolled && (
                        <div className="absolute top-3 left-12 px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold shadow-xs flex items-center gap-1 z-10">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Enrolled</span>
                        </div>
                      )}

                      {/* Remove item quick button */}
                      <button
                        onClick={() => setItemToRemove(item)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 dark:bg-gray-900/80 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 backdrop-blur-md transition shadow-xs z-10"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {/* Category Tag (if available) */}
                      {item.categoryName && (
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-gray-900/75 backdrop-blur-md text-white text-[10px] font-bold tracking-wide">
                          {item.categoryName}
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="p-5">
                      <Link to={`/courses/${item.courseId}`}>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 transition-colors leading-snug">
                          {title}
                        </h3>
                      </Link>

                      {item.description && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {formattedDate && (
                        <div className="mt-3 flex items-center text-[11px] text-gray-400 dark:text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Saved {formattedDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mb-4">
                      <div>
                        <span className="text-base font-extrabold text-gray-900 dark:text-white">
                          {enrolled ? (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Purchased & Active</span>
                          ) : !item.price || item.price === 0 ? (
                            'Free'
                          ) : (
                            `$${item.price.toFixed(2)}`
                          )}
                        </span>
                        {!enrolled && item.price && item.price > 0 && (
                          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1.5 uppercase">
                            {item.currency || 'USD'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {enrolled ? (
                        <Link
                          to={`/learn/${item.courseId}`}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Go to Course</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleMoveToCart(item)}
                          disabled={isMoving}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center justify-center transition"
                        >
                          {isMoving ? (
                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                          ) : (
                            <ShoppingCart className="h-4 w-4 mr-1.5" />
                          )}
                          Move to Cart
                        </button>
                      )}

                      <button
                        onClick={() => setItemToRemove(item)}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && filteredItems.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 shadow-xs">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const isMoving = movingItemIds.has(item.id);
              const enrolled = isEnrolled(item.courseId);
              const title = item.courseName || item.courseTitle || 'Untitled Course';
              const imageUrl = item.courseImageUrl || item.courseProfileImageUrl || coursePlaceholder;
              const formattedDate = item.addedAt || item.createdAt
                ? new Date(item.addedAt || item.createdAt!).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : null;

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                    isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : 'hover:bg-gray-50/60 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => toggleSelectItem(item.id)}
                      className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex-shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>

                    <Link to={`/courses/${item.courseId}`} className="flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={title}
                        className="w-24 sm:w-28 h-16 sm:h-18 object-cover rounded-xl border border-gray-100 dark:border-gray-800"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = coursePlaceholder;
                        }}
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/courses/${item.courseId}`}
                          className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1 transition"
                        >
                          {title}
                        </Link>
                        {enrolled && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                            Enrolled
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      )}
                      {formattedDate && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                          Saved on {formattedDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Price in List View */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                    <div className="text-left sm:text-right">
                      <span className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
                        {enrolled ? (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Purchased</span>
                        ) : !item.price || item.price === 0 ? (
                          'Free'
                        ) : (
                          `$${item.price.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrolled ? (
                        <Link
                          to={`/learn/${item.courseId}`}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Go to Course</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleMoveToCart(item)}
                          disabled={isMoving}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center transition"
                        >
                          {isMoving ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Move to Cart
                        </button>
                      )}

                      <button
                        onClick={() => setItemToRemove(item)}
                        className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 1. Single Item Remove Modal */}
      <ConfirmModal
        isOpen={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        onConfirm={handleConfirmRemoveSingle}
        title="Remove from Wishlist"
        message={`Are you sure you want to remove "${itemToRemove?.courseName || itemToRemove?.courseTitle || 'this course'}" from your wishlist?`}
        confirmText="Remove"
        variant="danger"
      />

      {/* 2. Clear All Wishlist Modal */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={async () => {
          await clearWishlist();
          clearSelection();
          setIsClearModalOpen(false);
        }}
        title="Clear Wishlist"
        message="Are you sure you want to remove all courses from your wishlist? This action cannot be undone."
        confirmText="Clear All"
        variant="danger"
      />

      {/* 3. Batch Remove Modal */}
      <ConfirmModal
        isOpen={isBatchRemoveModalOpen}
        onClose={() => setIsBatchRemoveModalOpen(false)}
        onConfirm={handleBatchRemove}
        title="Remove Selected Courses"
        message={`Are you sure you want to remove ${selectedIds.size} selected course(s) from your wishlist?`}
        confirmText="Remove Selected"
        variant="danger"
      />
    </div>
  );
};

export default Wishlist;
