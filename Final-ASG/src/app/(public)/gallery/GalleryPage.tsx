"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PageWrapper from '@/components/layout/PageWrapper/PageWrapper';
import SectionHeading from '@/components/common/SectionHeading/SectionHeading';
import Lightbox from '@/components/common/Lightbox/Lightbox';

export default function GalleryPage({ entries }) {
  const [yearFilter, setYearFilter] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImages, setActiveImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  useEffect(() => {
    if (highlightId) {
      const entry = (entries || []).find((e) => e.id === highlightId);
      if (entry) {
        setActiveImages(entry.photos || []);
        setLightboxIndex(0);
        setLightboxOpen(true);
        setTimeout(() => {
          const el = document.getElementById(`gallery-entry-${highlightId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.borderColor = 'var(--apex-primary)';
            el.style.boxShadow = '0 0 15px rgba(255, 90, 20, 0.4)';
          }
        }, 150);
      }
    }
  }, [highlightId, entries]);

  const filteredEntries = (entries || []).filter((entry) => {
    return yearFilter === 'All' || entry.eventDate?.startsWith(yearFilter);
  });

  const triggerLightbox = (photos, index) => {
    setActiveImages(photos);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <PageWrapper>
      <div className="container">
        <SectionHeading
          overline="Ecosystem Logs"
          title="Chronological Timeline"
          subtitle="Explore our journey, achievements, and community milestones from 2024 to present."
        />

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          backgroundColor: 'var(--apex-bg-surface)',
          border: '1px solid var(--apex-border-dark)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-3) var(--space-4)',
          marginBottom: 'var(--space-7)',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '750px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--apex-text-muted)', fontWeight: '700', marginRight: '6px' }}>YEAR:</span>
            {['All', '2026', '2025', '2024', '2023'].map((year) => (
              <button
                key={year}
                onClick={() => setYearFilter(year)}
                style={{
                  backgroundColor: yearFilter === year ? 'var(--apex-primary)' : 'var(--apex-bg-surface-elevated)',
                  color: yearFilter === year ? '#fff' : 'var(--apex-text-white)',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {filteredEntries.length > 0 ? (
          <div style={{ position: 'relative', maxWidth: '850px', margin: '0 auto', padding: '20px 0' }}>
            <div style={{ position: 'absolute', left: '120px', top: '10px', bottom: '10px', width: '2px', background: 'var(--apex-border-dark)', zIndex: 1 }} />
            {filteredEntries.map((entry) => (
              <div key={entry.id} id={`gallery-entry-${entry.id}`} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 'var(--space-7)', position: 'relative' }}>
                <div style={{ width: '100px', textAlign: 'right', paddingRight: '24px', paddingTop: '6px', fontSize: '0.9rem', fontWeight: '800', color: 'var(--apex-primary)', fontFamily: 'Fira Code, monospace', zIndex: 2 }}>
                  {entry.eventDate?.slice(5, 10)}
                  <div style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--apex-text-muted)', marginTop: '2px' }}>
                    {entry.eventDate?.slice(0, 4)}
                  </div>
                </div>
                <div style={{ position: 'absolute', left: '121px', top: '14px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--apex-primary)', transform: 'translateX(-50%)', zIndex: 2, boxShadow: '0 0 0 4px var(--apex-bg-base)' }} />
                <div style={{ flex: 1, marginLeft: '40px', backgroundColor: 'var(--apex-bg-surface)', border: '1px solid var(--apex-border-dark)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 0, transition: 'border-color var(--transition-base), box-shadow var(--transition-base)' }}>
                  <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                    <div>
                      <h4 className="heading-sm" style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--apex-text-white)' }}>{entry.title}</h4>
                      <p className="body-sm" style={{ color: 'var(--apex-text-muted)', lineHeight: '1.6' }}>{entry.description}</p>
                    </div>
                  </div>
                  <div style={{ position: 'relative', overflow: 'hidden', height: '100%', minHeight: '220px', backgroundColor: 'var(--apex-bg-surface-elevated)' }}>
                    <img
                      src={entry.coverPhoto}
                      alt={entry.title}
                      onClick={() => triggerLightbox(entry.photos, 0)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in', transition: 'transform var(--transition-base)' }}
                    />
                    {entry.photos?.length > 1 && (
                      <div onClick={() => triggerLightbox(entry.photos, 1)} style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: 'rgba(17,24,39,0.85)', color: '#fff', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                        +{entry.photos.length - 1} Photos
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-7) 0', color: 'var(--apex-text-muted)', border: '1px dashed var(--apex-border-dark)', borderRadius: 'var(--radius-md)' }}>
            No entries match the selected filters.
          </div>
        )}

        {lightboxOpen && (
          <Lightbox
            images={activeImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            onPrev={() => setLightboxIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length)}
            onNext={() => setLightboxIndex((prev) => (prev + 1) % activeImages.length)}
          />
        )}
      </div>
    </PageWrapper>
  );
}
