import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import { coursePlaceholder } from '../../utils/placeholders';
import {
  BookOpen,
  PlayCircle,
  Search,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Clock,
  Compass,
} from 'lucide-react';

const MyCourses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  // Fetch student courses
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['student-courses'],
    queryFn: () => courseService.getStudentCourses(),
  });

  const courses = coursesData?.data || [];

  // Compute progress for each course cleanly
  const coursesWithProgress = courses.map((course: any) => {
    const progress = Number(course.progress ?? course.progressPercentage ?? (course.isFinished ? 100 : 0));
    const isCompleted = progress >= 100 || !!course.isFinished;
    return {
      ...course,
      progress,
      isCompleted,
    };
  });

  // Filtered courses
  const filteredCourses = coursesWithProgress.filter((course: any) => {
    const matchesSearch =
      (course.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'in_progress') return !course.isCompleted;
    if (filter === 'completed') return course.isCompleted;
    return true;
  });

  const completedCount = coursesWithProgress.filter((c: any) => c.isCompleted).length;
  const inProgressCount = coursesWithProgress.length - completedCount;

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
                <GraduationCap className="h-3.5 w-3.5 text-indigo-300" />
                <span>Student Learning Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                My Learning Curriculum
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                Pick up where you left off, stream interactive video lessons, and monitor your course achievements.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-950 bg-white hover:bg-gray-50 shadow-md transition active:scale-95"
              >
                <Compass className="h-4 w-4 text-indigo-600" />
                <span>Browse New Courses</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Clean Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-900 shadow-xs rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Enrolled Courses
              </p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                {coursesWithProgress.length}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 shadow-xs rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                In Progress
              </p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                {inProgressCount}
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/50 rounded-2xl text-purple-600 dark:text-purple-400">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 shadow-xs rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Completed
              </p>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                {completedCount}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm transition"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-750'
              }`}
            >
              All ({coursesWithProgress.length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'in_progress'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-750'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'completed'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-750'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {isLoadingCourses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs p-5 animate-pulse border border-gray-100 dark:border-gray-800">
                <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4" />
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-12 text-center max-w-md mx-auto">
            <div className="mx-auto w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-100 dark:border-indigo-900/50">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No courses found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              {searchTerm
                ? "We couldn't find any enrolled courses matching your search."
                : filter === 'completed'
                ? "You haven't completed any courses yet. Keep learning!"
                : "You haven't enrolled in any courses yet."}
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <span>Explore Course Catalog</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course: any) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-900/60 transition duration-200"
              >
                {/* Course Thumbnail */}
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={course.courseProfileImageUrl || coursePlaceholder}
                    alt={course.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = coursePlaceholder;
                    }}
                  />
                  {course.isCompleted && (
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Completed
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mb-1.5">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                      {course.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                        <span>Progress</span>
                        <span>{Math.round(course.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            course.isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, course.progress))}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/learn/${course.id}`}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <PlayCircle className="h-4 w-4" />
                      <span>{course.isCompleted ? 'Review Lessons' : 'Continue Learning'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
