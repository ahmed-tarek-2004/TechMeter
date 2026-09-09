export type LessonMediaType = 'video' | 'pdf' | 'image' | 'unknown';

export const getVideoExtensions = (): string[] => [
  'mp4',
  'webm',
  'mkv',
  'mov',
  'avi',
  'wmv',
  'flv',
  'm4v',
  'mpeg',
  'mpg',
  '3gp',
  'ts',
  'mts',
  'm2ts',
  'ogv',
];

export const getImageExtensions = (): string[] => [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'bmp',
  'svg',
  'avif',
];

export const getPdfExtensions = (): string[] => ['pdf'];

/**
 * Normalizes media URL by upgrading HTTP to HTTPS (prevents Mixed Content blocking for Cloudinary/CDN)
 * and prepending backend host if given relative path.
 */
export function formatMediaUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Upgrade HTTP to HTTPS for Cloudinary and public CDN resources to prevent browser mixed content blocks
  if (trimmed.startsWith('http://res.cloudinary.com')) {
    return trimmed.replace('http://', 'https://');
  }

  // If already absolute URL or blob/data URI
  if (/^(https?:|\/\/|blob:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  // If relative path from local backend
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7165/api';
  const serverBase = apiBase.replace(/\/api\/?$/i, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${serverBase}${cleanPath}`;
}

/**
 * Extracts YouTube video ID and returns embed URL
 */
export function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(ytRegex);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&enablejsapi=1&rel=0` : null;
}

/**
 * Extracts Vimeo video ID and returns embed URL
 */
export function getVimeoEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|))(\d+)/i;
  const match = url.match(vimeoRegex);
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : null;
}

/**
 * Detects the media type from URL, file extension, or MIME type
 */
export function getLessonMediaType(url?: string | null): LessonMediaType {
  if (!url) return 'unknown';

  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  const extMatch = cleanUrl.match(/\.([a-z0-9]+)$/i);
  const ext = extMatch ? extMatch[1] : '';

  // Check for video platforms
  if (getYouTubeEmbedUrl(url) || getVimeoEmbedUrl(url)) {
    return 'video';
  }

  if (getVideoExtensions().includes(ext)) {
    return 'video';
  }

  if (getPdfExtensions().includes(ext)) {
    return 'pdf';
  }

  if (getImageExtensions().includes(ext)) {
    return 'image';
  }

  // Check URL path clues (e.g. Cloudinary, S3, blob storage signatures)
  if (cleanUrl.includes('/video/') || cleanUrl.includes('video/upload')) {
    return 'video';
  }
  if (cleanUrl.includes('/image/') || cleanUrl.includes('image/upload')) {
    return 'image';
  }
  if (cleanUrl.includes('.pdf') || cleanUrl.includes('/pdf/')) {
    return 'pdf';
  }

  // Default assumption for general media stream URLs without extensions
  return 'video';
}

/**
 * Return friendly media label and badge colors
 */
export function getMediaMeta(type: LessonMediaType) {
  switch (type) {
    case 'video':
      return {
        label: 'Video',
        color: 'indigo',
        iconName: 'Video',
      };
    case 'pdf':
      return {
        label: 'PDF Document',
        color: 'rose',
        iconName: 'FileText',
      };
    case 'image':
      return {
        label: 'Image / Diagram',
        color: 'emerald',
        iconName: 'Image',
      };
    default:
      return {
        label: 'Resource',
        color: 'gray',
        iconName: 'File',
      };
  }
}
