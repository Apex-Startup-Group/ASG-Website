import React from 'react';
import PageWrapper from '@/components/layout/PageWrapper/PageWrapper';
import PartnersAndExpertsLogos from '@/components/shared/PartnersAndExpertsLogos';

export default function AboutPage() {
  return (
    <PageWrapper>
      {/* Header Section */}
      <section className="section" style={{ textAlign: 'center', paddingBottom: 'var(--space-4)' }}>
        <div className="container">
          <span className="label" style={{ color: 'var(--apex-primary)', marginBottom: 'var(--space-2)', display: 'block' }}>
            OUR BACKGROUND
          </span>
          <h1 className="display-xl" style={{ color: 'var(--apex-text-white)', marginBottom: 'var(--space-3)' }}>
            How <span style={{ position: 'relative', display: 'inline-block' }}>
              APEX
              <span style={{ content: '""', position: 'absolute', bottom: '6px', left: '0', width: '100%', height: '3px', background: 'var(--apex-primary)' }}></span>
            </span> Began
          </h1>
          <p className="body-lg" style={{ color: 'var(--apex-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            The origin story of Jalgaon&apos;s largest tech, student, and founder collective.
          </p>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-6)', alignItems: 'center' }} className="grid-2">
            
            {/* Left Column: Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <p className="body-md" style={{ color: 'var(--apex-text-muted)' }}>
                Founded in Jalgaon, APEX Startup Group (ASG) began as a series of informal weekend chats between founders, tech leads, and academic advisors looking to build scalable tech solutions locally.
              </p>
              <p className="body-md" style={{ color: 'var(--apex-text-muted)' }}>
                We noticed a prominent pattern: while our local engineering students had theoretical knowledge, they lacked practical, hands-on framework exposure. Conversely, early-stage founders lacked structured mentor access and tech pipelines to test prototypes.
              </p>
              <p className="body-md" style={{ color: 'var(--apex-text-muted)' }}>
                To solve this, we launched the <strong>APEX AI Launchpad (AAL)</strong> internship. Today, APEX represents a unified platform housing our dual efforts—bridging industry talent with growth circles.
              </p>
            </div>

            {/* Right Column: Card */}
            <div style={{ 
              background: 'var(--apex-bg-surface)', 
              border: '1px solid var(--apex-border-dark)', 
              borderRadius: 'var(--radius-lg)', 
              padding: 'var(--space-5)', 
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'center'
            }}>
              <h3 className="heading-md" style={{ color: 'var(--apex-primary)', marginBottom: 'var(--space-2)' }}>Grassroots Innovation</h3>
              <p className="body-sm" style={{ color: 'var(--apex-text-muted)', marginBottom: 'var(--space-4)' }}>
                We believe Tier 2/3 cities are hubs of raw engineering potential.
              </p>
              <div style={{ fontSize: '2.5rem', display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}>
                🌱 🚀 📈
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section" style={{ background: 'var(--apex-bg-surface-elevated)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }} className="grid-2">
            
            {/* Mission Card */}
            <article style={{ background: 'var(--apex-bg-surface)', border: '1px solid var(--apex-border-dark)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="heading-md" style={{ color: 'var(--apex-primary)', marginBottom: 'var(--space-3)' }}>Our Mission</h2>
              <p className="body-md" style={{ color: 'var(--apex-text-muted)', margin: 0, lineHeight: 1.6 }}>
                To democratize access to industry-grade technical skills, structure peer networks for local entrepreneurs, and reduce regional brain drain by fostering innovation directly inside Jalgaon.
              </p>
            </article>

            {/* Vision Card */}
            <article style={{ background: 'var(--apex-bg-surface)', border: '1px solid var(--apex-border-dark)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="heading-md" style={{ color: 'var(--apex-primary)', marginBottom: 'var(--space-3)' }}>Our Vision</h2>
              <p className="body-md" style={{ color: 'var(--apex-text-muted)', margin: 0, lineHeight: 1.6 }}>
                To position North Maharashtra as a self-sustaining innovation hub, where students build global-quality code and startup founders find immediate funding, legal, and operational support.
              </p>
            </article>

          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="label" style={{ color: 'var(--apex-primary)', marginBottom: 'var(--space-2)', display: 'block' }}>
            COLLABORATION
          </span>
          <h2 className="display-md" style={{ color: 'var(--apex-text-white)', marginBottom: 'var(--space-3)' }}>
            Our Industry Partners
          </h2>
          <div style={{ width: '72px', height: '3px', borderRadius: '999px', background: 'var(--apex-primary)', margin: '0 auto var(--space-5)' }} />
          <PartnersAndExpertsLogos />
        </div>
      </section>

    </PageWrapper>
  );
}
