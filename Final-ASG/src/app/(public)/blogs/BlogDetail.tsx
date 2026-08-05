"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper/PageWrapper';

export default function BlogDetail({ blog, relatedBlogs }) {
  const router = useRouter();

  if (!blog) {
    return (
      <PageWrapper>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--apex-text-white)' }}>
          Blog post not found.
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <style>{`
        .rich-blog-content h1, .rich-blog-content h2, .rich-blog-content h3, .rich-blog-content h4 {
          color: var(--apex-text-white);
          margin-top: 1.8em;
          margin-bottom: 0.6em;
          font-weight: 700;
          line-height: 1.3;
        }
        .rich-blog-content h1 { font-size: 2.2rem; }
        .rich-blog-content h2 { font-size: 1.7rem; border-left: 4px solid var(--apex-primary); padding-left: 12px; }
        .rich-blog-content h3 { font-size: 1.4rem; }
        .rich-blog-content h4 { font-size: 1.15rem; }
        .rich-blog-content p {
          color: var(--apex-text-muted);
          line-height: 1.8;
          margin-bottom: 1.4rem;
          font-size: 1.05rem;
        }
        .rich-blog-content a {
          color: var(--apex-primary);
          text-decoration: underline;
          transition: opacity 0.2s;
        }
        .rich-blog-content a:hover {
          opacity: 0.85;
        }
        .rich-blog-content blockquote {
          border-left: 4px solid var(--apex-primary);
          background-color: var(--apex-bg-surface-elevated);
          padding: 16px 20px;
          margin: 24px 0;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: var(--apex-text-white);
        }
        .rich-blog-content blockquote p {
          margin-bottom: 0;
          font-size: 1.1rem;
        }
        .rich-blog-content ul, .rich-blog-content ol {
          margin-bottom: 1.5rem;
          padding-left: 24px;
          color: var(--apex-text-muted);
        }
        .rich-blog-content ul {
          list-style-type: disc;
        }
        .rich-blog-content ol {
          list-style-type: decimal;
        }
        .rich-blog-content li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        .rich-blog-content pre {
          background-color: #0f172a;
          border: 1px solid var(--apex-border-dark);
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 24px 0;
        }
        .rich-blog-content code {
          font-family: 'Courier New', monospace;
          color: #38bdf8;
          font-size: 0.95rem;
        }
        .rich-blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
          color: var(--apex-text-white);
          font-size: 0.95rem;
        }
        .rich-blog-content th, .rich-blog-content td {
          border: 1px solid var(--apex-border-dark);
          padding: 12px 16px;
          text-align: left;
        }
        .rich-blog-content th {
          background-color: var(--apex-bg-surface-elevated);
          font-weight: 600;
        }
        .rich-blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 28px auto;
          display: block;
          border: 1px solid var(--apex-border-dark);
        }
        .rich-blog-content figcaption {
          text-align: center;
          font-size: 0.85rem;
          color: var(--apex-text-muted);
          margin-top: -16px;
          margin-bottom: 24px;
          font-style: italic;
        }
        .rich-blog-content iframe {
          border-radius: 12px;
          border: 1px solid var(--apex-border-dark);
        }
      `}</style>

      <section className="section" style={{ paddingTop: 'var(--space-6)' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <Link href="/blogs" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--apex-primary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: 'var(--space-6)',
            transition: 'opacity 0.2s'
          }}>
            ← Back to Blogs
          </Link>

          <div style={{ marginBottom: '12px' }}>
            <span style={{
              fontSize: '0.8rem',
              color: 'var(--apex-primary)',
              backgroundColor: 'var(--apex-primary-tint)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {blog.category}
            </span>
          </div>

          <h1 className="heading-lg" style={{
            fontSize: '2.8rem',
            color: 'var(--apex-text-white)',
            lineHeight: '1.2',
            marginBottom: 'var(--space-4)'
          }}>
            {blog.title}
          </h1>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '24px',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--apex-border-dark)',
            marginBottom: 'var(--space-6)',
            fontSize: '0.9rem',
            color: 'var(--apex-text-muted)'
          }}>
            <div>
              By <strong style={{ color: 'var(--apex-text-white)' }}>{blog.author || 'ASG Editor'}</strong>
            </div>
            <div>•</div>
            <div>
              Published: <strong>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Draft'}</strong>
            </div>
          </div>
          
          {blog.coverImage && (
            <div style={{
              width: '100%',
              maxHeight: '450px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              marginBottom: 'var(--space-6)',
              border: '1px solid var(--apex-border-dark)'
            }}>
              <img
                src={blog.coverImage}
                alt={blog.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          <div className="rich-blog-content" dangerouslySetInnerHTML={{ __html: blog.body }} />

          {relatedBlogs && relatedBlogs.length > 0 && (
            <div style={{ marginTop: 'var(--space-10)' }}>
              <h3 style={{ color: 'var(--apex-text-white)', marginBottom: 'var(--space-4)' }}>Related Articles</h3>
              <div className="grid-3">
                {relatedBlogs.map((related) => (
                  <div key={related.id} style={{ backgroundColor: 'var(--apex-bg-surface)', border: '1px solid var(--apex-border-dark)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: 'var(--space-4)' }}>
                    <h4 style={{ marginBottom: '10px', color: 'var(--apex-text-white)' }}>{related.title}</h4>
                    <p style={{ color: 'var(--apex-text-muted)', marginBottom: 'var(--space-4)' }}>{related.excerpt}</p>
                    <button onClick={() => router.push(`/blogs/${related.slug}`)} style={{ color: 'var(--apex-primary)', fontWeight: '600', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                      Read More →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
