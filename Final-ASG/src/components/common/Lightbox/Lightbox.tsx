'use client';

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Disable scrolling when lightbox is active
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  if (!images || images.length === 0) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 5, 5, 0.95)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s'
        }}
        aria-label="Close image lightbox"
      >
        <X size={24} />
      </button>

      {/* Prev Button */}
      {images.length > 1 && (
        <button 
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          style={{
            position: 'absolute',
            left: '24px',
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          aria-label="Previous image"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Main Image */}
      <div 
        style={{
          maxWidth: '85%',
          maxHeight: '80%',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={images[currentIndex]} 
          alt={`Gallery view ${currentIndex + 1}`}
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)'
          }}
        />
        
        {/* Caption count indicator */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          color: 'var(--apex-text-muted)',
          fontSize: '0.9rem'
        }}>
          Image {currentIndex + 1} of {images.length}
        </div>
      </div>

      {/* Next Button */}
      {images.length > 1 && (
        <button 
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          style={{
            position: 'absolute',
            right: '24px',
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '12px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          aria-label="Next image"
        >
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  );
}
