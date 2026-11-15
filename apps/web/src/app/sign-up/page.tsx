'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeSlash,
  UserPlus,
  Moon,
  Sun,
  GraduationCap,
  ChalkboardTeacher,
  ShieldCheck,
  IdentificationBadge,
  UsersThree,
  CheckCircle,
} from '@phosphor-icons/react';
import { Button, Card, InlineError, Input } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth-context';

type RoleOption = {
  slug: string;
  label: string;
  description: string;
  icon: React.ElementType;
};

const ROLES: RoleOption[] = [
  {
    slug: 'student',
    label: 'Student',
    description: 'Access student portal, course enrollment, grades, timetable, and study planner.',
    icon: GraduationCap,
  },
  {
    slug: 'faculty',
    label: 'Faculty',
    description: 'Grade entry, student roster, attendance marking, and course evaluation.',
    icon: ChalkboardTeacher,
  },
  {
    slug: 'admin',
    label: 'Campus Admin',
    description: 'System administration, RBAC, campus config, audit logs, and compliance.',
    icon: ShieldCheck,
  },
  {
    slug: 'registrar',
    label: 'Registrar',
    description: 'Academic catalog, student dossier exports, registration, and transcript records.',
    icon: IdentificationBadge,
  },
  {
    slug: 'parent',
    label: 'Parent / Guardian',
    description: 'View ward academic standing, fee invoices, attendance, and campus notifications.',
    icon: UsersThree,
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const { api, setSessionTokens, theme, toggleTheme } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleSlug, setRoleSlug] = useState('student');
  const [departmentCode, setDepartmentCode] = useState('CSE');
  const [studentNumber, setStudentNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.authRegister<{
        status: string;
        accessToken?: string;
        refreshToken?: string;
        user?: { id: string; email: string };
      }>({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        roleSlug,
        departmentCode: departmentCode.trim().toUpperCase(),
        studentNumber: studentNumber.trim() || undefined,
        platform: 'web',
        deviceName: 'Web Console Registration',
      });

      setSuccess('Account created successfully in Supabase! Signing in...');

      if (res.accessToken) {
        const me = await setSessionTokens(res.accessToken, res.refreshToken);
        const tier = me?.activeContext?.roleTier;
        setTimeout(() => {
          router.replace(tier === 'STUDENT' || tier === 'PARENT' ? '/portal' : '/console');
        }, 800);
      } else {
        setTimeout(() => {
          router.replace('/sign-in');
        }, 1200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center bg-[var(--se-bg-canvas)] px-16 py-32"
    >
      <div className="mb-16 flex w-full max-w-[520px] items-center justify-between">
        <div className="flex items-center gap-8">
          <img
            src={theme === 'dark' ? '/brand/smart-edu-logo-dark.svg' : '/brand/smart-edu-logo-light.svg'}
            alt="Smart EDU"
            className="h-32 w-auto"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          aria-label="Toggle color theme"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>

      <Card className="w-full max-w-[520px] p-24">
        <form onSubmit={handleRegister} className="space-y-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-5 text-[var(--se-text-primary)]">Create your account</h1>
              <p className="body-6 mt-4 text-[var(--se-text-secondary)]">
                Register a manual account in remote Supabase PostgreSQL.
              </p>
            </div>
            <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-subtle)] text-teal-400">
              <UserPlus size={22} weight="bold" />
            </div>
          </div>

          {error ? <InlineError message={error} /> : null}

          {success ? (
            <div className="flex items-center gap-8 rounded-[var(--se-radius-md)] border border-emerald-500/30 bg-emerald-950/20 p-12 text-xs text-emerald-400">
              <CheckCircle size={18} weight="fill" />
              <span>{success}</span>
            </div>
          ) : null}

          {/* Role Selection */}
          <div>
            <label className="body-5 mb-8 block text-[var(--se-text-primary)] font-medium">
              Select your role
            </label>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = roleSlug === role.slug;
                return (
                  <button
                    key={role.slug}
                    type="button"
                    onClick={() => setRoleSlug(role.slug)}
                    className={`flex items-start gap-10 rounded-[var(--se-radius-md)] border p-10 text-left transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-950/20 text-[var(--se-text-primary)] shadow-sm'
                        : 'border-[var(--se-border)] bg-[var(--se-bg-subtle)] text-[var(--se-text-secondary)] hover:border-[var(--se-border-hover)]'
                    }`}
                  >
                    <div
                      className={`mt-2 flex h-28 w-28 shrink-0 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-teal-500/20 text-teal-400' : 'bg-transparent text-[var(--se-text-muted)]'
                      }`}
                    >
                      <Icon size={18} weight={isSelected ? 'fill' : 'regular'} />
                    </div>
                    <div>
                      <p className="caption-5 font-semibold text-[var(--se-text-primary)]">{role.label}</p>
                      <p className="text-[11px] leading-tight text-[var(--se-text-muted)] mt-2">
                        {role.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-12">
            <div>
              <label htmlFor="fullName" className="body-5 mb-6 block text-[var(--se-text-primary)] font-medium">
                Full name
              </label>
              <Input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="body-5 mb-6 block text-[var(--se-text-primary)] font-medium">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john.doe@university.edu or custom email"
              />
            </div>

            <div>
              <label htmlFor="password" className="body-5 mb-6 block text-[var(--se-text-primary)] font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="pr-48"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-8 top-1/2 -translate-y-1/2 rounded-lg p-8 text-[var(--se-text-secondary)] hover:text-[var(--se-text-primary)]"
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Department and Student ID if applicable */}
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
              <div>
                <label htmlFor="departmentCode" className="body-5 mb-6 block text-[var(--se-text-primary)] font-medium">
                  Department
                </label>
                <select
                  id="departmentCode"
                  value={departmentCode}
                  onChange={(e) => setDepartmentCode(e.target.value)}
                  className="w-full rounded-[var(--se-radius-md)] border border-[var(--se-border)] bg-[var(--se-bg-subtle)] px-12 py-10 text-xs text-[var(--se-text-primary)] focus:border-teal-500 focus:outline-none"
                >
                  <option value="CSE">CSE — Computer Science & Eng</option>
                  <option value="EEE">EEE — Electrical & Electronic</option>
                  <option value="BBA">BBA — Business Administration</option>
                  <option value="ENG">ENG — English Literature</option>
                  <option value="LAW">LAW — Faculty of Law</option>
                </select>
              </div>

              {roleSlug === 'student' ? (
                <div>
                  <label htmlFor="studentNumber" className="body-5 mb-6 block text-[var(--se-text-primary)] font-medium">
                    Student ID (optional)
                  </label>
                  <Input
                    id="studentNumber"
                    type="text"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    placeholder="Auto if blank (2026-CSE-XXXX)"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Creating account in Supabase...' : 'Create account'}
          </Button>

          <div className="flex items-center justify-center pt-8 text-xs border-t border-[var(--se-border)]">
            <span className="text-[var(--se-text-secondary)]">Already have an account?</span>
            <Link
              href="/sign-in"
              className="ml-6 font-medium text-teal-400 hover:text-teal-300 hover:underline"
            >
              Sign in here
            </Link>
          </div>
        </form>
      </Card>
    </main>
  );
}
