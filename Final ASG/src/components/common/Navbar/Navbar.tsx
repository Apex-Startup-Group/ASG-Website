'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import styles from './Navbar.module.css';
import Logo from '../Logo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<'communities' | 'highlights' | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveMobileDropdown(null);
  }, [pathname]);

  const handleApplyClick = () => {
    window.open('https://aal-portal-link.example.com', '_blank', 'noopener,noreferrer');
  };

  const handleJoinClick = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/contact?role=Founder';
    }
  };

  const toggleMobileDropdown = (type: 'communities' | 'highlights') => {
    if (activeMobileDropdown === type) {
      setActiveMobileDropdown(null);
    } else {
      setActiveMobileDropdown(type);
    }
  };

  // Dropdown Items List
  const communitiesItems = [
    { label: 'AAL Program', path: '/aal' },
    { label: 'ASG Community', path: '/asg' }
  ];

  const highlightsItems = [
    { label: 'Events & Meetups', path: '/events' },
    { label: 'Gallery Timeline', path: '/gallery' },
    { label: 'Ecosystem Blogs', path: '/blogs' }
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logoContainer}>
          <Logo size="small" />
        </Link>

        {/* Desktop Nav links */}
        <div className={styles.navLinks}>
          <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.activeNavItem : ''}`}>
            Home
          </Link>

          {/* Communities Dropdown */}
          <div className={styles.dropdownContainer}>
            <div className={`${styles.navItem} ${communitiesItems.some(i => i.path === pathname) ? styles.activeNavItem : ''}`}>
              Communities <ChevronDown size={14} />
            </div>
            <div className={styles.dropdownMenu}>
              {communitiesItems.map(item => (
                <Link
                  key={item.label}
                  href={item.path}
                  className={`${styles.dropdownItem} ${pathname === item.path ? styles.activeDropdownItem : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Highlights Dropdown */}
          <div className={styles.dropdownContainer}>
            <div className={`${styles.navItem} ${highlightsItems.some(i => i.path === pathname) ? styles.activeNavItem : ''}`}>
              Highlights <ChevronDown size={14} />
            </div>
            <div className={styles.dropdownMenu}>
              {highlightsItems.map(item => (
                <Link
                  key={item.label}
                  href={item.path}
                  className={`${styles.dropdownItem} ${pathname === item.path ? styles.activeDropdownItem : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/about" className={`${styles.navItem} ${pathname === '/about' ? styles.activeNavItem : ''}`}>
            About
          </Link>
          <Link href="/contact" className={`${styles.navItem} ${pathname === '/contact' ? styles.activeNavItem : ''}`}>
            Contact
          </Link>
        </div>

        {/* Desktop CTAs */}
        <div className={styles.ctas}>
          <button
            className="btn btn-primary"
            onClick={handleJoinClick}
            style={{
              background: 'var(--gradient-primary)',
              color: '#fff',
              borderRadius: 'var(--radius-full)',
              padding: '10px 22px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.transform = 'scale(1.02)';
              target.style.boxShadow = 'var(--shadow-glow-orange)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.transform = 'scale(1)';
              target.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            Join Community
          </button>
        </div>

        {/* Hamburger */}
        <button
          className={styles.menuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{ color: scrolled ? 'var(--apex-text-white)' : 'var(--apex-primary)' }}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <div className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.mobileOverlayActive : ''}`}>
        <div className={styles.mobileNavLinks}>
          <Link href="/" className={styles.mobileNavItem} onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>

          {/* Mobile Communities */}
          <div className={styles.mobileNavItem} onClick={() => toggleMobileDropdown('communities')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              Communities <ChevronDown size={18} style={{ transform: activeMobileDropdown === 'communities' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
            {activeMobileDropdown === 'communities' && (
              <div className={styles.mobileSubLinks}>
                {communitiesItems.map(item => (
                  <Link key={item.label} href={item.path} className={styles.mobileSubLink} onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Highlights */}
          <div className={styles.mobileNavItem} onClick={() => toggleMobileDropdown('highlights')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              Highlights <ChevronDown size={18} style={{ transform: activeMobileDropdown === 'highlights' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
            {activeMobileDropdown === 'highlights' && (
              <div className={styles.mobileSubLinks}>
                {highlightsItems.map(item => (
                  <Link key={item.label} href={item.path} className={styles.mobileSubLink} onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/about" className={styles.mobileNavItem} onClick={() => setMobileMenuOpen(false)}>
            About
          </Link>
          <Link href="/contact" className={styles.mobileNavItem} onClick={() => setMobileMenuOpen(false)}>
            Contact
          </Link>
        </div>

        <div className={styles.mobileCtas}>
          <button
            onClick={() => { setMobileMenuOpen(false); handleApplyClick(); }}
            style={{
              border: '1.5px solid var(--apex-primary)',
              color: 'var(--apex-primary)',
              borderRadius: 'var(--radius-full)',
              padding: '12px 24px',
              cursor: 'pointer',
              background: 'transparent',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Apply Now (AAL)
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); handleJoinClick(); }}
            style={{
              background: 'var(--gradient-primary)',
              color: '#fff',
              borderRadius: 'var(--radius-full)',
              padding: '14px 24px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              boxShadow: 'var(--shadow-glow-orange)'
            }}
          >
            Join ASG Community
          </button>
        </div>
      </div>
    </nav>
  );
}
