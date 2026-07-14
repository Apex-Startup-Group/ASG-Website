import React from 'react';
import type { Metadata } from 'next';
import { AuthProvider } from '../../context/admin/AuthContext';
import '../../styles/admin.css';

export const metadata: Metadata = {
  title: 'ASG Admin Panel',
  description: 'Admin Portal for managing APEX Startup Group and AI Launchpad.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
