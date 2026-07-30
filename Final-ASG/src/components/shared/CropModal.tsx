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
  allowFlexibleAspect?: boolean;
}

export default function CropModal({
  isOpen,
  imageSrc,
  aspectRatio,
  onClose,
  onConfirm,
  allowFlexibleAspect = true,
}: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [activeAspect, setActiveAspect] = useState<number | undefined>(aspectRatio);
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

  const ASPECT_OPTIONS = [
    { label: '1:1', value: 1 / 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:1 Wide', value: 3 / 1 },
    { label: 'Free Crop', value: undefined },
  ];

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
        maxWidth: '640px',
        backgroundColor: '#0c0c0e',
        border: '1px solid #27272a',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '92vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #27272a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#f4f4f5'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Crop & Resize Image</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              fontSize: '1.25rem',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Cropper Area */}
        <div style={{
          position: 'relative',
          flex: 1,
          minHeight: '360px',
          backgroundColor: '#18181b',
          overflow: 'hidden'
        }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={activeAspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Aspect Ratio & Zoom Control & Actions */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #27272a',
          backgroundColor: '#0c0c0e',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Aspect Ratio Selector */}
          {allowFlexibleAspect && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 500 }}>Aspect Ratio:</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {ASPECT_OPTIONS.map((opt) => {
                  const isSelected = activeAspect === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setActiveAspect(opt.value)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: isSelected ? '1px solid #FF6B00' : '1px solid #27272a',
                        backgroundColor: isSelected ? 'rgba(255, 107, 0, 0.15)' : '#18181b',
                        color: isSelected ? '#FF6B00' : '#a1a1aa'
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Zoom Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 500 }}>Zoom</span>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '4px' }}>
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
                padding: '8px 18px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#fff',
                backgroundColor: '#FF6B00',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)'
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
