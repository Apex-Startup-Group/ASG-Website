'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Calendar, MapPin, CheckCircle } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper/PageWrapper';
import SectionHeading from '@/components/common/SectionHeading/SectionHeading';
import Lightbox from '@/components/common/Lightbox/Lightbox';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useCountUp } from '@/hooks/useCountUp';
import Logo from '@/components/common/Logo';
import anime from 'animejs';

interface EventEntry {
  id: string;
  title: string;
  status: string;
  venue: string;
  type: string;
  description: string;
  tags: string[];
  thumbnail: string;
  date: string;
}

interface GalleryEntry {
  id: string;
  title: string;
  description: string;
  date: string;
  photos: string[];
  tags: string[];
  coverPhoto?: string;
}

interface BlogEntry {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  cover: string;
  summary: string;
  excerpt: string;
}

interface HomePageProps {
  events: EventEntry[];
  galleryEntries: GalleryEntry[];
  blogs: BlogEntry[];
}

export default function HomePage({ events, galleryEntries, blogs }: HomePageProps) {
  const router = useRouter();

  const words = ['Community', 'Innovation', 'Growth'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    const tl = anime.timeline({
      defaults: {
        easing: 'easeOutQuad',
      },
    });

    tl.add({
      targets: '.hero-overline',
      translateY: [-40, 0],
      opacity: [0, 1],
      duration: 1000,
    })
      .add(
        {
          targets: '.hero-title',
          translateY: [40, 0],
          opacity: [0, 1],
          easing: 'spring(1, 80, 12, 0)',
          duration: 1400,
        },
        '-=800'
      )
      .add(
        {
          targets: '.hero-desc',
          translateY: [30, 0],
          opacity: [0, 1],
          duration: 800,
        },
        '-=1000'
      )
      .add(
        {
          targets: '.hero-cta',
          scale: [0.9, 1],
          opacity: [0, 1],
          delay: anime.stagger(150),
          easing: 'easeOutBack',
          duration: 800,
        },
        '-=700'
      )
      .add(
        {
          targets: '.hero-trust-item',
          translateY: [15, 0],
          opacity: [0, 1],
          delay: anime.stagger(100),
          duration: 600,
        },
        '-=600'
      )
      .add(
        {
          targets: '.hero-graphic',
          scale: [0.7, 1],
          rotate: ['-120deg', '0deg'],
          opacity: [0, 1],
          easing: 'spring(1, 70, 11, 0)',
          duration: 1600,
        },
        '-=1300'
      );
  }, []);

  const { ref: statsRef, inView: statsInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const cohortCount = useCountUp(44, 1500, statsInView);
  const internCount = useCountUp(120, 2000, statsInView);
  const mentorCount = useCountUp(40, 2000, statsInView);
  const eventCount = useCountUp(40, 1800, statsInView);

  const heroAnim = useScrollAnimation();
  const splitAnim = useScrollAnimation();
  const eventsAnim = useScrollAnimation();
  const galleryAnim = useScrollAnimation();
  const testimonialsAnim = useScrollAnimation();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeEntryImages, setActiveEntryImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (entryIndex: number, imgIndex: number) => {
    const selectedEntry = galleryEntries[entryIndex];
    setActiveEntryImages(selectedEntry?.photos || []);
    setLightboxIndex(imgIndex);
    setLightboxOpen(true);
  };

  const upcoming = events.filter((e) => e.status === 'upcoming').slice(0, 2);
  const featuredEvents = upcoming.length > 0 ? upcoming : events.slice(0, 2);

  return (
    <PageWrapper>
      <section className="section" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              gap: 'var(--space-6)',
              alignItems: 'center',
            }}
            className="grid-2"
          >
            <div>
              <span className="label hero-overline" style={{ color: 'var(--apex-primary)', marginBottom: 'var(--space-2)', display: 'block', opacity: 0 }}>
                APEX — JALGAON'S STARTUP ECOSYSTEM
              </span>
              <h1 className="display-xl hero-title" style={{ marginBottom: 'var(--space-4)', color: 'var(--apex-text-white)', opacity: 0 }}>
                Where Startups Meet Talent, Mentors, and <br />
                <span
                  className="text-highlight"
                  style={{
                    display: 'inline-block',
                    minWidth: '220px',
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  {words[currentWordIndex]}.
                </span>
              </h1>

              <p className="body-lg hero-desc" style={{ color: 'var(--apex-text-muted)', marginBottom: 'var(--space-5)', maxWidth: '580px', opacity: 0 }}>
                APEX is Jalgaon’s first dedicated public community platform that connects local innovators, builds industry-grade talent through the APEX AI Launchpad (AAL), and fosters growth through the APEX Startup Group (ASG).
              </p>

              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
                <Link href="/aal" className="btn hero-cta" style={{
                  background: 'var(--gradient-primary)',
                  color: '#fff',
                  borderRadius: 'var(--radius-full)',
                  padding: '14px 28px',
                  fontWeight: '600',
                  boxShadow: 'var(--shadow-glow-orange)',
                  opacity: 0,
                }}>
                  Apply for AAL Internship
                </Link>
                <Link href="/asg" className="btn hero-cta" style={{
                  border: '1.5px solid var(--apex-primary)',
                  color: 'var(--apex-primary)',
                  borderRadius: 'var(--radius-full)',
                  padding: '14px 28px',
                  fontWeight: '600',
                  background: 'transparent',
                  opacity: 0,
                }}>
                  Join ASG Community
                </Link>
              </div>

              <div style={{
                display: 'flex',
                gap: 'var(--space-4)',
                borderTop: '1px solid var(--apex-border-dark)',
                paddingTop: 'var(--space-4)',
                flexWrap: 'wrap',
                color: 'var(--apex-text-muted)',
                fontSize: '0.9rem',
              }}>
                <div className="hero-trust-item" style={{ opacity: 0 }}><strong>120+</strong> Interns Trained</div>
                <div className="hero-trust-item" style={{ opacity: 0 }}><strong>40+</strong> Mentors & Experts</div>
                <div className="hero-trust-item" style={{ opacity: 0 }}><strong>40+</strong> Events Hosted</div>
                <div className="hero-trust-item" style={{ opacity: 0 }}><strong>44+</strong> Completed Cohorts</div>
              </div>
            </div>

            <div className="hero-graphic" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              width: '320px',
              height: '320px',
              margin: '0 auto',
              opacity: 0,
            }}>
              <div className="animate-rotate" style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '1.5px dashed rgba(255, 90, 20, 0.25)',
                top: 0,
                left: 0,
                pointerEvents: 'none',
              }}>
                <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--apex-primary)', boxShadow: 'var(--shadow-glow-orange)' }} />
                <div style={{ position: 'absolute', bottom: '35px', left: '25px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--apex-primary-warm)' }} />
                <div style={{ position: 'absolute', top: '100px', right: '15px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--apex-primary)' }} />
              </div>

              <div style={{
                position: 'relative',
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                border: '2px solid rgba(255, 90, 20, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FFFFFF',
                boxShadow: 'var(--shadow-md)',
                zIndex: 2,
                transition: 'transform var(--transition-base), border-color var(--transition-base)',
                cursor: 'pointer',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 90, 20, 0.6)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 90, 20, 0.35)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-45deg)' }}>
                  <path d="M12 2L22 22L12 18L2 22L12 2Z" fill="url(#arrowGradient)" stroke="var(--apex-primary)" strokeWidth="1" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="arrowGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FF3D00" />
                      <stop offset="100%" stopColor="#FF8A00" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={statsRef} style={{
        backgroundColor: 'var(--apex-bg-surface)',
        borderTop: '1px solid var(--apex-border-dark)',
        borderBottom: '1px solid var(--apex-border-dark)',
        padding: 'var(--space-5) 0',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--space-4)',
            textAlign: 'center',
          }} className="grid-4">
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--apex-primary)', fontFamily: 'Plus Jakarta Sans' }}>{cohortCount}</div>
              <div style={{ color: 'var(--apex-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Cohorts Completed</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--apex-primary)', fontFamily: 'Plus Jakarta Sans' }}>{internCount}+ </div>
              <div style={{ color: 'var(--apex-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Interns Trained</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--apex-primary)', fontFamily: 'Plus Jakarta Sans' }}>{mentorCount}+ </div>
              <div style={{ color: 'var(--apex-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Mentors & Experts</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--apex-primary)', fontFamily: 'Plus Jakarta Sans' }}>{eventCount}+ </div>
              <div style={{ color: 'var(--apex-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Events Hosted</div>
            </div>
          </div>
        </div>
      </section>

      <section ref={splitAnim.ref} className={`section ${splitAnim.className}`}>
        <div className="container">
          <SectionHeading overline="Dual Programs" title="Two Pillars. One Platform." subtitle="APEX unifies startup growth circles and AI launchpad initiatives under a single collaborative ecosystem." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }} className="grid-2">
            <div style={{
              backgroundColor: 'var(--apex-bg-surface)',
              border: '1px solid var(--apex-border-dark)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div>
                <span className="label" style={{
                  color: 'var(--apex-primary)',
                  backgroundColor: 'rgba(255,90,20,0.1)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-block',
                  marginBottom: 'var(--space-3)',
                }}>AAL</span>
                <h3 className="heading-md" style={{ marginBottom: 'var(--space-3)', color: 'var(--apex-text-white)' }}>APEX AI Launchpad</h3>
                <p className="body-md" style={{ color: 'var(--apex-text-muted)', marginBottom: 'var(--space-4)' }}>
                  A structured 6-week internship program pairing students with industry experts to deliver production-grade products using AI, Web Dev, Product, and Design frameworks.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', color: 'var(--apex-text-white)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="var(--apex-primary)" /> 12 specific project choices</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="var(--apex-primary)" /> Industry mentor alignment</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="var(--apex-primary)" /> Hands-on live builds</div>
                </div>
              </div>
              <Link href="/aal" style={{ color: 'var(--apex-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Explore AAL Program <ArrowRight size={18} />
              </Link>
            </div>

            <div style={{
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#fff',
              boxShadow: 'var(--shadow-glow-orange)',
            }}>
              <div>
                <span className="label" style={{
                  color: '#fff',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-block',
                  marginBottom: 'var(--space-3)',
                }}>ASG</span>
                <h3 className="heading-md" style={{ marginBottom: 'var(--space-3)', color: '#FFFFFF' }}>APEX Startup Group</h3>
                <p className="body-md" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 'var(--space-4)' }}>
                  The startup ecosystem community. Bringing together early-stage founders, investors, experts, and service providers to build scalable ventures from Jalgaon.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="#fff" /> Closed-door Founder Circles</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="#fff" /> Angel Investor introductions</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={16} color="#fff" /> Dedicated local network</div>
                </div>
              </div>
              <Link href="/asg" style={{ color: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Explore ASG Community <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section ref={eventsAnim.ref} className={`section ${eventsAnim.className}`} style={{ backgroundColor: 'var(--apex-bg-surface-elevated)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-5)' }}>
            <SectionHeading overline="Upcoming Events" title="Join Our Next Event" subtitle="Participate in hands-on workshops, networking meetups, and expert panels." align="left" />
            <Link href="/events" className="btn" style={{
              color: 'var(--apex-primary)',
              fontWeight: '600',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              View All Events <ArrowRight size={18} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }} className="grid-2">
            {featuredEvents.map((item) => (
              <div key={item.id} style={{
                backgroundColor: 'var(--apex-bg-surface)',
                border: '1px solid var(--apex-border-dark)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <span style={{
                      backgroundColor: 'rgba(255,90,20,0.1)',
                      color: 'var(--apex-primary)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}>{item.type}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--apex-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {item.date}
                    </span>
                  </div>
                  <h4 className="heading-sm" style={{ marginBottom: 'var(--space-2)', color: 'var(--apex-text-white)' }}>{item.title}</h4>
                  <p className="body-sm" style={{ color: 'var(--apex-text-muted)', marginBottom: 'var(--space-4)' }}>{item.description}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--apex-border-dark)', paddingTop: 'var(--space-3)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--apex-text-muted)' }}>
                    <MapPin size={14} /> {item.venue}
                  </span>
                  <Link href="/events" style={{ color: 'var(--apex-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={galleryAnim.ref} className={`section ${galleryAnim.className}`}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-5)' }}>
            <SectionHeading overline="Visual Timeline" title="Moments in the Ecosystem" subtitle="Take a look at snapshots of our past demo days, cohorts, and meetups." align="left" />
            <Link href="/gallery" style={{
              color: 'var(--apex-primary)',
              fontWeight: '600',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              View Full Timeline <ArrowRight size={18} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }} className="grid-3">
            {galleryEntries.slice(0, 3).map((entry, entryIndex) => (
              <div key={entry.id} style={{
                backgroundColor: 'var(--apex-bg-surface)',
                border: '1px solid var(--apex-border-dark)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ position: 'relative', overflow: 'hidden', height: '180px', cursor: 'zoom-in' }} onClick={() => openLightbox(entryIndex, 0)}>
                  <img
                    src={entry.photos?.[0] || entry.coverPhoto || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop'}
                    alt={entry.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(255, 90, 20, 0.1)',
                    color: 'var(--apex-primary)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                  }}>
                    {entry.date}
                  </div>
                </div>

                <div style={{ padding: 'var(--space-3)' }}>
                  <h4 className="heading-sm" style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--apex-text-white)' }}>{entry.title}</h4>
                  <p className="body-sm" style={{
                    color: 'var(--apex-text-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {entry.description}
                  </p>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(entry.tags || []).map((t) => (
                      <span key={t} style={{
                        backgroundColor: 'var(--apex-bg-surface-elevated)',
                        color: 'var(--apex-primary)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                      }}>#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ borderTop: '1px solid var(--apex-border-dark)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-5)' }}>
            <SectionHeading overline="Insights & Ideas" title="Ecosystem Blogs" subtitle="Thoughts, tutorials, and success stories from the APEX Startup Group and AI Launchpad cohorts." align="left" />
            <Link href="/blogs" className="btn" style={{
              color: 'var(--apex-primary)',
              fontWeight: '600',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              View All Blogs <ArrowRight size={18} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }} className="grid-3">
            {blogs.slice(0, 3).map((blog) => (
              <article
                key={blog.id}
                style={{
                  backgroundColor: 'var(--apex-bg-surface)',
                  border: '1px solid var(--apex-border-dark)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'translateY(-4px)';
                  el.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'none';
                  el.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ height: '180px', overflow: 'hidden' }}>
                  <img
                    src={blog.cover}
                    alt={blog.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--apex-primary)',
                        backgroundColor: 'var(--apex-primary-tint)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: '700',
                      }}>{blog.category}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--apex-text-muted)' }}>{blog.readTime}</span>
                    </div>

                    <h4 className="heading-sm" style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--apex-text-white)' }}>{blog.title}</h4>
                    <p className="body-sm" style={{
                      color: 'var(--apex-text-muted)',
                      marginBottom: 'var(--space-4)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{blog.summary}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--apex-border-dark)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--apex-text-muted)' }}>{blog.date}</span>
                    <Link href={`/blogs/${blog.slug}`} style={{ color: 'var(--apex-primary)', fontWeight: '600', fontSize: '0.85rem' }}>
                      Read Article →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section ref={testimonialsAnim.ref} className={`section ${testimonialsAnim.className}`} style={{ backgroundColor: 'var(--apex-bg-surface-elevated)' }}>
        <div className="container">
          <SectionHeading overline="What ASG Members Say" title="Community Voices" subtitle="Read real feedback from students, founders, and investors building in North Maharashtra." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }} className="grid-3">
            <div style={{
              backgroundColor: 'var(--apex-bg-surface)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--apex-primary)',
              borderTop: '1px solid var(--apex-border-dark)',
              borderRight: '1px solid var(--apex-border-dark)',
              borderBottom: '1px solid var(--apex-border-dark)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <p style={{ fontStyle: 'italic', marginBottom: 'var(--space-4)', color: 'var(--apex-text-muted)' }}>
                "The AAL internship was the first time I built something that went live. Connecting with real startup mentors helped me understand the software lifecycle beyond textbook theories."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  RK
                </div>
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--apex-text-white)' }}>Rohit Kharat</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--apex-text-muted)' }}>AAL Cohort 2 Alumnus</p>
                </div>
              </div>
            </div>
            <div style={{
              backgroundColor: 'var(--apex-bg-surface)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--apex-primary)',
              borderTop: '1px solid var(--apex-border-dark)',
              borderRight: '1px solid var(--apex-border-dark)',
              borderBottom: '1px solid var(--apex-border-dark)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <p style={{ fontStyle: 'italic', marginBottom: 'var(--space-4)', color: 'var(--apex-text-muted)' }}>
                "Building a business in a Tier-2 city can feel isolating. APEX Startup Group provided a curated space to brainstorm hiring plans, meet advisors, and share localized operational problems."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  VM
                </div>
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--apex-text-white)' }}>Vikram Mahajan</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--apex-text-muted)' }}>Founder, AgriConnect Jalgaon</p>
                </div>
              </div>
            </div>
            <div style={{
              backgroundColor: 'var(--apex-bg-surface)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--apex-primary)',
              borderTop: '1px solid var(--apex-border-dark)',
              borderRight: '1px solid var(--apex-border-dark)',
              borderBottom: '1px solid var(--apex-border-dark)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <p style={{ fontStyle: 'italic', marginBottom: 'var(--space-4)', color: 'var(--apex-text-muted)' }}>
                "I was impressed by the quality of interns coming out of the AAL program. Their grasp of practical tools like Git, Figma, and basic API integrations is exceptionally strong for engineering undergraduates."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  AP
                </div>
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--apex-text-white)' }}>Abhay Patil</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--apex-text-muted)' }}>Technical Director, TechNol Inc</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 100,
        backgroundColor: 'var(--apex-bg-surface)',
        border: '1px solid var(--apex-border-dark)',
        padding: '16px 10px',
        borderRadius: 'var(--radius-full)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <a href="https://www.instagram.com/apexstartupgroup" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--apex-text-muted)', transition: 'color var(--transition-fast)' }} aria-label="Instagram link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
        </a>
        <a href="https://www.linkedin.com/company/apex-startup-group" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--apex-text-muted)', transition: 'color var(--transition-fast)' }} aria-label="LinkedIn link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
        </a>
        <a href="https://x.com/apexstartupgrp" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--apex-text-muted)', transition: 'color var(--transition-fast)' }} aria-label="X (Twitter) link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
        </a>
        <a href="https://youtube.com/@apexstartupgroup" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--apex-text-muted)', transition: 'color var(--transition-fast)' }} aria-label="YouTube link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25a29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
        </a>
        <a href="https://chat.whatsapp.com/CoG7rugANv166E6p51uLcI" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--apex-text-muted)', transition: 'color var(--transition-fast)' }} aria-label="WhatsApp Community link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
        </a>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={activeEntryImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex((prev) => (prev - 1 + activeEntryImages.length) % activeEntryImages.length)}
          onNext={() => setLightboxIndex((prev) => (prev + 1) % activeEntryImages.length)}
        />
      )}
    </PageWrapper>
  );
}
