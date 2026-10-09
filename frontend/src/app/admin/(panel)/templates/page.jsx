'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/templates/list`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err.message || 'Failed to load templates');
      // Set default templates if API fails
      setTemplates([
        { name: 'rawMaterials', filename: 'rawMaterials_template.xlsx', path: '/api/templates/download/rawMaterials' },
        { name: 'readyMade', filename: 'readyMade_template.xlsx', path: '/api/templates/download/readyMade' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async (templateName, filename) => {
    try {
      setDownloading(templateName);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/templates/download/${templateName}`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download template: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage(`${filename} downloaded successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to download template');
    } finally {
      setDownloading(null);
    }
  };

  const templateInfo = [
    {
      id: 'rawMaterials',
      name: 'Raw Materials Template',
      description: 'For meter/raw material products (fabrics, yarns, etc.)',
      filename: 'rawMaterials_template.xlsx',
      uses: ['Fabric rolls', 'Yarns', 'Raw materials sold by meter'],
      features: [
        'Meter configuration (min, max, increment)',
        'Price per meter',
        'Color options with hex codes',
        'Bulk order notes'
      ]
    },
    {
      id: 'readyMade',
      name: 'Ready-Made Template',
      description: 'For piece/ready-made products (garments, finished items)',
      filename: 'readyMade_template.xlsx',
      uses: ['T-shirts', 'Shirts', 'Dresses', 'Pre-assembled products'],
      features: [
        'Price per piece',
        'Color and size variants',
        'Stock management',
        'Multiple variant pricing'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Upload Templates</h1>
          <p className="text-gray-600">Download Excel templates for bulk product uploads</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Templates Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {templateInfo.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-6 h-6" />
                    <h2 className="text-xl font-bold">{template.name}</h2>
                  </div>
                  <p className="text-blue-100 text-sm">{template.description}</p>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Uses */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Best For</h3>
                    <ul className="space-y-2">
                      {template.uses.map((use, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          {use}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Features</h3>
                    <ul className="space-y-2">
                      {template.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => downloadTemplate(template.id, template.filename)}
                    disabled={downloading === template.id}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                      downloading === template.id
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    {downloading === template.id ? 'Downloading...' : 'Download Template'}
                  </button>

                  {/* File Info */}
                  <p className="text-xs text-gray-500 text-center mt-3">{template.filename}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Download the Template</h3>
                <p className="text-gray-600 text-sm">
                  Choose the appropriate template for your product type (Raw Materials or Ready-Made) and download the Excel file.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Fill in Your Data</h3>
                <p className="text-gray-600 text-sm">
                  Open the template in Excel and fill in your product information. Follow the column headers and validation hints provided in the template comments.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload Images</h3>
                <p className="text-gray-600 text-sm">
                  Upload product images to the media library using the naming convention specified in the template (e.g., SKU_1.jpg, SKU_2.jpg).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Bulk Import</h3>
                <p className="text-gray-600 text-sm">
                  Save the file and use the bulk import feature in the Products section to upload your filled template.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Review & Publish</h3>
                <p className="text-gray-600 text-sm">
                  Review the imported products in draft status, make any necessary adjustments, and publish them when ready.
                </p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold text-gray-900 mb-4">Tips for Success</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-3 text-gray-700 text-sm">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Ensure all SKUs are unique across your product catalog</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Verify that categories and sub-categories exist in the system before uploading</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Use proper JSON formatting for Colors and Variants columns</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Double-check image filenames match the naming convention exactly</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Start with draft status to review before publishing products</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
