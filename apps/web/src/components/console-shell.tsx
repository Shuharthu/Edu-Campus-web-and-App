'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  BookOpen,
  Briefcase,
  Buildings,
  Calendar,
  Certificate,
  ChartBar,
  ChartLineUp,
  ChatCircleText,
  CheckCircle,
  ClipboardText,
  ClockCounterClockwise,
  CurrencyDollar,
  Eye,
  GearSix,
  GraduationCap,
  List,
  MagnifyingGlass,
  Moon,
  ShieldCheck,
  SignOut,
  SquaresFour,
  Sun,
  Users,
  WarningCircle,
  Wrench,
  X,
} from '@phosphor-icons/react';
import { Badge, Button, Card } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { useAuth } from '@/lib/auth-context';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  module?: string;
}

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    me,
    wsConnected,
    lastWsEventAt,
    theme,
    toggleTheme,
    switchRole,
    exitPreview,
    signOut,
    hasPermission,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  useEffect(() => {
    if (!me) {
      const savedToken = typeof window !== 'undefined' ? window.localStorage.getItem('smartedu_access_token') : null;
      if (!savedToken) {
        router.replace('/sign-in');
      }
    }
  }, [me, router]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
        setRoleMenuOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const navItems: NavItem[] = useMemo(() => {
    const all: NavItem[] = [
      { href: '/console', label: 'Overview', icon: <SquaresFour size={18} /> },
      {
        href: '/console/academics/timetable',
        label: 'Timetable builder',
        icon: <Calendar size={18} />,
        module: 'academics_setup',
      },
      {
        href: '/console/students',
        label: 'All students',
        icon: <Users size={18} />,
        module: 'student_records',
      },
      {
        href: '/console/academics',
        label: 'Academic setup',
        icon: <GraduationCap size={18} />,
        module: 'academics_setup',
      },
      {
        href: '/console/faculty',
        label: 'Faculty directory',
        icon: <Buildings size={18} />,
        module: 'academics_setup',
      },
      {
        href: '/console/attendance',
        label: 'Attendance desk',
        icon: <CheckCircle size={18} />,
        module: 'attendance',
      },
      {
        href: '/console/grades',
        label: 'Grades & moderation',
        icon: <ChartBar size={18} />,
        module: 'grades',
      },
      {
        href: '/console/exams',
        label: 'Exam scheduler',
        icon: <Calendar size={18} />,
        module: 'academics_setup',
      },
      {
        href: '/console/finance',
        label: 'Finance & Invoicing',
        icon: <CurrencyDollar size={18} />,
        module: 'finance',
      },
      {
        href: '/console/services',
        label: 'University Services',
        icon: <Certificate size={18} />,
        module: 'services',
      },
      {
        href: '/console/communication',
        label: 'Communication',
        icon: <ChatCircleText size={18} />,
        module: 'communication',
      },
      {
        href: '/console/library',
        label: 'Central Library',
        icon: <BookOpen size={18} />,
      },
      {
        href: '/console/operations',
        label: 'Campus Operations',
        icon: <Wrench size={18} />,
      },
      {
        href: '/console/career',
        label: 'Career & Placement',
        icon: <Briefcase size={18} />,
      },
      {
        href: '/console/analytics',
        label: 'Institutional Analytics',
        icon: <ChartLineUp size={18} />,
      },
      {
        href: '/console/analytics/at-risk',
        label: 'At-risk warning',
        icon: <WarningCircle size={18} />,
      },
      {
        href: '/console/analytics/surveys',
        label: 'Surveys & evaluations',
        icon: <ClipboardText size={18} />,
      },
      {
        href: '/console/campus',
        label: 'Campus Management',
        icon: <Buildings size={18} />,
      },
      {
        href: '/console/approvals',
        label: 'User Approvals',
        icon: <ShieldCheck size={18} />,
      },
      {
        href: '/console/roles',
        label: 'Roles and access',
        icon: <ShieldCheck size={18} />,
        module: 'roles_permissions',
      },
      {
        href: '/console/compliance',
        label: 'Compliance & privacy',
        icon: <ShieldCheck size={18} />,
      },
      {
        href: '/console/audit-logs',
        label: 'Audit log',
        icon: <ClockCounterClockwise size={18} />,
        module: 'audit_log',
      },
      {
        href: '/console/settings',
        label: 'Settings',
        icon: <GearSix size={18} />,
      },
    ];
    return all.filter((item) => !item.module || hasPermission(item.module, 'view'));
  }, [hasPermission]);

  const phaseRoadmapItems = [
    { label: 'Hardening & Release', phase: 'Phase 9', icon: <ShieldCheck size={18} /> },
  ];

  const initials = (me?.user.fullName ?? 'SE')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const filteredCommandRoutes = navItems.filter((item) =>
    item.label.toLowerCase().includes(commandQuery.trim().toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-[var(--se-bg-canvas)] text-[var(--se-text-primary)]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[240px] shrink-0 flex-col justify-between border-r border-[var(--se-border)] bg-[var(--se-bg-sidebar)] p-16 lg:flex">
        <div className="space-y-24">
          <div className="flex items-center justify-between px-8 pt-4">
            <img
              src={theme === 'dark' ? '/brand/smart-edu-logo-dark.svg' : '/brand/smart-edu-logo-light.svg'}
              alt="Smart EDU"
              className="h-24 w-auto"
            />
          </div>

          <nav aria-label="Console navigation" className="space-y-4">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'title-4 flex min-h-[44px] items-center gap-12 rounded-xl px-12 py-8 transition-colors duration-300 ease-smartedu',
                    active
                      ? 'bg-[var(--se-bg-card)] text-[var(--se-text-primary)] border border-[var(--se-border)]'
                      : 'text-[var(--se-text-secondary)] hover:bg-[var(--se-bg-hover)] hover:text-[var(--se-text-primary)] border border-transparent',
                  )}
                >
                  <span className={active ? 'text-brand-bright-teal' : ''}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-12">
              <p className="caption-4 px-12 pb-4 text-[var(--se-text-muted)]">Upcoming modules</p>
              {phaseRoadmapItems.map((item) => (
                <div
                  key={item.label}
                  className="title-4 flex min-h-[40px] items-center justify-between rounded-xl px-12 py-8 text-[var(--se-text-muted)]"
                >
                  <span className="flex items-center gap-12">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  <span className="caption-5 tabular-mono">{item.phase}</span>
                </div>
              ))}
            </div>
          </nav>
        </div>

        <Card className="p-12">
          <div className="flex items-center gap-8">
            <Badge tone={wsConnected ? 'success' : 'warning'}>
              {wsConnected ? 'Live' : 'Connecting'}
            </Badge>
          </div>
          <p className="body-5 mt-8 text-[var(--se-text-primary)]">
            {wsConnected ? 'Realtime bus active' : 'Reconnecting bus'}
          </p>
          <p className="caption-5 mt-2 text-[var(--se-text-muted)]">
            {lastWsEventAt ? 'Synced just now' : 'Channel ready for updates'}
          </p>
        </Card>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 flex w-[280px] flex-col justify-between bg-[var(--se-bg-sidebar)] p-16">
            <div className="space-y-16">
              <div className="flex items-center justify-between">
                <img
                  src={theme === 'dark' ? '/brand/smart-edu-logo-dark.svg' : '/brand/smart-edu-logo-light.svg'}
                  alt="Smart EDU"
                  className="h-24 w-auto"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Close navigation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={18} />
                </Button>
              </div>
              <nav className="space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'title-4 flex min-h-[44px] items-center gap-12 rounded-xl px-12 py-8',
                      pathname === item.href
                        ? 'bg-[var(--se-bg-card)] text-[var(--se-text-primary)]'
                        : 'text-[var(--se-text-secondary)]',
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-64 items-center justify-between gap-12 border-b border-[var(--se-border)] bg-[var(--se-bg-canvas)] px-16 lg:px-32">
          <div className="flex min-w-0 flex-1 items-center gap-12">
            <Button
              variant="secondary"
              size="sm"
              className="lg:hidden"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <List size={18} />
            </Button>

            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="body-6 flex h-40 w-full max-w-[420px] items-center justify-between rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] px-12 text-[var(--se-text-muted)] transition-colors duration-300 ease-smartedu hover:border-brand-teal"
            >
              <span className="flex items-center gap-8 truncate">
                <MagnifyingGlass size={16} />
                <span className="truncate">Search roles, audit events, settings</span>
              </span>
              <span className="caption-5 tabular-mono hidden rounded border border-[var(--se-border)] px-8 py-2 sm:inline">
                Ctrl K
              </span>
            </button>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRoleMenuOpen((v) => !v)}
              >
                <span className="caption-3">
                  {me?.activeContext.roleSlug.replace(/_/g, ' ') ?? 'Role'}
                </span>
                {me?.activeContext.isActing ? (
                  <Badge tone="warning">Acting</Badge>
                ) : null}
              </Button>

              {roleMenuOpen && me ? (
                <Card className="absolute right-0 top-48 z-40 w-[280px] p-12 shadow-lg">
                  <p className="caption-4 mb-8 text-[var(--se-text-muted)]">Switch active role</p>
                  <div className="space-y-4">
                    {me.assignments.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={async () => {
                          await switchRole(a.id);
                          setRoleMenuOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg border px-12 py-8 text-left transition-colors duration-300',
                          a.id === me.activeContext.assignmentId
                            ? 'border-brand-teal bg-[var(--se-bg-elevated)]'
                            : 'border-transparent hover:bg-[var(--se-bg-hover)]',
                        )}
                      >
                        <div>
                          <p className="body-5 text-[var(--se-text-primary)]">{a.roleName}</p>
                          <p className="caption-5 text-[var(--se-text-muted)]">
                            {a.departmentCode ? `${a.scopeType} · ${a.departmentCode}` : a.scopeType}
                          </p>
                        </div>
                        {a.isActing ? <Badge tone="warning">Acting</Badge> : null}
                      </button>
                    ))}
                  </div>
                </Card>
              ) : null}
            </div>

            <Button
              variant="secondary"
              size="sm"
              aria-label="Toggle color theme"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              aria-label="Notifications"
              onClick={() => router.push('/console/audit-logs')}
            >
              <Bell size={16} />
            </Button>

            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-brand-teal text-xs font-semibold text-brand-ink">
              {initials}
            </div>

            <Button
              variant="ghost"
              size="sm"
              aria-label="Sign out"
              onClick={async () => {
                await signOut();
                router.replace('/sign-in');
              }}
            >
              <SignOut size={16} />
            </Button>
          </div>
        </header>

        {me?.activeContext.isPreview ? (
          <div className="flex flex-wrap items-center justify-between gap-12 border-b border-[var(--se-border)] bg-[var(--se-warning-bg)] px-16 py-8 text-[var(--se-warning-text)] lg:px-32">
            <span className="body-5 flex items-center gap-8">
              <Eye size={18} />
              Previewing workspace as {me.activeContext.roleSlug.replace(/_/g, ' ')}. Edits are disabled.
            </span>
            <Button size="sm" variant="secondary" onClick={exitPreview}>
              Exit preview
            </Button>
          </div>
        ) : null}

        <main id="main-content" className="flex-1 p-16 lg:p-32">
          {children}
        </main>
      </div>

      {/* Global Command Palette Modal */}
      {commandOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-16 pt-80">
          <Card className="w-full max-w-[520px] p-16">
            <div className="flex items-center gap-8 border-b border-[var(--se-border)] pb-12">
              <MagnifyingGlass size={18} className="text-[var(--se-text-muted)]" />
              <input
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Jump to a console screen..."
                className="body-3 w-full bg-transparent text-[var(--se-text-primary)] outline-none placeholder:text-[var(--se-text-muted)]"
              />
              <Button size="xsm" variant="ghost" onClick={() => setCommandOpen(false)}>
                Esc
              </Button>
            </div>
            <div className="mt-12 space-y-4">
              {filteredCommandRoutes.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => {
                    router.push(item.href);
                    setCommandOpen(false);
                    setCommandQuery('');
                  }}
                  className="body-5 flex w-full items-center gap-12 rounded-xl px-12 py-8 text-left text-[var(--se-text-primary)] hover:bg-[var(--se-bg-hover)]"
                >
                  <Buildings size={16} className="text-brand-bright-teal" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
