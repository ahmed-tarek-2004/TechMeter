import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  FastForward,
  Settings,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { formatMediaUrl, getYouTubeEmbedUrl, getVimeoEmbedUrl } from '../../utils/mediaUtils';

interface VideoPlayerProps {
  src: string;
  title?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
  playbackRate?: number;
  onPlaybackRateChange?: (rate: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  onEnded,
  autoPlay = true,
  playbackRate = 1,
  onPlaybackRateChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [hasError, setHasError] = useState(false);

  const controlsTimeoutRef = useRef<any>(null);

  // Normalize the video source URL
  const videoSrc = formatMediaUrl(src);

  // Detect YouTube / Vimeo embeds
  const youtubeEmbedUrl = getYouTubeEmbedUrl(src);
  const vimeoEmbedUrl = getVimeoEmbedUrl(src);
  const isEmbed = !!(youtubeEmbedUrl || vimeoEmbedUrl);

  // Sync playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, src]);

  // Handle Fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Format time (seconds to MM:SS or HH:MM:SS)
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (h > 0) {
      return `${h}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
      setHasError(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        Math.max(0, videoRef.current.currentTime + seconds),
        duration
      );
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettings(false);
      }
    }, 2800);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // YouTube / Vimeo embed player (uses iframe instead of <video>)
  if (isEmbed) {
    const embedUrl = youtubeEmbedUrl || vimeoEmbedUrl!;
    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
      >
        <iframe
          src={embedUrl}
          title={title || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center select-none group"
    >
      {/* HTML5 Native Video element */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay={autoPlay}
        playsInline
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Loading Spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-10">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            <span className="text-xs text-gray-300 font-medium">Buffering video...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 p-6 text-center z-20">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">Failed to load video stream</h4>
          <p className="text-xs text-gray-400 max-w-md mb-4">
            The video file could not be played directly in your browser. This may be a CORS issue, an unsupported format, or the file is still being processed. Try opening it in a new tab.
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              Retry
            </button>
            <a
              href={videoSrc}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              Open Video in New Tab
            </a>
          </div>
        </div>
      )}

      {/* Center Big Play Button when paused */}
      {!isPlaying && !isLoading && !hasError && (
        <button
          onClick={togglePlay}
          className="absolute z-10 p-5 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 transition duration-200 backdrop-blur-xs"
          title="Play Video"
        >
          <Play className="h-8 w-8 fill-current ml-1" />
        </button>
      )}

      {/* Top Title Overlay Bar */}
      {title && (
        <div
          className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-2xl">{title}</h3>
        </div>
      )}

      {/* Custom Bottom Video Controls Strip */}
      <div
        className={`absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 transition-opacity duration-300 flex flex-col space-y-2 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Seek Progress Bar */}
        <div className="relative w-full flex items-center group/scrubber cursor-pointer">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2.5 transition-all"
            style={{
              background: `linear-gradient(to right, #6366f1 ${progressPercent}%, rgba(75, 85, 99, 0.6) ${progressPercent}%)`,
            }}
          />
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Left: Play/Pause, Rewind, Fast Forward, Volume & Time */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={togglePlay}
              className="p-1.5 hover:bg-white/10 rounded-lg transition"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
            </button>

            <button
              onClick={() => handleSkip(-10)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition hidden sm:flex items-center"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="text-[10px] ml-0.5 font-bold">10</span>
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition hidden sm:flex items-center"
              title="Forward 10 seconds"
            >
              <FastForward className="h-3.5 w-3.5" />
              <span className="text-[10px] ml-0.5 font-bold">10</span>
            </button>

            {/* Volume control */}
            <div className="flex items-center space-x-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 hover:bg-white/10 rounded-lg transition"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-rose-400" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 sm:w-18 h-1 bg-gray-700 rounded-lg appearance-none accent-indigo-500 cursor-pointer hidden group-hover/vol:block sm:block"
              />
            </div>

            {/* Timestamp */}
            <span className="text-[11px] font-medium text-gray-300 ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: Speed Settings & Fullscreen */}
          <div className="flex items-center space-x-2 relative">
            {/* Speed Selector Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold transition flex items-center space-x-1"
                title="Playback Speed"
              >
                <span>{playbackRate}x</span>
                <Settings className="h-3 w-3" />
              </button>

              {/* Speed Popover */}
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 w-28 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-1.5 z-30 space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Speed
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        if (onPlaybackRateChange) onPlaybackRateChange(rate);
                        setShowSettings(false);
                      }}
                      className={`w-full text-left px-2 py-1 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                        playbackRate === rate
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <span>{rate}x</span>
                      {rate === 1 && <span className="text-[10px] opacity-75">Norm</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-white/10 rounded-lg transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
