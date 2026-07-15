'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare } from 'lucide-react';
import styles from './Footer.module.css';
import Logo from '../../common/Logo';

export default function Footer() {
  const [contactDetails, setContactDetails] = useState({
    email: "reachus.asg@gmail.com",
    location: "Jalgaon, Maharashtra, India",
    whatsapp: "https://chat.whatsapp.com/CoG7rugANv166E6p51uLcI",
    instagram: "https://www.instagram.com/apexstartupgroup",
    linkedin: "https://www.linkedin.com/company/apex-startup-group",
    twitter: "https://x.com/apexstartupgrp",
    youtube: "https://youtube.com/@apexstartupgroup"
  });

  useEffect(() => {
    async function fetchContactDetails() {
      try {
        const res = await fetch('/api/v1/site-settings?key=contact_details');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.value) {
            setContactDetails(json.data.value);
          }
        }
      } catch (err) {
        console.error("Failed to load contact details in footer:", err);
      }
    }
    fetchContactDetails();
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <div className={styles.logoContainer}>
              <Logo size="medium" light={true} />
            </div>
            <p className={styles.tagline}>
              Jalgaon's premiere startup and innovation ecosystem. Accelerating careers, building products, and connecting founders.
            </p>
            <div className={styles.socials}>
              <a href={contactDetails.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </a>
              <a href={contactDetails.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
              <a href={contactDetails.twitter} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
              </a>
              <a href={contactDetails.youtube} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25a29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
              <a href={`mailto:${contactDetails.email}`} className={styles.socialIcon} aria-label="Email">
                <Mail size={18} />
              </a>
              <a href={contactDetails.whatsapp} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="WhatsApp Community">
                <MessageSquare size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.colHeading}>Quick Links</h4>
            <div className={styles.linksList}>
              <Link href="/" className={styles.footerLink}>Home</Link>
              <Link href="/aal" className={styles.footerLink}>AAL Internship</Link>
              <Link href="/asg" className={styles.footerLink}>ASG Community</Link>
              <Link href="/events" className={styles.footerLink}>Events & Meetups</Link>
              <Link href="/gallery" className={styles.footerLink}>Timeline Gallery</Link>
              <Link href="/about" className={styles.footerLink}>About APEX</Link>
              <Link href="/blogs" className={styles.footerLink}>Ecosystem Blogs</Link>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 className={styles.colHeading}>Ecosystem Events</h4>
            <div className={styles.linksList}>
              <Link href="/events" className={styles.footerLink}>Monthly Meetups (22 Cohorts)</Link>
              <Link href="/events" className={styles.footerLink}>Breakfast with Brilliance (4 Cohorts)</Link>
              <Link href="/events" className={styles.footerLink}>AI Ki Choupal (2 Cohorts)</Link>
              <Link href="/events" className={styles.footerLink}>Startup Pe Charcha (2 Cohorts)</Link>
              <Link href="/events" className={styles.footerLink}>Apex AI Launchpad (2 Cohorts)</Link>
              <Link href="/events" className={styles.footerLink}>APEX Manthan (1 Cohort)</Link>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className={styles.colHeading}>Connect</h4>
            <div className={styles.linksList}>
              <span className={styles.footerLink}>{contactDetails.location}</span>
              <a href={`mailto:${contactDetails.email}`} className={styles.footerLink}>{contactDetails.email}</a>
              <Link href="/contact" className={styles.footerLink} style={{ color: 'var(--apex-primary)', fontWeight: '600' }}>Get In Touch →</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div>
            © 2026 APEX Startup Group. Built with ❤️ in Jalgaon.
          </div>
          <div className={styles.bottomLinks}>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
