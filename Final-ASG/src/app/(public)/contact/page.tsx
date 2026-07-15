'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, MessageSquare, MapPin, CheckCircle } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper/PageWrapper';
import SectionHeading from '@/components/common/SectionHeading/SectionHeading';

interface FormDataState {
  name: string;
  email: string;
  phone: string;
  message: string;
  role: string;
}

function ContactFormContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'Student';

  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    email: '',
    phone: '',
    message: '',
    role: initialRole
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialRole) {
      setFormData(prev => ({ ...prev, role: initialRole }));
    }
  }, [initialRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) errors.phone = 'Mobile Number is required';
    if (!formData.message.trim()) errors.message = 'Message is required';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to submit message.');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'An error occurred while sending your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '0.8fr 1.2fr',
      gap: 'var(--space-6)',
      alignItems: 'start'
    }} className="grid-2">

      {/* Left Info Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <h3 className="heading-sm" style={{ marginBottom: 'var(--space-2)' }}>Contact Details</h3>
          <p className="body-sm" style={{ color: 'var(--apex-text-muted)', marginBottom: 'var(--space-3)' }}>
            Reach out to the organizing team directly for sponsorship inquiries, workshop pitches, or program partnerships.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: 'var(--apex-bg-surface)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--apex-primary)'
            }}>
              <Mail size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--apex-text-muted)', display: 'block' }}>Email</span>
              <a href="mailto:reachus.asg@gmail.com" style={{ fontSize: '0.9rem', fontWeight: '600' }}>reachus.asg@gmail.com</a>
            </div>
          </div>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: 'var(--apex-bg-surface)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--apex-primary)'
            }}>
              <MapPin size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--apex-text-muted)', display: 'block' }}>HQ Location</span>
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Jalgaon, Maharashtra, India</span>
            </div>
          </div>

          {/* WhatsApp Community */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: 'var(--apex-bg-surface)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--apex-primary)'
            }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--apex-text-muted)', display: 'block' }}>WhatsApp Group</span>
              <a href="https://chat.whatsapp.com/CoG7rugANv166E6p51uLcI" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--apex-primary)' }}>Join WhatsApp Community →</a>
            </div>
          </div>
        </div>

        {/* Social Channels */}
        <div style={{ borderTop: '1px solid var(--apex-border-dark)', paddingTop: 'var(--space-4)' }}>
          <h4 className="label" style={{ color: 'var(--apex-text-muted)', marginBottom: 'var(--space-3)' }}>Follow our updates</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="https://www.instagram.com/apexstartupgroup" target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--apex-text-muted)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg> Instagram
            </a>
            <a href="https://www.linkedin.com/company/apex-startup-group" target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--apex-text-muted)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg> LinkedIn
            </a>
            <a href="https://x.com/apexstartupgrp" target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--apex-text-muted)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg> Twitter/X
            </a>
            <a href="https://youtube.com/@apexstartupgroup" target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--apex-text-muted)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25a29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg> YouTube
            </a>
          </div>
        </div>
      </div>

      {/* Right Form Column */}
      <div style={{
        backgroundColor: 'var(--apex-bg-surface)',
        border: '1px solid var(--apex-border-dark)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)'
      }}>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--apex-text-muted)', display: 'block', marginBottom: '6px' }}>Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Full Name"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--apex-bg-base)',
                  border: formErrors.name ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: '#000000ff',
                  outline: 'none'
                }}
              />
              {formErrors.name && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.name}</span>}
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--apex-text-muted)', display: 'block', marginBottom: '6px' }}>Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--apex-bg-base)',
                  border: formErrors.email ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: '#000000ff',
                  outline: 'none'
                }}
              />
              {formErrors.email && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.email}</span>}
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--apex-text-muted)', display: 'block', marginBottom: '6px' }}>Mobile Number *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your Mobile Number"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--apex-bg-base)',
                  border: formErrors.phone ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: '#000000ff',
                  outline: 'none'
                }}
              />
              {formErrors.phone && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.phone}</span>}
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--apex-text-muted)', display: 'block', marginBottom: '6px' }}>Message *</label>
              <textarea
                name="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about yourself or ask a question..."
                style={{
                  width: '100%',
                  backgroundColor: 'var(--apex-bg-base)',
                  border: formErrors.message ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: '#000000ff',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
              {formErrors.message && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: 'var(--gradient-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '12px 24px',
                fontWeight: '700',
                cursor: 'pointer',
                marginTop: 'var(--space-2)',
                boxShadow: 'var(--shadow-glow-orange)',
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-5) 0' }}>
            <div style={{ color: 'var(--apex-success)', marginBottom: 'var(--space-3)', display: 'inline-block' }}>
              <CheckCircle size={48} />
            </div>
            <h4 className="heading-sm" style={{ marginBottom: '8px' }}>Thank you, {formData.name}!</h4>
            <p className="body-sm" style={{ color: 'var(--apex-text-muted)', marginBottom: 'var(--space-4)' }}>
              Your inquiry has been logged successfully. Our organizing committee will get back to you within 2 business days.
            </p>
            <button
              onClick={() => { setIsSubmitted(false); setFormData({ name: '', email: '', phone: '', message: '', role: 'Student' }); setFormErrors({}); }}
              style={{
                backgroundColor: 'transparent',
                border: '1.5px solid var(--apex-primary)',
                color: 'var(--apex-primary)',
                borderRadius: 'var(--radius-full)',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Send Another Message
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default function Contact() {
  return (
    <PageWrapper>
      <section className="section">
        <div className="container">
          <SectionHeading
            overline="Connect"
            title="Get in Touch"
            subtitle="Submit an inquiry or register your interest to join the community."
          />
          <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center' }}>Loading form...</div>}>
            <ContactFormContent />
          </Suspense>
        </div>
      </section>
    </PageWrapper>
  );
}
