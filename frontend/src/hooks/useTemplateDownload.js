import { useState } from 'react';

/**
 * Custom hook for handling template downloads
 * Usage: const { download, loading, error } = useTemplateDownload();
 */
export function useTemplateDownload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const download = async (templateName, filename) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/templates/download/${templateName}`,
        {
          credentials: 'include',
          method: 'GET'
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download template: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${templateName}_template.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      console.error('Template download error:', err);
      setError(err.message || 'Failed to download template');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    download,
    loading,
    error,
    clearError: () => setError(null)
  };
}
