import React from 'react';

interface SectionHeadingProps {
  overline?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  lightBg?: boolean;
}

export default function SectionHeading({ overline, title, subtitle, align = 'center', lightBg = false }: SectionHeadingProps) {
  const isLeft = align === 'left';
  
  return (
    <div style={{
      textAlign: isLeft ? 'left' : 'center',
      marginBottom: 'var(--space-6)',
      maxWidth: '700px',
      marginLeft: isLeft ? '0' : 'auto',
      marginRight: isLeft ? '0' : 'auto'
    }}>
      {overline && (
        <span className="label" style={{
          color: 'var(--apex-primary)',
          display: 'block',
          marginBottom: 'var(--space-2)'
        }}>
          {overline}
        </span>
      )}
      
      <h2 className="display-lg" style={{
        color: lightBg ? 'var(--apex-text-dark)' : 'var(--apex-text-white)',
        marginBottom: 'var(--space-3)'
      }}>
        {title}
      </h2>
      
      {/* Centered or left-aligned gradient line */}
      <div style={{
        height: '3px',
        width: '60px',
        background: 'var(--gradient-primary)',
        borderRadius: 'var(--radius-full)',
        margin: isLeft ? '0' : '0 auto var(--space-3) auto',
        marginBottom: 'var(--space-3)'
      }} />
      
      {subtitle && (
        <p className="body-lg" style={{
          color: lightBg ? 'rgba(0,0,0,0.6)' : 'var(--apex-text-muted)',
          lineHeight: '1.6'
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
