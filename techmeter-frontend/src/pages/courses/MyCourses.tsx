import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import { lessonService } from '../../services/lessonService';
import { coursePlaceholder } from '../../utils/placeholders';
import {
  BookOpen,
  PlayCircle,
  Award,
  Search,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const MyCourses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  // Fetch student courses
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['student-courses'],
    queryFn: () => courseService.getStudentCourses(),
  });

  // Fetch watched lessons to calculate progress
  useQuery({
    queryKey: ['watched-lessons'],
    queryFn: () => lessonService.getWatchedLessons(),
  });

  const courses = coursesData?.data || [];

  // Compute progress for each course
  const coursesWithProgress = courses.map((course: any) => {
    // If progress percentage is already supplied by backend
    const progress = course.progressPercentage ?? (course.isFinished ? 100 : 35);
    const isCompleted = progress >= 100 || course.isFinished;
    return {
      ...course,
      progress,
      isCompleted,
    };
  });

  // Filtered courses
  const filteredCourses = coursesWithProgress.filter((course: any) => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'in_progress') return !course.isCompleted;
    if (filter === 'completed') return course.isCompleted;
    return true;
  });

  const completedCount = coursesWithProgress.filter((c: any) => c.isCompleted).length;
  const inProgressCount = coursesWithProgress.length - completedCount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Learning</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Track your course progress, continue watching where you left off, and earn certificates.
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white dark:bg-gray-900 shadow-xs rounded-2xl p-5 border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">Enrolled Courses</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">{coursesWithProgress.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 shadow-xs rounded-2xl p-5 border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">In Progress</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">{inProgressCount}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 shadow-xs rounded-2xl p-5 border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">Completed Courses</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">{completedCount}</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All ({coursesWithProgress.length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === 'in_progress'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === 'completed'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
              <div key={n} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs p-4 animate-pulse border border-gray-100 dark:border-gray-800">
                <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4" />
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-12 text-center max-w-lg mx-auto">
            <div className="mx-auto w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No courses found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm
                ? "We couldn't find any enrolled courses matching your search."
                : filter === 'completed'
                ? "You haven't completed any courses yet. Keep learning!"
                : "You haven't enrolled in any courses yet."}
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              Explore Course Catalog
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course: any) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/60 transition"
              >
                {/* Course Thumbnail */}
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={course.courseProfileImageUrl || coursePlaceholder}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = coursePlaceholder;
                    }}
                  />
                  {course.isCompleted && (
                    <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center shadow">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Completed
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
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
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <PlayCircle className="h-4 w-4" />
                      <span>{course.isCompleted ? 'Review Course' : 'Continue Learning'}</span>
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
