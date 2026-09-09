import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import { sectionService } from '../../services/sectionService';
import { lessonService } from '../../services/lessonService';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Video,
  ChevronDown,
  ChevronUp,
  Layers,
  Upload,
  Eye,
  X,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Play,
  Film,
  FolderPlus,
  Sparkles,
  FileText,
  Image as ImageIcon,
  File,
} from 'lucide-react';
import { Section, Lesson } from '../../types';
import { LessonViewer } from '../../components/lessons/LessonViewer';
import { getLessonMediaType } from '../../utils/mediaUtils';

const CourseCurriculum: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Confirmation Modals State
  const [sectionToDelete, setSectionToDelete] = useState<{ id: string; name: string } | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<{ id: string; name: string } | null>(null);

  // Collapsible Sections State
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  // Video Preview Modal State
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  // Section Modal State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionName, setSectionName] = useState('');

  // Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string>('');
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonName, setLessonName] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonFile, setLessonFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // 1. Fetch Course Info
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

  // 3. Fetch Lessons
  const { data: lessonsData, isLoading: isLoadingLessons } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: () => lessonService.getCourseLessons(courseId!),
    enabled: !!courseId,
  });

  const course = courseData?.data;
  const sections: Section[] = sectionsData?.data || [];
  const lessons: Lesson[] = lessonsData?.data || [];

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: prev[id] === undefined ? false : !prev[id] }));
  };

  const toggleAllSections = (expand: boolean) => {
    const newState: { [key: string]: boolean } = {};
    sections.forEach((s) => {
      newState[s.id] = expand;
    });
    setOpenSections(newState);
  };

  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // -------------------------------------------------------------
  // Section Mutations
  // -------------------------------------------------------------
  const saveSectionMutation = useMutation({
    mutationFn: async () => {
      const trimmedName = sectionName.trim();
      if (!trimmedName) throw new Error('Section name cannot be empty');

      if (editingSection) {
        return sectionService.updateSection(editingSection.id, {
          name: trimmedName,
          courseId: courseId!,
        });
      } else {
        return sectionService.createSection(courseId!, {
          sectionName: trimmedName,
        });
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['course-sections', courseId] });
      toast.success(res?.message || (editingSection ? 'Section updated successfully!' : 'Section created successfully!'));
      setIsSectionModalOpen(false);
      setSectionName('');
      setEditingSection(null);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to save section.';
      toast.error(msg);
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId: string) => sectionService.deleteSection(courseId!, sectionId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['course-sections', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-lessons', courseId] });
      toast.success(res?.message || 'Section and its lessons deleted.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete section.';
      toast.error(msg);
    },
  });

  // -------------------------------------------------------------
  // Lesson Mutations
  // -------------------------------------------------------------
  const saveLessonMutation = useMutation({
    mutationFn: async () => {
      const trimmedName = lessonName.trim();
      if (!trimmedName) throw new Error('Lesson title is required');

      if (!editingLesson && !lessonFile) {
        throw new Error('Please select a video or media file for the lesson');
      }

      const formData = new FormData();
      formData.append('Name', trimmedName);
      if (lessonDescription.trim()) {
        formData.append('Description', lessonDescription.trim());
      }

      if (editingLesson) {
        formData.append('SectionId', targetSectionId || editingLesson.sectionId);
        return lessonService.updateLesson(editingLesson.id, formData);
      } else {
        if (!targetSectionId) throw new Error('Please select a target section');
        formData.append('LessonStream', lessonFile!);
        return lessonService.addLesson(targetSectionId, formData, (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        });
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-sections', courseId] });
      toast.success(res?.message || (editingLesson ? 'Lesson updated!' : 'Lesson uploaded successfully!'));
      setIsLessonModalOpen(false);
      setLessonName('');
      setLessonDescription('');
      setLessonFile(null);
      setUploadProgress(0);
      setEditingLesson(null);
    },
    onError: (error: any) => {
      setUploadProgress(0);
      const msg = error?.response?.data?.message || error?.message || 'Failed to save lesson.';
      toast.error(msg);
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => lessonService.deleteLesson(lessonId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['course-lessons', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-sections', courseId] });
      toast.success(res?.message || 'Lesson removed.');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete lesson.';
      toast.error(msg);
    },
  });

  // Open Section Modal
  const handleOpenSectionModal = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setSectionName(section.name);
    } else {
      setEditingSection(null);
      setSectionName('');
    }
    setIsSectionModalOpen(true);
  };

  // Open Lesson Modal
  const handleOpenLessonModal = (sectionId: string, lesson?: Lesson) => {
    setTargetSectionId(sectionId);
    setUploadProgress(0);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonName(lesson.name);
      setLessonDescription(lesson.description || '');
      setTargetSectionId(lesson.sectionId || sectionId);
    } else {
      setEditingLesson(null);
      setLessonName('');
      setLessonDescription('');
    }
    setLessonFile(null);
    setIsLessonModalOpen(true);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setLessonFile(file);
      if (!lessonName) {
        // Autopopulate lesson name from file name without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setLessonName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  if (isLoadingCourse || isLoadingSections || isLoadingLessons) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent dark:border-indigo-400"></div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Loading course curriculum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Navigation */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              to="/provider/dashboard"
              className="inline-flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Dashboard
            </Link>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Curriculum Builder
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                {course?.title || 'Course'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Structure chapters, upload HD video lessons, and arrange course materials.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <Link
              to={`/provider/courses/${courseId}/edit`}
              className="px-3.5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Edit Course Info
            </Link>
            <button
              onClick={() => handleOpenSectionModal()}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Section
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">Total Sections</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white">{sections.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">Total Lessons</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white">{lessons.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">Curriculum View</p>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {sections.length > 0 ? 'Ready for Students' : 'Draft Mode'}
                </p>
              </div>
            </div>
            {sections.length > 0 && (
              <div className="flex space-x-1">
                <button
                  onClick={() => toggleAllSections(true)}
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1.5 py-1"
                >
                  Expand All
                </button>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <button
                  onClick={() => toggleAllSections(false)}
                  className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 hover:underline px-1.5 py-1"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sections List */}
        {sections.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
              <FolderPlus className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No sections added yet</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Start building your course structure by creating your first module or chapter.
            </p>
            <button
              onClick={() => handleOpenSectionModal()}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Section
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, sIdx) => {
              const sectionLessons = lessons.filter((l) => l.sectionId === section.id);
              const isOpen = openSections[section.id] !== false;

              return (
                <div
                  key={section.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200"
                >
                  {/* Section Head */}
                  <div className="p-4 sm:p-5 bg-gray-50/75 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center space-x-3 text-left focus:outline-none flex-1 group"
                    >
                      <div className="p-1 rounded-lg bg-gray-200/50 dark:bg-gray-700/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 transition">
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                          Section {sIdx + 1}: {section.name}
                        </h2>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                          {sectionLessons.length} {sectionLessons.length === 1 ? 'lesson' : 'lessons'}
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenLessonModal(section.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Lesson
                      </button>
                      <button
                        onClick={() => handleOpenSectionModal(section)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        title="Edit Section Name"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setSectionToDelete({ id: section.id, name: section.name })}
                        className="p-1.5 text-rose-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        title="Delete Section"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons List inside Section */}
                  {isOpen && (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                      {sectionLessons.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-400 dark:text-gray-500 italic bg-gray-50/25 dark:bg-gray-950/20">
                          No lessons in this section yet. Click &quot;Add Lesson&quot; to upload video or document content.
                        </div>
                      ) : (
                        sectionLessons.map((lesson, lIdx) => {
                          const mediaType = getLessonMediaType(lesson.lessonUrl);

                          const getMediaBadge = () => {
                            if (!lesson.lessonUrl) return null;
                            switch (mediaType) {
                              case 'pdf':
                                return (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 flex-shrink-0">
                                    <FileText className="h-3 w-3 mr-0.5" />
                                    PDF Document
                                  </span>
                                );
                              case 'image':
                                return (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 flex-shrink-0">
                                    <ImageIcon className="h-3 w-3 mr-0.5" />
                                    Image / Diagram
                                  </span>
                                );
                              case 'video':
                              default:
                                return (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40 flex-shrink-0">
                                    <CheckCircle2 className="h-3 w-3 mr-0.5" />
                                    Video Uploaded
                                  </span>
                                );
                            }
                          };

                          const getMediaIcon = () => {
                            switch (mediaType) {
                              case 'pdf':
                                return <FileText className="h-4 w-4 text-rose-500" />;
                              case 'image':
                                return <ImageIcon className="h-4 w-4 text-emerald-500" />;
                              case 'video':
                              default:
                                return <Video className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
                            }
                          };

                          return (
                            <div
                              key={lesson.id}
                              className="p-4 sm:px-5 flex items-center justify-between hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition"
                            >
                              <div className="flex items-center space-x-3.5 min-w-0 flex-1 mr-4">
                                <div className="p-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 flex-shrink-0">
                                  {getMediaIcon()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                      {lIdx + 1}. {lesson.name}
                                    </h3>
                                    {getMediaBadge()}
                                  </div>
                                  <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">
                                    {lesson.description || 'No description provided'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 flex-shrink-0">
                                {lesson.lessonUrl && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewVideo({ url: lesson.lessonUrl, title: lesson.name })
                                    }
                                    className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl border border-indigo-100 dark:border-indigo-900/40 transition"
                                    title="Preview Lesson Media"
                                  >
                                    <Play className="h-3 w-3 mr-1 fill-current" />
                                    Preview
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenLessonModal(section.id, lesson)}
                                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                  title="Edit Lesson"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setLessonToDelete({ id: lesson.id, name: lesson.name })
                                  }
                                  className="p-1.5 text-rose-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                                  title="Delete Lesson"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
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
        )}

        {/* Section Create / Edit Modal */}
        {isSectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {editingSection ? 'Edit Section' : 'Create New Section'}
                </h3>
                <button
                  onClick={() => setIsSectionModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Section Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    placeholder="e.g. 1. Introduction & Environment Setup"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && sectionName.trim() && !saveSectionMutation.isPending) {
                        saveSectionMutation.mutate();
                      }
                    }}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                    Keep section titles concise and descriptive of the module topic.
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setIsSectionModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveSectionMutation.mutate()}
                    disabled={!sectionName.trim() || saveSectionMutation.isPending}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition flex items-center space-x-1.5"
                  >
                    {saveSectionMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingSection ? 'Update Section' : 'Create Section'}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lesson Create / Edit Modal */}
        {isLessonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Video className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {editingLesson ? 'Edit Lesson' : 'Upload New Lesson'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsLessonModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Section selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Assigned Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={targetSectionId}
                    onChange={(e) => setTargetSectionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lesson Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Lesson Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                    placeholder="e.g. Installing React & Configuring Tailwind CSS"
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                {/* Lesson Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Lesson Notes / Description <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={lessonDescription}
                    onChange={(e) => setLessonDescription(e.target.value)}
                    placeholder="Key concepts covered, links to code repositories, timestamps..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                {/* Lesson Video Upload (Required on create) */}
                {!editingLesson && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Video / Media File <span className="text-rose-500">*</span>
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition cursor-pointer ${
                        isDragging
                          ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-gray-50/40 dark:bg-gray-800/30'
                      }`}
                    >
                      <label className="flex flex-col items-center justify-center w-full cursor-pointer">
                        {lessonFile ? (
                          <div className="flex flex-col items-center text-center">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-2">
                              <FileVideo className="h-7 w-7" />
                            </div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white max-w-xs truncate">
                              {lessonFile.name}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                              {formatFileSize(lessonFile.size)}
                            </p>
                            <span className="mt-2 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                              Click or drop to replace file
                            </span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                              Choose a media file (Video, PDF, Image) or drag & drop here
                            </span>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                              Supports MP4, WebM, MKV, MOV, PDF, PNG, JPG, WebP
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="video/*,image/*,.pdf,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setLessonFile(file);
                              if (!lessonName) {
                                const cleanName = file.name
                                  .replace(/\.[^/.]+$/, '')
                                  .replace(/[-_]/g, ' ');
                                setLessonName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Upload Progress Bar */}
                {saveLessonMutation.isPending && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
                      <span>Uploading & Processing Media...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setIsLessonModalOpen(false)}
                    disabled={saveLessonMutation.isPending}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveLessonMutation.mutate()}
                    disabled={
                      !lessonName.trim() ||
                      (!editingLesson && !lessonFile) ||
                      saveLessonMutation.isPending
                    }
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition flex items-center space-x-1.5"
                  >
                    {saveLessonMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                        <span>{editingLesson ? 'Updating...' : 'Uploading...'}</span>
                      </>
                    ) : (
                      <span>{editingLesson ? 'Save Changes' : 'Upload Lesson'}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lesson Media Preview Modal */}
        {previewVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 rounded-3xl max-w-4xl w-full p-4 shadow-2xl border border-gray-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 px-2 border-b border-gray-800 mb-3">
                <div className="flex items-center space-x-2">
                  <Play className="h-4 w-4 text-indigo-400 fill-current" />
                  <h3 className="text-xs font-bold text-white truncate max-w-md">
                    Preview: {previewVideo.title}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewVideo(null)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="w-full flex items-center justify-center">
                <LessonViewer
                  lessonUrl={previewVideo.url}
                  lessonName={previewVideo.title}
                  autoPlay={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Delete Section Confirmation Modal */}
        <ConfirmModal
          isOpen={!!sectionToDelete}
          onClose={() => setSectionToDelete(null)}
          onConfirm={() => {
            if (sectionToDelete) {
              deleteSectionMutation.mutate(sectionToDelete.id);
              setSectionToDelete(null);
            }
          }}
          title="Delete Section"
          message={`Are you sure you want to delete "${sectionToDelete?.name}" and all its associated lessons? This action cannot be undone.`}
          confirmText="Delete Section"
          variant="danger"
          isLoading={deleteSectionMutation.isPending}
        />

        {/* Delete Lesson Confirmation Modal */}
        <ConfirmModal
          isOpen={!!lessonToDelete}
          onClose={() => setLessonToDelete(null)}
          onConfirm={() => {
            if (lessonToDelete) {
              deleteLessonMutation.mutate(lessonToDelete.id);
              setLessonToDelete(null);
            }
          }}
          title="Delete Lesson"
          message={`Are you sure you want to permanently delete lesson "${lessonToDelete?.name}"?`}
          confirmText="Delete Lesson"
          variant="danger"
          isLoading={deleteLessonMutation.isPending}
        />
      </div>
    </div>
  );
};

export default CourseCurriculum;
