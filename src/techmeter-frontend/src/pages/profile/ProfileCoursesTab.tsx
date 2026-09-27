import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Play,
  Edit,
  Plus,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  Clock,
  Award,
} from 'lucide-react';
import { coursePlaceholder } from '../../utils/placeholders';
import { Course } from '../../types';

interface ProfileCoursesTabProps {
  role: 'student' | 'provider' | 'admin';
  courses: Course[];
  isLoading: boolean;
}

const ProfileCoursesTab: React.FC<ProfileCoursesTabProps> = ({
  role,
  courses,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-4 h-72 flex flex-col justify-between"
            >
              <div className="w-full h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded-md w-1/2" />
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16" />
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Provider Courses View
  if (role === 'provider') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              My Published Courses
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
              {courses.length}
            </span>
          </div>
          <Link
            to="/courses/create"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Create New Course</span>
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-8 w-8" />
            </div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              No courses published yet
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              Share your knowledge and start creating high-impact courses for students worldwide.
            </p>
            <Link
              to="/courses/create"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create your first course</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/60 transition-all duration-200 flex flex-col justify-between group"
              >
                {/* Course Image & Price Badge */}
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={course.courseProfileImageUrl || coursePlaceholder}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = coursePlaceholder;
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white backdrop-blur-md shadow-xs border border-white/20">
                        {!course.price || course.price === 0
                          ? 'Free'
                          : `${course.currency || '$'}${course.price}`}
                      </span>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="p-5">
                    <Link to={`/courses/${course.id}`}>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug">
                        {course.title || 'Untitled Course'}
                      </h4>
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                      {course.description || 'No description provided.'}
                    </p>
                    <div className="flex items-center text-[11px] text-gray-400 dark:text-gray-500">
                      <Clock className="h-3 w-3 mr-1 text-gray-400 dark:text-gray-500" />
                      <span>Self-paced</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-5 pt-0">
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    <Link
                      to={`/provider/courses/${course.id}/curriculum`}
                      className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition"
                      title="Manage Curriculum"
                    >
                      <Layers className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Curriculum</span>
                    </Link>
                    <Link
                      to={`/provider/courses/${course.id}/edit`}
                      className="inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold transition"
                      title="Edit Course"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Link>
                    <Link
                      to={`/courses/${course.id}`}
                      className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
                      title="View Public Page"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Student Courses View (also fallback for admin/default)
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            My Enrolled Courses
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
            {courses.length}
          </span>
        </div>
        <Link
          to="/courses"
          className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
        >
          <span>Browse Catalog</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="h-8 w-8" />
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            You haven't enrolled in any courses yet
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            Explore our catalog of top-rated courses and begin your learning journey today!
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Sparkles className="h-4 w-4" />
            <span>Browse Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/60 transition-all duration-200 flex flex-col justify-between group"
            >
              {/* Course Image */}
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={course.courseProfileImageUrl || coursePlaceholder}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = coursePlaceholder;
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600/90 text-white backdrop-blur-md shadow-xs">
                      <Award className="h-3 w-3" />
                      <span>Enrolled</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <Link to={`/courses/${course.id}`}>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug">
                      {course.title || 'Untitled Course'}
                    </h4>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                    {course.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center text-[11px] text-gray-400 dark:text-gray-500">
                    <Clock className="h-3 w-3 mr-1 text-gray-400 dark:text-gray-500" />
                    <span>Lifetime Access</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0">
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <Link
                    to={`/courses/${course.id}`}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
                  >
                    Course Details
                  </Link>
                  <Link
                    to={`/learn/${course.id}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Continue Learning</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileCoursesTab;
