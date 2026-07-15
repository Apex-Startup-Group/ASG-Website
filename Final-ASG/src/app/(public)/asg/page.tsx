'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, Compass, Briefcase, Wrench, CheckCircle } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper/PageWrapper';
import SectionHeading from '@/components/common/SectionHeading/SectionHeading';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import ApexDropdown from '@/components/common/ApexDropdown/ApexDropdown';
import ImageUpload from '@/components/shared/ImageUpload';

interface FormDataState {
  name: string;
  email: string;
  phone: string;
  role: string;
  socialLinks: string[];
  company: string;
  companyWebsite: string;
  description: string;
  photoUrl: string;
  otherRoleDetails: string;
}

export default function ASG() {
  const router = useRouter();
  const pillarsAnim = useScrollAnimation();
  const programsAnim = useScrollAnimation();
  const membersAnim = useScrollAnimation();

  // ASG Member Listing Application Form State
  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    email: '',
    phone: '',
    role: '', // founders | mentors | investors | service-providers
    socialLinks: [''],
    company: '',
    companyWebsite: '',
    description: '',
    photoUrl: '',
    otherRoleDetails: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.socialLinks];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, socialLinks: newLinks }));
    if (formErrors.socialLinks) {
      setFormErrors(prev => ({ ...prev, socialLinks: '' }));
    }
  };

  const addSocialLink = () => {
    setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, ''] }));
  };

  const removeSocialLink = (index: number) => {
    const newLinks = formData.socialLinks.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, socialLinks: newLinks.length ? newLinks : [''] }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone Number is required';
    if (!formData.role) errors.role = 'Ecosystem role is required';
    if (!formData.company.trim()) errors.company = 'Company / Affiliation is required';
    if (!formData.description.trim()) errors.description = 'Short Description is required';
    if (!formData.photoUrl) errors.photoUrl = 'Profile Photo / Company Logo is required';
    if (formData.role === 'other' && !formData.otherRoleDetails?.trim()) {
      errors.otherRoleDetails = 'Tell us about your role is required';
    }
    return errors;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/v1/community-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to submit application.');
      }

      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        socialLinks: [''],
        company: '',
        companyWebsite: '',
        description: '',
        photoUrl: '',
        otherRoleDetails: ''
      });
    } catch (err: any) {
      alert(err.message || 'An error occurred while submitting your application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pillars = [
    {
      title: "Founders",
      path: "founders",
      icon: <Rocket size={32} color="var(--apex-primary)" />,
      desc: "Early-stage builders, product innovators, and tech visionaries actively running companies in Jalgaon or building remotely."
    },
    {
      title: "Mentors",
      path: "mentors",
      icon: <Compass size={32} color="var(--apex-primary)" />,
      desc: "Domain experts, legal advisors, marketing specialists, and tech leads committed to guiding the next generation of builders."
    },
    {
      title: "Investors",
      path: "investors",
      icon: <Briefcase size={32} color="var(--apex-primary)" />,
      desc: "Local angel investors, corporate leaders, and regional micro-VC syndicates looking for dealflow and technology co-investments."
    },
    {
      title: "Service Providers",
      path: "service-providers",
      icon: <Wrench size={32} color="var(--apex-primary)" />,
      desc: "Validated legal, chartered accountant, tech consulting, design agency, and server hosting partners offering startup discounts."
    }
  ];

  const recurrentPrograms = [
    { title: "Founder Circles", desc: "Closed-door roundtable conversations focusing on operational blocks, fundraising metrics, and hiring pipelines." },
    { title: "Monthly Meetups", desc: "Open-community meetups with live panels, speaker slots, and interactive demos open to all innovators." },
    { title: "Expert Sessions", desc: "Masterclasses from external leaders on domains like legal setup, cloud scaling, and GTM strategy." },
    { title: "AI Launchpads", desc: "Hackfests and integration workshops mapping student tech squads to support startup prototypes." }
  ];

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <section className="section" style={{ borderBottom: '1px solid var(--apex-border-dark)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="label" style={{ color: 'var(--apex-primary)', marginBottom: 'var(--space-2)', display: 'block' }}>
            APEX STARTUP GROUP (ASG)
          </span>
          <h1 className="display-xl" style={{ marginBottom: 'var(--space-4)', color: 'var(--apex-text-white)' }}>
            The Hub for <span className="text-highlight">Local Innovators.</span>
          </h1>
          <p className="body-lg" style={{ color: 'var(--apex-text-muted)', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto', marginBottom: 'var(--space-2)' }}>
            Building an active, structured startup ecosystem in North Maharashtra. Connecting Jalgaon founders with peer groups, legal service providers, and early venture backing.
          </p>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="pillars" ref={pillarsAnim.ref} className={`section ${pillarsAnim.className}`}>
        <div className="container">
          <SectionHeading
            overline="Community Pillars"
            title="The Four Ecosystem Nodes"
            subtitle="ASG is built upon collaborative support structures matching founders, mentors, investors, and service partners. Click on any card to view ecosystem members."
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }} className="grid-2">
            {pillars.map((p) => {
              return (
                <div
                  key={p.title}
                  onClick={() => router.push(`/listings/${p.path}`)}
                  style={{
                    backgroundColor: 'var(--apex-bg-surface)',
                    border: '1px solid var(--apex-border-dark)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--apex-primary)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-glow-orange-sm)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--apex-border-dark)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                    <div style={{ marginTop: '4px' }}>{p.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 className="heading-sm" style={{ marginBottom: '4px', color: 'var(--apex-text-white)' }}>{p.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--apex-primary)', fontWeight: '700' }}>
                          View Listings →
                        </span>
                      </div>
                      <p className="body-sm" style={{ color: 'var(--apex-text-muted)', margin: 0 }}>{p.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Listing Form Section */}
      <section className="section" style={{ borderTop: '1px solid var(--apex-border-dark)', backgroundColor: 'var(--apex-bg-surface-elevated)' }}>
        <div className="container" style={{ maxWidth: '650px' }}>
          <div style={{
            backgroundColor: 'var(--apex-bg-surface)',
            border: '1px solid var(--apex-border-dark)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h3 className="heading-md" style={{ color: 'var(--apex-text-white)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
              Apply for Listing on Live Website
            </h3>
            <p className="body-sm" style={{ color: 'var(--apex-text-muted)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
              Are you a founder, mentor, investor, or service provider in Jalgaon? Submit your details to get listed in the ASG directory.
            </p>

            {submitSuccess ? (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-4) 0',
                color: '#10B981',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <CheckCircle size={48} color="var(--apex-primary)" />
                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--apex-text-white)' }}>Listing Application Received!</h4>
                <p className="body-sm" style={{ color: 'var(--apex-text-muted)', maxWidth: '400px' }}>
                  Thank you! Our community admins will review your profile details and list your profile details on the directory.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  style={{
                    marginTop: '10px',
                    background: 'transparent',
                    border: '1.5px solid var(--apex-primary)',
                    color: 'var(--apex-primary)',
                    padding: '8px 20px',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>

                {/* Name & Email Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }} className="grid-2">
                  {/* Name */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Abhay Patil"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--apex-bg-surface-elevated)',
                        border: formErrors.name ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                        color: 'var(--apex-text-white)',
                        fontSize: '0.9rem'
                      }}
                    />
                    {formErrors.name && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.name}</span>}
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="name@example.com"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--apex-bg-surface-elevated)',
                        border: formErrors.email ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                        color: 'var(--apex-text-white)',
                        fontSize: '0.9rem'
                      }}
                    />
                    {formErrors.email && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.email}</span>}
                  </div>
                </div>

                {/* Phone & Role Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }} className="grid-2">
                  {/* Phone */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="e.g. 9876543210"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--apex-bg-surface-elevated)',
                        border: formErrors.phone ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                        color: 'var(--apex-text-white)',
                        fontSize: '0.9rem'
                      }}
                    />
                    {formErrors.phone && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.phone}</span>}
                  </div>

                  {/* Role Dropdown */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Community Node Role *</label>
                    <ApexDropdown
                      label={
                        formData.role === 'founders' ? 'Founder' :
                          formData.role === 'mentors' ? 'Mentor' :
                            formData.role === 'investors' ? 'Investor' :
                              formData.role === 'service-providers' ? 'Service Provider' :
                                formData.role === 'other' ? 'Other' :
                                  'Select role'
                      }
                      options={[
                        { value: 'founders', label: 'Founder' },
                        { value: 'mentors', label: 'Mentor' },
                        { value: 'investors', label: 'Investor' },
                        { value: 'service-providers', label: 'Service Provider' },
                        { value: 'other', label: 'Other' }
                      ]}
                      onSelect={(value) => {
                        setFormData((prev) => ({ ...prev, role: value }));
                        if (formErrors.role) {
                          setFormErrors((prev) => ({ ...prev, role: '' }));
                        }
                      }}
                      minWidth="100%"
                    />
                    {formErrors.role && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.role}</span>}
                  </div>
                </div>

                {/* Custom Role Details - Visible only when "Other" is selected */}
                {formData.role === 'other' && (
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Tell us about your role *</label>
                    <textarea
                      name="otherRoleDetails"
                      value={formData.otherRoleDetails}
                      onChange={handleFormChange}
                      rows={3}
                      placeholder="Please specify your startup role or affiliation..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--apex-bg-surface-elevated)',
                        border: formErrors.otherRoleDetails ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                        color: 'var(--apex-text-white)',
                        fontSize: '0.9rem',
                        resize: 'vertical'
                      }}
                    />
                    {formErrors.otherRoleDetails && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.otherRoleDetails}</span>}
                  </div>
                )}

                {/* Company & Website Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }} className="grid-2">
                  {/* Company / Affiliation */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Company / Affiliation *</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleFormChange}
                      placeholder="e.g. AgriScale AI"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--apex-bg-surface-elevated)',
                        border: formErrors.company ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                        color: 'var(--apex-text-white)',
                        fontSize: '0.9rem'
                      }}
                    />
                    {formErrors.company && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.company}</span>}
                  </div>

                  {/* Company Website Link */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Company Website Link</label>
                    <input
                      type="url"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleFormChange}
                      placeholder="https://company.com"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--apex-bg-surface-elevated)',
                        border: '1px solid var(--apex-border-dark)',
                        color: 'var(--apex-text-white)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                {/* Dynamic Social Media Links */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Social Media Links <span style={{ color: 'var(--apex-text-muted)', fontWeight: 400 }}>(Optional)</span></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formData.socialLinks.map((link, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                          placeholder="e.g. https://linkedin.com/in/username"
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--apex-bg-surface-elevated)',
                            border: formErrors.socialLinks ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                            color: 'var(--apex-text-white)',
                            fontSize: '0.9rem'
                          }}
                        />
                        {formData.socialLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSocialLink(index)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              border: 'none',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              fontWeight: '650',
                              fontSize: '0.85rem'
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addSocialLink}
                    style={{
                      background: 'rgba(255, 107, 0, 0.1)',
                      color: 'var(--apex-primary)',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      marginTop: '8px',
                      display: 'inline-block'
                    }}
                  >
                    + Add Another Social Link
                  </button>
                  {formErrors.socialLinks && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.socialLinks}</span>}
                </div>

                {/* Short Description */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Short Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Briefly describe your business, role, or area of focus..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--apex-bg-surface-elevated)',
                      border: formErrors.description ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                      color: 'var(--apex-text-white)',
                      fontSize: '0.9rem',
                      resize: 'vertical'
                    }}
                  />
                  {formErrors.description && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.description}</span>}
                </div>

                {/* Photo Upload Zone */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Profile Photo / Company Logo *</label>
                  <ImageUpload
                    uploadType="community_member_photo"
                    value={formData.photoUrl}
                    onChange={(url) => {
                      setFormData(prev => ({ ...prev, photoUrl: url }));
                      if (formErrors.photoUrl) {
                        setFormErrors(prev => ({ ...prev, photoUrl: '' }));
                      }
                    }}
                  />
                  {formErrors.photoUrl && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.photoUrl}</span>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: 'var(--gradient-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '12px 28px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'opacity 0.2s'
                  }}
                >
                  {isSubmitting ? 'Submitting Application...' : 'Apply for Listing'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Recurrent Programs List (Styling fix for light mode) */}
      <section ref={programsAnim.ref} className={`section ${programsAnim.className}`} style={{ backgroundColor: 'var(--apex-bg-surface-elevated)' }}>
        <div className="container">
          <SectionHeading
            overline="Ecosystem Operations"
            title="ASG Programs & Initiatives"
            subtitle="We run recurring monthly, bi-weekly, and annual formats to keep stakeholders engaged."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }} className="grid-4">
            {recurrentPrograms.map((prog) => (
              <div key={prog.title} style={{
                backgroundColor: 'var(--apex-bg-surface)',
                border: '1px solid var(--apex-border-dark)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h4 className="heading-sm" style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--apex-primary)' }}>{prog.title}</h4>
                  <p className="body-sm" style={{ color: 'var(--apex-text-muted)' }}>{prog.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
