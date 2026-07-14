'use client';

import React from 'react';
import Navbar from '../../common/Navbar/Navbar';
import Footer from '../Footer/Footer';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background Noise Overlay */}
      <div className="noise-overlay" />

      {/* Primary Radial Glow Orbs */}
      <div 
        className="bg-glow-orb animate-float"
        style={{
          width: '500px',
          height: '500px',
          background: 'rgba(255, 90, 20, 0.15)',
          top: '-100px',
          right: '-100px'
        }}
      />
      <div 
        className="bg-glow-orb animate-float-delayed"
        style={{
          width: '600px',
          height: '600px',
          background: 'rgba(255, 61, 0, 0.08)',
          bottom: '200px',
          left: '-200px'
        }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main style={{ flex: '1', paddingTop: '40px', position: 'relative', zIndex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
