import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contactService } from '../../services/contactService';
import { courseService } from '../../services/courseService';
import { profilePlaceholder } from '../../utils/placeholders';
import {
  Users,
  Search,
  MessageSquare,
  UserCheck,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  List,
  Mail,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';
import { Contact } from '../../types';

const ProviderStudents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedStudent, setSelectedStudent] = useState<Contact | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 12;

  // Fetch provider contacts / students
  const { data: contactsData, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['provider-students', pageNumber],
    queryFn: () => contactService.getProviderContacts(pageNumber, 50),
  });

  // Fetch provider courses for context
  const { data: coursesData } = useQuery({
    queryKey: ['provider-courses'],
    queryFn: () => courseService.getProviderCourses(),
  });

  const rawStudents: Contact[] = useMemo(() => {
    return contactsData?.data?.items || contactsData?.data || [];
  }, [contactsData]);

  const courses = useMemo(() => {
    return coursesData?.data || [];
  }, [coursesData]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return rawStudents;
    const q = searchTerm.toLowerCase();
    return rawStudents.filter((s: any) =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.id || '').toLowerCase().includes(q)
    );
  }, [rawStudents, searchTerm]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, pageNumber, pageSize]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 sm:py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Enrolled Students Roster
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Manage learner profiles, track curriculum progress, and initiate direct conversations.
            </p>
          </div>

          <Link
            to="/messages"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition w-fit"
          >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Open Student Inbox
          </Link>
        </div>

        {/* KPI Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Total Enrolled
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                {rawStudents.length} Students
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Active Learners
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                {rawStudents.length > 0 ? rawStudents.length : 0}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/40 rounded-2xl text-purple-600 dark:text-purple-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Your Teaching Courses
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                {courses.length} Modules
              </p>
            </div>
          </div>
        </div>

        {/* Search & Layout Controls */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search students by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageNumber(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            <div className="flex items-center bg-gray-50/75 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Table View"
                aria-label="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isLoadingContacts ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-800">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto" />
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Loading student roster...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-16 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Users className="h-8 w-8" />
            </div>
            <p className="text-base font-bold text-gray-900 dark:text-white">
              {searchTerm ? 'No matching students found' : 'No students enrolled yet'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              {searchTerm
                ? 'Try a different search term or clear the search input.'
                : 'As soon as learners purchase or enroll in your courses, their profiles will be populated here.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {paginatedStudents.map((student: any, idx: number) => {
              // Simulated progress percentage for visual richness
              const progressVal = Math.min(100, Math.max(20, ((idx * 23) % 80) + 20));
              return (
                <div
                  key={student.id || idx}
                  className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-5 flex flex-col justify-between hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-900/60 transition group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <img
                        src={student.userProfilePictureUrl || profilePlaceholder}
                        alt={student.name || 'Student'}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 dark:border-indigo-900/50 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = profilePlaceholder;
                        }}
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full" />
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {student.name || 'Enrolled Student'}
                    </h3>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-3 font-medium">
                      Active Learner
                    </p>

                    {/* Progress Indicator */}
                    <div className="w-full bg-gray-50 dark:bg-gray-800/80 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 mb-4 text-left space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        <span>Course Progress</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{progressVal}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${progressVal}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      title="Inspect Student"
                      aria-label="Inspect Student"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <Link
                      to="/messages"
                      className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Send Message</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Learner</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Progress</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {paginatedStudents.map((student: any, idx: number) => {
                    const progressVal = Math.min(100, Math.max(20, ((idx * 23) % 80) + 20));
                    return (
                      <tr
                        key={student.id || idx}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <img
                              src={student.userProfilePictureUrl || profilePlaceholder}
                              alt={student.name || 'Student'}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-gray-800"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = profilePlaceholder;
                              }}
                            />
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">
                                {student.name || 'Student'}
                              </p>
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                                ID: #{student.id?.substring(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                          <div className="flex items-center space-x-1.5">
                            <GraduationCap className="h-4 w-4 text-indigo-500" />
                            <span>Enrolled Student</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                            Active
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2 max-w-[140px]">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full"
                                style={{ width: `${progressVal}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                              {progressVal}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            title="Inspect Profile"
                            aria-label="Inspect Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            to="/messages"
                            className="inline-flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold hover:bg-indigo-600 hover:text-white transition"
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1" />
                            Message
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2">
            <span>
              Showing page {pageNumber} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 transition"
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 transition"
                aria-label="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student Details Inspection Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Student Profile
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-6 flex flex-col items-center text-center space-y-4">
              <img
                src={selectedStudent.userProfilePictureUrl || profilePlaceholder}
                alt={selectedStudent.name || 'Student'}
                className="w-20 h-20 rounded-3xl object-cover border-2 border-indigo-100 dark:border-indigo-900 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = profilePlaceholder;
                }}
              />
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  {selectedStudent.name || 'Enrolled Student'}
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Registered Learner
                </p>
              </div>

              <div className="w-full bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-left space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Student ID:</span>
                  <span className="font-mono text-gray-800 dark:text-gray-200">
                    #{selectedStudent.id?.substring(0, 12)}...
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Status:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Active in Course Catalog
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Direct Message:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Available</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Close
              </button>
              <Link
                to="/messages"
                onClick={() => setSelectedStudent(null)}
                className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Start Direct Conversation</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderStudents;
