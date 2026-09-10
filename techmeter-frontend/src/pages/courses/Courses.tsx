import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import { categoryService } from '../../services/categoryService';
import { cartService } from '../../services/cartService';
import CourseCard from '../../components/courses/CourseCard';
import { Loader2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Courses: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', searchTerm, selectedCategory, priceFilter],
    queryFn: () => courseService.getAllCourses(),
    retry: false,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
    retry: false,
  });

  const addToCartMutation = useMutation({
    mutationFn: (courseId: string) => cartService.addToCart(courseId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      const msg = res?.message || 'Added to cart';
      if (msg.toLowerCase().includes('already')) {
        toast(msg, { icon: 'ℹ️' });
      } else {
        toast.success(msg);
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to add to cart';
      if (msg.toLowerCase().includes('already')) {
        toast(msg, { icon: 'ℹ️' });
      } else {
        toast.error(msg);
      }
    },
  });

  const allCourses = coursesData?.data || [];
  const categories = categoriesData?.data || [];

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch = !searchTerm ||
      (course.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || course.categoryId === selectedCategory;
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === 'free' && (!course.price || course.price === 0)) ||
      (priceFilter === 'paid' && course.price && course.price > 0);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Explore Courses</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Find the perfect course for your learning journey</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search courses by name or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-2.5 px-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            >
              <option value="" className="dark:bg-gray-800">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="dark:bg-gray-800">{cat.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              {(['all', 'free', 'paid'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPriceFilter(filter)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    priceFilter === filter
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter === 'free' ? 'Free' : 'Paid'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {coursesLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" /></div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <Filter className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
            <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">No courses found</h3>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onAddToCart={isAuthenticated && user?.role === 'student' ? (courseId) => addToCartMutation.mutate(courseId) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
