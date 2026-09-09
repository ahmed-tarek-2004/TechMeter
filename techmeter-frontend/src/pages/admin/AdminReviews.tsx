import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { ratingService } from '../../services/ratingService';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Star,
  Trash2,
  Search,
} from 'lucide-react';

const AdminReviews: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewToDelete, setReviewToDelete] = useState<{ studentId: string; courseId: string } | null>(null);

  // Sample or fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => ratingService.getAllCourseRatings('all'),
  });

  const reviews = reviewsData?.data || [];

  // Delete Rating Mutation
  const deleteMutation = useMutation({
    mutationFn: ({ studentId, courseId }: { studentId: string; courseId: string }) =>
      adminService.deleteRating(studentId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review removed.');
    },
    onError: () => toast.error('Failed to remove review.'),
  });

  const filteredReviews = reviews.filter((r: any) =>
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Review Moderation
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Inspect student reviews and ratings across all courses and delete abusive or spam comments.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search review content or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400 dark:text-gray-500">
            No course reviews flagged for moderation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Rating</th>
                  <th className="py-3.5 px-6">Comment / Review</th>
                  <th className="py-3.5 px-6">Student ID</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {filteredReviews.map((review: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${
                              s <= (review.rating || 5)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white max-w-md">
                      {review.comment || 'No written text'}
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-500 dark:text-gray-400 text-[11px]">
                      {review.studentId?.substring(0, 10)}...
                    </td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                      {review.ratedAt
                        ? new Date(review.ratedAt).toLocaleDateString()
                        : 'Recent'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() =>
                          setReviewToDelete({
                            studentId: review.studentId,
                            courseId: review.courseId,
                          })
                        }
                        className="inline-flex items-center p-1.5 text-rose-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        title="Delete Review"
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

      {/* Delete Review Confirmation Modal */}
      <ConfirmModal
        isOpen={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        onConfirm={() => {
          if (reviewToDelete) {
            deleteMutation.mutate({
              studentId: reviewToDelete.studentId,
              courseId: reviewToDelete.courseId,
            });
            setReviewToDelete(null);
          }
        }}
        title="Delete Review"
        message="Are you sure you want to permanently delete this student review and rating?"
        confirmText="Delete Review"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminReviews;
