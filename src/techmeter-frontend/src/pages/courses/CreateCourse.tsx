import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import { categoryService } from '../../services/categoryService';
import { Loader2, Upload, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    price: 0,
    currency: 'USD',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
    retry: false,
  });

  const createCourseMutation = useMutation({
    mutationFn: (data: FormData) => courseService.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-courses'] });
      toast.success('Course created successfully!');
      navigate('/provider/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create course');
    },
  });

  const categories = categoriesData?.data || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.categoryId) {
      toast.error('Title and category are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('Title', formData.title);
      submitData.append('Description', formData.description);
      submitData.append('CategoryId', formData.categoryId);
      submitData.append('Price', formData.price.toString());
      submitData.append('Currency', formData.currency);
      if (imageFile) submitData.append('CourseProfileImageUrl', imageFile);

      await createCourseMutation.mutateAsync(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'provider') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-200">
        <p className="text-xs text-gray-500 dark:text-gray-400">Access denied. Provider account required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />Back
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">Create New Course</h1>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Course Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              placeholder="e.g. Modern Full-Stack Development with React & ASP.NET"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              placeholder="Describe your course syllabus, objectives, and prerequisites..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                <option value="" className="dark:bg-gray-800">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="dark:bg-gray-800">{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Price (USD)</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Course Thumbnail</label>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                <label className="flex flex-col items-center px-6 py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                  <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Click to upload cover image</span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">PNG, JPG up to 5MB</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              {imagePreview && (
                <div className="relative flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-36 h-24 object-cover rounded-2xl border border-gray-200 dark:border-gray-700" />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center transition"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              {isSubmitting ? 'Creating Course...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
