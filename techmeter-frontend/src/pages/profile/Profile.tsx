import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { courseService } from '../../services/courseService';
import { orderService } from '../../services/orderService';
import {
  Mail,
  Phone,
  BookOpen,
  User as UserIcon,
  ShieldCheck,
  Pencil,
  GraduationCap,
  Globe,
  Briefcase,
  ShoppingBag,
  LayoutDashboard,
  Camera,
  KeyRound,
} from 'lucide-react';
import StudentEditForm from './StudentEditForm';
import ProviderEditForm from './ProviderEditForm';
import ChangePasswordModal from './ChangePasswordModal';
import StudentOverviewTab from './StudentOverviewTab';
import ProviderOverviewTab from './ProviderOverviewTab';
import ProfileCoursesTab from './ProfileCoursesTab';
import ProfileOrdersTab from './ProfileOrdersTab';
import { StudentProfile, ProviderProfile, OrderSummaryResponse } from '../../types';

type TabType = 'overview' | 'courses' | 'orders';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Student Profile Query
  const { data: studentProfileData } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => profileService.getStudentProfile(),
    enabled: !!user && user.role === 'student',
    retry: false,
  });

  // Provider Profile Query
  const { data: providerProfileData } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: () => profileService.getProviderProfile(),
    enabled: !!user && user.role === 'provider',
    retry: false,
  });

  const studentProfile = studentProfileData?.data as StudentProfile | undefined;
  const providerProfile = providerProfileData?.data as ProviderProfile | undefined;

  // Courses Query
  const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['my-courses', user?.role],
    queryFn: () =>
      user?.role === 'provider'
        ? courseService.getProviderCourses()
        : courseService.getStudentCourses(),
    enabled: !!user,
    retry: false,
  });

  // Orders Query
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['my-orders', user?.id, user?.role, studentProfile?.id, providerProfile?.id],
    queryFn: () => {
      if (user?.role === 'provider') {
        return orderService.getProviderOrders(providerProfile?.id || user.id, 1, 20);
      }
      if (user?.role === 'student') {
        return orderService.getStudentOrders(studentProfile?.id || user.id, 1, 20);
      }
      return Promise.resolve({
        statusCode: 200,
        succeeded: true,
        data: {
          items: [],
          pageNumber: 1,
          pageSize: 20,
          totalPages: 1,
          totalCount: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    },
    enabled: !!user && (user.role === 'student' || user.role === 'provider'),
    retry: 1,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/80 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 text-center max-w-sm shadow-xs">
          <UserIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Authentication Required</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-5">
            Please log in to your account to view and manage your profile.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const courses = coursesData?.data || [];

  // Defensive orders normalization
  const rawOrders = ordersData?.data;
  const ordersList: OrderSummaryResponse[] = Array.isArray(rawOrders?.items)
    ? rawOrders.items
    : Array.isArray(rawOrders)
    ? rawOrders
    : Array.isArray(ordersData?.data?.data)
    ? (ordersData?.data?.data as any)
    : [];

  const totalOrdersCount: number =
    typeof rawOrders?.totalCount === 'number'
      ? rawOrders.totalCount
      : typeof rawOrders?.count === 'number'
      ? rawOrders.count
      : ordersList.length;

  const avatarUrl =
    user.role === 'student'
      ? studentProfile?.profileImage
      : user.role === 'provider'
      ? providerProfile?.profileUrl
      : user.profileUrl;

  const displayName =
    user.role === 'student'
      ? studentProfile?.studentName || user.userName
      : user.role === 'provider'
      ? providerProfile?.providerName || user.userName
      : user.userName;

  const country =
    user.role === 'student'
      ? studentProfile?.country
      : user.role === 'provider'
      ? providerProfile?.country
      : undefined;

  const roleLabel =
    user.role === 'provider'
      ? 'Instructor'
      : user.role === 'admin'
      ? 'Administrator'
      : 'Student';

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-gray-950 py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Hero Header Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            {/* Avatar with Camera Overlay */}
            <div className="relative group flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md border-2 border-white dark:border-gray-800">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black uppercase">
                    {displayName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>

              {(user.role === 'student' || user.role === 'provider') && (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="absolute bottom-1 right-1 p-2 rounded-2xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-md border border-gray-100 dark:border-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 transition duration-150"
                  title="Change profile photo"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* User Credentials & Quick Badges */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {displayName}
                    </h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      {roleLabel}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Manage your account profile, credentials, and settings
                  </p>
                </div>

                {/* Header Actions */}
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5">
                  {(user.role === 'student' || user.role === 'provider') && (
                    <button
                      onClick={() => setIsEditOpen(true)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit Profile</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 text-xs font-bold shadow-xs transition"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Change Password</span>
                  </button>

                  {user.role === 'student' && (
                    <Link
                      to="/my-learning"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                      <span>My Learning</span>
                    </Link>
                  )}

                  {user.role === 'provider' && (
                    <Link
                      to="/provider/dashboard"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Instructor Dashboard</span>
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Quick Info Tags */}
              <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                  <Mail className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                  <span className="font-medium">{user.email}</span>
                </div>

                {(user.phoneNumber || studentProfile?.phoneNumber || providerProfile?.phoneNumber) && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <Phone className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                    <span className="font-medium">
                      {user.phoneNumber || studentProfile?.phoneNumber || providerProfile?.phoneNumber}
                    </span>
                  </div>
                )}

                {country && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <Globe className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                    <span className="font-medium">{country}</span>
                  </div>
                )}

                {user.role === 'student' && studentProfile?.educationLevel && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <GraduationCap className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                    <span className="font-medium">{studentProfile.educationLevel}</span>
                  </div>
                )}

                {user.role === 'provider' && providerProfile?.experienceYears !== undefined && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <Briefcase className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                    <span className="font-medium">{providerProfile.experienceYears} Years Exp</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'courses'
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>{user.role === 'provider' ? 'Published Courses' : 'My Courses'}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                  activeTab === 'courses'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {courses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{user.role === 'provider' ? 'Sales Records' : 'Order History'}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                  activeTab === 'orders'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {totalOrdersCount}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Body Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <>
              {user.role === 'student' && (
                <StudentOverviewTab
                  profile={studentProfile || null}
                  user={user}
                  coursesCount={courses.length}
                  ordersCount={totalOrdersCount}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onChangePassword={() => setIsChangePasswordOpen(true)}
                />
              )}
              {user.role === 'provider' && (
                <ProviderOverviewTab
                  profile={providerProfile || null}
                  user={user}
                  coursesCount={courses.length}
                  ordersCount={totalOrdersCount}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onChangePassword={() => setIsChangePasswordOpen(true)}
                />
              )}
              {user.role === 'admin' && (
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Administrator Profile
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    You have administrative access to TechMeter. You can manage courses, categories, users, orders, and financial payouts directly from the Admin Panel.
                  </p>
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to Admin Dashboard</span>
                  </Link>
                </div>
              )}
            </>
          )}

          {activeTab === 'courses' && (
            <ProfileCoursesTab
              role={user.role}
              courses={courses}
              isLoading={isCoursesLoading}
            />
          )}

          {activeTab === 'orders' && (
            <ProfileOrdersTab
              role={user.role}
              orders={ordersList}
              isLoading={isOrdersLoading}
              isError={isOrdersError}
              onRetry={() => refetchOrders()}
            />
          )}
        </div>
      </div>

      {/* Edit Profile Modals */}
      {user.role === 'student' && isEditOpen && (
        <StudentEditForm
          profile={studentProfile || null}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => setIsEditOpen(false)}
        />
      )}

      {user.role === 'provider' && isEditOpen && (
        <ProviderEditForm
          profile={providerProfile || null}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => setIsEditOpen(false)}
        />
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          onClose={() => setIsChangePasswordOpen(false)}
          onSuccess={() => setIsChangePasswordOpen(false)}
        />
      )}
    </div>
  );
};

export default Profile;
