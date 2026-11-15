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

      {/* Hero Section */}
      <section className="relative overflow-hidden px-16 py-48 sm:py-64 sm:px-24 text-center">
        <div className="mx-auto max-w-4xl space-y-20">
          <Badge tone="success" className="px-12 py-4 text-xs">
            Multi-Campus University Operating System
          </Badge>
          <h1 className="heading-2 sm:text-5xl font-bold tracking-tight text-[var(--se-text-primary)]">
            One Unified Platform for Campuses, Academics & Student Life
          </h1>
          <p className="body-4 mx-auto max-w-2xl text-[var(--se-text-secondary)]">
            Connected multi-tenant infrastructure powered by Supabase PostgreSQL. Centralized attendance, timetable automation, grading, and secure role-based access.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-12 pt-12">
            <Button
              size="lg"
              onClick={() => router.push('/sign-in')}
              className="flex items-center gap-8 bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold"
            >
              Sign In to Workspace <ArrowRight size={18} />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/sign-in?mode=signup')}
              className="flex items-center gap-8"
            >
              <UserPlus size={18} /> Register Account
            </Button>
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
