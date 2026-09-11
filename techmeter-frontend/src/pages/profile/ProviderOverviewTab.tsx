import React from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Globe,
  Briefcase,
  CreditCard,
  BookOpen,
  DollarSign,
  Award,
  Clock,
  FileText,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ProviderProfile, User } from '../../types';

interface ProviderOverviewTabProps {
  profile: ProviderProfile | null;
  user: User;
  coursesCount: number;
  ordersCount: number;
  onNavigateTab?: (tab: 'overview' | 'courses' | 'orders') => void;
}

const ProviderOverviewTab: React.FC<ProviderOverviewTabProps> = ({
  profile,
  user,
  coursesCount,
  ordersCount,
  onNavigateTab,
}) => {
  const experienceYears = profile?.experienceYears ?? 0;
  const experienceText = `${experienceYears} ${experienceYears === 1 ? 'Year' : 'Years'}`;

  const statCards = [
    {
      label: 'Published Courses',
      value: coursesCount,
      subtext: 'Marketplace courses',
      icon: BookOpen,
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      targetTab: 'courses' as const,
    },
    {
      label: 'Total Orders / Sales',
      value: ordersCount,
      subtext: 'Student enrollments',
      icon: DollarSign,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      targetTab: 'orders' as const,
    },
    {
      label: 'Experience',
      value: experienceText,
      subtext: 'Professional background',
      icon: Clock,
      iconBg: 'bg-amber-50 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      targetTab: null,
    },
    {
      label: 'Country / Base',
      value: profile?.country || 'Not specified',
      subtext: 'Operating location',
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
        {/* Left 2 Columns: Biography, Instructor Info & Professional Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructor Biography / About Me */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Instructor Biography
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Public bio shown to students across your course pages
                </p>
              </div>
            </div>

            <div className="pt-5">
              {profile?.brief && profile.brief.trim() ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {profile.brief}
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div className="text-xs">
                    <p className="font-bold">No biography added yet.</p>
                    <p className="mt-0.5 text-amber-700/80 dark:text-amber-400/80">
                      Click 'Edit Profile' to add your bio and introduce your professional background to students.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructor Account Information */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Instructor Credentials
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Account details and direct contact points
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-5">
              {/* Instructor Name */}
              <div className="bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <UserIcon className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold">Instructor / Display Name</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                  {profile?.providerName || user.userName || 'Not specified'}
                </p>
              </div>

              {/* Email Address */}
              <div className="bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center justify-between gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-500" />
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
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold">Phone Number</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                  {profile?.phoneNumber || user.phoneNumber || 'Not provided'}
                </p>
              </div>

              {/* Role */}
              <div className="bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold">Account Role</span>
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 capitalize">
                    {user.role} Partner
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional & Payout Details */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Professional & Payout Settings
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Experience level, region, and registered bank details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-5">
              {/* Experience Years */}
              <div className="bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold">Experience</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/50">
                  {experienceText}
                </span>
              </div>

              {/* Country */}
              <div className="bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1.5">
                  <Globe className="w-4 h-4 text-sky-500" />
                  <span className="text-xs font-semibold">Country / Base</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {profile?.country || 'Not specified'}
                </p>
              </div>

              {/* Bank Account */}
              <div className="sm:col-span-2 bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                <div className="flex items-center justify-between gap-2 text-gray-500 dark:text-gray-400 mb-1.5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-semibold">Bank / Payout Account (IBAN)</span>
                  </div>
                  {profile?.bankAccount ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                      <CheckCircle2 className="w-3 h-3" />
                      Account Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                      <AlertCircle className="w-3 h-3" />
                      Setup Required
                    </span>
                  )}
                </div>
                <p className="text-sm font-mono font-bold text-gray-900 dark:text-white mt-1">
                  {profile?.bankAccount || 'No bank account added yet'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Instructor Status & Payout Verification Indicator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-emerald-50/70 via-white to-indigo-50/50 dark:from-emerald-950/30 dark:via-gray-900 dark:to-indigo-950/20 rounded-3xl p-6 sm:p-7 border border-emerald-100 dark:border-indigo-900/40 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  <Sparkles className="w-3.5 h-3.5" />
                  Provider Status
                </span>
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                  TechMeter Partner
                </span>
              </div>

              {/* Center Icon & Title */}
              <div className="text-center my-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20 mb-3">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  Verified Instructor
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Authorized to create, publish & monetize courses
                </p>
              </div>

              {/* Status Checklist */}
              <div className="mt-6 pt-5 border-t border-emerald-100/80 dark:border-indigo-900/40 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Course Creation & Curriculum Editor Active</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Interactive Student Q&A & Comments</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Real-time Analytics & Sales Dashboard</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                  {profile?.bankAccount ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={profile?.bankAccount ? '' : 'text-amber-700 dark:text-amber-400 font-medium'}>
                    {profile?.bankAccount
                      ? 'Automated Payout Channel Connected'
                      : 'Payout Account Pending Setup'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Tip Card */}
            <div className="mt-6 p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/60 border border-emerald-100/80 dark:border-emerald-900/30 text-[11px] text-gray-500 dark:text-gray-400 text-center">
              Keep your bio and payout details updated to ensure smooth earnings distribution.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderOverviewTab;
