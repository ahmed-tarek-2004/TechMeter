import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../../types';
import { ShoppingCart } from 'lucide-react';
import { coursePlaceholder } from '../../utils/placeholders';

interface CourseCardProps {
  course: Course;
  onAddToCart?: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onAddToCart }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/60 transition duration-200 flex flex-col justify-between">
      <div>
        <Link to={`/courses/${course.id}`} className="block relative overflow-hidden group">
          <img
            src={course.courseProfileImageUrl || coursePlaceholder}
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = coursePlaceholder;
            }}
          />
        </Link>
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
            {!course.price || course.price === 0 ? 'Free' : `$${course.price}`}
          </span>
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {course.currency || 'USD'}
          </span>
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
