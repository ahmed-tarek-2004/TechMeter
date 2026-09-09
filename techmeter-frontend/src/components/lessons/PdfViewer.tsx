import React, { useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  CheckCircle,
} from 'lucide-react';

interface PdfViewerProps {
  src: string;
  title?: string;
  onFinished?: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ src, title, onFinished }) => {
  const [zoom, setZoom] = useState<number>(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(200, prev + 20));
  const handleZoomOut = () => setZoom((prev) => Math.max(50, prev - 20));

  return (
    <div className="w-full flex flex-col bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      {/* Top Toolbar */}
      <div className="bg-gray-850 px-4 py-3 border-b border-gray-800 flex items-center justify-between text-xs text-white">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
            <FileText className="h-4 w-4" />
          </div>
          <span className="font-bold truncate max-w-sm">{title || 'PDF Document'}</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-xl border border-gray-700">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-indigo-400 transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] font-semibold w-10 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-indigo-400 transition"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Open in New Window */}
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl border border-gray-700 transition"
            title="Open Fullscreen in New Window"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          {/* Download button */}
          <a
            href={src}
            download
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download PDF
          </a>

          {onFinished && (
            <button
              onClick={onFinished}
              className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Mark Read
            </button>
          )}
        </div>
      </div>

      {/* PDF Container Frame */}
      <div className="w-full bg-gray-950 flex items-center justify-center p-2 min-h-[500px] lg:min-h-[650px]">
        <iframe
          src={`${src}#toolbar=1&navpanes=0&scrollbar=1&zoom=${zoom}`}
          title={title || 'Document Viewer'}
          className="w-full h-[650px] rounded-xl border border-gray-800 bg-white"
        />
      </div>
    </div>
  );
};
