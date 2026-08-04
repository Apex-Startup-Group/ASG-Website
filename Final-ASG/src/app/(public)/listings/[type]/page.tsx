'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Filter } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper/PageWrapper';
import SectionHeading from '@/components/common/SectionHeading/SectionHeading';
import ApexDropdown from '@/components/common/ApexDropdown/ApexDropdown';

function ListingsContent() {
  const params = useParams();
  const type = params.type as string;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Resolve standard types
  const validTypes = ['founders', 'mentors', 'investors', 'service-providers', 'interns'];
  const currentType = validTypes.includes(type) ? type : 'founders';

  // State for project filter (applicable for interns only)
  const [selectedProject, setSelectedProject] = useState('all');
  const [dbMembers, setDbMembers] = useState<any[]>([]);
  const [dbInterns, setDbInterns] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const projectInUrl = searchParams.get('project');
    if (projectInUrl) {
      setSelectedProject(projectInUrl);
    } else {
      setSelectedProject('all');
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        if (currentType === 'interns') {
          const res = await fetch('/api/v1/interns');
          if (res.ok) {
            const { data } = await res.json();
            setDbInterns(data || []);
          }
        } else {
          const res = await fetch('/api/v1/community-members');
          if (res.ok) {
            const { data } = await res.json();
            setDbMembers(data || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live listings:", err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, [currentType]);

  // Headers metadata
  const metaMap: Record<string, { overline: string; title: string; subtitle: string }> = {
    founders: {
      overline: "ASG Ecosystem Nodes",
      title: "Ecosystem Founders",
      subtitle: "Meet our early-stage builders, product innovators, and tech visionaries actively running companies."
    },
    mentors: {
      overline: "ASG Ecosystem Nodes",
      title: "Domain Mentors",
      subtitle: "Meet our domain experts, legal advisors, marketing specialists, and tech leads guiding builders."
    },
    investors: {
      overline: "ASG Ecosystem Nodes",
      title: "Angel Investors",
      subtitle: "Meet our angel syndicates, corporate leaders, and VC partners seeking regional technology investments."
    },
    "service-providers": {
      overline: "ASG Ecosystem Nodes",
      title: "Service Providers",
      subtitle: "Meet our validated legal, chartered accountant, tech consulting, design agency, and server hosting partners."
    },
    interns: {
      overline: "AAL Talent Pool",
      title: "Active Intern Cohorts",
      subtitle: "Explore our cross-functional squads containing web devs, PMs, and designers working on startup prototypes."
    }
  };

  const currentMeta = metaMap[currentType];

  const handleProjectFilterChange = (val: string) => {
    setSelectedProject(val);
    const newParams = new URLSearchParams(searchParams.toString());
    if (val === 'all') {
      newParams.delete('project');
    } else {
      newParams.set('project', val);
    }
    router.push(`/listings/${type}?${newParams.toString()}`);
  };

  // Derive dynamic domains list from live intern records
  const dynamicDomainsMap = new Map<string, string>();
  dbInterns.forEach((intern) => {
    const rawDomain = intern.domain || 'General';
    const slug = rawDomain.toLowerCase().replace(/\s+/g, '-');
    if (!dynamicDomainsMap.has(slug)) {
      dynamicDomainsMap.set(slug, rawDomain);
    }
  });

  const availableDomains = Array.from(dynamicDomainsMap.entries()).map(([id, name]) => ({ id, name }));

  // Get data to display
  let displayData: any[] = [];
  if (currentType === 'interns') {
    if (selectedProject === 'all') {
      displayData = dbInterns.map(intern => ({
        id: intern.id,
        name: intern.name,
        course: intern.course || 'B.Tech/Other',
        year: intern.year || 'Graduated/Active',
        college: intern.college || 'SSBT COET',
        photo: intern.photo || '',
        project: intern.domain || 'General',
        projectId: (intern.domain || 'general').toLowerCase().replace(/\s+/g, '-')
      }));
    } else {
      displayData = dbInterns
        .filter(intern => {
          const projId = (intern.domain || 'general').toLowerCase().replace(/\s+/g, '-');
          return projId === selectedProject;
        })
        .map(intern => ({
          id: intern.id,
          name: intern.name,
          course: intern.course || 'B.Tech/Other',
          year: intern.year || 'Graduated/Active',
          college: intern.college || 'SSBT COET',
          photo: intern.photo || '',
          project: intern.domain || 'General',
          projectId: selectedProject
        }));
    }
  } else {
    const typeMapping: Record<string, string> = {
      'founders': 'founder',
      'mentors': 'mentor',
      'investors': 'investor',
      'service-providers': 'service_provider',
      'other': 'other'
    };
    const dbType = typeMapping[currentType];
    displayData = dbMembers
      .filter(m => m.memberType === dbType && m.showOnWebsite)
      .map(m => ({
        id: m.id,
        name: m.name,
        company: m.company || '',
        role: m.designation || m.memberType || '',
        photo: m.photo || '',
        phone: m.phone || '',
        companyWebsite: m.websiteUrl || '',
        socialLinks: m.linkedinUrl ? [m.linkedinUrl] : [],
        description: m.bio || ''
      }));
  }

  // Resolve currently selected project name
  const currentProjectName = selectedProject === 'all' ? 'All Projects' : (dynamicDomainsMap.get(selectedProject) || selectedProject);

  return (
    <div className="container">
      {/* Back button */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link
          href={currentType === 'interns' ? '/aal' : '/asg'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--apex-primary)',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'transform var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = 'translateX(-4px)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = 'translateX(0)';
          }}
        >
          <ArrowLeft size={16} /> Back to {currentType === 'interns' ? 'APEX AI Launchpad (AAL)' : 'ASG Page'}
        </Link>
      </div>

      {/* Section heading */}
      <SectionHeading
        overline={currentMeta.overline}
        title={currentMeta.title}
        subtitle={currentMeta.subtitle}
      />

      {/* Filters for interns */}
      {currentType === 'interns' && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          marginBottom: 'var(--space-5)',
          backgroundColor: 'var(--apex-bg-surface-elevated)',
          padding: '12px 24px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--apex-border-dark)',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <Filter size={18} color="var(--apex-primary)" />
          <label style={{ color: 'var(--apex-text-white)', fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            Filter by Project:
          </label>
          <ApexDropdown
            label={currentProjectName}
            options={[
              { value: 'all', label: 'All Projects' },
              ...availableDomains.map((d) => ({ value: d.id, label: d.name }))
            ]}
            onSelect={handleProjectFilterChange}
            minWidth="200px"
          />
        </div>
      )}

      {/* Listings Grid */}
      {displayData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-6) 0', color: 'var(--apex-text-muted)' }}>
          No members found in this category.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)'
        }} className="grid-3">
          {displayData.map((member, idx) => (
            <div
              key={member.id || member.name + idx}
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
                <img
                  src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                  alt={member.name}
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
              </div>

              <h3 className="heading-sm" style={{ color: 'var(--apex-text-white)', marginBottom: '6px', fontSize: '1.2rem' }}>
                {member.name}
              </h3>

              {currentType !== 'interns' ? (
                <>
                  <p className="body-sm" style={{ color: 'var(--apex-primary-warm)', fontWeight: '600', marginBottom: '4px' }}>
                    {member.role}
                  </p>
                  <p className="body-sm" style={{ color: 'var(--apex-text-muted)', margin: 0 }}>
                    {member.companyWebsite ? (
                      <a href={member.companyWebsite} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--apex-text-white)', textDecoration: 'underline', transition: 'color var(--transition-fast)' }} onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.color = 'var(--apex-primary)';
                      }} onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.color = 'var(--apex-text-white)';
                      }}>
                        {member.company} 🔗
                      </a>
                    ) : member.company}
                  </p>
                  {member.phone && (
                    <p className="body-sm" style={{ color: 'var(--apex-text-muted)', fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                      <span>📞</span> {member.phone}
                    </p>
                  )}
                  {member.description && (
                    <p className="body-sm" style={{ color: 'var(--apex-text-muted)', fontSize: '0.8rem', marginTop: '8px', fontStyle: 'italic', maxWidth: '240px', lineHeight: '1.4' }}>
                      "{member.description}"
                    </p>
                  )}
                  {member.socialLinks && member.socialLinks.filter(Boolean).length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
                      {member.socialLinks.filter(Boolean).map((link: string, lIdx: number) => {
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
                </>
              ) : (
                <>
                  <p className="body-sm" style={{ color: 'var(--apex-text-white)', fontWeight: '500', fontSize: '0.85rem', margin: '2px 0' }}>
                    🏫 {member.college}
                  </p>
                  <p className="body-sm" style={{ color: 'var(--apex-text-muted)', fontSize: '0.8rem', margin: '2px 0' }}>
                    <strong>Course:</strong> {member.course}
                  </p>
                  <p className="body-sm" style={{ color: 'var(--apex-text-muted)', fontSize: '0.8rem', margin: '2px 0 8px 0' }}>
                    <strong>Year:</strong> {member.year}
                  </p>
                  <span style={{
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(255, 90, 20, 0.1)',
                    color: 'var(--apex-primary)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: '700',
                    display: 'inline-block'
                  }}>
                    Project: {member.project}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Listings() {
  return (
    <PageWrapper>
      <section className="section" style={{ borderBottom: '1px solid var(--apex-border-dark)', minHeight: '80vh' }}>
        <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center' }}>Loading listings...</div>}>
          <ListingsContent />
        </Suspense>
      </section>
    </PageWrapper>
  );
}
