import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../../types';
import { ShoppingCart, Heart, Play, CheckCircle2 } from 'lucide-react';
import { coursePlaceholder } from '../../utils/placeholders';
import { useWishlist } from '../../context/WishlistContext';
import { useEnrolledCourses } from '../../hooks/useEnrolledCourses';

interface CourseCardProps {
  course: Course;
  onAddToCart?: (courseId: string) => void;
  showWishlistButton?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onAddToCart,
  showWishlistButton = true,
}) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isEnrolled } = useEnrolledCourses();
  const wishlisted = isWishlisted(course.id);
  const enrolled = isEnrolled(course.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(course);
  };

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/60 transition duration-200 flex flex-col justify-between relative">
      <div>
        <div className="relative overflow-hidden">
          <Link to={`/courses/${course.id}`} className="block overflow-hidden">
            <img
              src={course.courseProfileImageUrl || coursePlaceholder}
              alt={course.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = coursePlaceholder;
              }}
            />
          </Link>

          {/* Enrolled Status Badge */}
          {enrolled && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold shadow-xs flex items-center gap-1 z-10">
              <CheckCircle2 className="h-3 w-3" />
              <span>Enrolled</span>
            </div>
          )}

          {/* Wishlist Floating Toggle Button */}
          {showWishlistButton && (
            <button
              onClick={handleWishlistClick}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-xs z-10 focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                wishlisted
                  ? 'bg-white/95 dark:bg-gray-900/95 text-rose-500 scale-105 hover:scale-110 shadow-rose-200/50 dark:shadow-rose-950/50'
                  : 'bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-300 hover:text-rose-500 hover:bg-white dark:hover:bg-gray-900'
              }`}
              title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={`h-4 w-4 transition-transform duration-150 ${
                  wishlisted ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            </button>
          )}
        </div>

        <div className="p-5">
          <Link to={`/courses/${course.id}`}>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 transition-colors leading-snug">
              {course.title || 'Untitled Course'}
            </h3>
          </Link>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {course.description || 'No description available.'}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0">
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mb-4">
          <span className="text-base font-extrabold text-gray-900 dark:text-white">
            {enrolled ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Purchased & Active</span>
            ) : !course.price || course.price === 0 ? (
              'Free'
            ) : (
              `$${course.price}`
            )}
          </span>
          {!enrolled && (
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {course.currency || 'USD'}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {enrolled ? (
            <Link
              to={`/learn/${course.id}`}
              className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Go to Course</span>
            </Link>
          ) : (
            <>
              <Link
                to={`/courses/${course.id}`}
                className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-semibold shadow-xs transition"
              >
                View Course
              </Link>
              {onAddToCart && (
                <button
                  onClick={() => onAddToCart(course.id)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  title="Add to Cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
