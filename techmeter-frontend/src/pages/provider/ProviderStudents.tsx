import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contactService } from '../../services/contactService';
import { profilePlaceholder } from '../../utils/placeholders';
import {
  Users,
  Search,
  MessageSquare,
  UserCheck,
} from 'lucide-react';

const ProviderStudents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: contactsData, isLoading } = useQuery({
    queryKey: ['provider-students'],
    queryFn: () => contactService.getProviderContacts(1, 50),
  });

  const students = contactsData?.data?.items || contactsData?.data || [];

  const filteredStudents = students.filter((s: any) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Enrolled Students</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              View learners enrolled in your courses and start direct conversations.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-2 w-fit">
            <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {students.length} Total Active Students
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 mb-6 flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search students by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
            />
          </div>
        </div>

        {/* Students Grid */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-12 text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
              <Users className="h-7 w-7" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">No students found</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Students who enroll in your courses will be listed here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredStudents.map((student: any) => (
              <div
                key={student.id}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center text-center hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/60 transition"
              >
                <img
                  src={student.userProfilePictureUrl || profilePlaceholder}
                  alt={student.name}
                  className="w-16 h-16 rounded-2xl object-cover mb-3 border-2 border-indigo-100 dark:border-indigo-900/50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = profilePlaceholder;
                  }}
                />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{student.name}</h3>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-4 font-medium">Learner</p>

                <Link
                  to="/messages"
                  className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Send Message</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderStudents;
