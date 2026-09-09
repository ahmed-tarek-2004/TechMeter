import React from 'react';
import { getLessonMediaType, LessonMediaType, formatMediaUrl } from '../../utils/mediaUtils';
import { VideoPlayer } from './VideoPlayer';
import { PdfViewer } from './PdfViewer';
import { ImageViewer } from './ImageViewer';
import { PlayCircle, AlertCircle } from 'lucide-react';

interface LessonViewerProps {
  lessonUrl?: string | null;
  lessonName?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
  playbackRate?: number;
  onPlaybackRateChange?: (rate: number) => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lessonUrl,
  lessonName,
  onEnded,
  autoPlay = true,
  playbackRate = 1,
  onPlaybackRateChange,
}) => {
  if (!lessonUrl) {
    return (
      <div className="w-full aspect-video bg-gray-950 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-gray-900 shadow-2xl">
        <PlayCircle className="h-16 w-16 text-indigo-500 mx-auto mb-3 opacity-50 animate-pulse" />
        <p className="text-sm font-bold text-gray-200">
          {lessonName || 'Select a lesson to begin learning'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          No video or document source has been uploaded for this lesson yet.
        </p>
      </div>
    );
  }

  const mediaType: LessonMediaType = getLessonMediaType(lessonUrl);
  const normalizedUrl = formatMediaUrl(lessonUrl);

  switch (mediaType) {
    case 'video':
      return (
        <VideoPlayer
          src={normalizedUrl}
          title={lessonName}
          onEnded={onEnded}
          autoPlay={autoPlay}
          playbackRate={playbackRate}
          onPlaybackRateChange={onPlaybackRateChange}
        />
      );

    case 'pdf':
      return (
        <PdfViewer
          src={normalizedUrl}
          title={lessonName}
          onFinished={onEnded}
        />
      );

    case 'image':
      return (
        <ImageViewer
          src={normalizedUrl}
          title={lessonName}
        />
      );

    default:
      return (
        <VideoPlayer
          src={normalizedUrl}
          title={lessonName}
          onEnded={onEnded}
          autoPlay={autoPlay}
          playbackRate={playbackRate}
          onPlaybackRateChange={onPlaybackRateChange}
        />
      );
  }
};
