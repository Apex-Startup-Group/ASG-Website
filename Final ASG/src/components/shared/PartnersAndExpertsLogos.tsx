'use client';

import React, { useEffect, useState } from 'react';
import { getPartnersAction, type PartnerRecord } from '@/app/actions/partners';

export default function PartnersAndExpertsLogos() {
  const [partners, setPartners] = useState<PartnerRecord[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedPartners = await getPartnersAction({ publicOnly: true });
        setPartners(fetchedPartners);
      } catch (error) {
        console.error('Failed to load logos', error);
      }
    };

    void loadData();
  }, []);

  const hasItems = partners.length > 0;

  if (!hasItems) {
    return (
      <p className="body-sm" style={{ color: 'var(--apex-text-muted)', margin: 0, textAlign: 'center' }}>
        Approved partner logos will appear here.
      </p>
    );
  }

  return (
    <div style={{ padding: '32px 0', width: '100%', overflow: 'hidden' }}>
      <style jsx>{`
        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
          width: 100%;
          position: relative;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }

        .marquee-track {
          display: inline-flex;
          gap: 32px;
          animation: marquee 30s linear infinite;
          padding-left: 32px; /* Matches gap for seamless loop */
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 16px)); } /* Half the total width minus half the gap */
        }

        .interactive-logo {
          filter: grayscale(1);
          opacity: 0.6;
          transform: translateY(0) scale(1);
          transition: filter 250ms ease, opacity 250ms ease, transform 250ms ease, box-shadow 250ms ease;
          width: 140px;
          height: 80px;
          border-radius: 12px;
          background: #fff;
          border: 1px solid var(--apex-border-dark);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          text-decoration: none;
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
        }

        .interactive-logo:hover {
          filter: grayscale(0);
          opacity: 1;
          transform: translateY(-6px) scale(1.05);
          box-shadow: 0 16px 32px rgba(255, 107, 0, 0.2);
          z-index: 10;
        }
      `}</style>

      {partners.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <div className="marquee-container">
            <div className="marquee-track">
              {/* Render 10 times to ensure enough width for any screen size and seamless looping at -50% */}
              {[...Array(10)].map((_, i) => (
                <React.Fragment key={`partner-group-${i}`}>
                  {partners.map((partner) => (
                    <a
                      key={`partner-${partner.id}-${i}`}
                      className="interactive-logo"
                      href={partner.websiteUrl || partner.website || '#'}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${partner.name} website`}
                      title={partner.name}
                    >
                      {partner.logo ? (
                        <img src={partner.logo} alt={partner.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ color: '#000', fontWeight: 800, fontSize: '0.8rem', textAlign: 'center', whiteSpace: 'normal' }}>{partner.name}</span>
                      )}
                    </a>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
