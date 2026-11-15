'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Buildings,
  ShieldCheck,
  Moon,
  Sun,
  ArrowRight,
  SignIn as SignInIcon,
  UserPlus,
  MapPin,
  Clock,
  CalendarCheck,
  UserCheck,
  CheckCircle,
  List,
  X,
  CaretDown,
  Sparkle,
} from '@phosphor-icons/react';
import { Button, Card, Badge, Input } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth-context';

export default function WebsiteHomePage() {
  const router = useRouter();
  const { me, theme, toggleTheme, api, setSessionTokens } = useAuth();

  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Header quick sign-in dropdown toggle
  const [loginToggleOpen, setLoginToggleOpen] = useState(false);
  const [headerEmail, setHeaderEmail] = useState('');
  const [headerPassword, setHeaderPassword] = useState('');
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [headerSubmitting, setHeaderSubmitting] = useState(false);

  // Selected campus preview
  const [activeCampusTab, setActiveCampusTab] = useState<'main' | 'tech' | 'medical'>('main');

  // Interactive FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const campusData = {
    main: {
      name: 'Main University Campus',
      code: 'MAIN',
      location: '100 University Boulevard, Academic District',
      timezone: 'UTC',
      departments: 14,
      programs: 28,
      rooms: 64,
      students: 647,
      description: 'The historic central campus featuring administrative headquarters, central library, and flagship departments.',
    },
    tech: {
      name: 'North Tech Innovation Campus',
      code: 'NORTH',
      location: '500 Innovation Way, Cyber Park',
      timezone: 'America/New_York',
      departments: 8,
      programs: 16,
      rooms: 32,
      students: 310,
      description: 'Dedicated center for Computer Science, Robotics, Data Science laboratories, and faculty research hubs.',
    },
    medical: {
      name: 'South Medical & Health Sciences',
      code: 'SOUTH',
      location: '220 Hospital Parkway, Health Quad',
      timezone: 'UTC',
      departments: 6,
      programs: 10,
      rooms: 24,
      students: 215,
      description: 'Specialized healthcare and clinical facility with advanced simulator rooms and diagnostic study suites.',
    },
  };

  const faqItems = [
    {
      q: 'How does multi-campus synchronization work across different branches?',
      a: 'Every campus branch operates within a unified database core. Room scheduling, cross-campus faculty assignments, and department courses update in real time with automatic conflict detection.',
    },
    {
      q: 'How are new student and faculty registrations verified?',
      a: 'Applicants submit an in-app or web self-registration. Academic administrators receive the request in the central verification desk to review credentials, assign department roles, and activate the account.',
    },
    {
      q: 'Is the platform fully accessible on smartphones and tablets?',
      a: 'Yes. The web console is completely responsive for mobile Safari and Chrome, while the dedicated native Android APK delivers offline-capable attendance scanning and notifications.',
    },
    {
      q: 'How is student privacy and institutional governance maintained?',
      a: 'Smart EDU strictly enforces role-based access control (RBAC). Student transcripts, grading records, and attendance logs are partitioned by department and protected with immutable audit trails.',
    },
  ];

  async function handleHeaderLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!headerEmail.trim() || !headerPassword) {
      setHeaderError('Please enter your university email and password.');
      return;
    }
    setHeaderError(null);
    setHeaderSubmitting(true);
    try {
      const res = await api.authLogin<{
        status: string;
        accessToken?: string;
        refreshToken?: string;
      }>({
        email: headerEmail.trim(),
        password: headerPassword,
        platform: 'web',
        deviceName: 'Website Header Quick Sign-In',
      });

      if (res.status === 'AUTHENTICATED' && res.accessToken) {
        const sessionMe = await setSessionTokens(res.accessToken, res.refreshToken);
        const tier = sessionMe?.activeContext.roleTier;
        if (tier === 'STUDENT' || tier === 'PARENT') {
          router.push('/portal');
        } else {
          router.push('/console');
        }
      } else {
        router.push('/sign-in');
      }
    } catch (err) {
      setHeaderError(err instanceof Error ? err.message : 'Invalid credentials or account pending approval.');
    } finally {
      setHeaderSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--se-bg-canvas)] text-[var(--se-text-primary)] antialiased">
      {/* Sticky Header with Adaptive Mobile & Tablet Navigation */}
      <header className="sticky top-0 z-50 border-b border-[var(--se-border)] bg-[var(--se-bg-canvas)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-60 max-w-7xl items-center justify-between px-16 sm:px-24 lg:px-32">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-8 focus:outline-none">
            <img
              src={theme === 'dark' ? '/brand/smart-edu-logo-dark.svg' : '/brand/smart-edu-logo-light.svg'}
              alt="Smart EDU Logo"
              className="h-28 sm:h-32 w-auto"
            />
          </Link>

          {/* Desktop Navigation Links (Tablet Landscape & Desktop) */}
          <nav className="hidden md:flex items-center gap-20 lg:gap-28 text-xs font-medium text-[var(--se-text-secondary)]">
            <a href="#campuses" className="hover:text-teal-400 transition-colors">Campuses</a>
            <a href="#features" className="hover:text-teal-400 transition-colors">Academic Suite</a>
            <a href="#governance" className="hover:text-teal-400 transition-colors">Governance & Security</a>
            <a href="#faq" className="hover:text-teal-400 transition-colors">FAQ</a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-8 sm:gap-12">
            {/* Theme Toggle Button */}
            <Button
              variant="secondary"
              size="sm"
              aria-label="Toggle color theme"
              onClick={toggleTheme}
              className="p-8"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>

            {me ? (
              <Button
                size="sm"
                onClick={() => router.push(me.activeContext.roleTier === 'STUDENT' ? '/portal' : '/console')}
                className="flex items-center gap-6"
              >
                <span className="hidden sm:inline">Workspace</span>
                <ArrowRight size={14} />
              </Button>
            ) : (
              <div className="relative">
                <Button
                  size="sm"
                  onClick={() => setLoginToggleOpen((v) => !v)}
                  className="flex items-center gap-6 bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold"
                >
                  <SignInIcon size={16} weight="bold" />
                  <span>Sign In</span>
                </Button>

                {/* Quick Sign-In Dropdown Card (Mobile/Tablet Friendly Viewport Anchor) */}
                {loginToggleOpen && (
                  <div className="fixed sm:absolute inset-x-16 sm:inset-x-auto sm:right-0 top-68 sm:top-auto sm:mt-8 sm:w-84 rounded-2xl border border-[var(--se-border)] bg-[var(--se-bg-card)] p-16 sm:p-20 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between pb-8 border-b border-[var(--se-border)] mb-12">
                      <span className="caption-4 font-semibold text-[var(--se-text-primary)]">
                        Portal Quick Sign In
                      </span>
                      <button
                        type="button"
                        onClick={() => setLoginToggleOpen(false)}
                        className="rounded p-4 text-xs text-[var(--se-text-muted)] hover:text-[var(--se-text-primary)] focus:outline-none"
                      >
                        ✕
                      </button>
                    </div>

                    {headerError && (
                      <div className="mb-12 rounded-lg border border-red-500/30 bg-red-950/30 p-8 text-[11px] text-red-400">
                        {headerError}
                      </div>
                    )}

                    <form onSubmit={handleHeaderLogin} className="space-y-10">
                      <div>
                        <label className="caption-5 mb-4 block text-[var(--se-text-secondary)]">
                          University Email
                        </label>
                        <Input
                          type="email"
                          required
                          value={headerEmail}
                          onChange={(e) => setHeaderEmail(e.target.value)}
                          placeholder="name@university.edu"
                          className="h-36 text-xs w-full"
                        />
                      </div>
                      <div>
                        <label className="caption-5 mb-4 block text-[var(--se-text-secondary)]">
                          Password
                        </label>
                        <Input
                          type="password"
                          required
                          value={headerPassword}
                          onChange={(e) => setHeaderPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-36 text-xs w-full"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={headerSubmitting}
                        className="w-full h-36 text-xs font-semibold bg-teal-500 hover:bg-teal-600 text-slate-950"
                      >
                        {headerSubmitting ? 'Authenticating...' : 'Sign In'}
                      </Button>
                    </form>

                    <div className="mt-14 pt-10 border-t border-[var(--se-border)] flex items-center justify-between text-[11px]">
                      <Link
                        href="/sign-in?mode=signup"
                        onClick={() => setLoginToggleOpen(false)}
                        className="text-teal-400 hover:underline"
                      >
                        Create Account →
                      </Link>
                      <Link
                        href="/sign-in"
                        onClick={() => setLoginToggleOpen(false)}
                        className="text-[var(--se-text-muted)] hover:underline"
                      >
                        Full Portal Page
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Toggle (md:hidden) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden flex h-36 w-36 items-center justify-center rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-elevated)] text-[var(--se-text-primary)] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[var(--se-border)] bg-[var(--se-bg-card)]/95 px-20 py-20 backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col space-y-14 text-sm font-medium">
              <a
                href="#campuses"
                onClick={() => setMobileMenuOpen(false)}
                className="py-6 text-[var(--se-text-primary)] hover:text-teal-400 transition-colors"
              >
                Campus Infrastructure
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-6 text-[var(--se-text-primary)] hover:text-teal-400 transition-colors"
              >
                Academic Suite
              </a>
              <a
                href="#governance"
                onClick={() => setMobileMenuOpen(false)}
                className="py-6 text-[var(--se-text-primary)] hover:text-teal-400 transition-colors"
              >
                Governance & Compliance
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-6 text-[var(--se-text-primary)] hover:text-teal-400 transition-colors"
              >
                Frequently Asked Questions
              </a>
            </nav>

            <div className="mt-20 pt-16 border-t border-[var(--se-border)] grid grid-cols-2 gap-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/sign-in?mode=signup');
                }}
                className="w-full text-xs"
              >
                Register
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/sign-in');
                }}
                className="w-full text-xs bg-teal-500 text-slate-950 font-semibold"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section — Fully Responsive Split Layout */}
      <section className="relative overflow-hidden px-16 pt-24 pb-40 sm:pt-40 sm:pb-56 sm:px-24 lg:px-32">
        {/* Subtle background ambient illumination */}
        <div className="pointer-events-none absolute -top-96 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-teal-500/10 via-emerald-500/5 to-transparent blur-3xl rounded-full -z-10" />

        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-28 lg:gap-36 items-center">
            
            {/* Left Column: Outcome, Value Proposition & Actions */}
            <div className="lg:col-span-7 space-y-16 sm:space-y-24 text-left">
              {/* Institutional Platform Pill */}
              <div className="inline-flex items-center gap-8 rounded-full border border-teal-500/30 bg-teal-500/10 px-12 py-6 text-[11px] sm:text-xs font-medium text-teal-300">
                <span className="flex h-8 w-8 rounded-full bg-teal-400 animate-pulse" />
                Unified Higher Education Academic Platform
              </div>

              {/* Main Headline */}
              <h1 className="heading-1 text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 dark:from-white dark:to-slate-400 leading-tight">
                One Platform for Campuses, Academics & Student Services
              </h1>

              {/* Subheadline with clear institutional benefit */}
              <p className="body-2 text-sm sm:text-base text-[var(--se-text-secondary)] max-w-2xl leading-relaxed">
                Connect decentralized campus branches, timetable automation, attendance verification, and student admissions in one unified, real-time institutional core.
              </p>

              {/* Action Buttons (Full width on mobile, auto on sm+) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-10 sm:gap-14 pt-4">
                <Button
                  size="lg"
                  onClick={() => router.push('/sign-in')}
                  className="w-full sm:w-auto flex items-center justify-center gap-8 bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold shadow-lg shadow-teal-500/20 transition-transform active:scale-[0.98]"
                >
                  Sign In to Workspace <ArrowRight size={16} weight="bold" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => router.push('/sign-in?mode=signup')}
                  className="w-full sm:w-auto flex items-center justify-center gap-8 border border-[var(--se-border)] hover:bg-[var(--se-bg-elevated)] transition-transform active:scale-[0.98]"
                >
                  <UserPlus size={16} weight="bold" /> Register Account
                </Button>
              </div>

              {/* Institutional Trust Metrics Strip */}
              <div className="pt-16 sm:pt-20 border-t border-[var(--se-border)] grid grid-cols-3 gap-12 sm:gap-16 max-w-lg">
                <div>
                  <div className="text-lg sm:text-2xl font-semibold text-[var(--se-text-primary)]">600+</div>
                  <div className="text-[11px] sm:text-xs text-[var(--se-text-secondary)]">Enrolled Students</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-semibold text-[var(--se-text-primary)]">14</div>
                  <div className="text-[11px] sm:text-xs text-[var(--se-text-secondary)]">Departments</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-semibold text-teal-400">100%</div>
                  <div className="text-[11px] sm:text-xs text-[var(--se-text-secondary)]">Automated Schedules</div>
                </div>
              </div>
            </div>

            {/* Right Column: Campus Visual Card (No Horizontal Overflow) */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              {/* Outer Card Container */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-[var(--se-bg-card)] shadow-2xl">
                {/* Campus Image */}
                <img
                  src="/images/campus-hero.jpg"
                  alt="Modern university campus building with landscaped entrance"
                  className="w-full h-64 sm:h-84 lg:h-[400px] object-cover"
                />

                {/* Gradient Contrast Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/30 pointer-events-none" />

                {/* Top Floating Badge */}
                <div className="absolute top-12 left-12 right-12 flex items-center justify-between pointer-events-none">
                  <div className="inline-flex items-center gap-6 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/15 px-10 py-5 text-[11px] text-white shadow-md">
                    <span className="flex h-6 w-6 rounded-full bg-emerald-400" />
                    <span className="font-semibold">Main Campus</span>
                    <span className="text-slate-400 hidden sm:inline">• Central Quad</span>
                  </div>
                  <div className="rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 px-8 py-3 text-[10px] font-medium text-slate-300">
                    Academic District
                  </div>
                </div>

                {/* Bottom Overlay Information Box */}
                <div className="absolute bottom-12 left-12 right-12 rounded-xl sm:rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/15 p-12 sm:p-14 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-8 min-w-0">
                      <div className="p-6 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
                        <Buildings size={16} weight="bold" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold leading-tight truncate">Central Academic Complex</div>
                        <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">100 University Boulevard</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/30 rounded-md px-6 py-2 shrink-0">
                      Active Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10 text-center">
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-white">64</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400">Classrooms</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-white">28</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400">Degree Tracks</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-teal-300">647</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400">Students</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Card Institutional Badge (Contained safely without overflow) */}
              <div className="mt-12 flex items-center gap-10 rounded-xl bg-[var(--se-bg-card)] border border-[var(--se-border)] p-12 shadow-md">
                <div className="flex h-36 w-36 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
                  <ShieldCheck size={20} weight="bold" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--se-text-primary)]">Enterprise Security Architecture</div>
                  <div className="text-[11px] text-[var(--se-text-secondary)]">Role-based data segregation and encrypted records</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Multi-Campus Infrastructure Showcase */}
      <section id="campuses" className="border-t border-[var(--se-border)] bg-[var(--se-bg-subtle)] px-16 py-36 sm:py-48 sm:px-24 lg:px-32">
        <div className="mx-auto max-w-6xl space-y-24">
          <div className="text-center space-y-8">
            <h2 className="heading-4 text-xl sm:text-3xl font-semibold text-[var(--se-text-primary)]">
              Multi-Campus Academic Facilities
            </h2>
            <p className="body-6 text-xs sm:text-sm text-[var(--se-text-secondary)] max-w-2xl mx-auto">
              Centralized visibility across academic branches, specialized laboratories, and clinical facilities with live timetable and attendance synchronization.
            </p>

            {/* Campus Selector Tabs (Mobile Wrapping Friendly) */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 pt-4">
              {[
                { id: 'main' as const, label: 'Main Campus (Central)' },
                { id: 'tech' as const, label: 'North Technology Campus' },
                { id: 'medical' as const, label: 'South Medical Sciences' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCampusTab(tab.id)}
                  className={`rounded-lg px-12 sm:px-16 py-8 text-xs font-semibold transition-all ${
                    activeCampusTab === tab.id
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                      : 'border border-[var(--se-border)] bg-[var(--se-bg-card)] text-[var(--se-text-secondary)] hover:text-[var(--se-text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Campus Details Card */}
          {(() => {
            const c = campusData[activeCampusTab];
            return (
              <Card className="p-20 sm:p-28 max-w-4xl mx-auto space-y-20 border-teal-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-12">
                  <div className="flex items-center gap-12">
                    <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
                      <Buildings size={24} weight="duotone" />
                    </div>
                    <div>
                      <span className="font-mono text-[11px] font-semibold text-teal-400">{c.code} Branch</span>
                      <h3 className="heading-5 text-base sm:text-xl font-semibold text-[var(--se-text-primary)]">{c.name}</h3>
                    </div>
                  </div>
                  <Badge tone="success" className="self-start sm:self-auto">Operational</Badge>
                </div>

                <p className="body-5 text-xs sm:text-sm text-[var(--se-text-secondary)] leading-relaxed">{c.description}</p>

                {/* 4 Professional Stat Boxes */}
                <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 text-center">
                  <div className="rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-card)] p-12">
                    <span className="caption-5 text-[11px] text-[var(--se-text-muted)]">Academic Departments</span>
                    <p className="heading-5 mt-4 text-base sm:text-xl font-semibold text-[var(--se-text-primary)]">{c.departments}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-card)] p-12">
                    <span className="caption-5 text-[11px] text-[var(--se-text-muted)]">Degree Programs</span>
                    <p className="heading-5 mt-4 text-base sm:text-xl font-semibold text-[var(--se-text-primary)]">{c.programs}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-card)] p-12">
                    <span className="caption-5 text-[11px] text-[var(--se-text-muted)]">Lecture Halls & Labs</span>
                    <p className="heading-5 mt-4 text-base sm:text-xl font-semibold text-[var(--se-text-primary)]">{c.rooms}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-card)] p-12">
                    <span className="caption-5 text-[11px] text-[var(--se-text-muted)]">Active Students</span>
                    <p className="heading-5 mt-4 text-base sm:text-xl font-semibold text-teal-400">{c.students}</p>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10 border-t border-[var(--se-border)] pt-16 text-xs text-[var(--se-text-muted)]">
                  <div className="flex items-center gap-6">
                    <MapPin size={16} className="text-teal-400 shrink-0" />
                    <span>{c.location}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <Clock size={16} className="text-teal-400 shrink-0" />
                    <span>Timezone: {c.timezone}</span>
                  </div>
                </div>
              </Card>
            );
          })()}
        </div>
      </section>

      {/* Feature Pillars / Academic Suite */}
      <section id="features" className="px-16 py-36 sm:py-48 sm:px-24 lg:px-32">
        <div className="mx-auto max-w-6xl space-y-28">
          <div className="text-center space-y-8">
            <h2 className="heading-4 text-xl sm:text-3xl font-semibold text-[var(--se-text-primary)]">
              Engineered for Modern Academic Governance
            </h2>
            <p className="body-6 text-xs sm:text-sm text-[var(--se-text-secondary)] max-w-2xl mx-auto">
              Replace disconnected spreadsheets and manual rosters with automated timetable generation, verified user onboarding, and granular access control.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
            {/* Pillar 1 */}
            <Card className="p-20 sm:p-24 space-y-12 border-[var(--se-border)] hover:border-teal-500/40 transition-colors">
              <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                <CalendarCheck size={22} weight="duotone" />
              </div>
              <h3 className="heading-6 text-base font-semibold text-[var(--se-text-primary)]">
                Timetable Automation
              </h3>
              <p className="body-6 text-xs sm:text-sm text-[var(--se-text-secondary)] leading-relaxed">
                Algorithmic scheduling that eliminates classroom conflicts, balances faculty workload, and publishes live updates to students.
              </p>
            </Card>

            {/* Pillar 2 */}
            <Card className="p-20 sm:p-24 space-y-12 border-[var(--se-border)] hover:border-teal-500/40 transition-colors">
              <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                <UserCheck size={22} weight="duotone" />
              </div>
              <h3 className="heading-6 text-base font-semibold text-[var(--se-text-primary)]">
                Admissions & Verified Onboarding
              </h3>
              <p className="body-6 text-xs sm:text-sm text-[var(--se-text-secondary)] leading-relaxed">
                Self-service account registration for students and faculty paired with an administrative verification desk to approve new accounts.
              </p>
            </Card>

            {/* Pillar 3 */}
            <Card id="governance" className="p-20 sm:p-24 space-y-12 border-[var(--se-border)] hover:border-teal-500/40 transition-colors">
              <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                <ShieldCheck size={22} weight="duotone" />
              </div>
              <h3 className="heading-6 text-base font-semibold text-[var(--se-text-primary)]">
                Institutional Security & Governance
              </h3>
              <p className="body-6 text-xs sm:text-sm text-[var(--se-text-secondary)] leading-relaxed">
                Role-based authorization across administrators, faculty, students, and parents with tamper-resistant audit logs and data protection.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Mandatory Tagline Reveal Moment (Landing Page Design Guideline) */}
      <section className="border-y border-[var(--se-border)] bg-[var(--se-bg-subtle)] px-16 py-32 sm:py-44 sm:px-24 text-center">
        <div className="mx-auto max-w-3xl space-y-12">
          <div className="inline-flex items-center gap-6 rounded-full border border-teal-500/30 bg-teal-500/10 px-12 py-4 text-[11px] font-medium text-teal-300">
            <Sparkle size={14} weight="fill" />
            Institutional Architecture
          </div>
          <p className="heading-3 text-lg sm:text-2xl lg:text-3xl font-medium text-[var(--se-text-primary)] leading-relaxed">
            A cohesive operating system connecting campus faculties, classroom schedules, and student records in real time.
          </p>
        </div>
      </section>

      {/* Institutional FAQ Section */}
      <section id="faq" className="px-16 py-36 sm:py-48 sm:px-24 lg:px-32">
        <div className="mx-auto max-w-4xl space-y-24">
          <div className="text-center space-y-8">
            <h2 className="heading-4 text-xl sm:text-3xl font-semibold text-[var(--se-text-primary)]">
              Frequently Asked Questions
            </h2>
            <p className="body-6 text-xs sm:text-sm text-[var(--se-text-secondary)]">
              Everything you need to know about the multi-campus academic operating system.
            </p>
          </div>

          <div className="space-y-10">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-card)] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-16 sm:p-20 text-left focus:outline-none"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-[var(--se-text-primary)] pr-12">
                      {item.q}
                    </span>
                    <CaretDown
                      size={18}
                      className={`text-[var(--se-text-muted)] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-16 pb-16 sm:px-20 sm:pb-20 pt-0 text-xs sm:text-sm text-[var(--se-text-secondary)] leading-relaxed border-t border-[var(--se-border)] mt-4">
                      <p className="pt-12">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Conversion Action Banner */}
      <section className="px-16 pb-48 sm:px-24 lg:px-32">
        <div className="mx-auto max-w-5xl rounded-2xl sm:rounded-3xl border border-teal-500/30 bg-gradient-to-b from-teal-950/20 to-[var(--se-bg-card)] p-24 sm:p-36 text-center space-y-16">
          <h2 className="heading-4 text-xl sm:text-3xl font-semibold text-[var(--se-text-primary)]">
            Ready to Connect Your University Campus?
          </h2>
          <p className="body-5 text-xs sm:text-sm text-[var(--se-text-secondary)] max-w-xl mx-auto">
            Experience conflict-free academic timetables, centralized student attendance, and secure role-based administrative control.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-4">
            <Button
              size="lg"
              onClick={() => router.push('/sign-in')}
              className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold px-24"
            >
              Sign In to Workspace
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/sign-in?mode=signup')}
              className="w-full sm:w-auto border border-[var(--se-border)] px-24"
            >
              Register University Account
            </Button>
          </div>
        </div>
      </section>

      {/* Professional Multi-Column Footer */}
      <footer className="border-t border-[var(--se-border)] bg-[var(--se-bg-subtle)] px-16 py-32 sm:py-40 sm:px-24 lg:px-32">
        <div className="mx-auto max-w-6xl space-y-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-24">
            {/* Column 1: Brand & Institutional Notice */}
            <div className="space-y-12">
              <img
                src={theme === 'dark' ? '/brand/smart-edu-logo-dark.svg' : '/brand/smart-edu-logo-light.svg'}
                alt="Smart EDU"
                className="h-28 w-auto"
              />
              <p className="text-xs text-[var(--se-text-secondary)] leading-relaxed">
                Multi-campus higher education operating system unifying academic planning, admissions, and student life.
              </p>
              <div className="flex items-center gap-6 text-[11px] text-teal-400">
                <CheckCircle size={14} weight="fill" />
                <span>All Academic Systems Operational</span>
              </div>
            </div>

            {/* Column 2: Campus Suite */}
            <div className="space-y-10">
              <div className="text-xs font-semibold text-[var(--se-text-primary)]">Campus Infrastructure</div>
              <ul className="space-y-8 text-xs text-[var(--se-text-secondary)]">
                <li><a href="#campuses" className="hover:text-teal-400 transition-colors">Main University Campus</a></li>
                <li><a href="#campuses" className="hover:text-teal-400 transition-colors">North Tech Innovation</a></li>
                <li><a href="#campuses" className="hover:text-teal-400 transition-colors">South Medical Sciences</a></li>
                <li><Link href="/console/campus" className="hover:text-teal-400 transition-colors">Campus Directory</Link></li>
              </ul>
            </div>

            {/* Column 3: Academic Operations */}
            <div className="space-y-10">
              <div className="text-xs font-semibold text-[var(--se-text-primary)]">Academic Operations</div>
              <ul className="space-y-8 text-xs text-[var(--se-text-secondary)]">
                <li><Link href="/console/academics/timetable" className="hover:text-teal-400 transition-colors">Timetable Scheduling</Link></li>
                <li><Link href="/console/approvals" className="hover:text-teal-400 transition-colors">Account Approvals</Link></li>
                <li><Link href="/console/attendance" className="hover:text-teal-400 transition-colors">Attendance Records</Link></li>
                <li><Link href="/portal" className="hover:text-teal-400 transition-colors">Student Portal</Link></li>
              </ul>
            </div>

            {/* Column 4: Access & Governance */}
            <div className="space-y-10">
              <div className="text-xs font-semibold text-[var(--se-text-primary)]">Security & Access</div>
              <ul className="space-y-8 text-xs text-[var(--se-text-secondary)]">
                <li><Link href="/sign-in" className="hover:text-teal-400 transition-colors">Workspace Sign In</Link></li>
                <li><Link href="/sign-in?mode=signup" className="hover:text-teal-400 transition-colors">Account Registration</Link></li>
                <li><Link href="/console/audit-logs" className="hover:text-teal-400 transition-colors">Security Audit Logs</Link></li>
                <li><Link href="/console/compliance" className="hover:text-teal-400 transition-colors">Compliance Standards</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-16 border-t border-[var(--se-border)] flex flex-col sm:flex-row items-center justify-between gap-10 text-[11px] text-[var(--se-text-muted)]">
            <div>© 2026 Smart EDU. All rights reserved.</div>
            <div className="flex items-center gap-16">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>FERPA Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
