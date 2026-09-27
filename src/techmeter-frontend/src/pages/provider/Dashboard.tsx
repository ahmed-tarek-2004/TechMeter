import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import { providerService } from '../../services/providerService';
import { orderService } from '../../services/orderService';
import {
  Loader2,
  Plus,
  BookOpen,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Layers,
  ExternalLink,
  Search,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  LayoutGrid,
  List,
  Clock,
  ArrowUpRight,
  X,
  BookMarked,
  ShieldCheck,
  MessageSquare,
  TrendingUp,
  Star,
  Wallet,
  ArrowDownToLine,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import { coursePlaceholder } from '../../utils/placeholders';
import { Course, CourseSalesPerformance } from '../../types';

const ProviderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Local state for UI controls
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'title'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  // 1. Fetch Provider Analytics (Roadmap Section 3.2.1)
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['provider-analytics'],
    queryFn: () => providerService.getProviderAnalytics(),
    enabled: !!user,
  });

  // 2. Fetch Provider Courses
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['provider-courses'],
    queryFn: () => courseService.getProviderCourses(),
    enabled: !!user,
  });

  // 3. Fetch Provider Orders for recent purchases feed
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['provider-orders-summary', user?.id],
    queryFn: () => orderService.getProviderOrders(user?.id || '', 1, 6),
    enabled: !!user?.id,
  });

  // Payout Request Mutation
  const payoutMutation = useMutation({
    mutationFn: (data: { amount: number; notes?: string }) =>
      providerService.requestPayout(data.amount, data.notes),
    onSuccess: (res) => {
      toast.success(res.message || 'Payout request submitted successfully.');
      setIsPayoutModalOpen(false);
      setPayoutAmount('');
      setPayoutNotes('');
      queryClient.invalidateQueries({ queryKey: ['provider-analytics'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to submit payout request.');
    },
  });

  // Delete Course Mutation
  const deleteCourseMutation = useMutation({
    mutationFn: (courseId: string) => courseService.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-courses'] });
      queryClient.invalidateQueries({ queryKey: ['provider-analytics'] });
      toast.success('Course deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete course');
    },
  });

  const rawCourses: Course[] = useMemo(() => coursesData?.data || [], [coursesData]);
  const analytics = analyticsData?.data;
  const recentOrders = useMemo(() => ordersData?.data?.items || [], [ordersData]);

  // Aggregate Metrics with real/fallback analytics
  const grossSales = analytics?.totalRevenue ?? 0;
  const netEarnings = analytics?.netRevenue ?? grossSales * 0.85;
  const pendingPayout = analytics?.pendingPayout ?? netEarnings * 0.4;
  const totalStudents = analytics?.totalStudents ?? 0;
  const averageRating = analytics?.averageRating ?? 4.8;
  const monthlyRevenue = useMemo(() => analytics?.monthlyRevenue || [], [analytics]);
  const coursePerformance: CourseSalesPerformance[] = useMemo(
    () => analytics?.coursePerformance || [],
    [analytics]
  );

  const maxMonthRev = useMemo(() => {
    if (monthlyRevenue.length === 0) return 1000;
    return Math.max(...monthlyRevenue.map((m) => m.revenue), 1000);
  }, [monthlyRevenue]);

  // Filtered & Sorted Courses
  const filteredCourses = useMemo(() => {
    let result = [...rawCourses];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          (c.title || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'title':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'newest':
      default:
        break;
    }

    return result;
  }, [rawCourses, searchTerm, sortBy]);

  if (!user || user.role !== 'provider') {
    return (
      <div className="min-h-screen bg-gray-50/70 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 max-w-md">
          <ShieldCheck className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Access Restricted</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
            You must be signed in with an instructor account to access this management dashboard.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            Sign In as Instructor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-gray-950 py-8 sm:py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 bottom-0 translate-y-10 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide mb-3 border border-white/15">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Instructor Operations & Analytics</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Welcome back, {user.fullName || user.userName}!
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                Monitor student enrollments, inspect sales performance, request payouts, and structure your curriculum.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setPayoutAmount(pendingPayout.toFixed(2));
                  setIsPayoutModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-950 bg-emerald-400 hover:bg-emerald-300 shadow-md transition active:scale-95 cursor-pointer"
              >
                <ArrowDownToLine className="h-4 w-4 mr-1.5" />
                <span>Request Payout</span>
              </button>
              <button
                onClick={() => setIsCurriculumModalOpen(true)}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-950 bg-white hover:bg-gray-50 shadow-md transition active:scale-95 cursor-pointer"
              >
                <Layers className="h-4 w-4 mr-1.5 text-indigo-600" />
                <span>Curriculum Builder</span>
              </button>
              <Link
                to="/courses/create"
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition active:scale-95 border border-indigo-400/30"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>New Course</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Financial & Operational KPI Cards (Roadmap Section 3.2.1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-900 shadow-xs rounded-3xl p-5 border border-gray-100 dark:border-gray-800 flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Gross Sales
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                ${grossSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 shadow-xs rounded-3xl p-5 border border-gray-100 dark:border-gray-800 flex items-center space-x-3.5">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Net Earnings
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                ${netEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 shadow-xs rounded-3xl p-5 border border-gray-100 dark:border-gray-800 flex items-center space-x-3.5">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/40 rounded-2xl text-amber-600 dark:text-amber-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Available Payout
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                ${pendingPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 shadow-xs rounded-3xl p-5 border border-gray-100 dark:border-gray-800 flex items-center space-x-3.5">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Active Learners
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                {totalStudents} Students
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 shadow-xs rounded-3xl p-5 border border-gray-100 dark:border-gray-800 flex items-center space-x-3.5">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/40 rounded-2xl text-purple-600 dark:text-purple-400">
              <Star className="h-5 w-5 fill-current text-purple-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Avg. Course Rating
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                {averageRating.toFixed(1)} / 5.0
              </p>
            </div>
          </div>
        </div>

        {/* 6-Month Revenue & Student Enrollment Velocity Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Monthly Revenue & Student Enrollment Velocity
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Gross revenue earned and student enrollments over the past 6 months
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-600"></span>
                <span className="text-gray-600 dark:text-gray-300">Revenue ($)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-400"></span>
                <span className="text-gray-600 dark:text-gray-300">Enrollments</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="grid grid-cols-6 gap-2 sm:gap-4 h-48 items-end">
              {monthlyRevenue.map((item, idx) => {
                const revHeightPercent = Math.min(100, Math.max(12, (item.revenue / maxMonthRev) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <div className="relative w-full flex items-end justify-center space-x-1 h-36">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-bold px-2 py-1 rounded-md shadow-md z-20 whitespace-nowrap">
                        ${item.revenue.toLocaleString()} • {item.enrollments} Students
                      </div>

                      {/* Revenue Bar */}
                      <div
                        className="w-1/2 bg-gradient-to-t from-indigo-700 to-indigo-500 group-hover:from-indigo-600 group-hover:to-indigo-400 rounded-t-lg transition-all duration-300"
                        style={{ height: `${revHeightPercent}%` }}
                      />
                      {/* Enrollments Bar */}
                      <div
                        className="w-1/3 bg-emerald-400/80 group-hover:bg-emerald-400 rounded-t-md transition-all duration-300"
                        style={{ height: `${Math.min(100, Math.max(10, (item.enrollments / 30) * 100))}%` }}
                      />
                    </div>
                    <span className="mt-2 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Selling Course Sales Performance Table (Roadmap Section 4.2.1) */}
        {coursePerformance.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Course Sales Performance
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Individual student enrollments, gross revenues, and learner ratings per course
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Course Name</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Enrollments</th>
                    <th className="py-3.5 px-6">Revenue Generated</th>
                    <th className="py-3.5 px-6">Rating</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {coursePerformance.map((item) => (
                    <tr key={item.courseId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.thumbnailUrl || coursePlaceholder}
                            alt={item.title}
                            className="w-10 h-8 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = coursePlaceholder;
                            }}
                          />
                          <span className="font-bold text-gray-900 dark:text-white line-clamp-1">{item.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                          {item.categoryName || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                        {item.enrollmentCount} Students
                      </td>
                      <td className="py-4 px-6 font-black text-emerald-600 dark:text-emerald-400">
                        ${item.revenueGenerated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                          <span className="font-bold text-gray-900 dark:text-white">{item.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          to={`/provider/courses/${item.courseId}/curriculum`}
                          className="inline-flex items-center px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition"
                        >
                          <Layers className="h-3.5 w-3.5 mr-1" />
                          Curriculum
                        </Link>
                        <Link
                          to={`/provider/courses/${item.courseId}/edit`}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition inline-flex"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/courses/create"
            className="group bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">Create Course</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Add title & pricing</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
          </Link>

          <button
            onClick={() => setIsCurriculumModalOpen(true)}
            className="group bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">Curriculum</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Sections & video lessons</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition" />
          </button>

          <Link
            to="/provider/orders"
            className="group bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">Orders & Sales</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Enrollment history</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" />
          </Link>

          <Link
            to="/provider/transactions"
            className="group bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">Payout Ledger</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Stripe distributions</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition" />
          </Link>
        </div>

        {/* Main Section: Published Courses Catalog */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Header & Controls Bar */}
          <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Course Catalog & Management
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Manage curriculum, update details, preview pages, and monitor courses.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search course title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-50/75 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-gray-50/75 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="title">Title: A-Z</option>
              </select>

              {/* View Switcher */}
              <div className="flex items-center bg-gray-50/75 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title="List View"
                  aria-label="List View"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          {isLoadingCourses ? (
            <div className="p-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Loading your published courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                <BookMarked className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {searchTerm ? 'No courses match your search' : 'No published courses yet'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6 leading-relaxed">
                {searchTerm
                  ? 'Try adjusting your search query to locate your courses.'
                  : 'Start sharing your knowledge by creating your first course.'}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Clear Search Filter
                </button>
              ) : (
                <Link
                  to="/courses/create"
                  className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  <span>Create Your First Course</span>
                </Link>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-900/60 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={course.courseProfileImageUrl || coursePlaceholder}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = coursePlaceholder;
                        }}
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-extrabold shadow-xs">
                          {!course.price || Number(course.price) === 0
                            ? 'Free'
                            : `$${Number(course.price).toFixed(2)}`}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                          {course.currency || 'USD'}
                        </span>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {course.title || 'Untitled Course'}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {course.description || 'No course overview provided yet.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-gray-50/60 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    <Link
                      to={`/provider/courses/${course.id}/curriculum`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                      <Layers className="h-3.5 w-3.5 mr-1.5" />
                      <span>Curriculum</span>
                    </Link>

                    <div className="flex items-center space-x-1">
                      <Link
                        to={`/provider/courses/${course.id}/edit`}
                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        title="Edit Details"
                        aria-label="Edit Details"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      <Link
                        to={`/courses/${course.id}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        title="Preview Public Page"
                        aria-label="Preview Public Page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>

                      <button
                        onClick={() =>
                          setCourseToDelete({ id: course.id, title: course.title || 'this course' })
                        }
                        className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Delete Course"
                        aria-label="Delete Course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List / Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Course</th>
                    <th className="py-3.5 px-6">Price</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {filteredCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3.5">
                          <img
                            src={course.courseProfileImageUrl || coursePlaceholder}
                            alt={course.title}
                            className="w-14 h-10 object-cover rounded-xl border border-gray-100 dark:border-gray-800 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = coursePlaceholder;
                            }}
                          />
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                              {course.title || 'Untitled Course'}
                            </h3>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1">
                              {course.description || 'No description provided'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                        {!course.price || Number(course.price) === 0
                          ? 'Free'
                          : `$${Number(course.price).toFixed(2)}`}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/provider/courses/${course.id}/curriculum`}
                            className="inline-flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
                          >
                            <Layers className="h-3.5 w-3.5 mr-1" />
                            Curriculum
                          </Link>
                          <Link
                            to={`/provider/courses/${course.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/courses/${course.id}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            title="Preview"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() =>
                              setCourseToDelete({ id: course.id, title: course.title || 'this course' })
                            }
                            className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom Section: Recent Orders / Enrollment Purchases */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl text-emerald-600 dark:text-emerald-400">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Recent Enrollment Purchases
                  </h2>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Real-time student course purchases and ledger entries
                  </p>
                </div>
              </div>
              <Link
                to="/provider/orders"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
              >
                <span>View All Orders</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>

            {isLoadingOrders ? (
              <div className="py-10 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 dark:text-gray-500">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No student enrollment orders recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 mt-2">
                {recentOrders.slice(0, 5).map((order: any, idx: number) => {
                  const studentDisplayName =
                    order.studentFullName ||
                    order.studentName ||
                    order.studentUserName ||
                    order.fullName ||
                    order.name ||
                    order.userName ||
                    (order.id ? `Order #${order.id.substring(0, 8)}` : 'Student');
                  const initial = (studentDisplayName || 'S').charAt(0).toUpperCase();

                  return (
                    <div
                      key={order.id || idx}
                      className="py-3.5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 px-2 rounded-2xl transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                          {initial}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {studentDisplayName}
                          </p>
                          <div className="flex items-center space-x-2 text-[11px] text-gray-400 dark:text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString()
                                : 'Recent'}
                            </span>
                            <span>•</span>
                            <span>{order.itemCount || 1} course(s)</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-gray-900 dark:text-white">
                          +${(Number(order.totalPrice) || 0).toFixed(2)}
                        </p>
                        <span className="inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {order.status || 'Paid'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Quick-Selector Modal */}
      {isCurriculumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Select Course Curriculum
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Choose which course to edit sections and lessons for
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCurriculumModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 max-h-80 overflow-y-auto space-y-2">
              {rawCourses.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-400">
                  No courses available yet. Create one first!
                </div>
              ) : (
                rawCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => {
                      setIsCurriculumModalOpen(false);
                      navigate(`/provider/courses/${course.id}/curriculum`);
                    }}
                    className="w-full text-left p-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800/80 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={course.courseProfileImageUrl || coursePlaceholder}
                        alt={course.title}
                        className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-gray-800"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = coursePlaceholder;
                        }}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {course.title || 'Untitled Course'}
                        </h4>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {!course.price || Number(course.price) === 0
                            ? 'Free'
                            : `$${Number(course.price).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
                  </button>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setIsCurriculumModalOpen(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Request Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl text-emerald-600 dark:text-emerald-400">
                  <ArrowDownToLine className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Request Payout Withdrawal
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Withdrawable balance: ${pendingPayout.toFixed(2)} USD
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Withdrawal Amount ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={pendingPayout}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Transfer Notes / Account Reference (Optional)
                </label>
                <textarea
                  rows={2}
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. Regular monthly payout to connected Stripe account"
                  className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  Payouts are settled via Stripe Direct Connect within 1-2 business days into your designated bank account.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const amount = parseFloat(payoutAmount);
                  if (isNaN(amount) || amount <= 0) {
                    toast.error('Please enter a valid payout amount.');
                    return;
                  }
                  payoutMutation.mutate({ amount, notes: payoutNotes });
                }}
                disabled={payoutMutation.isPending}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {payoutMutation.isPending ? 'Submitting...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Confirm Modal */}
      <ConfirmModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={() => {
          if (courseToDelete) {
            deleteCourseMutation.mutate(courseToDelete.id);
            setCourseToDelete(null);
          }
        }}
        title="Delete Course Permanently"
        message={`Are you sure you want to permanently delete "${courseToDelete?.title}"? All associated sections, lessons, and student access records will be removed.`}
        confirmText="Delete Course"
        variant="danger"
        isLoading={deleteCourseMutation.isPending}
      />
    </div>
  );
};

export default ProviderDashboard;
