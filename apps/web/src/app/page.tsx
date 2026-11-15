'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Buildings,
  GraduationCap,
  Users,
  ShieldCheck,
  Moon,
  Sun,
  ArrowRight,
  SignIn as SignInIcon,
  UserPlus,
  MapPin,
  Clock,
} from '@phosphor-icons/react';
import { Button, Card, Badge, Input } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth-context';

export default function WebsiteHomePage() {
  const router = useRouter();
  const { me, theme, toggleTheme, api, setSessionTokens } = useAuth();

  // Header login modal / dropdown toggle
  const [loginToggleOpen, setLoginToggleOpen] = useState(false);
  const [headerEmail, setHeaderEmail] = useState('');
  const [headerPassword, setHeaderPassword] = useState('');
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [headerSubmitting, setHeaderSubmitting] = useState(false);

  // Selected campus preview
  const [activeCampusTab, setActiveCampusTab] = useState<'main' | 'tech' | 'medical'>('main');

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
    <div className="min-h-screen bg-[var(--se-bg-canvas)] text-[var(--se-text-primary)]">
      {/* Top Header with Brand and Login Toggle */}
      <header className="sticky top-0 z-40 border-b border-[var(--se-border)] bg-[var(--se-bg-canvas)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-64 max-w-7xl items-center justify-between px-16 sm:px-24">
          <Link href="/" className="flex items-center gap-8">
            <img
              src={theme === 'dark' ? '/brand/smart-edu-logo-dark.svg' : '/brand/smart-edu-logo-light.svg'}
              alt="Smart EDU brand logo"
              className="h-32 w-auto"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-24 text-xs font-medium text-[var(--se-text-secondary)]">
            <a href="#campuses" className="hover:text-teal-400 transition-colors">Campuses</a>
            <a href="#features" className="hover:text-teal-400 transition-colors">Academic Suite</a>
            <a href="#governance" className="hover:text-teal-400 transition-colors">RBAC & Security</a>
          </nav>

          {/* Right Header Actions & Login Toggle */}
          <div className="flex items-center gap-12">
            <Button
              variant="secondary"
              size="sm"
              aria-label="Toggle color theme"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>

            {me ? (
              <Button
                size="sm"
                onClick={() => router.push(me.activeContext.roleTier === 'STUDENT' ? '/portal' : '/console')}
                className="flex items-center gap-6"
              >
                Go to Workspace <ArrowRight size={14} />
              </Button>
            ) : (
              <div className="relative">
                <Button
                  size="sm"
                  onClick={() => setLoginToggleOpen((v) => !v)}
                  className="flex items-center gap-6 bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold"
                >
                  <SignInIcon size={16} weight="bold" />
                  Sign In Toggle
                </Button>

                {/* Header Login Dropdown Card */}
                {loginToggleOpen && (
                  <div className="absolute right-0 mt-8 w-80 rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-card)] p-16 shadow-2xl z-50">
                    <div className="flex items-center justify-between pb-8 border-b border-[var(--se-border)] mb-12">
                      <span className="caption-4 font-semibold text-[var(--se-text-primary)]">
                        Quick Workspace Sign In
                      </span>
                      <button
                        type="button"
                        onClick={() => setLoginToggleOpen(false)}
                        className="text-xs text-[var(--se-text-muted)] hover:text-[var(--se-text-primary)]"
                      >
                        ✕
                      </button>
                    </div>

                    {headerError && (
                      <div className="mb-10 rounded border border-red-500/30 bg-red-950/20 p-6 text-[11px] text-red-400">
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
                          className="h-32 text-xs"
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
                          className="h-32 text-xs"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={headerSubmitting}
                        className="w-full h-32 text-xs font-semibold"
                      >
                        {headerSubmitting ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-[var(--se-border)] flex items-center justify-between text-[11px]">
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
                        Full Portal Sign In
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section — Split Modern Layout with Campus Imagery (Reference UI Aligned) */}
      <section className="relative overflow-hidden px-16 pt-32 pb-48 sm:pt-48 sm:pb-64 sm:px-24">
        {/* Ambient background illumination */}
        <div className="pointer-events-none absolute -top-96 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-teal-500/10 via-emerald-500/5 to-cyan-500/10 blur-3xl rounded-full -z-10" />
        <div className="pointer-events-none absolute top-1/3 -right-64 w-[500px] h-[500px] bg-teal-500/5 blur-3xl rounded-full -z-10" />

        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 lg:gap-40 items-center">
            
            {/* Left Column: Value Proposition, Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-20 text-left">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-8 rounded-full border border-teal-500/30 bg-teal-500/10 px-12 py-6 text-xs font-medium text-teal-300">
                <span className="flex h-8 w-8 rounded-full bg-teal-400 animate-pulse" />
                Multi-Campus University Operating System
              </div>

              {/* Main Headline with skill-compliant text gradient */}
              <h1 className="heading-1 text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 dark:from-white dark:to-slate-400">
                One Unified Platform for Campuses, Academics & Student Life
              </h1>

              {/* Subheadline */}
              <p className="body-2 text-base sm:text-lg text-[var(--se-text-secondary)] max-w-xl leading-relaxed">
                Connected multi-tenant infrastructure powered by Supabase PostgreSQL. Centralized attendance, timetable automation, grading, and secure role-based access.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-12 pt-8">
                <Button
                  size="lg"
                  onClick={() => router.push('/sign-in')}
                  className="flex items-center gap-8 bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In to Workspace <ArrowRight size={18} weight="bold" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => router.push('/sign-in?mode=signup')}
                  className="flex items-center gap-8 border border-[var(--se-border)] hover:bg-[var(--se-bg-elevated)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <UserPlus size={18} weight="bold" /> Register Account
                </Button>
              </div>

              {/* Quick Trust / Institutional Metrics Strip */}
              <div className="pt-16 border-t border-[var(--se-border)] grid grid-cols-3 gap-16 max-w-lg">
                <div>
                  <div className="text-xl sm:text-2xl font-semibold text-[var(--se-text-primary)]">600+</div>
                  <div className="text-xs text-[var(--se-text-secondary)]">Enrolled Students</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-semibold text-[var(--se-text-primary)]">14</div>
                  <div className="text-xs text-[var(--se-text-secondary)]">Departments</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-semibold text-teal-400">100%</div>
                  <div className="text-xs text-[var(--se-text-secondary)]">Conflict-Free Timetables</div>
                </div>
              </div>
            </div>

            {/* Right Column: Campus Featured Visual with Floating Cards (Reference UI Aligned) */}
            <div className="lg:col-span-5 relative">
              {/* Decorative Backdrop Glow Shape */}
              <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-tr from-teal-500/20 via-emerald-500/10 to-transparent blur-xl -z-10" />

              {/* Main Image Frame Container */}
              <div className="relative overflow-hidden rounded-[28px] border border-white/15 dark:border-white/10 bg-[var(--se-bg-card)] shadow-2xl transition-transform hover:scale-[1.01] duration-500">
                <img
                  src="/images/campus-hero.jpg"
                  alt="Modern university campus building with landscaped entrance"
                  className="w-full h-80 sm:h-96 lg:h-[420px] object-cover"
                />

                {/* Subtle gradient overlay for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 pointer-events-none" />

                {/* Top Floating Badge: Campus Status */}
                <div className="absolute top-16 left-16 right-16 flex items-center justify-between pointer-events-none">
                  <div className="inline-flex items-center gap-8 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 px-12 py-6 text-xs text-white shadow-lg">
                    <span className="flex h-8 w-8 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    <span className="font-semibold">Main Campus</span>
                    <span className="text-slate-400">• Operational</span>
                  </div>
                  <div className="rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 px-10 py-4 text-[11px] font-medium text-slate-300">
                    UTC Timezone
                  </div>
                </div>

                {/* Bottom Floating Info Overlay: Facility Metrics */}
                <div className="absolute bottom-16 left-16 right-16 rounded-2xl bg-slate-950/85 backdrop-blur-lg border border-white/15 p-16 text-white shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-8">
                      <div className="p-6 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        <Buildings size={18} weight="bold" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold leading-tight">Central Academic Complex</div>
                        <div className="text-[11px] text-slate-400">100 University Boulevard</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/30 rounded-md px-8 py-2">
                      Live Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10 text-center">
                    <div>
                      <div className="text-sm font-semibold text-white">64</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Labs & Rooms</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">28</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Programs</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-teal-300">647</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Enrolled</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Bottom Badge Accent */}
              <div className="absolute -bottom-16 -right-12 hidden sm:flex items-center gap-8 rounded-xl bg-[var(--se-bg-card)]/90 backdrop-blur-md border border-teal-500/40 p-12 shadow-xl z-20">
                <div className="p-6 rounded-lg bg-teal-500/20 text-teal-400">
                  <ShieldCheck size={20} weight="bold" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--se-text-primary)]">PostgreSQL Active</div>
                  <div className="text-[11px] text-[var(--se-text-secondary)]">Multi-Tenant Tenancy</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Campus Interface & Interactive Showcase */}
      <section id="campuses" className="border-t border-[var(--se-border)] bg-[var(--se-bg-subtle)] px-16 py-48 sm:px-24">
        <div className="mx-auto max-w-6xl space-y-24">
          <div className="text-center space-y-8">
            <h2 className="heading-4 text-[var(--se-text-primary)]">Institutional Campus Infrastructure</h2>
            <p className="body-6 text-[var(--se-text-secondary)]">
              Explore interconnected academic branches with dedicated faculties, classrooms, and synchronized real-time data.
            </p>

            {/* Campus Selector Tabs */}
            <div className="inline-flex rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-4">
              {[
                { id: 'main' as const, label: 'Main Campus (MAIN)' },
                { id: 'tech' as const, label: 'North Tech Campus (NORTH)' },
                { id: 'medical' as const, label: 'South Medical (SOUTH)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCampusTab(tab.id)}
                  className={`rounded-lg px-16 py-8 text-xs font-semibold transition-all ${
                    activeCampusTab === tab.id
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                      : 'text-[var(--se-text-secondary)] hover:text-[var(--se-text-primary)]'
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
              <Card className="p-28 max-w-4xl mx-auto space-y-20 border-teal-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-12">
                  <div className="flex items-center gap-12">
                    <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                      <Buildings size={28} weight="duotone" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-semibold text-teal-400">{c.code}</span>
                      <h3 className="heading-5 text-[var(--se-text-primary)]">{c.name}</h3>
                    </div>
                  </div>
                  <Badge tone="success">Operational</Badge>
                </div>

                <p className="body-5 text-[var(--se-text-secondary)]">{c.description}</p>

                <div className="grid grid-cols-2 gap-12 sm:grid-cols-4 text-center">
                  <div className="rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-12">
                    <span className="caption-5 text-[var(--se-text-muted)]">Departments</span>
                    <p className="heading-5 mt-4 text-[var(--se-text-primary)]">{c.departments}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-12">
                    <span className="caption-5 text-[var(--se-text-muted)]">Degree Programs</span>
                    <p className="heading-5 mt-4 text-[var(--se-text-primary)]">{c.programs}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-12">
                    <span className="caption-5 text-[var(--se-text-muted)]">Classrooms & Labs</span>
                    <p className="heading-5 mt-4 text-[var(--se-text-primary)]">{c.rooms}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-12">
                    <span className="caption-5 text-[var(--se-text-muted)]">Students Enrolled</span>
                    <p className="heading-5 mt-4 text-teal-400">{c.students}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-12 border-t border-[var(--se-border)] pt-16 text-xs text-[var(--se-text-muted)]">
                  <div className="flex items-center gap-6">
                    <MapPin size={16} className="text-teal-400" />
                    <span>{c.location}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <Clock size={16} className="text-teal-400" />
                    <span>Operating Timezone: {c.timezone}</span>
                  </div>
                </div>
              </Card>
            );
          })()}
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="px-16 py-48 sm:px-24">
        <div className="mx-auto max-w-6xl space-y-32">
          <div className="text-center space-y-8">
            <h2 className="heading-4 text-[var(--se-text-primary)]">Engineered for Academic Excellence</h2>
            <p className="body-6 text-[var(--se-text-secondary)]">
              Eliminate disconnected spreadsheets and siloed legacy systems with a cohesive real-time core.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
            <Card className="p-24 space-y-12">
              <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                <GraduationCap size={22} weight="duotone" />
              </div>
              <h3 className="heading-6 text-[var(--se-text-primary)]">Academic Automation</h3>
              <p className="body-6 text-[var(--se-text-secondary)]">
                Automated conflict-free timetable generation, course catalog enrollment, grading moderation, and transcripts.
              </p>
            </Card>

            <Card className="p-24 space-y-12">
              <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                <Users size={22} weight="duotone" />
              </div>
              <h3 className="heading-6 text-[var(--se-text-primary)]">Admin Account Acceptance</h3>
              <p className="body-6 text-[var(--se-text-secondary)]">
                Self-service student and faculty registration with a centralized admin review desk to accept and activate new users.
              </p>
            </Card>

            <Card className="p-24 space-y-12">
              <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                <ShieldCheck size={22} weight="duotone" />
              </div>
              <h3 className="heading-6 text-[var(--se-text-primary)]">Institutional Governance</h3>
              <p className="body-6 text-[var(--se-text-secondary)]">
                Multi-tenant role-based access control, immutable audit trails, and strict database authentication.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--se-border)] bg-[var(--se-bg-subtle)] px-16 py-24 sm:px-24">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-12 sm:flex-row text-xs text-[var(--se-text-muted)]">
          <div className="flex items-center gap-8">
            <img
              src={theme === 'dark' ? '/brand/smart-edu-logo-dark.svg' : '/brand/smart-edu-logo-light.svg'}
              alt="Smart EDU"
              className="h-24 w-auto"
            />
            <span>© 2026 Smart EDU. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-16">
            <Link href="/sign-in" className="hover:text-teal-400 transition-colors">Sign In</Link>
            <Link href="/sign-in?mode=signup" className="hover:text-teal-400 transition-colors">Create Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
