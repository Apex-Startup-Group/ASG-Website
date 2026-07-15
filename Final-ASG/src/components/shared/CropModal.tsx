'use client';

import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from '@/lib/utils/image';

interface CropModalProps {
  isOpen: boolean;
  imageSrc: string;
  aspectRatio: number;
  onClose: () => void;
  onConfirm: (croppedAreaPixels: Area) => void;
}

export default function CropModal({
  isOpen,
  imageSrc,
  aspectRatio,
  onClose,
  onConfirm,
}: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  if (!isOpen) return null;

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleConfirm = () => {
    if (croppedAreaPixels) {
      onConfirm(croppedAreaPixels);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(4px)',
      padding: '16px'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '600px',
        backgroundColor: '#0c0c0e',
        border: '1px solid #27272a',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #27272a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#f4f4f5'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Crop Image</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              fontSize: '1.25rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* Cropper Area */}
        <div style={{
          position: 'relative',
          flex: 1,
          minHeight: '350px',
          backgroundColor: '#18181b',
          overflow: 'hidden'
        }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Zoom Control & Actions */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid #27272a',
          backgroundColor: '#0c0c0e',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Zoom Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{
                flex: 1,
                height: '4px',
                backgroundColor: '#27272a',
                borderRadius: '8px',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#e4e4e7',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              style={{
                padding: '8px 16px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#fff',
                backgroundColor: '#0284c7',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.2)'
              }}
            >
              Save Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
