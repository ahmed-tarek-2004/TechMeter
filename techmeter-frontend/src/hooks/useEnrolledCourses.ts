import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/courseService';
import { Course } from '../types';

export const useEnrolledCourses = () => {
  const { isAuthenticated, user } = useAuth();
  const isStudent = isAuthenticated && user?.role === 'student';

  const { data, isLoading } = useQuery({
    queryKey: ['student-courses'],
    queryFn: () => courseService.getStudentCourses(),
    enabled: isStudent,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const enrolledCourses: Course[] = useMemo(() => data?.data || [], [data]);

  const enrolledIds = useMemo(() => {
    return new Set(enrolledCourses.map((c) => c.id));
  }, [enrolledCourses]);

  const isEnrolled = (courseId?: string): boolean => {
    if (!courseId) return false;
    return enrolledIds.has(courseId);
  };

  return {
    enrolledCourses,
    enrolledIds,
    isEnrolled,
    isLoading: isStudent ? isLoading : false,
  };
};
