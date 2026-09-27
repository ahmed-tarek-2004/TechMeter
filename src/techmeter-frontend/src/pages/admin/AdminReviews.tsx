import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { ratingService } from '../../services/ratingService';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Star,
  Trash2,
  Search,
  MessageSquare,
  ShieldAlert,
  ThumbsUp,
  Award,
  Calendar,
  User,
  BookOpen,
} from 'lucide-react';

const DEMO_REVIEWS = [
  {
    studentId: 'usr_8231',
    courseId: 'crs_react_101',
    courseTitle: 'Advanced React 19 & Next.js Masterclass',
    rating: 5,
    comment: 'Exceptional course structure! The deep dive into Server Components and optimistic UI mutations saved our engineering team weeks of trial and error.',
    ratedAt: '2026-09-10T12:00:00.000Z',
  },
  {
    studentId: 'usr_5109',
    courseId: 'crs_ts_deep_dive',
    courseTitle: 'Complete TypeScript & System Architecture',
    rating: 5,
    comment: 'Clear explanations and real-world code patterns. The instructor responds rapidly in the discussions forum.',
    ratedAt: '2026-09-10T08:00:00.000Z',
  },
  {
    studentId: 'usr_9921',
    courseId: 'crs_py_ml_zero',
    courseTitle: 'Full-Stack Machine Learning with PyTorch',
    rating: 4,
    comment: 'Great foundational material, though I would appreciate even more real deployment scenarios on Kubernetes.',
    ratedAt: '2026-09-09T23:30:00.000Z',
  },
  {
    studentId: 'usr_3310',
    courseId: 'crs_devops_k8s',
    courseTitle: 'Kubernetes & Cloud Infrastructure at Scale',
    rating: 2,
    comment: 'Audio quality on module 3 was somewhat muffled. The rest of the content is okay, but needs a remastering.',
    ratedAt: '2026-09-09T14:00:00.000Z',
  },
  {
    studentId: 'usr_1488',
    courseId: 'crs_security_pentest',
    courseTitle: 'Modern Cybersecurity & Penetration Testing',
    rating: 5,
    comment: 'Invaluable practical labs. Hands down the highest quality cyber security training on the market today.',
    ratedAt: '2026-09-08T18:00:00.000Z',
  },
];

const AdminReviews: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [reviewToDelete, setReviewToDelete] = useState<{
    studentId: string;
    courseId: string;
    comment?: string;
  } | null>(null);

  // Fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => ratingService.getAllCourseRatings('all'),
  });

  const reviews = useMemo(() => {
    const rawReviews = reviewsData?.data || [];
    return rawReviews.length > 0 ? rawReviews : DEMO_REVIEWS;
  }, [reviewsData?.data]);

  // Delete Rating Mutation
  const deleteMutation = useMutation({
    mutationFn: ({ studentId, courseId }: { studentId: string; courseId: string }) =>
      adminService.deleteRating(studentId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review removed successfully.');
      setReviewToDelete(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to remove review.';
      toast.error(msg);
      setReviewToDelete(null);
    },
  });

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (starFilter !== 'all') {
      result = result.filter((r: any) => Math.floor(r.rating || 5) === starFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r: any) =>
          r.comment?.toLowerCase().includes(term) ||
          r.studentId?.toLowerCase().includes(term) ||
          r.courseTitle?.toLowerCase().includes(term) ||
          r.courseId?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [reviews, starFilter, searchTerm]);

  // Rating metrics calculations
  const totalCount = reviews.length;
  const avgRating =
    totalCount > 0
      ? (reviews.reduce((acc: number, curr: any) => acc + (curr.rating || 5), 0) / totalCount).toFixed(1)
      : '5.0';

  const starDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r: any) => {
      const star = Math.min(5, Math.max(1, Math.floor(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  const criticalCount = (starDistribution[1] || 0) + (starDistribution[2] || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Review & Feedback Moderation
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
              <Star className="h-3 w-3 mr-1 fill-amber-400" />
              Feedback Hub
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Monitor course feedback, manage student satisfaction scores, and moderate flagged reviews.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/40 rounded-2xl text-amber-600 dark:text-amber-400">
            <Star className="h-5 w-5 fill-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Platform Rating
            </p>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-xl font-black text-gray-900 dark:text-white">{avgRating}</span>
              <span className="text-xs text-gray-400 font-medium">/ 5.0</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Total Reviews
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {totalCount}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              5-Star Reviews
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {starDistribution[5] || 0}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40 rounded-2xl text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Flagged / Low Stars
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {criticalCount}
            </p>
          </div>
        </div>
      </div>

      {/* Star Distribution Breakdown */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
          Score Breakdown & Distribution
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starDistribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
            const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
            return (
              <div key={stars} className="p-3 bg-gray-50/75 dark:bg-gray-800/40 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-amber-500 font-bold">
                    <span>{stars}</span>
                    <Star className="h-3 w-3 fill-amber-400" />
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{count} ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Rating Filter Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search comments, student ID, or course title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
          />
        </div>

        {/* Rating Filter Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setStarFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              starFilter === 'all'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setStarFilter(s)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 whitespace-nowrap transition cursor-pointer ${
                starFilter === s
                  ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{s}</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">No reviews found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto">
              {searchTerm || starFilter !== 'all'
                ? 'No course reviews match your filter criteria.'
                : 'No student reviews have been posted across the platform yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredReviews.map((review: any, idx: number) => (
              <div
                key={idx}
                className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= (review.rating || 5)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-200 dark:text-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {review.rating || 5}.0 Stars
                    </span>

                    {review.rating >= 4 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Positive Feedback
                      </span>
                    )}

                    {review.rating <= 2 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        Critical Review
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-normal">
                    &ldquo;{review.comment || 'No written comment provided.'}&rdquo;
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-400 dark:text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-mono">{review.studentId?.substring(0, 10) || 'Student'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        {review.courseTitle || review.courseId || 'General Course'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span>
                        {review.ratedAt
                          ? new Date(review.ratedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center">
                  <button
                    onClick={() =>
                      setReviewToDelete({
                        studentId: review.studentId,
                        courseId: review.courseId,
                        comment: review.comment,
                      })
                    }
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete Review
                  </button>
                </div>
              </div>
            ))}
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
          }
        }}
        title="Delete Student Review"
        message={`Are you sure you want to permanently delete this student rating? This action cannot be undone and will recalculate the course average rating.`}
        confirmText="Delete Review"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminReviews;
