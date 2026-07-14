# APEX Hub — Website Technical & Architectural Documentation

Welcome to the documentation for the **APEX Hub Website**. APEX Startup Group (ASG) and APEX AI Launchpad (AAL) form a unified digital portal designed to connect, train, and accelerate the technology and startup ecosystem in Jalgaon, North Maharashtra.

This portal acts as a minimal, high-aesthetic, community-first landing page and directory structure that links local talent with founders, mentors, and investors.

---

## 📂 Table of Contents
1. [Project Overview & Philosophy](#1-project-overview--philosophy)
2. [Technical Stack](#2-technical-stack)
3. [File & Folder Structure](#3-file--folder-structure)
4. [Information Architecture & Pages](#4-information-architecture--pages)
5. [Design System & Styling](#5-design-system--styling)
6. [Data Schema & Configuration](#6-data-schema--configuration)
7. [Key Component & Utility Logic](#7-key-component--utility-logic)
8. [Setup & Running Locally](#8-setup--running-locally)

---

## 1. Project Overview & Philosophy

The APEX Hub web platform is designed to represent two distinct flagship initiatives:
- **ASG (APEX Startup Group):** The startup founder, investor, mentor, and service provider network.
- **AAL (APEX AI Launchpad):** The structured 6-week internship program bridging engineering students to live builds and industry-grade paradigms.

### Core Conversion Goals
1. **Apply for Internship:** Directing students/graduates to the AAL application flow.
2. **Join Community:** Channeling founders, investors, and experts to the ASG registration pipeline.

---

## 2. Technical Stack

The project runs on a modern frontend stack designed for speed, flexibility, and interactive visual polish:
- **Core Library:** [React 19](https://react.dev)
- **Build Tool:** [Vite 8](https://vite.dev)
- **Routing:** [React Router DOM 7](https://reactrouter.com)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com) with Vanilla CSS Variables for token management
- **Animation Framework:** [Anime.js 4](https://animejs.com) (used for synchronized entrance timelines)
- **Icons:** [Lucide React](https://lucide.dev)
- **Interactive UI Primitives:** Radix UI (`@radix-ui/react-dropdown-menu`, `@radix-ui/react-slot`)

---

## 3. File & Folder Structure

The code is organized into clean directory blocks:
```
Website/
├── public/                  # Static assets (Favicons, logos)
├── src/
│   ├── assets/              # Brand logos and illustration assets
│   ├── components/
│   │   ├── common/          # Reusable features (Navbar, Lightbox, SectionHeading)
│   │   ├── layout/          # Global shells (Footer, PageWrapper)
│   │   └── ui/              # Base interactive components (button, dropdown-menu)
│   ├── data/                # Local data models (events, team, mentors, domains)
│   ├── hooks/               # Custom hooks (scroll animation, countup interpolation)
│   ├── pages/               # Routed page entries
│   ├── styles/              # Design tokens and global stylesheets
│   ├── App.jsx              # Routing Configuration
│   ├── main.jsx             # React entry mounting
│   ├── index.css            # Custom animations and tailwind overrides
│   └── App.css              # Main component wrappers
├── package.json             # Dependencies and build script configs
├── tailwind.config.js       # Tailwind system specifications
└── vite.config.js           # Vite development server configs
```

---

## 4. Information Architecture & Pages

The application is client-side routed via `React Router DOM`. The following routes are configured:

### 🏠 Home (`/`)
A long-scroll page highlighting the overall ecosystem.
- **Hero Section:** Staggered fade-up text using Anime.js, typewriter cycle words ("Community", "Innovation", "Growth"), and an abstract rotating navigation orbit component.
- **Statistics Counter:** Integrates `useCountUp` hook displaying metrics of trained interns, completed cohorts, mentors, and hosted events.
- **Dual Split Card:** Offers visual portals split between the AAL and ASG initiatives.
- **Upcoming Events:** Fetches status-filtered upcoming events with custom venue details.
- **Visual Gallery Preview:** Bento-grid of the latest timeline photos with lightbox zoom triggers.
- **Testimonials Section:** Slider/grid of community quotes with visual avatar circles.

### 🚀 APEX AI Launchpad (`/aal`)
Dedicated portal describing the student internship workflow.
- **Domain Cards:** Displays the 12 domains (Web Dev, AI/ML, HoReCa, Mobility, etc.) mapped in a grid.
- **Milestone Timeline:** Vertical tracker charting the internship phases (Selection ➡️ Onboarding ➡️ Domain Deep-Dive ➡️ Project Execution ➡️ Demo Day).

### 🤝 APEX Startup Group (`/asg`)
Focuses on the founder & investor network.
- **Pillars Layout:** Highlights details for Founders, Mentors, Investors, and Service Providers.
- **Directory Portals:** Navigation to Listings representing active start-ups, service listings, or investor portfolios.

### 📅 Events (`/events`)
Interactive program hub divided into three status views:
- **Upcoming Events:** Cards displaying register/RSVP links.
- **Past Events:** Archive of completed sessions with links to media recaps.
- **Recurrent Programs:** Details on recurring meetups and weekly mastermind tables.

### 🖼️ Gallery (`/gallery`)
A comprehensive visual history of the community.
- Uses a vertical orange-gradient timeline path.
- Includes filters for years (e.g. 2024, 2025, 2026) and categories (AAL, ASG, Events).
- Integrated with a React-based fullscreen Lightbox for image carousel navigation.

### ℹ️ About (`/about`)
Background details on the core group.
- **Origin Story:** Explains how the group started from weekend chats in Jalgaon.
- **Mission & Vision:** Elevated visual card blocks showing the long-term roadmap.
- **Core Crew:** Profile grid showing the organizers, avatars, and bios.
- **Partners Marquee:** Infinite-scroll CSS slider highlighting logos of collaborating enterprises (e.g., SimpleSphere, Logic Point).

### ✉️ Contact (`/contact`)
An inquiry form where users select their category (Student, Founder, Mentor, Investor). Populates appropriate fields dynamically and guides conversion pathways.

---

## 5. Design System & Styling

Design tokens are managed in `:root` CSS variables and integrated into Tailwind utilities:

### Colors
- **Primary Accents:** Orange to Red gradient tokens (`--apex-primary: #FF5A14`, `--apex-primary-hot: #FF3D00`, `--apex-primary-light: #FF8A00`).
- **Surface Grays:** Deep gray backgrounds (`--apex-bg-base: #0D0D0D`, `--apex-bg-surface: #1A1A1A`) to ensure premium dark mode presentation.

### Typography
- **Headings & Display:** `Plus Jakarta Sans` or `Inter` (600 to 800 weights) for clean, bold titles with tight tracking (`-0.02em`).
- **Body & Metadata:** `Inter` for readability across device screens.
- **Monospace Code/Labels:** `JetBrains Mono` style chips for technical categorizations.

### Micro-Animations
- **Hover Transitions:** Card translations (`translateY(-2px)`) and orange glow overlays (`--shadow-glow-orange`).
- **Scroll Entrance:** Uses CSS animations mapped to DOM entry boundaries.

---

## 6. Data Schema & Configuration

All UI elements are driven by JSON configurations inside `src/data/` for easy updates without changing JSX logic:

- **`domains.js`:** The 12 learning/industry tracks in the AAL Internship (title, description, emoji icon).
- **`events.js`:** List of events with attributes: `id`, `title`, `date`, `venue`, `type`, `status` (`upcoming` | `past`), `description`, and `registrationUrl`.
- **`gallery.js`:** Timeline events containing: `id`, `title`, `date`, `description`, `photos` (array of image URLs), and classification `tags`.
- **`team.js`:** Profile details of organizers including avatar references, roles, and bios.
- **`mentors.js`:** Active advisors and their respective companies.
- **`blogs.js`:** Educational reads and articles written for the community.
- **`listingsData.js`:** Catalog of active founders, service providers, and startup profiles.

---

## 7. Key Component & Utility Logic

### Scroll Animation Hook (`src/hooks/useScrollAnimation.js`)
Uses a `react-intersection-observer` listener that adds an active viewport class once a section enters the frame, initiating CSS transitions:
```javascript
import { useInView } from 'react-intersection-observer';

export function useScrollAnimation() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  return {
    ref,
    className: inView ? 'animate-fade-in-up' : 'opacity-0 translate-y-6'
  };
}
```

### Stats Interpolator Hook (`src/hooks/useCountUp.js`)
Interpolates integer variables from `0` to the target metric over a specified duration once triggered by scroll intersections.

### Dynamic Infinite Marquee (`src/pages/About.jsx`)
Powered by CSS keyframes translating a track loop. Utilizes cloned logo nodes to support seamless infinite linear motion.

---

## 8. Setup & Running Locally

### Prerequisites
- Node.js (version 18 or above recommended)
- npm (Node Package Manager)

### Commands
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Run Dev Server:**
   ```bash
   npm run dev
   ```
3. **Build Production Assets:**
   ```bash
   npm run build
   ```
4. **Preview Build Locally:**
   ```bash
   npm run preview
   ```
