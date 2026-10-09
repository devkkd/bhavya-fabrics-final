'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, File, AlertCircle, CheckCircle, X, Loader, Download } from 'lucide-react';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');

export default function BulkUploadPanel() {
  const [templateType, setTemplateType] = useState('raw');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imageFolder, setImageFolder] = useState(null);
  const [dragActiveFile, setDragActiveFile] = useState(false);
  const [dragActiveImages, setDragActiveImages] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Drag handlers for Excel file
  const handleDragFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveFile(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDropFile = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveFile(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.includes('sheet') || file.type.includes('excel')) {
        setUploadedFile(file);
        setError(null);
      } else {
        setError('❌ Please upload an Excel file (.xlsx or .xls)');
      }
    }
  }, []);

  // Drag handlers for Images
  const handleDragImages = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveImages(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDropImages = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveImages(false);

    const files = e.dataTransfer.items;
    if (files) {
      const imageFiles = [];
      for (let i = 0; i < files.length; i++) {
        if (files[i].kind === 'file') {
          const file = files[i].getAsFile();
          if (file && (file.type.startsWith('image/') || file.webkitRelativePath)) {
            imageFiles.push(file);
          }
        }
      }
      
      if (imageFiles.length > 0) {
        const folderPath = imageFiles[0].webkitRelativePath || imageFiles[0].name;
        setImageFolder({
          files: imageFiles,
          path: folderPath.split('/')[0] || 'images',
          count: imageFiles.length,
        });
        setError(null);
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImageFolder({
        files: files,
        path: 'images',
        count: files.length,
      });
      setError(null);
    }
  };

  const handleValidate = async () => {
    if (!uploadedFile) {
      setError('❌ Please select an Excel file');
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('templateType', templateType);

      const response = await fetch(`${API_URL}/bulk-upload/validate`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Validation failed');
      }

      setValidation(data.validation);
      setUploadResult(null);
      setActiveTab('validation');
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!uploadedFile) {
      setError('❌ Please select an Excel file');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setActiveTab('progress');

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('templateType', templateType);
      if (imageFolder) {
        formData.append('imageFolder', imageFolder.path);
      }

      const response = await fetch(`${API_URL}/bulk-upload/process`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Import failed');
      }

      // Poll for progress
      const uploadId = data.uploadId;
      const pollInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch(
            `${API_URL}/bulk-upload/progress/${uploadId}`,
            { credentials: 'include' }
          );
          const progressData = await progressResponse.json();

          if (progressData.success) {
            setUploadProgress(progressData.progress.percentage);

            if (progressData.progress.status === 'completed') {
              clearInterval(pollInterval);
              setUploadResult(progressData.progress);
              setUploading(false);
              setActiveTab('results');
            }
          }
        } catch (err) {
          console.error('Progress poll error:', err);
        }
      }, 1000);
    } catch (err) {
      setError(`❌ ${err.message}`);
      setUploading(false);
    }
  };

  const clearAll = () => {
    setUploadedFile(null);
    setImageFolder(null);
    setValidation(null);
    setUploadResult(null);
    setError(null);
    setActiveTab('upload');
    setUploadProgress(0);
  };

  const styles = {
    container: {
      width: '100%',
      background: '#FFFFFF',
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderColor: '#E3DCD4',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    },
    
    tabBar: {
      display: 'flex',
      borderBottomWidth: '1.5px',
      borderBottomStyle: 'solid',
      borderBottomColor: '#E3DCD4',
      background: '#FAFAF8',
    },
    
    tab: {
      flex: 1,
      padding: '16px 20px',
      borderWidth: 0,
      borderBottomWidth: '3px',
      borderBottomStyle: 'solid',
      borderBottomColor: 'transparent',
      background: 'transparent',
      color: '#888888',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '-1.5px',
    },
    
    tabActive: {
      color: '#295C65',
      borderBottomColor: '#295C65',
      background: '#FFFFFF',
    },
    
    content: {
      padding: '32px',
    },
    
    section: {
      marginBottom: '28px',
    },
    
    sectionLabel: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    
    typeSelector: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginBottom: '20px',
    },
    
    typeButton: {
      padding: '14px 16px',
      borderRadius: '10px',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: '#E3DCD4',
      background: '#FFFFFF',
      color: '#666666',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left',
    },
    
    typeButtonActive: {
      background: '#295C65',
      color: '#FFFFFF',
      borderColor: '#295C65',
      boxShadow: '0 4px 12px rgba(41, 92, 101, 0.15)',
    },
    
    uploadBox: {
      padding: '32px 20px',
      borderWidth: '2px',
      borderStyle: 'dashed',
      borderColor: '#D9D0C5',
      borderRadius: '10px',
      background: '#FFFBF8',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
    },
    
    uploadBoxActive: {
      borderColor: '#295C65',
      background: '#F0F9FA',
      transform: 'scale(1.01)',
    },
    
    uploadIcon: {
      fontSize: '40px',
      marginBottom: '12px',
      display: 'block',
    },
    
    uploadText: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: '4px',
    },
    
    uploadSubtext: {
      fontSize: '12px',
      color: '#888888',
      marginBottom: '12px',
    },
    
    button: {
      padding: '10px 18px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '13px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
    },
    
    buttonPrimary: {
      background: '#295C65',
      color: '#FFFFFF',
    },
    
    buttonSecondary: {
      background: '#FFFFFF',
      color: '#295C65',
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderColor: '#D9D0C5',
    },
    
    buttonSmall: {
      padding: '8px 12px',
      fontSize: '12px',
    },
    
    fileInfo: {
      padding: '12px 14px',
      background: '#F5F2ED',
      borderRadius: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '12px',
      fontSize: '13px',
      color: '#666666',
    },
    
    errorBox: {
      padding: '14px 16px',
      background: '#FFF1EC',
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderColor: '#F0D5CF',
      borderRadius: '8px',
      color: '#914B3C',
      fontSize: '13px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
    },
    
    successBox: {
      padding: '14px 16px',
      background: '#F0FAF5',
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderColor: '#D5F0E3',
      borderRadius: '8px',
      color: '#2D7A5A',
      fontSize: '13px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
    },
    
    progressBar: {
      width: '100%',
      height: '8px',
      background: '#E3DCD4',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '8px',
    },
    
    progressFill: {
      height: '100%',
      background: '#295C65',
      transition: 'width 0.3s ease',
    },
    
    resultsList: {
      marginTop: '16px',
    },
    
    resultItem: {
      padding: '12px 14px',
      background: '#FAFAF8',
      borderRadius: '6px',
      marginBottom: '8px',
      fontSize: '13px',
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid',
      borderLeftColor: '#D9D0C5',
    },
    
    resultItemSuccess: {
      borderLeftColor: '#4CAF50',
      background: '#F0FAF5',
    },
    
    resultItemError: {
      borderLeftColor: '#F44336',
      background: '#FFF1EC',
    },
    
    resultsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginTop: '16px',
    },
    
    resultCard: {
      padding: '16px',
      background: '#FAFAF8',
      borderRadius: '10px',
      borderWidth: '1.5px',
      borderStyle: 'solid',
      borderColor: '#E3DCD4',
      textAlign: 'center',
    },
    
    resultCardNumber: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#295C65',
      marginBottom: '4px',
    },
    
    resultCardLabel: {
      fontSize: '12px',
      color: '#888888',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.container}>
      {/* Tab Bar */}
      <div style={styles.tabBar}>
        <button
          onClick={() => setActiveTab('upload')}
          style={{
            ...styles.tab,
            ...(activeTab === 'upload' ? styles.tabActive : {}),
          }}
        >
          📤 Upload
        </button>
        <button
          onClick={() => setActiveTab('validation')}
          disabled={!validation}
          style={{
            ...styles.tab,
            ...(activeTab === 'validation' ? styles.tabActive : {}),
            opacity: validation ? 1 : 0.5,
            cursor: validation ? 'pointer' : 'not-allowed',
          }}
        >
          ✓ Validation
        </button>
        <button
          onClick={() => setActiveTab('results')}
          disabled={!uploadResult}
          style={{
            ...styles.tab,
            ...(activeTab === 'results' ? styles.tabActive : {}),
            opacity: uploadResult ? 1 : 0.5,
            cursor: uploadResult ? 'pointer' : 'not-allowed',
          }}
        >
          📊 Results
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Error Alert */}
        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <>
            {/* Product Type Selection */}
            <div style={styles.section}>
              <div style={styles.sectionLabel}>
                <span>🎯</span> Select Product Type
              </div>
              <div style={styles.typeSelector}>
                <button
                  onClick={() => setTemplateType('raw')}
                  style={{
                    ...styles.typeButton,
                    ...(templateType === 'raw' ? styles.typeButtonActive : {}),
                  }}
                >
                  <strong>📦 Raw Materials</strong>
                  <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.85 }}>
                    Meter-based products
                  </div>
                </button>
                <button
                  onClick={() => setTemplateType('ready-made')}
                  style={{
                    ...styles.typeButton,
                    ...(templateType === 'ready-made' ? styles.typeButtonActive : {}),
                  }}
                >
                  <strong>👗 Ready-Made</strong>
                  <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.85 }}>
                    Piece-based products
                  </div>
                </button>
              </div>
            </div>

            {/* Excel File Upload */}
            <div style={styles.section}>
              <div style={styles.sectionLabel}>
                <Upload size={18} /> Excel File (Required)
              </div>
              <div
                onDragEnter={handleDragFile}
                onDragLeave={handleDragFile}
                onDragOver={handleDragFile}
                onDrop={handleDropFile}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  ...styles.uploadBox,
                  ...(dragActiveFile ? styles.uploadBoxActive : {}),
                }}
              >
                <div style={styles.uploadIcon}>📄</div>
                <div style={styles.uploadText}>
                  {uploadedFile ? uploadedFile.name : 'Drag Excel file here or click'}
                </div>
                <div style={styles.uploadSubtext}>
                  {uploadedFile
                    ? `Ready to upload (${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)`
                    : 'Supports .xlsx and .xls files'}
                </div>
              </div>
              {uploadedFile && (
                <div style={styles.fileInfo}>
                  <span>✓ {uploadedFile.name}</span>
                  <button
                    onClick={() => setUploadedFile(null)}
                    style={{
                      ...styles.button,
                      ...styles.buttonSmall,
                      background: 'transparent',
                      color: '#999999',
                      border: 'none',
                      padding: 0,
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Images Upload */}
            <div style={styles.section}>
              <div style={styles.sectionLabel}>
                <Upload size={18} /> Images (Optional)
              </div>
              <div
                onDragEnter={handleDragImages}
                onDragLeave={handleDragImages}
                onDragOver={handleDragImages}
                onDrop={handleDropImages}
                onClick={() => imageInputRef.current?.click()}
                style={{
                  ...styles.uploadBox,
                  ...(dragActiveImages ? styles.uploadBoxActive : {}),
                }}
              >
                <div style={styles.uploadIcon}>🖼️</div>
                <div style={styles.uploadText}>
                  {imageFolder ? `${imageFolder.count} images` : 'Drag image folder here or click'}
                </div>
                <div style={styles.uploadSubtext}>
                  {imageFolder
                    ? 'Folder ready for upload'
                    : 'Images will be matched to SKUs automatically'}
                </div>
              </div>
              {imageFolder && (
                <div style={styles.fileInfo}>
                  <span>✓ {imageFolder.count} image(s) in folder</span>
                  <button
                    onClick={() => setImageFolder(null)}
                    style={{
                      ...styles.button,
                      ...styles.buttonSmall,
                      background: 'transparent',
                      color: '#999999',
                      border: 'none',
                      padding: 0,
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
              <input
                ref={imageInputRef}
                type="file"
                multiple
                webkitdirectory="true"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '28px',
              }}
            >
              <button
                onClick={handleValidate}
                disabled={!uploadedFile || validating}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  opacity: validating ? 0.7 : 1,
                  cursor: validating ? 'wait' : 'pointer',
                }}
              >
                {validating ? (
                  <>
                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Validating...
                  </>
                ) : (
                  <>
                    ✓ Validate & Preview
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* VALIDATION TAB */}
        {activeTab === 'validation' && validation && (
          <>
            <div style={styles.successBox}>
              <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Validation Complete!</strong> {validation.validRows} product(s) ready to import
              </span>
            </div>

            {validation.validRows > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionLabel}>✓ Valid Products ({validation.validRows})</div>
                <div style={styles.resultsList}>
                  {validation.validRows > 0 && (
                    <div style={styles.resultItem} style={{ ...styles.resultItem, ...styles.resultItemSuccess }}>
                      <strong>✓ {validation.validRows} product(s) can be imported</strong>
                      <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                        Review the list and click Import to proceed
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {validation.invalidRows && validation.invalidRows.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionLabel}>⚠️ Errors Found ({validation.invalidRows.length})</div>
                <div style={styles.resultsList}>
                  {validation.invalidRows.map((row, idx) => (
                    <div key={idx} style={{ ...styles.resultItem, ...styles.resultItemError }}>
                      <strong>Row {row.rowNumber}:</strong> {row.errors.join(', ')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <button
                onClick={() => setActiveTab('upload')}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                ← Back to Upload
              </button>
              {validation.invalidRows?.length === 0 && (
                <button
                  onClick={handleImport}
                  disabled={uploading}
                  style={{
                    ...styles.button,
                    ...styles.buttonPrimary,
                    opacity: uploading ? 0.7 : 1,
                  }}
                >
                  {uploading ? 'Importing...' : '🚀 Import Products'}
                </button>
              )}
            </div>
          </>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && uploading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Loader
              size={48}
              style={{
                animation: 'spin 2s linear infinite',
                color: '#295C65',
                marginBottom: '20px',
                display: 'inline-block',
              }}
            />
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
              Importing Products...
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${uploadProgress}%`,
                }}
              />
            </div>
            <div style={{ marginTop: '12px', fontSize: '14px', color: '#666666' }}>
              {uploadProgress}% Complete
            </div>
          </div>
        )}

        {/* RESULTS TAB */}
        {activeTab === 'results' && uploadResult && (
          <>
            <div style={styles.successBox}>
              <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Import Complete!</strong> {uploadResult.successfulProducts?.length || 0} product(s) imported successfully
              </span>
            </div>

            <div style={styles.resultsGrid}>
              <div style={styles.resultCard}>
                <div style={styles.resultCardNumber}>{uploadResult.successfulProducts?.length || 0}</div>
                <div style={styles.resultCardLabel}>Successful</div>
              </div>
              <div style={styles.resultCard}>
                <div style={{ ...styles.resultCardNumber, color: '#F44336' }}>
                  {uploadResult.failedProducts?.length || 0}
                </div>
                <div style={styles.resultCardLabel}>Failed</div>
              </div>
              <div style={styles.resultCard}>
                <div style={styles.resultCardNumber}>{uploadResult.totalRows || 0}</div>
                <div style={styles.resultCardLabel}>Total</div>
              </div>
            </div>

            {uploadResult.successfulProducts && uploadResult.successfulProducts.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionLabel}>✓ Imported Products</div>
                <div style={styles.resultsList}>
                  {uploadResult.successfulProducts.slice(0, 5).map((product, idx) => (
                    <div key={idx} style={{ ...styles.resultItem, ...styles.resultItemSuccess }}>
                      <strong>{product.sku}</strong> - {product.title}
                    </div>
                  ))}
                  {uploadResult.successfulProducts.length > 5 && (
                    <div style={{ ...styles.resultItem, color: '#666666' }}>
                      +{uploadResult.successfulProducts.length - 5} more...
                    </div>
                  )}
                </div>
              </div>
            )}

            {uploadResult.failedProducts && uploadResult.failedProducts.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionLabel}>⚠️ Failed Products</div>
                <div style={styles.resultsList}>
                  {uploadResult.failedProducts.slice(0, 5).map((product, idx) => (
                    <div key={idx} style={{ ...styles.resultItem, ...styles.resultItemError }}>
                      <strong>{product.sku}</strong>
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>{product.errors?.[0]}</div>
                    </div>
                  ))}
                  {uploadResult.failedProducts.length > 5 && (
                    <div style={{ ...styles.resultItem, color: '#666666' }}>
                      +{uploadResult.failedProducts.length - 5} more...
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <button onClick={clearAll} style={{ ...styles.button, ...styles.buttonSecondary }}>
                ← Start New Upload
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
