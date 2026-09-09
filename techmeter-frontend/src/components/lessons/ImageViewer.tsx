import React, { useState } from 'react';
import {
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ExternalLink,
} from 'lucide-react';

interface ImageViewerProps {
  src: string;
  title?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ src, title }) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  const handleZoomIn = () => setScale((prev) => Math.min(3, prev + 0.25));
  const handleZoomOut = () => setScale((prev) => Math.max(0.5, prev - 0.25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <div className="w-full flex flex-col bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      {/* Top Toolbar */}
      <div className="bg-gray-850 px-4 py-3 border-b border-gray-800 flex items-center justify-between text-xs text-white">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <ImageIcon className="h-4 w-4" />
          </div>
          <span className="font-bold truncate max-w-sm">{title || 'Lesson Diagram / Image'}</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom & Rotation Controls */}
          <div className="flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-xl border border-gray-700">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-indigo-400 transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="text-[11px] font-semibold w-12 text-center hover:text-indigo-400 transition"
              title="Reset View"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-indigo-400 transition"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={handleRotate}
              className="p-1 hover:text-indigo-400 transition"
              title="Rotate 90deg"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl border border-gray-700 transition"
            title="Open Full Image"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          <a
            href={src}
            download
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download
          </a>
        </div>
      </div>

      {/* Image Stage Container */}
      <div className="w-full bg-black/90 min-h-[480px] lg:min-h-[580px] flex items-center justify-center p-6 overflow-hidden relative">
        <img
          src={src}
          alt={title || 'Lesson Image'}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-out',
          }}
          className="max-h-[540px] max-w-full object-contain rounded-xl shadow-2xl select-none"
        />
      </div>
    </div>
  );
};
