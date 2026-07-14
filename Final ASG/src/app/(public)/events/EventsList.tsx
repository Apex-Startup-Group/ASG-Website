"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper/PageWrapper';
import SectionHeading from '@/components/common/SectionHeading/SectionHeading';

export default function EventsList({ events, galleryEntries }) {
  const [activeTab, setActiveTab] = useState('all'); // all | upcoming | past

  const filteredEvents = (events || []).filter((event) => {
    const matchesTab = activeTab === 'all' || event.status === activeTab;
    return matchesTab;
  });

  return (
    <PageWrapper>
      <section className="section">
        <div className="container">
          <SectionHeading
            overline="APEX Calendar"
            title="Ecosystem Events & Rituals"
            subtitle="Engage in community meetups, expert masterclasses, hackfests, and demo days."
          />

          {/* Filters Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            backgroundColor: 'var(--apex-bg-surface)',
            border: '1px solid var(--apex-border-dark)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-5)'
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {['all', 'upcoming', 'past'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    backgroundColor: activeTab === tab ? 'var(--apex-primary)' : 'transparent',
                    color: activeTab === tab ? '#fff' : 'var(--apex-text-white)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    transition: 'background var(--transition-fast)'
                  }}
                >
                  {tab === 'all' ? 'All Events' : `${tab} events`}
                </button>
              ))}
            </div>
          </div>


          {/* Events List */}
          {filteredEvents.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }} className="grid-2">
              {filteredEvents.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--apex-bg-surface)',
                    border: '1px solid var(--apex-border-dark)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    opacity: item.status === 'past' ? 0.75 : 1
                  }}
                >
                  {item.thumbnail && (
                    <div style={{ width: '100%', height: '180px', overflow: 'hidden' }}>
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <span style={{
                          backgroundColor: 'rgba(255,90,20,0.1)',
                          color: 'var(--apex-primary)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>{item.type}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--apex-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> {item.date}
                        </span>
                      </div>

                      <h4 className="heading-sm" style={{ marginBottom: '10px' }}>{item.title}</h4>
                      <p className="body-sm" style={{ color: 'var(--apex-text-muted)', marginBottom: 'var(--space-4)' }}>{item.description}</p>

                      {/* Event Tags */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                        {(item.tags || []).map(tag => (
                          <span key={tag} style={{
                            fontSize: '0.75rem',
                            color: 'var(--apex-primary-warm)',
                            backgroundColor: 'rgba(255, 90, 20, 0.05)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)'
                          }}>{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--apex-border-dark)',
                      paddingTop: 'var(--space-3)',
                      marginTop: 'var(--space-2)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--apex-text-muted)' }}>
                        <MapPin size={14} /> {item.venue}
                      </span>


                      {(() => {
                        if (item.status !== 'past') return null;

                        const cleanEventTags = (item.tags || []).map(t => t.replace('#', '').toLowerCase());
                        const match = (galleryEntries || []).find(entry => {
                          const entryTags = (entry.tags || []).map(t => t.toLowerCase());
                          const hasTagMatch = entryTags.some(t => cleanEventTags.includes(t));
                          const titleMatch = entry.title.toLowerCase().includes(item.title.split(':')[0].split('(')[0].trim().toLowerCase()) ||
                            item.title.toLowerCase().includes(entry.title.split('-')[0].trim().toLowerCase());
                          return hasTagMatch || titleMatch;
                        });

                        if (match) {
                          return (
                            <Link href={`/gallery?highlight=${match.id}`} style={{ color: 'var(--apex-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                              View Recap →
                            </Link>
                          );
                        } else if (item.recapUrl && item.recapUrl !== '#') {
                          return (
                            <a href={item.recapUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--apex-text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>
                              View Recap →
                            </a>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-7) 0',
              color: 'var(--apex-text-muted)',
              border: '1px dashed var(--apex-border-dark)',
              borderRadius: 'var(--radius-md)'
            }}>
              No events found.
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
