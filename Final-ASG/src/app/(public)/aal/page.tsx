'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageWrapper from '@/components/layout/PageWrapper/PageWrapper';
import SectionHeading from '@/components/common/SectionHeading/SectionHeading';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import ApexDropdown from '@/components/common/ApexDropdown/ApexDropdown';
import { getExpertsAction, type ExpertRecord } from '@/app/actions/experts';
import ImageUpload from '@/components/shared/ImageUpload';
import { FileText, Users, Brain, Code, Award } from 'lucide-react';

interface FormDataState {
  name: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  year: string;
  project: string;
  github: string;
  notes: string;
  internStatus: string;
  linkedin: string;
  photoUrl: string;
  shortDescription: string;
  aiToolsUsed: string;
}

export default function AAL() {
  const router = useRouter();
  const domainsAnim = useScrollAnimation();
  const mentorsAnim = useScrollAnimation();
  const journeyAnim = useScrollAnimation();
  const formAnim = useScrollAnimation();

  const formRef = useRef<HTMLDivElement | null>(null);
  const [problemStatements, setProblemStatements] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProblemStatements() {
      try {
        const res = await fetch('/api/v1/problem-statements');
        if (res.ok) {
          const { data } = await res.json();
          setProblemStatements(data);
        }
      } catch (err) {
        console.error("Failed to fetch public problem statements:", err);
      }
    }
    fetchProblemStatements();
  }, []);

  const [experts, setExperts] = useState<ExpertRecord[]>([]);

  useEffect(() => {
    const loadExperts = async () => {
      try {
        const fetched = await getExpertsAction({ publicOnly: true });
        setExperts(fetched);
      } catch (err) {
        console.error('Failed to fetch experts', err);
      }
    };
    void loadExperts();
  }, []);

  const activeExperts = experts.map(e => {
    const socialLinks = e.socialLinks || [];
    const currentProblemStatement = e.currentProblemStatement || (e as any).expertise || "";
    const description = e.description || e.bio || "";
    return { ...e, socialLinks, currentProblemStatement, description };
  });

  // Form states
  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    email: '',
    phone: '',
    college: '',
    degree: '',
    year: '',
    project: '',
    github: '',
    notes: '',
    internStatus: 'new', // new | existing
    linkedin: '',
    photoUrl: '',
    shortDescription: '',
    aiToolsUsed: ''
  });
  const [selectedCollege, setSelectedCollege] = useState('');
  const [customCollege, setCustomCollege] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const journeyStages = [
    {
      stage: "Stage 1",
      title: "Apply & Get Selected",
      desc: "Submit your Github, portfolio, and choice of project. Candidates are selected based on basic problem-solving and eagerness to build.",
      icon: <FileText size={18} color="var(--apex-primary)" />
    },
    {
      stage: "Stage 2",
      title: "Onboarding & Squad Formation",
      desc: "Meet your co-interns. We align students into cross-functional squads containing web devs, PMs, and designers to mimic real startups.",
      icon: <Users size={18} color="var(--apex-primary)" />
    },
    {
      stage: "Stage 3",
      title: "Domain Deep-Dive (Weeks 1–2)",
      desc: "Intense skill sprints. Guided workshops on frameworks (React, Python, Fast API, Figma design libraries) to establish strong build foundations.",
      icon: <Brain size={18} color="var(--apex-primary)" />
    },
    {
      stage: "Stage 4",
      title: "Live Project Execution (Weeks 3–6)",
      desc: "Squads build a live production project addressing real client requests or local community problems under weekly expert design reviews.",
      icon: <Code size={18} color="var(--apex-primary)" />
    },
    {
      stage: "Stage 5",
      title: "Demo Day & Certification",
      desc: "Present your squad's live app to external mentors and investors. Outstanding builders get direct references and project certificates.",
      icon: <Award size={18} color="var(--apex-primary)" />
    }
  ];

  const handleApplyNow = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData(prev => ({ ...prev, photo: e.dataTransfer.files[0] }));
      if (formErrors.photo) {
        setFormErrors((prev) => ({ ...prev, photo: '' }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, photo: e.target.files[0] }));
      if (formErrors.photo) {
        setFormErrors((prev) => ({ ...prev, photo: '' }));
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!selectedCollege) {
      errors.college = 'College selection is required';
    } else if (selectedCollege === 'Others' && !customCollege.trim()) {
      errors.customCollege = 'Please specify your college name';
    }
    if (!formData.degree.trim()) errors.degree = 'Degree/Course of study is required';
    if (!formData.year) errors.year = 'Year of study is required';
    if (!formData.linkedin.trim()) errors.linkedin = 'LinkedIn Profile Link is required';
    if (!formData.photoUrl) errors.photo = 'Profile Photo is required';
    if (formData.internStatus === 'new' && !formData.aiToolsUsed.trim()) errors.aiToolsUsed = 'Please tell us what AI tools you use';
    if (formData.internStatus === 'existing') {
      if (!formData.project) errors.project = 'Please choose your project';
    }
    if (formData.internStatus === 'new' && formData.notes.length > 250) {
      errors.notes = 'Motivation/Notes cannot exceed 250 characters';
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
      const submissionData = {
        ...formData,
        college: selectedCollege === 'Others' ? 'Others' : selectedCollege
      };

      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to submit application.');
      }

      setSubmitSuccess(true);
      setSelectedCollege('');
      setCustomCollege('');
      setFormData({
        name: '',
        email: '',
        phone: '',
        college: '',
        degree: '',
        year: '',
        project: '',
        github: '',
        notes: '',
        internStatus: 'new',
        linkedin: '',
        photoUrl: '',
        shortDescription: '',
        aiToolsUsed: ''
      });
    } catch (err: any) {
      alert(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <section className="section" style={{ borderBottom: '1px solid var(--apex-border-dark)', overflow: 'hidden' }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <span className="label" style={{ color: 'var(--apex-primary)', marginBottom: 'var(--space-2)', display: 'block' }}>
            APEX AI LAUNCHPAD (AAL)
          </span>
          <h1 className="display-xl" style={{ marginBottom: 'var(--space-4)' }}>
            Learn. Build. <span className="text-highlight">Launch.</span>
          </h1>
          <p className="body-lg" style={{ color: 'var(--apex-text-muted)', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto', marginBottom: 'var(--space-5)' }}>
            A structured 6-week hands-on internship designed for students to master technical frameworks, build real startup projects in squads, and learn directly from industry mentors.
          </p>
          <button
            onClick={handleApplyNow}
            className="btn"
            style={{
              background: 'var(--gradient-primary)',
              color: '#fff',
              borderRadius: 'var(--radius-full)',
              padding: '14px 32px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-glow-orange)',
              transition: 'transform var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.transform = 'scale(1)';
            }}
          >
            Apply for Internship →
          </button>
        </div>
      </section>

      {/* A. Explore Projects */}
      <section id="projects" ref={domainsAnim.ref} className={`section ${domainsAnim.className}`}>
        <div className="container">
          <SectionHeading
            overline="Build Sprints"
            title="Explore Internship Projects"
            subtitle="Take on one of these 12 specialized startup projects. Click on any project card to see its active interns."
          />
          <div className="grid-3">
            {problemStatements.map((d) => (
              <div
                key={d.id}
                onClick={() => router.push(`/listings/interns?project=${d.id}`)}
                style={{
                  backgroundColor: 'var(--apex-bg-surface)',
                  border: '1px solid var(--apex-border-dark)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <div style={{ fontSize: '2rem' }}>{d.icon || '💡'}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--apex-primary)', fontWeight: '700' }}>
                    View Interns →
                  </span>
                </div>
                <h4 className="heading-sm" style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--apex-text-white)' }}>{d.title}</h4>
                <p className="body-sm" style={{ color: 'var(--apex-text-muted)', marginBottom: '8px' }}>{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* B. Learn from Experts */}
      <section ref={mentorsAnim.ref} className={`section ${mentorsAnim.className}`} style={{ backgroundColor: 'var(--apex-bg-surface-elevated)' }}>
        <div className="container">
          <SectionHeading
            overline="Mentorship"
            title="Learn From Industry Experts"
            subtitle="Engage with leading experts who mentor our teams on architecture, product design, and growth."
          />
          {/* Grid list of experts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-4)'
          }} className="grid-3">
            {activeExperts.map((expert, idx) => (
              <div
                key={expert.id || expert.name + idx}
                style={{
                  backgroundColor: 'var(--apex-bg-surface)',
                  border: '1px solid var(--apex-border-dark)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'border-color var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base)'
                }}
                className="expert-card"
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
                {/* Photo with beautiful avatar border styling */}
                <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '-4px',
                    right: '-4px',
                    bottom: '-4px',
                    background: 'linear-gradient(135deg, var(--apex-primary), var(--apex-primary-warm))',
                    borderRadius: '50%',
                    zIndex: 1
                  }} />
                  {expert.photo ? (
                    <img
                      src={expert.photo}
                      alt={expert.name}
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        position: 'relative',
                        zIndex: 2,
                        border: '3px solid var(--apex-bg-surface)'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 107, 0, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: 'var(--apex-primary)',
                      border: '3px solid var(--apex-bg-surface)',
                      position: 'relative',
                      zIndex: 2
                    }}>
                      {expert.name ? expert.name[0] : '?'}
                    </div>
                  )}
                </div>

                <h3 className="heading-sm" style={{ color: 'var(--apex-text-white)', marginBottom: '6px', fontSize: '1.2rem' }}>
                  {expert.name}
                </h3>

                <p className="body-sm" style={{ color: 'var(--apex-primary-warm)', fontWeight: '600', marginBottom: '4px' }}>
                  {expert.role || expert.designation}
                </p>
                <p className="body-sm" style={{ color: 'var(--apex-text-muted)', margin: 0 }}>
                  {expert.company}
                </p>

                {expert.currentProblemStatement && (
                  <div style={{ marginTop: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      backgroundColor: 'rgba(255, 90, 20, 0.1)',
                      color: 'var(--apex-primary)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: '700',
                      display: 'inline-block'
                    }}>
                      PS: {expert.currentProblemStatement}
                    </span>
                  </div>
                )}

                {(expert.description || expert.bio) && (
                  <p className="body-sm" style={{ color: 'var(--apex-text-muted)', fontSize: '0.8rem', marginTop: '8px', fontStyle: 'italic', maxWidth: '240px', lineHeight: '1.4', flex: 1 }}>
                    "{expert.description || expert.bio}"
                  </p>
                )}

                {expert.socialLinks && expert.socialLinks.filter(Boolean).length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
                    {expert.socialLinks.filter(Boolean).map((link: string, lIdx: number) => {
                      let label = "Link";
                      if (link.includes("linkedin.com")) label = "LinkedIn";
                      else if (link.includes("twitter.com") || link.includes("x.com")) label = "Twitter";
                      else if (link.includes("github.com")) label = "GitHub";
                      else if (link.includes("facebook.com")) label = "Facebook";
                      else if (link.includes("instagram.com")) label = "Instagram";

                      return (
                        <a
                          key={lIdx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            color: 'var(--apex-primary)',
                            backgroundColor: 'rgba(255, 107, 0, 0.1)',
                            border: '1px solid rgba(255, 107, 0, 0.2)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            textDecoration: 'none',
                            transition: 'all var(--transition-fast)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--apex-primary)';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 107, 0, 0.1)';
                            e.currentTarget.style.color = 'var(--apex-primary)';
                          }}
                        >
                          {label}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* C. Vertical Timeline Journey */}
      <section ref={journeyAnim.ref} className={`section ${journeyAnim.className}`}>
        <div className="container">
          <SectionHeading
            overline="Roadmap"
            title="Your AAL Internship Journey"
            subtitle="What does the 6-week timeline look like? From selecting to pitching."
          />

          <div style={{
            position: 'relative',
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px 0'
          }}>
            {/* Center Line */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '2px',
              background: 'var(--gradient-timeline)',
              transform: 'translateX(-50%)',
              zIndex: 1
            }} />

            {journeyStages.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={item.stage} style={{
                  display: 'flex',
                  justifyContent: isEven ? 'flex-start' : 'flex-end',
                  alignItems: 'center',
                  width: '100%',
                  marginBottom: 'var(--space-5)',
                  position: 'relative'
                }}>
                  {/* Timeline Dot with Stage Icon */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: '3px solid var(--apex-primary)',
                      transform: 'translateX(-50%)',
                      zIndex: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--apex-bg-surface-elevated)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Card Container */}
                  <div style={{
                    width: '43%',
                    backgroundColor: 'var(--apex-bg-surface)',
                    border: '1px solid var(--apex-border-dark)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    boxShadow: 'var(--shadow-sm)',
                    textAlign: 'left'
                  }}>
                    <span className="label" style={{ color: 'var(--apex-primary)', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                      {item.stage}
                    </span>
                    <h4 className="heading-sm" style={{ marginBottom: '8px', color: 'var(--apex-text-white)' }}>{item.title}</h4>
                    <p className="body-sm" style={{ color: 'var(--apex-text-muted)' }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Mini Application Form Section */}
          <div
            ref={(el) => {
              formRef.current = el;
              formAnim.ref(el);
            }}
            className={formAnim.className}
            style={{
              maxWidth: '700px',
              margin: '0 auto var(--space-6) auto',
              backgroundColor: 'var(--apex-bg-surface)',
              border: '1px solid var(--apex-border-dark)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              boxShadow: 'var(--shadow-md)',
              position: 'relative'
            }}
          >
            <h3 className="heading-md" style={{ color: 'var(--apex-text-white)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
              Internship Application
            </h3>
            <p className="body-sm" style={{ color: 'var(--apex-text-muted)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
              Select your type, fill out the form, and apply for listing or onboarding.
            </p>

            {submitSuccess ? (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-5) 0',
                color: '#10B981',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--apex-primary)' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--apex-text-white)' }}>Application Submitted!</h4>
                <p className="body-sm" style={{ color: 'var(--apex-text-muted)', maxWidth: '400px' }}>
                  Thank you for applying to APEX AI Launchpad. Our mentors will review your details and reach out.
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
                {/* Intern Status Dropdown */}
                <div style={{ marginBottom: 'var(--space-2)' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Intern Type *</label>
                  <ApexDropdown
                    label={formData.internStatus === 'new' ? 'New Intern (Admin will assign project)' : 'Existing Intern (Apply for listing on live website)'}
                    options={[
                      { value: 'new', label: 'New Intern (Admin will assign project)' },
                      { value: 'existing', label: 'Existing Intern (Apply for listing on live website)' }
                    ]}
                    onSelect={(value) => {
                      setFormData((prev) => ({ ...prev, internStatus: value, project: value === 'new' ? '' : prev.project }));
                      setFormErrors((prev) => ({ ...prev, project: '', photo: '' }));
                    }}
                    minWidth="100%"
                  />
                </div>

                <div className="grid-2">
                  {/* Name */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Rahul Patil"
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

                <div className="grid-2">
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

                  {/* LinkedIn link */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>LinkedIn Profile Link *</label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleFormChange}
                      placeholder="https://linkedin.com/in/username"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--apex-bg-surface-elevated)',
                        border: formErrors.linkedin ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                        color: 'var(--apex-text-white)',
                        fontSize: '0.9rem'
                      }}
                    />
                    {formErrors.linkedin && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.linkedin}</span>}
                  </div>
                </div>

                <div className="grid-2">
                  {/* College / University */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>College / University Name *</label>
                    <ApexDropdown
                      label={selectedCollege || 'Select College'}
                      options={[
                        { value: 'Government College of Engineering Jalgaon', label: 'Government College of Engineering Jalgaon' },
                        { value: 'SSBT College of Engineering and Technology', label: 'SSBT College of Engineering and Technology' },
                        { value: "KCE's College of Engineering", label: "KCE's College of Engineering" },
                        { value: 'M. J. College', label: 'M. J. College' },
                        { value: 'IMR College', label: 'IMR College' },
                        { value: "Godavari Foundation's College of Engineering", label: "Godavari Foundation's College of Engineering" },
                        { value: 'Others', label: 'Others' }
                      ]}
                      onSelect={(val) => {
                        setSelectedCollege(val);
                        if (val !== 'Others') {
                          setFormData(prev => ({ ...prev, college: val }));
                        } else {
                          setFormData(prev => ({ ...prev, college: 'Others' }));
                        }
                        if (formErrors.college) {
                          setFormErrors(prev => ({ ...prev, college: '' }));
                        }
                      }}
                      minWidth="100%"
                    />
                    {formErrors.college && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.college}</span>}
                    
                    {selectedCollege === 'Others' && (
                      <div style={{ marginTop: '10px' }}>
                        <input
                          type="text"
                          value={customCollege}
                          onChange={(e) => {
                            setCustomCollege(e.target.value);
                            if (formErrors.customCollege) {
                              setFormErrors(prev => ({ ...prev, customCollege: '' }));
                            }
                          }}
                          placeholder="Type your college name..."
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--apex-bg-surface-elevated)',
                            border: formErrors.customCollege ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                            color: 'var(--apex-text-white)',
                            fontSize: '0.9rem'
                          }}
                        />
                        {formErrors.customCollege && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.customCollege}</span>}
                      </div>
                    )}
                  </div>

                  {/* Degree / Course */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Degree / Course of Study *</label>
                    <input
                      type="text"
                      name="degree"
                      value={formData.degree}
                      onChange={handleFormChange}
                      placeholder="e.g. B.Tech Computer Engineering"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--apex-bg-surface-elevated)',
                        border: formErrors.degree ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                        color: 'var(--apex-text-white)',
                        fontSize: '0.9rem'
                      }}
                    />
                    {formErrors.degree && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.degree}</span>}
                  </div>
                </div>

                <div className="grid-2">
                  {/* Year of Study */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Year of Study *</label>
                    <ApexDropdown
                      label={formData.year || 'Select study year'}
                      options={[
                        { value: '1st Year', label: '1st Year' },
                        { value: '2nd Year', label: '2nd Year' },
                        { value: '3rd Year', label: '3rd Year' },
                        { value: '4th Year', label: '4th Year (Final Year)' },
                        { value: 'Graduate / Other', label: 'Graduate / Other' }
                      ]}
                      onSelect={(value) => {
                        setFormData((prev) => ({ ...prev, year: value }));
                        if (formErrors.year) {
                          setFormErrors((prev) => ({ ...prev, year: '' }));
                        }
                      }}
                      minWidth="100%"
                    />
                    {formErrors.year && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.year}</span>}
                  </div>

                  {/* Github */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Github / Portfolio Link (Optional)</label>
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleFormChange}
                      placeholder="https://github.com/username"
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

                 {/* Project Selection (Existing Only) */}
                {formData.internStatus === 'existing' && (
                  <div style={{ marginBottom: 'var(--space-2)' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Your Project *</label>
                    <ApexDropdown
                      label={problemStatements.find(d => d.id === formData.project)?.title || 'Select your project'}
                      options={problemStatements.map((d) => ({ value: d.id, label: d.title }))}
                      onSelect={(value) => {
                        setFormData((prev) => ({ ...prev, project: value }));
                        if (formErrors.project) {
                          setFormErrors((prev) => ({ ...prev, project: '' }));
                        }
                      }}
                      minWidth="100%"
                    />
                    {formErrors.project && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.project}</span>}
                  </div>
                )}

                {/* AI Tools (New Interns Only) */}
                {formData.internStatus === 'new' && (
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>What AI tools have you used? *</label>
                    <input
                      type="text"
                      name="aiToolsUsed"
                      value={formData.aiToolsUsed || ''}
                      onChange={handleFormChange}
                      placeholder="e.g. ChatGPT, GitHub Copilot, Claude"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--apex-bg-surface-elevated)',
                        border: formErrors.aiToolsUsed ? '1.5px solid var(--apex-primary)' : '1px solid var(--apex-border-dark)',
                        color: 'var(--apex-text-white)',
                        fontSize: '0.9rem'
                      }}
                    />
                    {formErrors.aiToolsUsed && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.aiToolsUsed}</span>}
                  </div>
                )}

                {/* Profile Photo Upload */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Profile Photo *</label>
                  <ImageUpload
                    uploadType="intern_photo"
                    value={formData.photoUrl}
                    onChange={(url) => {
                      setFormData((prev) => ({ ...prev, photoUrl: url }));
                      if (formErrors.photo) {
                        setFormErrors((prev) => ({ ...prev, photo: '' }));
                      }
                    }}
                  />
                  {formErrors.photo && <span style={{ color: 'var(--apex-primary)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{formErrors.photo}</span>}
                </div>

                {/* Statement / Notes (New Only) */}
                {formData.internStatus === 'new' && (
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--apex-text-white)', display: 'block', marginBottom: '6px' }}>Why do you want to join this project? (Optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      rows={3}
                      maxLength={250}
                      placeholder="Briefly tell us about your experience or motivation..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--apex-bg-surface-elevated)',
                        border: '1px solid var(--apex-border-dark)',
                        color: 'var(--apex-text-white)',
                        fontSize: '0.9rem',
                        resize: 'vertical'
                      }}
                    />
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--apex-text-muted)', marginTop: '4px' }}>
                      {formData.notes.length} / 250 characters
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: 'var(--gradient-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '14px 28px',
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
                  {isSubmitting ? 'Submitting...' : (formData.internStatus === 'existing' ? 'Submit Listings Application' : 'Submit Application')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
