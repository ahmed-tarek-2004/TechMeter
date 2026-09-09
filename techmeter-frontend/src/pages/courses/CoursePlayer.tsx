import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import { sectionService } from '../../services/sectionService';
import { lessonService } from '../../services/lessonService';
import { commentService } from '../../services/commentService';
import { ratingService } from '../../services/ratingService';
import toast from 'react-hot-toast';
import {
  PlayCircle,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  Star,
  ThumbsUp,
  Send,
  BookOpen,
  ArrowLeft,
  Share2,
  List,
  X,
  Search,
  Video,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Section, Lesson, Comment, Rating } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LessonViewer } from '../../components/lessons/LessonViewer';
import { getLessonMediaType, getMediaMeta } from '../../utils/mediaUtils';

const CoursePlayer: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'reviews'>('overview');
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [autoplayNext, setAutoplayNext] = useState<boolean>(true);

  // Rating modal/state
  const [userRating, setUserRating] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // 1. Fetch Course Details
  const { data: courseData, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseService.getCourseById(courseId!),
    enabled: !!courseId,
  });

  // 2. Fetch Sections
  const { data: sectionsData, isLoading: isLoadingSections } = useQuery({
    queryKey: ['course-sections', courseId],
    queryFn: () => sectionService.getSectionsByCourse(courseId!),
    enabled: !!courseId,
  });

  // 3. Fetch all Lessons
  const { data: lessonsData, isLoading: isLoadingLessons } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: () => lessonService.getCourseLessons(courseId!),
    enabled: !!courseId,
  });

  // 4. Fetch Watched Lessons
  const { data: watchedLessonsData } = useQuery({
    queryKey: ['watched-lessons'],
    queryFn: () => lessonService.getWatchedLessons(),
  });

  const course = courseData?.data;
  const sections: Section[] = sectionsData?.data || [];
  const lessons: Lesson[] = lessonsData?.data || [];
  const watchedLessons: Lesson[] = watchedLessonsData?.data || [];
  const watchedIds = new Set(watchedLessons.map((l) => l.id));

  // Determine current active lesson
  const currentLesson = lessons.find((l) => l.id === lessonId) || lessons[0];

  // Auto expand current section on load
  useEffect(() => {
    if (currentLesson?.sectionId) {
      setOpenSections((prev) => ({ ...prev, [currentLesson.sectionId]: true }));
    }
  }, [currentLesson]);

  // 5. Fetch Comments for current lesson
  const { data: commentsData } = useQuery({
    queryKey: ['lesson-comments', currentLesson?.id],
    queryFn: () => commentService.getLessonComments(currentLesson.id),
    enabled: !!currentLesson?.id,
  });

  // 6. Fetch Ratings
  const { data: courseRatingsData } = useQuery({
    queryKey: ['course-ratings', courseId],
    queryFn: () => ratingService.getAllCourseRatings(courseId!),
    enabled: !!courseId,
  });

  const comments: Comment[] = commentsData?.data || [];
  const ratings: Rating[] = courseRatingsData?.data || [];

  // Toggle Section
  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Mark Watched Mutation
  const watchMutation = useMutation({
    mutationFn: (id: string) => lessonService.markLessonAsWatched(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watched-lessons'] });
      toast.success('Lesson marked as completed!', { id: 'watched-toast' });
    },
  });

  // Unmark Watched Mutation
  const unwatchMutation = useMutation({
    mutationFn: (id: string) => lessonService.markLessonAsUnwatched(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watched-lessons'] });
      toast.success('Lesson marked as in-progress', { id: 'unwatch-toast' });
    },
  });

  const handleToggleWatched = (id: string) => {
    if (watchedIds.has(id)) {
      unwatchMutation.mutate(id);
    } else {
      watchMutation.mutate(id);
    }
  };

  // Next / Prev navigation
  const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  const handleNextLesson = () => {
    if (currentLesson && !watchedIds.has(currentLesson.id)) {
      watchMutation.mutate(currentLesson.id);
    }
    if (nextLesson) {
      navigate(`/learn/${courseId}/lesson/${nextLesson.id}`);
      setIsMobileSidebarOpen(false);
    }
  };

  // Post Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      commentService.addComment(currentLesson.id, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', currentLesson?.id] });
      setCommentText('');
      setReplyingTo(null);
      toast.success('Comment posted!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to post comment.');
    },
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentLesson) return;
    addCommentMutation.mutate({ content: commentText.trim() });
  };

  const handlePostReply = (parentId: string) => {
    const text = replyText[parentId];
    if (!text?.trim() || !currentLesson) return;
    addCommentMutation.mutate({ content: text.trim(), parentId });
    setReplyText((prev) => ({ ...prev, [parentId]: '' }));
  };

  // Like Comment Mutation
  const likeMutation = useMutation({
    mutationFn: (commentId: string) => commentService.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', currentLesson?.id] });
    },
  });

  // Submit Course Rating
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRating(true);
    try {
      await ratingService.addRating({
        courseId: courseId!,
        rating: userRating,
        comment: ratingComment.trim() || undefined,
      });
      toast.success('Thank you for reviewing this course!');
      queryClient.invalidateQueries({ queryKey: ['course-ratings', courseId] });
      setRatingComment('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not submit rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const completedCount = lessons.filter((l) => watchedIds.has(l.id)).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  // Render Lesson Type Icon in Sidebar
  const renderLessonTypeIcon = (url?: string) => {
    const type = getLessonMediaType(url);
    switch (type) {
      case 'pdf':
        return <FileText className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />;
      case 'image':
        return <ImageIcon className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />;
      case 'video':
      default:
        return <Video className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />;
    }
  };

  if (isLoadingCourse || isLoadingSections || isLoadingLessons) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center text-gray-900 dark:text-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent mb-4"></div>
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Loading course player...</p>
      </div>
    );
  }

  const currentMediaType = getLessonMediaType(currentLesson?.lessonUrl);
  const mediaMeta = getMediaMeta(currentMediaType);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <Link
            to="/my-learning"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition flex-shrink-0"
            title="Back to My Courses"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                {course?.title || 'Course Player'}
              </h1>
              {currentLesson && (
                <span
                  className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    currentMediaType === 'video'
                      ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                      : currentMediaType === 'pdf'
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                      : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                  }`}
                >
                  {mediaMeta.label}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {completedCount} of {lessons.length} lessons completed ({progressPercent}%)
            </p>
          </div>
        </div>

        {/* Progress & Sidebar Toggle for Mobile */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="hidden md:flex items-center space-x-3">
            <div className="w-32 bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{progressPercent}%</span>
          </div>

          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Lesson link copied!');
              }
            }}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs flex items-center space-x-1 transition"
            title="Share Lesson"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {/* Mobile Course Content Toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden inline-flex items-center px-3 py-1.5 bg-indigo-600 dark:bg-indigo-400 text-white hover:bg-indigo-700 dark:hover:bg-indigo-300 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <List className="h-4 w-4 mr-1.5" />
            Curriculum
          </button>
        </div>
      </header>

      {/* Main Learning Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Video / PDF / Image Player & Information Tabs */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Media Player Container */}
          <div className="w-full bg-black flex items-center justify-center border-b border-gray-800 dark:border-gray-900 p-2 sm:p-4">
            <div className="w-full max-w-5xl">
              <LessonViewer
                key={currentLesson?.id}
                lessonUrl={currentLesson?.lessonUrl}
                lessonName={currentLesson?.name}
                autoPlay={true}
                playbackRate={playbackSpeed}
                onPlaybackRateChange={(rate) => setPlaybackSpeed(rate)}
                onEnded={() => {
                  if (currentLesson && !watchedIds.has(currentLesson.id)) {
                    watchMutation.mutate(currentLesson.id);
                  }
                  if (autoplayNext && nextLesson) {
                    toast.success(`Advancing to next: ${nextLesson.name}`);
                    navigate(`/learn/${courseId}/lesson/${nextLesson.id}`);
                  }
                }}
              />
            </div>
          </div>

          {/* Quick Player Control & Progress Strip */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => currentLesson && handleToggleWatched(currentLesson.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  currentLesson && watchedIds.has(currentLesson.id)
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700'
                }`}
              >
                {currentLesson && watchedIds.has(currentLesson.id) ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
                <span>
                  {currentLesson && watchedIds.has(currentLesson.id)
                    ? 'Completed'
                    : 'Mark as Complete'}
                </span>
              </button>

              {/* Autoplay next toggle */}
              <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoplayNext}
                  onChange={(e) => setAutoplayNext(e.target.checked)}
                  className="rounded bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span>Auto-advance lessons</span>
              </label>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center space-x-2">
              <button
                disabled={!prevLesson}
                onClick={() => prevLesson && navigate(`/learn/${courseId}/lesson/${prevLesson.id}`)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  prevLesson
                    ? 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700'
                    : 'bg-gray-100 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700/50'
                }`}
              >
                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span>Previous</span>
              </button>

              <button
                disabled={!nextLesson}
                onClick={handleNextLesson}
                className={`flex items-center space-x-1 px-4 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition ${
                  nextLesson
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700/50'
                }`}
              >
                <span>Next Lesson</span>
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="border-b border-gray-200 dark:border-gray-800 mb-6 flex space-x-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('comments')}
                className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
                  activeTab === 'comments'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Q&A ({comments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
                  activeTab === 'reviews'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Star className="h-4 w-4" />
                <span>Reviews & Ratings ({ratings.length})</span>
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                      {currentLesson?.name}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        currentMediaType === 'video'
                          ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                          : currentMediaType === 'pdf'
                          ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                          : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                      }`}
                    >
                      {mediaMeta.label}
                    </span>
                  </div>
                  <div className="mt-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-white dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-800/80">
                    {currentLesson?.description ||
                      'No additional notes or description provided for this lesson.'}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    About this Course
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {course?.description || 'Learn and master key skills step by step.'}
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Comments & Q&A */}
            {activeTab === 'comments' && (
              <div className="max-w-3xl space-y-6">
                {/* Add Comment Form */}
                <form onSubmit={handlePostComment} className="space-y-3">
                  <div className="relative">
                    <textarea
                      rows={3}
                      placeholder="Ask a question or discuss this lesson..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!commentText.trim() || addCommentMutation.isPending}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition flex items-center space-x-1.5 shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{addCommentMutation.isPending ? 'Posting...' : 'Post Question'}</span>
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4 pt-2">
                  {comments.length === 0 ? (
                    <div className="p-8 text-center bg-gray-100 dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800/60">
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                        No questions asked yet on this lesson. Be the first to start the discussion!
                      </p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/70 rounded-2xl p-4 sm:p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs">
                              {comment.userName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white">{comment.userName}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => likeMutation.mutate(comment.id)}
                            className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>{comment.likesCount || 0}</span>
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>

                        {/* Reply trigger */}
                        <div className="pt-1 flex items-center space-x-4 text-xs">
                          <button
                            onClick={() =>
                              setReplyingTo(replyingTo === comment.id ? null : comment.id)
                            }
                            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                          >
                            {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                          </button>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment.id && (
                          <div className="pt-2 flex space-x-2">
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              value={replyText[comment.id] || ''}
                              onChange={(e) =>
                                setReplyText((prev) => ({
                                  ...prev,
                                  [comment.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && replyText[comment.id]?.trim()) {
                                  handlePostReply(comment.id);
                                }
                              }}
                              className="flex-1 bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                              onClick={() => handlePostReply(comment.id)}
                              disabled={!replyText[comment.id]?.trim()}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
                            >
                              Reply
                            </button>
                          </div>
                        )}

                        {/* Nested replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="pl-4 border-l-2 border-indigo-200 dark:border-indigo-900/40 space-y-2 mt-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="bg-gray-100 dark:bg-gray-950/60 p-3 rounded-xl border border-gray-200 dark:border-gray-800/40">
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className="w-5 h-5 bg-indigo-700 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                    {reply.userName?.charAt(0)?.toUpperCase() || 'R'}
                                  </div>
                                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                    {reply.userName}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 pl-7">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="max-w-3xl space-y-6">
                {/* Submit review */}
                <form
                  onSubmit={handleRatingSubmit}
                  className="bg-gray-100 dark:bg-gray-950/70 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs"
                >
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Rate & Review this Course</h3>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 transition ${
                            star <= userRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 ml-2">
                      {userRating} / 5 Stars
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Share what you liked or learned from this course..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 text-xs text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingRating}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-xs"
                  >
                    {isSubmittingRating ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>

                {/* Ratings list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Student Reviews ({ratings.length})
                  </h4>
                  {ratings.length === 0 ? (
                    <div className="p-8 text-center bg-gray-100 dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800/60">
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic">No reviews yet for this course.</p>
                    </div>
                  ) : (
                    ratings.map((r, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-100 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800/60 p-4 rounded-2xl space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3.5 w-3.5 ${
                                  s <= (r.rating || 5)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-600 dark:text-gray-500">
                            {r.ratedAt ? new Date(r.ratedAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        {r.comment && <p className="text-xs text-gray-700 dark:text-gray-300">{r.comment}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Course Content Sidebar (Desktop & Mobile Drawer) */}
        <aside
          className={`fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:transform-none ${
            isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              <span>Course Content</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                {completedCount}/{lessons.length}
              </span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search bar inside sidebar */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section & Lessons list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-800">
            {sections.map((section, sIdx) => {
              const allSectionLessons = lessons.filter((l) => l.sectionId === section.id);
              const filteredSectionLessons = allSectionLessons.filter((l) =>
                !sidebarSearch.trim()
                  ? true
                  : l.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
                    (l.description && l.description.toLowerCase().includes(sidebarSearch.toLowerCase()))
              );

              if (sidebarSearch.trim() && filteredSectionLessons.length === 0) {
                return null;
              }

              const sectionCompleted = allSectionLessons.filter((l) => watchedIds.has(l.id)).length;
              const isOpen = openSections[section.id] !== false;

              return (
                <div key={section.id} className="bg-white dark:bg-gray-900/40">
                  {/* Section Header Accordion */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-200 dark:hover:bg-gray-800/50 transition group"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        Section {sIdx + 1}: {section.name}
                      </p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                        {sectionCompleted} / {allSectionLessons.length} completed
                      </p>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {/* Section Lessons List */}
                  {isOpen && (
                    <div className="bg-gray-100 dark:bg-gray-950/60 divide-y divide-gray-200 dark:divide-gray-900">
                      {filteredSectionLessons.length === 0 ? (
                        <div className="p-4 text-center text-[11px] text-gray-600 dark:text-gray-400 italic">
                          No lessons found
                        </div>
                      ) : (
                        filteredSectionLessons.map((lesson, lIdx) => {
                          const isActive = currentLesson?.id === lesson.id;
                          const isWatched = watchedIds.has(lesson.id);

                          return (
                            <div
                              key={lesson.id}
                              className={`px-4 py-3 flex items-center space-x-3 cursor-pointer transition ${
                                isActive
                                  ? 'bg-indigo-950/70 border-l-4 border-indigo-500'
                                  : 'hover:bg-gray-200 dark:hover:bg-gray-800/40'
                              }`}
                              onClick={() => {
                                navigate(`/learn/${courseId}/lesson/${lesson.id}`);
                                setIsMobileSidebarOpen(false);
                              }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleWatched(lesson.id);
                                }}
                                className="focus:outline-none flex-shrink-0"
                                title={isWatched ? 'Mark as unwatched' : 'Mark as complete'}
                              >
                                {isWatched ? (
                                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                                ) : (
                                  <Circle className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs truncate ${
                                    isActive
                                      ? 'text-indigo-400 font-bold'
                                      : isWatched
                                      ? 'text-gray-500 dark:text-gray-400'
                                      : 'text-gray-300 dark:text-gray-500'
                                  }`}
                                >
                                  {lIdx + 1}. {lesson.name}
                                </p>
                              </div>

                              {renderLessonTypeIcon(lesson.lessonUrl)}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Backdrop for mobile drawer */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          />
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
