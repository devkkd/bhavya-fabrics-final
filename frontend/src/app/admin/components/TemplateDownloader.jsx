'use client';

import { Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useTemplateDownload } from '@/hooks/useTemplateDownload';

/**
 * Reusable Template Downloader Component
 * Used in products, bulk import, and other admin sections
 */
export function TemplateDownloader({ 
  templateName, 
  templateLabel = 'Download Template',
  compact = false,
  showMessage = true 
}) {
  const { download, loading, error, clearError } = useTemplateDownload();
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    const filename = `${templateName}_template.xlsx`;
    const result = await download(templateName, filename);
    
    if (result && showMessage) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
          loading
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }`}
        title={`Download ${templateName} template`}
      >
        <Download className="w-4 h-4" />
        {loading ? 'Downloading...' : templateLabel}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 text-sm font-medium">Download Error</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-700 text-xs font-medium mt-1 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-700 text-sm">Template downloaded successfully!</p>
          </div>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
          loading
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        <Download className="w-5 h-5" />
        {loading ? 'Downloading...' : templateLabel}
      </button>
    </div>
  );
}

export default TemplateDownloader;
