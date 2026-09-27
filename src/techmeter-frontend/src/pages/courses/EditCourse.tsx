import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import { categoryService } from '../../services/categoryService';
import { coursePlaceholder } from '../../utils/placeholders';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Upload,
  DollarSign,
  Layers,
  Save,
} from 'lucide-react';

const EditCourse: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | string>(0);
  const [currency, setCurrency] = useState('USD');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // 1. Fetch Course Data
  const { data: courseData, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourseById(courseId!),
    enabled: !!courseId,
  });

  // 2. Fetch Categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  });

  const categories = categoriesData?.data || [];

  // Populate state once course data loads
  useEffect(() => {
    if (courseData?.data) {
      const c = courseData.data;
      setTitle(c.title || '');
      setDescription(c.description || '');
      setCategoryId(c.categoryId || '');
      setPrice(c.price ?? 0);
      setCurrency(c.currency || 'USD');
      setImagePreview(c.courseProfileImageUrl || '');
    }
  }, [courseData]);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return courseService.updateCourse(courseId!, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['provider-courses'] });
      toast.success('Course updated successfully!');
      navigate(`/provider/courses/${courseId}/curriculum`);
    },
    onError: () => {
      toast.error('Failed to update course.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a course title');
      return;
    }

    const formData = new FormData();
    formData.append('Title', title);
    formData.append('Description', description);
    formData.append('CategoryId', categoryId);
    formData.append('Price', price.toString());
    formData.append('Currency', currency);
    if (imageFile) {
      formData.append('CourseProfileImageUrl', imageFile);
    }

    updateMutation.mutate(formData);
  };

  if (isLoadingCourse || isLoadingCategories) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Navigation */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/provider/dashboard"
            className="inline-flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-3">
            <Link
              to={`/provider/courses/${courseId}/curriculum`}
              className="inline-flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
            >
              <Layers className="h-3.5 w-3.5 mr-1.5" />
              Manage Curriculum
            </Link>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Edit Course Details</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Update the metadata, thumbnail, pricing, and category for your course.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                Course Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete React & TypeScript Bootcamp"
                required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
              />
            </div>

            {/* Category & Pricing Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                >
                  <option value="" className="dark:bg-gray-800">Select category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id} className="dark:bg-gray-800">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Price <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
                >
                  <option value="USD" className="dark:bg-gray-800">USD ($)</option>
                  <option value="EUR" className="dark:bg-gray-800">EUR (€)</option>
                  <option value="EGP" className="dark:bg-gray-800">EGP (E£)</option>
                  <option value="SAR" className="dark:bg-gray-800">SAR (SR)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                Course Description
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn in this course..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
              />
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                Course Cover Image
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-full sm:w-56 h-32 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                  <img
                    src={imagePreview || coursePlaceholder}
                    alt="Course Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = coursePlaceholder;
                    }}
                  />
                </div>

                <div className="flex-1 w-full">
                  <label className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition">
                    <Upload className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-1" />
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      Upload new cover image
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/provider/dashboard')}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 shadow-xs transition"
              >
                <Save className="h-4 w-4 mr-1.5" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;
