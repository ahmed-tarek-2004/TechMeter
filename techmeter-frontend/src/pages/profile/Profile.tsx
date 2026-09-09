import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { courseService } from '../../services/courseService';
import { Mail, Phone, BookOpen, User, ShieldCheck } from 'lucide-react';
import { coursePlaceholder } from '../../utils/placeholders';

const Profile: React.FC = () => {
  const { user } = useAuth();

  const { data: studentProfileData } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => profileService.getStudentProfile(),
    enabled: !!user && user.role === 'student',
    retry: false,
  });

  const { data: providerProfileData } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: () => profileService.getProviderProfile(),
    enabled: !!user && user.role === 'provider',
    retry: false,
  });

  const { data: coursesData } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => user?.role === 'provider' ? courseService.getProviderCourses() : courseService.getStudentCourses(),
    enabled: !!user,
    retry: false,
  });

  const profile = user?.role === 'provider' ? providerProfileData?.data : studentProfileData?.data;
  const courses = coursesData?.data || [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-200">
        <p className="text-xs text-gray-500 dark:text-gray-400">Please login to view your profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="w-28 h-28 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xs">
              {profile && 'profileImage' in profile && (profile as any).profileImage ? (
                <img src={(profile as any).profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-extrabold">{user.userName?.charAt(0)}</span>
              )}
            </div>
            <div className="mt-6 md:mt-0 md:ml-6 text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{user.userName}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40 w-fit mx-auto md:mx-0 uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  {user.role}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center"><Mail className="h-4 w-4 mr-1.5 text-indigo-500" />{user.email}</div>
                {user.phoneNumber && <div className="flex items-center"><Phone className="h-4 w-4 mr-1.5 text-indigo-500" />{user.phoneNumber}</div>}
              </div>

              {profile && 'country' in profile && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Country: <span className="text-gray-900 dark:text-white">{(profile as any).country}</span></p>
              )}
              {profile && 'educationLevel' in profile && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">Education: <span className="text-gray-900 dark:text-white">{(profile as any).educationLevel}</span></p>
              )}
              {profile && 'brief' in profile && (profile as any).brief && (
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  {(profile as any).brief}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
            {user.role === 'provider' ? 'My Created Courses' : 'Enrolled Courses'}
          </h2>
          {courses.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 max-w-lg mx-auto">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No courses yet</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                {user.role === 'provider'
                  ? 'Start publishing courses to share your expertise with students.'
                  : 'Start learning today by exploring our catalog.'}
              </p>
              <Link
                to={user.role === 'provider' ? '/provider/courses/create' : '/courses'}
                className="inline-flex items-center px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
              >
                {user.role === 'provider' ? 'Create New Course' : 'Browse Courses'}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course: any) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-5 flex flex-col justify-between hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/60 transition"
                >
                  <div>
                    <img
                      src={course.courseProfileImageUrl || coursePlaceholder}
                      alt={course.title}
                      className="w-full h-40 object-cover rounded-2xl mb-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = coursePlaceholder;
                      }}
                    />
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {course.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                      {!course.price || course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                    <Link
                      to={user.role === 'provider' ? `/provider/courses/${course.id}/edit` : `/learn/${course.id}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-semibold"
                    >
                      {user.role === 'provider' ? 'Manage' : 'Learn'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
