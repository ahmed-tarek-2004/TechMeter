import React from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Globe,
  GraduationCap,
  Calendar,
  BookOpen,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  Lock,
  KeyRound,
} from 'lucide-react';
import { StudentProfile, User } from '../../types';

interface StudentOverviewTabProps {
  profile: StudentProfile | null;
  user: User;
  coursesCount: number;
  ordersCount: number;
  onNavigateTab?: (tab: 'overview' | 'courses' | 'orders') => void;
  onChangePassword?: () => void;
}

const StudentOverviewTab: React.FC<StudentOverviewTabProps> = ({
  profile,
  user,
  coursesCount,
  ordersCount,
  onNavigateTab,
  onChangePassword,
}) => {
  const formatBirthday = (dateString?: string): string => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const statCards = [
    {
      label: 'Enrolled Courses',
      value: coursesCount,
      subtext: 'Active learning paths',
      icon: BookOpen,
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      targetTab: 'courses' as const,
    },
    {
      label: 'Total Orders',
      value: ordersCount,
      subtext: 'Completed purchases',
      icon: ShoppingBag,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      targetTab: 'orders' as const,
    },
    {
      label: 'Education Level',
      value: profile?.educationLevel || 'Not specified',
      subtext: 'Academic background',
      icon: GraduationCap,
      iconBg: 'bg-violet-50 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      targetTab: null,
    },
    {
      label: 'Country / Region',
      value: profile?.country || 'Not specified',
      subtext: 'Primary location',
      icon: Globe,
      iconBg: 'bg-sky-50 dark:bg-sky-900/30',
      iconColor: 'text-sky-600 dark:text-sky-400',
      targetTab: null,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          const isClickable = !!stat.targetTab && !!onNavigateTab;

          return (
            <div
              key={idx}
              onClick={() => isClickable && onNavigateTab?.(stat.targetTab!)}
              className={`bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs transition duration-200 flex flex-col justify-between ${
                isClickable
                  ? 'cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800/80 hover:shadow-md hover:-translate-y-0.5'
                  : 'hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`p-2.5 rounded-2xl ${stat.iconBg} ${stat.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
                  {stat.value}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium truncate">
                    {stat.subtext}
                  </p>
                  {isClickable && (
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 inline-flex items-center">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Account & Academic Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Account Information
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Personal credentials and registered contact points
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-5">
              {/* Username */}
              <div className="bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <UserIcon className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold">Full Name / Username</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                  {user.userName || profile?.studentName || 'Not specified'}
                </p>
              </div>

              {/* Email Address */}
              <div className="bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center justify-between gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-semibold">Email Address</span>
                  </div>
                  {user.isEmailConfirmed && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 truncate">
                  {user.email || profile?.email || 'Not specified'}
                </p>
              </div>

              {/* Phone Number */}
              <div className="bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Phone className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold">Phone Number</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                  {profile?.phoneNumber || user.phoneNumber || 'Not provided'}
                </p>
              </div>

              {/* Role */}
              <div className="bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold">Account Role</span>
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40 capitalize">
                    {user.role} Member
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic & Personal Details Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Academic & Personal Details
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Educational background and regional profile information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-5">
              {/* Education Level */}
              <div className="bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1.5">
                  <GraduationCap className="w-4 h-4 text-violet-500" />
                  <span className="text-xs font-semibold">Education Level</span>
                </div>
                {profile?.educationLevel ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200/70 dark:border-violet-800/50">
                    {profile.educationLevel}
                  </span>
                ) : (
                  <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                    Not specified
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1.5">
                  <Globe className="w-4 h-4 text-sky-500" />
                  <span className="text-xs font-semibold">Country / Location</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {profile?.country || 'Not specified'}
                </p>
              </div>

              {/* Date of Birth */}
              <div className="bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold">Date of Birth</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatBirthday(profile?.birthDay)}
                </p>
              </div>

              {/* Student Status */}
              <div className="bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold">Learning Status</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                  Active Student
                </span>
              </div>
            </div>
          </div>

          {/* Account Security & Password Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Account Security & Password
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Manage your account password and security credentials
                  </p>
                </div>
              </div>

              {onChangePassword && (
                <button
                  onClick={onChangePassword}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition self-start sm:self-auto"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Change Password</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status & Achievement Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-indigo-950/30 dark:via-gray-900 dark:to-purple-950/20 rounded-3xl p-6 sm:p-7 border border-indigo-100 dark:border-indigo-900/40 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                  <Sparkles className="w-3.5 h-3.5" />
                  Member Badge
                </span>
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                  TechMeter Learner
                </span>
              </div>

              {/* Center Icon & Title */}
              <div className="text-center my-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20 mb-3">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Active Student
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enrolled in courses & learning on TechMeter
                </p>
              </div>

              {/* Perks / Benefits List */}
              <div className="mt-6 pt-5 border-t border-indigo-100/80 dark:border-indigo-900/40 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>Unlimited access to all your enrolled courses</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>Direct questions & discussions with instructors</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>Personalized video playback and course progress tracking</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>Order history & verified receipts</span>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-6 p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/60 border border-indigo-100/80 dark:border-indigo-900/30 text-[11px] text-gray-500 dark:text-gray-400 text-center">
              Keep your profile details current to get personalized course recommendations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewTab;
