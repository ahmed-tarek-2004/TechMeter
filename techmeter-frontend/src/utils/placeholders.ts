export const createPlaceholderImage = (text: string = 'Image', width: number = 400, height: number = 200): string => {
  // Create a data URL for an SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" fill="#6b7280" text-anchor="middle" dy=".3em">
        ${text}
      </text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const coursePlaceholder = createPlaceholderImage('Course', 400, 200);
export const profilePlaceholder = createPlaceholderImage('Profile', 100, 100);
export const imagePlaceholder = createPlaceholderImage('Image', 300, 300);
