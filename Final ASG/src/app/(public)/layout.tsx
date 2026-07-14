import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../../styles/global.css';

export const metadata: Metadata = {
  title: 'APEX Startup Group — Jalgaon\'s Startup Ecosystem',
  description: 'APEX connects local innovators, builds industry-grade talent through the APEX AI Launchpad (AAL), and fosters growth through the APEX Startup Group (ASG).',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
