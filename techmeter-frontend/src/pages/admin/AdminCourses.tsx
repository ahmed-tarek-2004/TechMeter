import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import { adminService } from '../../services/adminService';
import { categoryService } from '../../services/categoryService';
import { coursePlaceholder } from '../../utils/placeholders';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Trash2,
  Search,
  ExternalLink,
  BookOpen,
  Filter,
  DollarSign,
  Layers,
  LayoutGrid,
  List,
  Eye,
  X,
  Copy,
  Check,
  BookMarked,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminCourses: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'title'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);
  const [previewCourse, setPreviewCourse] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Fetch all platform courses
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['admin-all-courses'],
    queryFn: () => courseService.getAllCourses(),
  });

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  });

  const courses = useMemo(() => coursesData?.data || [], [coursesData?.data]);
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);

  // Delete / Moderate Course Mutation
  const deleteMutation = useMutation({
    mutationFn: (courseId: string) => adminService.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-courses'] });
      toast.success('Course removed from platform by administrator.');
      setCourseToDelete(null);
      if (previewCourse) setPreviewCourse(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete course.';
      toast.error(msg);
      setCourseToDelete(null);
    },
  });

  // Filtering & Sorting
  const filteredAndSortedCourses = useMemo(() => {
    let result = [...courses];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((c: any) => c.categoryId === selectedCategory);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c: any) =>
          c.title?.toLowerCase().includes(term) ||
          c.description?.toLowerCase().includes(term) ||
          c.providerId?.toLowerCase().includes(term) ||
          c.id?.toLowerCase().includes(term)
      );
    }

    // Sorting
    result.sort((a: any, b: any) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return 0; // Default order
    });

    return result;
  }, [courses, selectedCategory, searchTerm, sortBy]);

  const totalCatalogValue = courses.reduce((acc, c: any) => acc + (c.price || 0), 0);
  const avgCoursePrice = courses.length > 0 ? totalCatalogValue / courses.length : 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getCategoryName = (catId?: string) => {
    if (!catId) return 'Uncategorized';
    const found = categories.find((cat: any) => cat.id === catId);
    return found ? found.name : 'General';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Course Catalog & Moderation
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
              <BookOpen className="h-3 w-3 mr-1" />
              Platform Catalog
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Review all published courses, inspect curriculum contents, and enforce compliance guidelines.
          </p>
        </div>

        <Link
          to="/courses/create"
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <BookMarked className="h-4 w-4 mr-1.5" />
          Create Platform Course
        </Link>
      </div>

      {/* Catalog Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Published Courses
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {courses.length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Average Price
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              ${avgCoursePrice.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Categories Covered
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {categories.length} Topics
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/40 rounded-2xl text-purple-600 dark:text-purple-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Catalog Total Value
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              ${totalCatalogValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by title, description, or instructor ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center space-x-1.5 bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-gray-800 dark:text-gray-200 cursor-pointer"
            >
              <option value="all" className="dark:bg-gray-800">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id} className="dark:bg-gray-800">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1.5 bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300">
            <span className="text-[11px] text-gray-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none text-xs text-gray-800 dark:text-gray-200 cursor-pointer"
            >
              <option value="newest" className="dark:bg-gray-800">Default</option>
              <option value="price-desc" className="dark:bg-gray-800">Price: High to Low</option>
              <option value="price-asc" className="dark:bg-gray-800">Price: Low to High</option>
              <option value="title" className="dark:bg-gray-800">Title: A-Z</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Courses Display */}
      {isLoadingCourses ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Loading platform courses...</p>
        </div>
      ) : filteredAndSortedCourses.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <BookOpen className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">No courses found</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto">
            Try adjusting your search criteria or category filter.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Course Information</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Price</th>
                  <th className="py-3.5 px-6">Provider</th>
                  <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {filteredAndSortedCourses.map((course: any) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={course.courseProfileImageUrl || coursePlaceholder}
                          alt={course.title}
                          className="w-14 h-11 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = coursePlaceholder;
                          }}
                        />
                        <div className="max-w-xs sm:max-w-sm">
                          <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{course.title}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                            {course.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                        {getCategoryName(course.categoryId)}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                      ${course.price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                      {course.providerId ? `${course.providerId.substring(0, 8)}...` : 'TechMeter'}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => setPreviewCourse(course)}
                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                        title="Preview Course Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/courses/${course.id}`}
                        target="_blank"
                        className="inline-flex items-center p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        title="Open Public Course Page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setCourseToDelete({ id: course.id, title: course.title || 'Untitled' })}
                        className="p-2 text-rose-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Force Delete Course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedCourses.map((course: any) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={course.courseProfileImageUrl || coursePlaceholder}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = coursePlaceholder;
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-md text-white font-bold text-xs px-2.5 py-1 rounded-xl">
                    ${course.price?.toFixed(2) || '0.00'}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                    {getCategoryName(course.categoryId)}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {course.description || 'No description provided'}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800 mt-2 flex items-center justify-between">
                <span className="font-mono text-[10px] text-gray-400">
                  ID: {course.id?.substring(0, 8)}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setPreviewCourse(course)}
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    title="Quick Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <Link
                    to={`/courses/${course.id}`}
                    target="_blank"
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    title="View Public Page"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setCourseToDelete({ id: course.id, title: course.title || 'Untitled' })}
                    className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete Course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Quick Preview Modal */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Course Inspection
              </h3>
              <button
                onClick={() => setPreviewCourse(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={previewCourse.courseProfileImageUrl || coursePlaceholder}
                  alt={previewCourse.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = coursePlaceholder;
                  }}
                />
              </div>

              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 mb-1">
                  {getCategoryName(previewCourse.categoryId)}
                </span>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  {previewCourse.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                  {previewCourse.description || 'No description provided'}
                </p>
              </div>

              {/* Course Meta Info */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Course ID:</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{previewCourse.id}</span>
                    <button
                      onClick={() => handleCopy(previewCourse.id)}
                      className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                    >
                      {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Provider ID:</span>
                  <span className="font-mono text-gray-800 dark:text-gray-200">
                    {previewCourse.providerId || 'System'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Listing Price:</span>
                  <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                    ${previewCourse.price?.toFixed(2) || '0.00'} USD
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    setCourseToDelete({ id: previewCourse.id, title: previewCourse.title });
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                >
                  Delete Course
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPreviewCourse(null)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Close
                  </button>
                  <Link
                    to={`/courses/${previewCourse.id}`}
                    target="_blank"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition inline-flex items-center"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={() => {
          if (courseToDelete) {
            deleteMutation.mutate(courseToDelete.id);
          }
        }}
        title="Admin Force Delete Course"
        message={`Are you sure you want to permanently remove "${courseToDelete?.title}" from the platform catalog? This action will immediately unpublish the course and cannot be recovered.`}
        confirmText="Force Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminCourses;
