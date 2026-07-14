'use client';

import React, { useEffect, useState } from 'react';
import { getExpertsAction, type ExpertRecord } from '@/app/actions/experts';

export default function AALEcosystemDirectory() {
  const [experts, setExperts] = useState<ExpertRecord[]>([]);

  useEffect(() => {
    const loadDirectory = async () => {
      try {
        const expertRows = await getExpertsAction({ publicOnly: true });
        setExperts(expertRows);
      } catch (error) {
        console.error('Failed to load AAL ecosystem directory', error);
      }
    };

    void loadDirectory();
  }, []);

  if (experts.length === 0) {
    return null;
  }

  return (
    <section className="section" style={{ borderTop: '1px solid var(--apex-border-dark)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <span className="label" style={{ color: 'var(--apex-primary)', marginBottom: 'var(--space-2)', display: 'block' }}>
            AAL ECOSYSTEM
          </span>
          <h2 className="display-md" style={{ color: 'var(--apex-text-white)', marginBottom: 'var(--space-3)' }}>
            Industry Experts
          </h2>
          <div style={{ width: '72px', height: '3px', background: 'var(--apex-primary)', margin: '0 auto var(--space-3)', borderRadius: '999px' }} />
          <p className="body-md" style={{ color: 'var(--apex-text-muted)', maxWidth: '720px', margin: '0 auto' }}>
            Approved mentors supporting AAL cohorts.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }} className="grid-3">
          {experts.map((expert) => (
            <article key={expert.id} style={{ background: 'var(--apex-bg-surface)', border: '1px solid var(--apex-border-dark)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <img
                src={expert.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop'}
                alt={expert.name}
                style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--apex-primary)', padding: '3px', background: '#fff', margin: '0 auto var(--space-3)' }}
              />
              <h3 className="heading-sm" style={{ color: 'var(--apex-text-white)', marginBottom: '6px' }}>{expert.name}</h3>
              <p style={{ color: 'var(--apex-primary)', fontWeight: 700, marginBottom: '6px' }}>{expert.role || expert.designation}</p>
              <p className="body-sm" style={{ color: 'var(--apex-text-muted)', marginBottom: '12px' }}>{expert.company}</p>
              {expert.currentProblemStatement && (
                <span style={{ display: 'inline-block', color: 'var(--apex-primary)', background: 'var(--apex-primary-tint)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '12px' }}>
                  PS: {expert.currentProblemStatement}
                </span>
              )}
              {expert.description && <p className="body-sm" style={{ color: 'var(--apex-text-muted)', fontStyle: 'italic' }}>"{expert.description}"</p>}
              {expert.socialLinks.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
                  {expert.socialLinks.map((link) => (
                    <a key={link} href={link} target="_blank" rel="noreferrer" style={{ color: 'var(--apex-primary)', background: 'var(--apex-primary-tint)', border: '1px solid rgba(255,107,0,0.25)', borderRadius: '999px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
                      {link.includes('linkedin') ? 'LinkedIn' : 'Website'}
                    </a>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
