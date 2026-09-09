import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import { Loader2, Plus, BookOpen, Users, DollarSign, Edit, Trash2, Layers, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import { coursePlaceholder } from '../../utils/placeholders';

const ProviderDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['provider-courses'],
    queryFn: () => courseService.getProviderCourses(),
    enabled: !!user,
    retry: false,
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId: string) => courseService.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-courses'] });
      toast.success('Course deleted');
    },
    onError: () => toast.error('Failed to delete course'),
  });

  const courses = coursesData?.data || [];

  const stats = [
    { icon: BookOpen, label: 'Total Courses', value: courses.length, color: 'indigo' },
    { icon: Users, label: 'Total Students', value: '0', color: 'emerald' },
    { icon: DollarSign, label: 'Total Revenue', value: '$0.00', color: 'amber' },
  ];

  if (!user || user.role !== 'provider') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-200">
        <p className="text-xs text-gray-500 dark:text-gray-400">Access denied. Provider account required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Provider Dashboard</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Welcome back, {user.userName}</p>
          </div>
          <Link
            to="/courses/create"
            className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition w-fit"
          >
            <Plus className="h-4 w-4 mr-1.5" />Create Course
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-6 flex items-center space-x-4"
            >
              <div
                className={`p-3 rounded-2xl border ${
                  stat.color === 'indigo'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                    : stat.color === 'emerald'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400'
                }`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">{stat.label}</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">My Published Courses</h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{courses.length} courses</span>
          </div>
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
            </div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center max-w-sm mx-auto">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No courses yet</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Start sharing your knowledge with the world.</p>
              <Link
                to="/courses/create"
                className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
              >
                <Plus className="h-4 w-4 mr-1.5" />Create Your First Course
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {courses.map((course: any) => (
                <div key={course.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                  <div className="flex items-center space-x-4">
                    <img
                      src={course.courseProfileImageUrl || coursePlaceholder}
                      alt={course.title}
                      className="w-24 h-16 object-cover rounded-xl border border-gray-100 dark:border-gray-800 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = coursePlaceholder;
                      }}
                    />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{course.title || 'Untitled Course'}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{course.description || 'No description'}</p>
                      <div className="mt-1 flex items-center gap-3 text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                        <span>{!course.price || course.price === 0 ? 'Free' : `$${course.price}`}</span>
                        <span>•</span>
                        <span className="uppercase">{course.currency || 'USD'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/provider/courses/${course.id}/curriculum`}
                      className="inline-flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
                      title="Manage Sections & Lessons"
                    >
                      <Layers className="h-3.5 w-3.5 mr-1.5" />
                      Curriculum
                    </Link>
                    <Link
                      to={`/provider/courses/${course.id}/edit`}
                      className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      title="Edit Course Details"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/courses/${course.id}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      title="Preview Course Page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setCourseToDelete({ id: course.id, title: course.title || 'this course' })}
                      className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={() => {
          if (courseToDelete) {
            deleteCourseMutation.mutate(courseToDelete.id);
            setCourseToDelete(null);
          }
        }}
        title="Delete Course"
        message={`Are you sure you want to permanently delete "${courseToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Course"
        variant="danger"
        isLoading={deleteCourseMutation.isPending}
      />
    </div>
  );
};

export default ProviderDashboard;
