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
          mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
        }

        .marquee-track {
          display: inline-flex;
          align-items: center;
          gap: 56px;
          animation: marquee 35s linear infinite;
          padding-left: 56px;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 28px)); }
        }

        .interactive-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 60px;
          padding: 4px 12px;
          text-decoration: none;
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
          background: transparent;
          border: none;
          outline: none;
          filter: grayscale(100%);
          opacity: 0.65;
          transition: filter 300ms ease, opacity 300ms ease, transform 300ms ease;
        }

        .interactive-logo:hover {
          filter: grayscale(0%);
          opacity: 1;
          transform: scale(1.1);
          z-index: 10;
        }
      `}</style>

      {partners.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
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
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          style={{
                            height: '44px',
                            width: 'auto',
                            maxWidth: '160px',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />
                      ) : (
                        <span style={{ color: 'var(--apex-text-white, #0d0d0d)', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {partner.name}
                        </span>
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
