import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import { sectionService } from '../../services/sectionService';
import { lessonService } from '../../services/lessonService';
import { cartService } from '../../services/cartService';
import { ratingService } from '../../services/ratingService';
import {
  Loader2,
  ShoppingCart,
  Heart,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Star,
  PlayCircle,
  Layers,
  Lock,
  Play,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { coursePlaceholder } from '../../utils/placeholders';
import { Section, Lesson } from '../../types';
import { getLessonMediaType } from '../../utils/mediaUtils';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isWishlistPending, setIsWishlistPending] = useState(false);

  // 1. Fetch Course Info
  const { data: courseData, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourseById(id!),
    enabled: !!id,
    retry: false,
  });

  // 2. Fetch Sections
  const { data: sectionsData } = useQuery({
    queryKey: ['sections', id],
    queryFn: () => sectionService.getSectionsByCourse(id!),
    enabled: !!id,
    retry: false,
  });

  // 3. Fetch Lessons
  const { data: lessonsData } = useQuery({
    queryKey: ['course-lessons', id],
    queryFn: () => lessonService.getCourseLessons(id!),
    enabled: !!id,
    retry: false,
  });

  // 4. Fetch Enrolled Courses for current student (to check if already enrolled)
  const { data: studentCoursesData } = useQuery({
    queryKey: ['student-courses'],
    queryFn: () => courseService.getStudentCourses(),
    enabled: isAuthenticated && user?.role === 'student',
    retry: false,
  });

  // 5. Fetch Course Ratings
  const { data: ratingsData } = useQuery({
    queryKey: ['course-ratings', id],
    queryFn: () => ratingService.getAllCourseRatings(id!),
    enabled: !!id,
    retry: false,
  });

  const addToCartMutation = useMutation({
    mutationFn: (courseId: string) => cartService.addToCart(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
    },
    onError: () => toast.error('Failed to add to cart'),
  });

  const handleWishlistToggle = async () => {
    if (!course) return;
    setIsWishlistPending(true);
    try {
      await toggleWishlist(course);
    } finally {
      setIsWishlistPending(false);
    }
  };

  const course = courseData?.data;
  const wishlisted = course ? isWishlisted(course.id) : false;
  const sections: Section[] = sectionsData?.data || [];
  const lessons: Lesson[] = lessonsData?.data || [];
  const ratings = ratingsData?.data || [];
  const enrolledCourses = studentCoursesData?.data || [];
  const isEnrolled = enrolledCourses.some((c) => c.id === id);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === undefined ? false : !prev[sectionId],
    }));
  };

  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + (r.rating || 5), 0) / ratings.length).toFixed(1)
      : '5.0';

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Loading course syllabus...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course not found</h2>
        <Link
          to="/courses"
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
        >
          Back to Course Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Top Banner Hero */}
      <div className="bg-gray-900 border-b border-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/courses"
            className="inline-flex items-center text-xs font-semibold text-gray-400 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to courses
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
                {course.title || 'Untitled Course'}
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6">
                {course.description || 'Comprehensive step-by-step training curriculum.'}
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="bg-gray-800/90 border border-gray-700/60 px-3 py-1.5 rounded-full flex items-center">
                  <Star className="h-3.5 w-3.5 mr-1.5 text-amber-400 fill-amber-400" />
                  {averageRating} ({ratings.length} reviews)
                </span>
                <span className="bg-gray-800/90 border border-gray-700/60 px-3 py-1.5 rounded-full flex items-center">
                  <Layers className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
                  {sections.length} {sections.length === 1 ? 'Section' : 'Sections'}
                </span>
                <span className="bg-gray-800/90 border border-gray-700/60 px-3 py-1.5 rounded-full flex items-center">
                  <PlayCircle className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                  {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
                </span>
              </div>
            </div>

            {/* Pricing & Call to Action Card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 text-gray-900 dark:text-white">
                <img
                  src={course.courseProfileImageUrl || coursePlaceholder}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-2xl mb-5 shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = coursePlaceholder;
                  }}
                />
                <div className="text-center mb-5">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {!course.price || course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                  {course.price > 0 && (
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 ml-2 uppercase">
                      {course.currency || 'USD'}
                    </span>
                  )}
                </div>

                {/* Enrolled Action Button */}
                {isEnrolled ? (
                  <Link
                    to={`/learn/${course.id}`}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-2 transition"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Go to Course Player</span>
                  </Link>
                ) : (
                  <>
                    {isAuthenticated && user?.role === 'student' && (
                      <div className="space-y-3">
                        <button
                          onClick={() => addToCartMutation.mutate(course.id)}
                          disabled={addToCartMutation.isPending}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center justify-center transition"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </button>
                        <button
                          onClick={handleWishlistToggle}
                          disabled={isWishlistPending}
                          className={`w-full py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center justify-center transition border ${
                            wishlisted
                              ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 mr-2 transition-transform duration-150 ${
                              wishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'text-rose-500'
                            }`}
                          />
                          {wishlisted ? 'Saved in Wishlist (Remove)' : 'Add to Wishlist'}
                        </button>
                      </div>
                    )}

                    {isAuthenticated && user?.role === 'provider' && (
                      <Link
                        to={`/provider/courses/${course.id}/curriculum`}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center transition"
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        Manage Course Curriculum
                      </Link>
                    )}

                    {!isAuthenticated && (
                      <Link
                        to="/login"
                        className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-semibold text-center shadow-xs transition"
                      >
                        Enroll Now
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Curriculum Syllabus Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Column: Course Syllabus */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Course Content & Syllabus
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {sections.length} sections • {lessons.length} lectures
                </p>
              </div>
            </div>

            {sections.length === 0 ? (
              <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
                No sections published yet for this course.
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section, sIdx) => {
                  const sectionLessons = lessons.filter((l) => l.sectionId === section.id);
                  const isExpanded = expandedSections[section.id] !== false;

                  return (
                    <div
                      key={section.id}
                      className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition text-left"
                      >
                        <div className="flex items-center space-x-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            Section {sIdx + 1}: {section.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                          {sectionLessons.length} {sectionLessons.length === 1 ? 'lesson' : 'lessons'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/40 divide-y divide-gray-100 dark:divide-gray-800/60">
                          {sectionLessons.length === 0 ? (
                            <div className="px-6 py-3 text-[11px] text-gray-400 italic">
                              No lessons currently published in this section.
                            </div>
                          ) : (
                            sectionLessons.map((lesson, lIdx) => {
                              const mediaType = getLessonMediaType(lesson.lessonUrl);
                              const renderIcon = () => {
                                switch (mediaType) {
                                  case 'pdf':
                                    return <FileText className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />;
                                  case 'image':
                                    return <ImageIcon className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />;
                                  case 'video':
                                  default:
                                    return <PlayCircle className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />;
                                }
                              };

                              return (
                                <div
                                  key={lesson.id}
                                  className="px-6 py-3 flex items-center justify-between text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100/40 dark:hover:bg-gray-800/30 transition"
                                >
                                  <div className="flex items-center space-x-3 min-w-0">
                                    {renderIcon()}
                                    <span className="truncate">
                                      {lIdx + 1}. {lesson.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-[11px] text-gray-400 flex-shrink-0">
                                    {isEnrolled ? (
                                      <Link
                                        to={`/learn/${course.id}/lesson/${lesson.id}`}
                                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center"
                                      >
                                        Open
                                      </Link>
                                    ) : (
                                      <Lock className="h-3 w-3 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Reviews & Student Ratings */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
              Student Reviews
            </h2>

            {ratings.length === 0 ? (
              <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
                No reviews yet for this course. Be among the first to enroll!
              </div>
            ) : (
              <div className="space-y-3">
                {ratings.map((rating, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${
                              s <= (rating.rating || 5)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {rating.ratedAt ? new Date(rating.ratedAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        {rating.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
