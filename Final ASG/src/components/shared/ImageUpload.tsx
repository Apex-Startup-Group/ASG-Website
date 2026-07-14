'use client';

import React, { useState, useRef, DragEvent } from 'react';
import { UploadCloud, Loader2, Trash2 } from 'lucide-react';
import { UPLOAD_CONFIGS } from '@/lib/constants/uploads';
import { getCroppedImg, Area } from '@/lib/utils/image';
import CropModal from './CropModal';

interface ImageUploadProps {
  uploadType: keyof typeof UPLOAD_CONFIGS;
  value?: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ uploadType, value, onChange }: ImageUploadProps) {
  const config = UPLOAD_CONFIGS[uploadType];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!config) {
    return <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>Invalid upload type: {uploadType}</div>;
  }

  // Format file size helper
  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  // Validate file type and size
  const validateFile = (file: File): boolean => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      setError('Allowed formats: .jpg, .jpeg, .png, .webp');
      return false;
    }

    if (file.size > config.maxSize) {
      setError(`File is too large. Max size: ${formatSize(config.maxSize)}`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (validateFile(file)) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setIsCropOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  // Trigger file dialog
  const handleClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  // Confirm crop and execute upload
  const handleCropConfirm = async (croppedAreaPixels: Area) => {
    setIsCropOpen(false);
    if (!imageSrc) return;

    try {
      setIsUploading(true);
      setError(null);

      // 1. Optimize image (crop, resize, convert to WebP)
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, config.maxWidth);
      if (!croppedBlob) {
        throw new Error('Image optimization failed.');
      }

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append('file', croppedBlob, 'upload.webp');
      formData.append('bucket', config.bucket);
      formData.append('uploadType', uploadType);

      // 3. Post to API
      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to upload image.');
      }

      const data = await res.json();
      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
      setImageSrc(null);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Upload Zone */}
      <div
        onClick={value ? undefined : handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          position: 'relative',
          width: '100%',
          border: '2px dashed #27272a',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: value ? 'default' : 'pointer',
          backgroundColor: value ? 'rgba(24, 24, 27, 0.2)' : 'rgba(24, 24, 27, 0.4)',
          transition: 'all 0.2s',
          pointerEvents: isUploading ? 'none' : 'auto',
          boxSizing: 'border-box'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
        />

        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: '8px' }}>
            <Loader2 style={{ height: '32px', width: '32px', color: '#0284c7', animation: 'spin 1s linear infinite' }} />
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa', margin: 0 }}>Optimizing & Uploading...</p>
          </div>
        ) : value ? (
          // Preview state
          <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', maxHeight: '240px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #27272a' }}>
              <img
                src={value}
                alt={`${config.label} Preview`}
                style={{ maxHeight: '240px', width: 'auto', display: 'block', borderRadius: '8px' }}
              />
              {/* Delete Button */}
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  padding: '8px',
                  backgroundColor: 'rgba(220, 38, 38, 0.9)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Trash2 style={{ height: '16px', width: '16px' }} />
              </button>
            </div>
            <p style={{ marginTop: '8px', fontSize: '0.75rem', color: '#71717a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px', margin: 0 }}>
              {value}
            </p>
          </div>
        ) : (
          // Dropzone Empty State
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px', padding: '16px 0' }}>
            <div style={{ padding: '12px', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
              <UploadCloud style={{ height: '24px', width: '24px', color: '#a1a1aa' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e4e4e7', margin: 0 }}>
                Click to upload or drag & drop
              </p>
              <p style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '4px', margin: 0 }}>
                {config.label} ({config.aspectRatio === 16/9 ? '16:9' : config.aspectRatio === 4/3 ? '4:3' : '1:1'}) • WebP, JPG, PNG up to {formatSize(config.maxSize)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: 500, margin: 0 }}>{error}</p>}

      {/* Crop Modal */}
      {imageSrc && (
        <CropModal
          isOpen={isCropOpen}
          imageSrc={imageSrc}
          aspectRatio={config.aspectRatio}
          onClose={() => {
            setIsCropOpen(false);
            setImageSrc(null);
          }}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
