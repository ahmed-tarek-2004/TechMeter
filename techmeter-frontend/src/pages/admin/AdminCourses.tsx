import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import { adminService } from '../../services/adminService';
import { coursePlaceholder } from '../../utils/placeholders';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Trash2,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminCourses: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);

  // Fetch all courses
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['admin-all-courses'],
    queryFn: () => courseService.getAllCourses(),
  });

  const courses = coursesData?.data || [];

  // Delete/Moderate Course Mutation
  const deleteMutation = useMutation({
    mutationFn: (courseId: string) => adminService.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-courses'] });
      toast.success('Course removed by admin.');
    },
    onError: () => toast.error('Failed to delete course.'),
  });

  const filteredCourses = courses.filter((c: any) =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Course Moderation</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Review all platform courses, inspect content, and remove non-compliant courses.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search platform courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
          />
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400 dark:text-gray-500">No courses found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Course</th>
                  <th className="py-3.5 px-6">Price</th>
                  <th className="py-3.5 px-6">Provider ID</th>
                  <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {filteredCourses.map((course: any) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={course.courseProfileImageUrl || coursePlaceholder}
                          alt={course.title}
                          className="w-12 h-10 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = coursePlaceholder;
                          }}
                        />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{course.title}</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1">
                            {course.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                      ${course.price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                      {course.providerId ? `${course.providerId.substring(0, 10)}...` : 'Unknown'}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        to={`/courses/${course.id}`}
                        target="_blank"
                        className="inline-flex items-center p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        title="View Course Page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setCourseToDelete({ id: course.id, title: course.title || 'Untitled' })}
                        className="inline-flex items-center p-1.5 text-rose-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        title="Delete Course (Admin)"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={() => {
          if (courseToDelete) {
            deleteMutation.mutate(courseToDelete.id);
            setCourseToDelete(null);
          }
        }}
        title="Admin Force Delete Course"
        message={`Are you sure you want to force delete "${courseToDelete?.title}" from the platform? This cannot be recovered.`}
        confirmText="Delete Course"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminCourses;
