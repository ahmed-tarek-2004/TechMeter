import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '../services/courseService';
import { categoryService } from '../services/categoryService';
import CourseCard from '../components/courses/CourseCard';
import { Loader2, ArrowRight, Users, BookOpen, Award, TrendingUp } from 'lucide-react';

const Home: React.FC = () => {
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getAllCourses(),
    retry: false,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
    retry: false,
  });

  const stats = [
    { icon: Users, label: 'Active Students', value: '10,000+' },
    { icon: BookOpen, label: 'Courses', value: '500+' },
    { icon: Award, label: 'Certified Instructors', value: '100+' },
    { icon: TrendingUp, label: 'Completion Rate', value: '95%' },
  ];

  const courses = coursesData?.data || [];
  const categories = categoriesData?.data || [];

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 dark:from-indigo-950 dark:via-gray-900 dark:to-purple-950 border-b border-indigo-500/10">
        <div className="absolute inset-0 bg-gray-950/40"></div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl tracking-tight">
              Learn Without Limits
            </h1>
            <p className="mt-4 max-w-md mx-auto text-lg text-indigo-100 dark:text-gray-300 sm:text-xl md:mt-5 md:max-w-3xl">
              Access world-class education from anywhere. Learn from industry experts and advance your career.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                to="/courses"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg transition"
              >
                Browse Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition"
              >
                Start Learning
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 dark:bg-gray-900/60 py-12 border-b border-gray-100 dark:border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-10 w-10 mx-auto text-indigo-600 dark:text-indigo-400" />
                <p className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Popular Categories</h2>
            <p className="mt-3 text-base text-gray-500 dark:text-gray-400">Explore our wide range of tech courses</p>
          </div>
          {categoriesLoading ? (
            <div className="flex justify-center mt-8"><Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" /></div>
          ) : categories.length > 0 ? (
            <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  to={`/courses?category=${category.id}`}
                  className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 p-6 text-center hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/60 transition"
                >
                  <BookOpen className="h-10 w-10 mx-auto text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{category.description}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : null}
          <div className="mt-8 text-center">
            <Link to="/courses" className="inline-flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
              View all courses <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div className="bg-gray-50 dark:bg-gray-900/60 py-16 border-t border-gray-100 dark:border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Featured Courses</h2>
            <p className="mt-3 text-base text-gray-500 dark:text-gray-400">Handpicked courses to boost your skills</p>
          </div>
          {coursesLoading ? (
            <div className="flex justify-center mt-8"><Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" /></div>
          ) : courses.length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">Courses coming soon</h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Check back later for our latest courses.</p>
            </div>
          )}
          <div className="mt-10 text-center">
            <Link
              to="/courses"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition"
            >
              View all courses <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-indigo-700 dark:bg-indigo-950 border-t border-indigo-600/30">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Ready to Start Learning?</h2>
          <p className="mt-3 text-base text-indigo-200 dark:text-indigo-300">Join thousands of learners and start your journey today.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-indigo-700 dark:text-indigo-400 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-lg transition"
            >
              Get Started Free
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg transition"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
