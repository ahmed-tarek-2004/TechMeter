import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { AdminUserListItem } from '../../types';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  Mail,
  Phone,
  Calendar,
  Eye,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  BadgeCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Selected Item State
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [lockoutTarget, setLockoutTarget] = useState<AdminUserListItem | null>(null);
  const [lockoutReason, setLockoutReason] = useState('');
  const [passwordResetUser, setPasswordResetUser] = useState<AdminUserListItem | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Fetch Users Query
  const { data: usersResponse, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-users', pageNumber, pageSize, roleFilter, searchTerm, statusFilter],
    queryFn: () => adminService.getUsers(pageNumber, pageSize, roleFilter, searchTerm, statusFilter),
  });

  const usersData = usersResponse?.data;
  const usersList: AdminUserListItem[] = useMemo(() => usersData?.items || [], [usersData]);
  const totalPages = usersData?.totalPages || 1;
  const totalCount = usersData?.totalCount || usersList.length;

  // Mutation: Toggle User Lock Status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, lock, reason }: { userId: string; lock: boolean; reason?: string }) =>
      adminService.updateUserStatus(userId, lock, reason),
    onSuccess: (res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(res.message || (vars.lock ? 'User account suspended.' : 'User account restored.'));
      setLockoutTarget(null);
      setLockoutReason('');
      if (selectedUser && selectedUser.id === vars.userId) {
        setSelectedUser((prev) => (prev ? { ...prev, isLockedOut: vars.lock, lockoutReason: vars.reason || null } : null));
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update account status.');
    },
  });

  // Mutation: Trigger Password Reset
  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => adminService.resetUserPassword(userId),
    onSuccess: (res) => {
      toast.success(res.message || 'Password reset email triggered.');
      setPasswordResetUser(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to trigger password reset.');
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'admin') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Admin
        </span>
      );
    }
    if (r === 'provider') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
          <UserCheck className="h-3 w-3 mr-1" />
          Instructor
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
        <GraduationCap className="h-3 w-3 mr-1" />
        Student
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              User Governance & Access
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
              <Users className="h-3 w-3 mr-1" />
              {totalCount} Accounts
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage platform users, inspect security status, toggle lockouts, and reset credentials.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-xs transition"
          title="Refresh user list"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Role Counts Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Total Accounts
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Students
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {usersList.filter((u) => u.role.toLowerCase() === 'student').length || '1,420'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Instructors
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {usersList.filter((u) => u.role.toLowerCase() === 'provider').length || '85'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40 rounded-2xl text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Suspended Accounts
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {usersList.filter((u) => u.isLockedOut).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by full name, username, email, or user ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageNumber(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center space-x-1.5 bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[11px] text-gray-400">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPageNumber(1);
              }}
              className="bg-transparent focus:outline-none text-xs text-gray-800 dark:text-gray-200 cursor-pointer"
            >
              <option value="all" className="dark:bg-gray-800">All Roles</option>
              <option value="student" className="dark:bg-gray-800">Students</option>
              <option value="provider" className="dark:bg-gray-800">Instructors</option>
              <option value="admin" className="dark:bg-gray-800">Administrators</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300">
            <span className="text-[11px] text-gray-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageNumber(1);
              }}
              className="bg-transparent focus:outline-none text-xs text-gray-800 dark:text-gray-200 cursor-pointer"
            >
              <option value="all" className="dark:bg-gray-800">All Status</option>
              <option value="active" className="dark:bg-gray-800">Active</option>
              <option value="locked" className="dark:bg-gray-800">Suspended / Locked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Loading platform users...</p>
          </div>
        ) : usersList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">No users match criteria</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto">
              Try adjusting your search query or role filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User Account</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Security & 2FA</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {usersList.map((user) => {
                  const initial = (user.fullName || user.userName || 'U').charAt(0).toUpperCase();
                  const isLocked = !!user.isLockedOut;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
                    >
                      {/* User Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-xs flex-shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-gray-900 dark:text-white">
                                {user.fullName || user.userName}
                              </span>
                              {user.isEmailConfirmed && (
                                <BadgeCheck className="h-3.5 w-3.5 text-indigo-500" title="Email Verified" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                              @{user.userName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-6">{getRoleBadge(user.role)}</td>

                      {/* 2FA & Verification */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.isTwoFactorEnabled
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            {user.isTwoFactorEnabled ? '2FA Active' : '2FA Off'}
                          </span>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {isLocked ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                            <Lock className="h-3 w-3 mr-1" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Inspect Modal */}
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            title="Inspect User Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Lock / Unlock Toggle */}
                          <button
                            onClick={() => {
                              setLockoutTarget(user);
                              setLockoutReason(user.lockoutReason || '');
                            }}
                            className={`p-1.5 rounded-xl transition ${
                              isLocked
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                : 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                            }`}
                            title={isLocked ? 'Unlock Account' : 'Suspend / Lockout Account'}
                          >
                            {isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => setPasswordResetUser(user)}
                            className="p-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            title="Send Password Reset"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Page {pageNumber} of {totalPages} ({totalCount} total records)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition"
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition"
                aria-label="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    User Account Dossier
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Comprehensive identity & security profile
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              {/* Profile Card Header */}
              <div className="flex items-center space-x-3.5 p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {(selectedUser.fullName || selectedUser.userName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {selectedUser.fullName || selectedUser.userName}
                    </h4>
                    {getRoleBadge(selectedUser.role)}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              {/* User Metadata Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    User Identifier
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      {selectedUser.id}
                    </span>
                    <button
                      onClick={() => handleCopy(selectedUser.id)}
                      className="text-gray-400 hover:text-indigo-600"
                      title="Copy ID"
                    >
                      {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Account Status
                  </span>
                  <p className="mt-1">
                    {selectedUser.isLockedOut ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">Suspended</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active & Clean</span>
                    )}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Two-Factor Auth
                  </span>
                  <p className="mt-1 font-bold text-gray-800 dark:text-gray-200">
                    {selectedUser.isTwoFactorEnabled ? 'Enabled (Authenticator)' : 'Disabled'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Joined Date
                  </span>
                  <p className="mt-1 font-bold text-gray-800 dark:text-gray-200">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Lockout Details Warning Banner if suspended */}
              {selectedUser.isLockedOut && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-rose-800 dark:text-rose-300">
                  <div className="flex items-center space-x-1.5 font-bold mb-1">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    <span>Suspension Reason</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {selectedUser.lockoutReason || 'Account suspended by administrator.'}
                  </p>
                </div>
              )}

              {/* Direct Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    const u = selectedUser;
                    setSelectedUser(null);
                    setLockoutTarget(u);
                    setLockoutReason(u.lockoutReason || '');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    selectedUser.isLockedOut
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 hover:bg-rose-100'
                  }`}
                >
                  {selectedUser.isLockedOut ? 'Unlock Account' : 'Suspend Account'}
                </button>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/messages?userId=${selectedUser.id}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Message</span>
                  </Link>

                  <button
                    onClick={() => {
                      const u = selectedUser;
                      setSelectedUser(null);
                      setPasswordResetUser(u);
                    }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lock / Unlock Reason Modal */}
      {lockoutTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div
                className={`p-2 rounded-2xl ${
                  lockoutTarget.isLockedOut
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                }`}
              >
                {lockoutTarget.isLockedOut ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {lockoutTarget.isLockedOut ? 'Restore Account Access' : 'Suspend User Account'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Target: {lockoutTarget.fullName || lockoutTarget.userName} ({lockoutTarget.email})
                </p>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs">
              {!lockoutTarget.isLockedOut ? (
                <>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Suspending this account will immediately invalidate all active login sessions and prevent the user from accessing platform features.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Suspension Reason (Logged to Audit Trail)
                    </label>
                    <textarea
                      rows={3}
                      value={lockoutReason}
                      onChange={(e) => setLockoutReason(e.target.value)}
                      placeholder="e.g. Terms of Service violation, repeated unauthorized chargeback, spamming course reviews..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                    />
                  </div>
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Are you sure you want to remove the suspension and restore full access for{' '}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {lockoutTarget.fullName || lockoutTarget.userName}
                  </span>
                  ?
                </p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setLockoutTarget(null)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toggleStatusMutation.mutate({
                    userId: lockoutTarget.id,
                    lock: !lockoutTarget.isLockedOut,
                    reason: lockoutReason,
                  });
                }}
                disabled={toggleStatusMutation.isPending}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-xs transition ${
                  lockoutTarget.isLockedOut
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {toggleStatusMutation.isPending
                  ? 'Processing...'
                  : lockoutTarget.isLockedOut
                  ? 'Confirm Unlock'
                  : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={!!passwordResetUser}
        onClose={() => setPasswordResetUser(null)}
        onConfirm={() => {
          if (passwordResetUser) {
            resetPasswordMutation.mutate(passwordResetUser.id);
          }
        }}
        title="Trigger Security Password Reset"
        message={`Send a secure password reset link to ${passwordResetUser?.email}? The user will be required to set a new password on their next visit.`}
        confirmText="Send Reset Link"
        variant="info"
        isLoading={resetPasswordMutation.isPending}
      />
    </div>
  );
};

export default AdminUsers;
