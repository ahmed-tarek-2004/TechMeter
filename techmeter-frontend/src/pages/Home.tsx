import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '../services/courseService';
import { categoryService } from '../services/categoryService';
import CourseCard from '../components/courses/CourseCard';
import HeroShowcase from '../components/home/HeroShowcase';
import TechMarquee from '../components/home/TechMarquee';
import BentoFeatures from '../components/home/BentoFeatures';
import AmbientBackground from '../components/home/AmbientBackground';
import { useAuth } from '../context/AuthContext';
import {
  Loader2,
  ArrowRight,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Search,
  Code2,
  Cpu,
  Globe,
  Database,
  Shield,
  Smartphone,
  GraduationCap,
} from 'lucide-react';
import { Category, Course } from '../types';

export const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');

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

  const courses: Course[] = coursesData?.data || [];
  const categories: Category[] = categoriesData?.data || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/courses?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/courses');
    }
  };

  const filteredCourses = selectedCategoryTab === 'all'
    ? courses
    : courses.filter((c) => String(c.categoryId || (c as any).category?.id) === selectedCategoryTab);

  const stats = [
    {
      icon: Users,
      label: 'Active Tech Learners',
      value: '25,000+',
      subtext: 'Across 80+ countries',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      icon: BookOpen,
      label: 'Accredited Courses',
      value: '450+',
      subtext: 'From verified practitioners',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
    },
    {
      icon: Award,
      label: 'Certified Instructors',
      value: '120+',
      subtext: 'Senior tech leads & architects',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
    },
    {
      icon: TrendingUp,
      label: 'Course Completion Rate',
      value: '96.4%',
      subtext: 'High engagement curriculum',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200 overflow-hidden">
      {/* 1. HERO SECTION WITH DYNAMIC MOVING AMBIENT BACKGROUND */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden text-gray-900 dark:text-white min-h-[580px] flex items-center">
        {/* Ambient Moving Interactive Canvas Background */}
        <AmbientBackground particleCount={55} interactive={true} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, Value Prop & Search Prompt */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-400/30 text-indigo-600 dark:text-indigo-300 backdrop-blur-md shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Next-Gen Engineering & Tech Education</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                Master In-Demand <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500 dark:from-indigo-400 dark:via-purple-300 dark:to-sky-400">
                  Tech Skills.
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Step into software engineering, AI, and cloud architecture with hands-on projects, live code sandboxes, and direct mentor guidance.
              </p>

              {/* Interactive Quick Search Prompt */}
              <form onSubmit={handleSearchSubmit} className="relative max-w-md mx-auto lg:mx-0">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-gray-400 dark:text-slate-400" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search Python, React, DevOps, AI, C#..."
                    className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/80 backdrop-blur-md border border-gray-200 dark:border-slate-700/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg dark:shadow-xl transition"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/courses"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition hover:translate-x-0.5"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {isAuthenticated ? (
                  <Link
                    to={user?.role === 'provider' ? '/provider/dashboard' : '/my-learning'}
                    className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-bold shadow-md transition"
                  >
                    <span>{user?.role === 'provider' ? 'Instructor Dashboard' : 'My Learning'}</span>
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-indigo-600 dark:text-white border border-indigo-200 dark:border-white/20 text-xs sm:text-sm font-bold backdrop-blur-md shadow-xs transition"
                  >
                    <span>Get Started Free</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column: HeroShowcase Terminal & Sandbox */}
            <div className="lg:col-span-6">
              <HeroShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* 2. INFINITE TECH STACK TICKER */}
      <TechMarquee />

      {/* 3. REAL-TIME STATS SECTION */}
      <section className="py-16 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-gray-50/70 dark:bg-gray-900/60 rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition duration-200 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <div className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-medium">
                      {stat.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE BENTO GRID FEATURES */}
      <BentoFeatures />

      {/* 5. POPULAR CATEGORIES EXPLORER */}
      <section className="py-20 bg-slate-50/50 dark:bg-gray-900/40 border-t border-gray-200/80 dark:border-gray-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Curated Learning Tracks</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Explore Top Engineering Fields
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Choose a specialization and build an industry-ready portfolio.
              </p>
            </div>
            <Link
              to="/courses"
              className="mt-4 md:mt-0 inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 group"
            >
              <span>Browse all categories</span>
              <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {categories.slice(0, 8).map((cat) => {
                const lower = (cat.name || '').toLowerCase();
                let CatIcon = BookOpen;
                if (lower.includes('web') || lower.includes('front') || lower.includes('full')) CatIcon = Globe;
                else if (lower.includes('ai') || lower.includes('data') || lower.includes('learn')) CatIcon = Cpu;
                else if (lower.includes('cloud') || lower.includes('devops')) CatIcon = Database;
                else if (lower.includes('security') || lower.includes('cyber')) CatIcon = Shield;
                else if (lower.includes('mobile') || lower.includes('app')) CatIcon = Smartphone;
                else if (lower.includes('code') || lower.includes('program')) CatIcon = Code2;

                return (
                  <Link
                    key={cat.id}
                    to={`/courses?category=${cat.id}`}
                    className="group relative bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shadow-xs">
                        <CatIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      <span>Explore Tracks</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-500">Categories available soon.</div>
          )}
        </div>
      </section>

      {/* 6. FEATURED COURSES WITH INTERACTIVE TABS */}
      <section className="py-20 bg-white dark:bg-gray-950 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 mb-3">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Handpicked Curriculum</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Featured Marketplace Courses
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Learn from verified engineers and industry practitioners with structured modules.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setSelectedCategoryTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                  selectedCategoryTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All Courses
              </button>
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryTab(String(cat.id))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                    selectedCategoryTab === String(cat.id)
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          {coursesLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.slice(0, 6).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">
                No courses found in this category
              </h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Explore other tracks or view the complete catalog.
              </p>
              <button
                onClick={() => setSelectedCategoryTab('all')}
                className="mt-5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-500 transition"
              >
                Show All Courses
              </button>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/courses"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition"
            >
              <span>View Full Course Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CLEAN DYNAMIC CTA SECTION WITH AMBIENT BACKGROUND */}
      <section className="relative py-24 text-gray-900 dark:text-white overflow-hidden flex items-center">
        {/* Continuous Dynamic Moving Background */}
        <AmbientBackground particleCount={40} interactive={false} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-white/20 backdrop-blur-md shadow-xs">
            <span>TechMeter Continuous Learning</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 dark:text-white max-w-2xl mx-auto">
            Ready to Level Up Your Tech Career?
          </h2>

          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Get instant access to top-rated courses, direct instructor communication, and verified credentials.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/courses"
                  className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-indigo-600 dark:bg-white text-white dark:text-indigo-950 hover:bg-indigo-700 dark:hover:bg-gray-100 text-xs sm:text-sm font-black shadow-lg shadow-indigo-600/20 dark:shadow-2xl transition"
                >
                  <span>Explore All Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to={user?.role === 'provider' ? '/provider/dashboard' : '/my-learning'}
                  className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-white dark:bg-indigo-600 hover:bg-gray-50 dark:hover:bg-indigo-500 text-gray-900 dark:text-white border border-gray-200 dark:border-indigo-400/40 text-xs sm:text-sm font-bold shadow-md transition"
                >
                  <span>{user?.role === 'provider' ? 'Instructor Dashboard' : 'My Learning'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-indigo-600 dark:bg-white text-white dark:text-indigo-950 hover:bg-indigo-700 dark:hover:bg-gray-100 text-xs sm:text-sm font-black shadow-lg shadow-indigo-600/20 dark:shadow-2xl transition"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-white dark:bg-indigo-600 hover:bg-gray-50 dark:hover:bg-indigo-500 text-gray-900 dark:text-white border border-gray-200 dark:border-indigo-400/40 text-xs sm:text-sm font-bold shadow-md transition"
                >
                  <span>Browse Courses</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
