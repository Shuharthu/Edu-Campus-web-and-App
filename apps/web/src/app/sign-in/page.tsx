'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeSlash,
  ShieldCheck,
  Moon,
  Sun,
  Check,
  UserPlus,
  SignIn as SignInIcon,
  CheckCircle,
} from '@phosphor-icons/react';
import { Button, Card, InlineError, Input } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth-context';

interface LoginResponse {
  status: 'MFA_REQUIRED' | 'MFA_SETUP_REQUIRED' | 'AUTHENTICATED';
  mfaToken?: string;
  secret?: string;
  accessToken?: string;
  refreshToken?: string;
}

interface RegisterResponse {
  status: 'PENDING_APPROVAL';
  message: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

type RoleType = 'faculty' | 'student' | 'admin';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const { api, setSessionTokens, theme, toggleTheme } = useAuth();

  // Tab mode: 'signin' | 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Sign in state
  const [selectedRole, setSelectedRole] = useState<RoleType>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaSetupSecret, setMfaSetupSecret] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  // Sign up state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState<'student' | 'faculty'>('student');
  const [signupDept, setSignupDept] = useState('CSE');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleRoleSelect(role: RoleType) {
    setSelectedRole(role);
    setError(null);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide your university email and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.authLogin<LoginResponse>({
        email: email.trim(),
        password,
        platform: 'web',
        deviceName: 'Web Console',
      });

      if (res.status === 'MFA_REQUIRED' && res.mfaToken) {
        setMfaToken(res.mfaToken);
        setMfaSetupSecret(null);
        return;
      }

      if (res.status === 'MFA_SETUP_REQUIRED' && res.mfaToken) {
        setMfaToken(res.mfaToken);
        setMfaSetupSecret(res.secret ?? null);
        return;
      }

      if (res.status === 'AUTHENTICATED' && res.accessToken) {
        const me = await setSessionTokens(res.accessToken, res.refreshToken);
        const tier = me?.activeContext.roleTier;
        if (selectedRole === 'student' || tier === 'STUDENT' || tier === 'PARENT') {
          router.replace('/portal');
        } else {
          router.replace('/console');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!signupFullName.trim() || !signupEmail.trim() || !signupPassword) {
      setError('All fields are required.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await api.request<RegisterResponse>('POST', '/auth/register', {
        fullName: signupFullName.trim(),
        email: signupEmail.trim().toLowerCase(),
        password: signupPassword,
        roleSlug: signupRole,
        departmentCode: signupDept,
      });

      setSignupSuccess(
        `Registration submitted for ${res.fullName}! Your account has been registered and is pending administrator approval. An administrator will review and accept your account before you can log in.`
      );
      setSignupFullName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaToken) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.authVerifyMfa<LoginResponse>({
        mfaToken,
        code: mfaCode.trim(),
        platform: 'web',
        deviceName: 'Web Console',
      });
      if (res.accessToken) {
        const me = await setSessionTokens(res.accessToken, res.refreshToken);
        const tier = me?.activeContext.roleTier;
        if (selectedRole === 'student' || tier === 'STUDENT' || tier === 'PARENT') {
          router.replace('/portal');
        } else {
          router.replace('/console');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Enter a valid 6 digit code.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center bg-[var(--se-bg-canvas)] px-16 py-32"
    >
      {/* Top Header Bar */}
      <div className="mb-16 flex w-full max-w-[440px] items-center justify-between">
        <Link href="/" className="flex items-center gap-8">
          <img
            src={theme === 'dark' ? '/brand/smart-edu-logo-dark.svg' : '/brand/smart-edu-logo-light.svg'}
            alt="Smart EDU brand logo"
            className="h-32 w-auto"
          />
        </Link>
        <div className="flex items-center gap-8">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Toggle color theme"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>
      </div>

      <Card className="w-full max-w-[440px] p-24">
        {/* Sign In / Sign Up Mode Toggle */}
        <div className="flex rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-4 mb-20">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
              setSignupSuccess(null);
            }}
            className={`flex flex-1 items-center justify-center gap-6 rounded-md py-8 text-xs font-semibold transition-all ${
              mode === 'signin'
                ? 'bg-[var(--se-bg-elevated)] text-teal-400 shadow-sm border border-[var(--se-border)]'
                : 'text-[var(--se-text-secondary)] hover:text-[var(--se-text-primary)]'
            }`}
          >
            <SignInIcon size={16} />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
              setSignupSuccess(null);
            }}
            className={`flex flex-1 items-center justify-center gap-6 rounded-md py-8 text-xs font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-[var(--se-bg-elevated)] text-teal-400 shadow-sm border border-[var(--se-border)]'
                : 'text-[var(--se-text-secondary)] hover:text-[var(--se-text-primary)]'
            }`}
          >
            <UserPlus size={16} />
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-16">
            <InlineError message={error} />
          </div>
        )}

        {signupSuccess && (
          <div className="mb-16 rounded-lg border border-teal-500/40 bg-teal-950/25 p-12 text-xs text-teal-300">
            <div className="flex items-center gap-6 font-semibold mb-4 text-teal-300">
              <CheckCircle size={16} weight="bold" />
              Registration Submitted!
            </div>
            <p>{signupSuccess}</p>
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setSignupSuccess(null);
              }}
              className="mt-8 text-xs underline font-medium text-teal-400 hover:text-teal-200"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {mode === 'signin' ? (
          !mfaToken ? (
            <form onSubmit={handleLogin} className="space-y-16">
              <div>
                <h1 className="heading-5 text-[var(--se-text-primary)]">Sign in to Smart EDU</h1>
                <p className="body-6 mt-4 text-[var(--se-text-secondary)]">
                  Use your registered university email to open your workspace.
                </p>
              </div>

              <div className="space-y-12">
                <div>
                  <label htmlFor="email" className="body-5 mb-8 block text-[var(--se-text-primary)]">
                    University email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="body-5 mb-8 block text-[var(--se-text-primary)]">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pr-48"
                      autoComplete="new-password"
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

                {/* Role selection with tick marks - directly beneath password */}
                <div className="pt-2">
                  <span className="caption-5 block font-medium text-[var(--se-text-secondary)] mb-6">
                    Select portal role:
                  </span>
                  <div className="grid grid-cols-3 gap-8">
                    {[
                      { id: 'faculty' as RoleType, label: 'Faculty' },
                      { id: 'student' as RoleType, label: 'Student' },
                      { id: 'admin' as RoleType, label: 'Admin' },
                    ].map((role) => {
                      const isSelected = selectedRole === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => handleRoleSelect(role.id)}
                          className={`flex items-center justify-center gap-6 rounded-[var(--se-radius-md)] border py-8 px-6 text-xs font-medium transition-all ${
                            isSelected
                              ? 'border-teal-500 bg-teal-500/15 text-teal-300 font-semibold shadow-sm ring-1 ring-teal-500/50'
                              : 'border-[var(--se-border)] bg-[var(--se-bg-subtle)] text-[var(--se-text-secondary)] hover:text-[var(--se-text-primary)] hover:border-[var(--se-border-hover)]'
                          }`}
                        >
                          <span>{role.label}</span>
                          {isSelected ? (
                            <Check size={14} weight="bold" className="text-teal-400 shrink-0" />
                          ) : (
                            <span className="h-3 w-3 rounded-full border border-[var(--se-border)] opacity-40 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Verifying...' : `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
              </Button>

              <div className="flex items-center justify-between text-xs pt-4 border-t border-[var(--se-border)]">
                <span className="text-[var(--se-text-secondary)]">Don&apos;t have an approved account?</span>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-medium text-teal-400 hover:text-teal-300 hover:underline"
                >
                  Create account →
                </button>
              </div>

              <p className="caption-5 text-[var(--se-text-muted)] text-center">
                Multi-tenant database authentication enabled. Pending accounts require administrator acceptance before signing in.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyMfa} className="space-y-16">
              <div className="flex items-start gap-12">
                <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] text-brand-teal">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h1 className="heading-6 text-[var(--se-text-primary)]">Two factor verification</h1>
                  <p className="body-6 mt-4 text-[var(--se-text-secondary)]">
                    Enter the 6 digit code from your authenticator app.
                  </p>
                </div>
              </div>

              {mfaSetupSecret ? (
                <div className="rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-12">
                  <p className="caption-3 text-[var(--se-text-primary)]">Setup secret key</p>
                  <p className="tabular-mono mt-4 break-all text-xs text-brand-bright-teal">
                    {mfaSetupSecret}
                  </p>
                </div>
              ) : null}

              <div>
                <label htmlFor="mfa-code" className="body-5 mb-8 block text-[var(--se-text-primary)]">
                  Verification code
                </label>
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456"
                  className="tabular-mono tracking-widest"
                />
              </div>

              <div className="flex gap-8">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setMfaToken(null);
                    setMfaCode('');
                    setError(null);
                  }}
                >
                  Back
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Verifying...' : 'Verify code'}
                </Button>
              </div>
            </form>
          )
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="space-y-16">
            <div>
              <h1 className="heading-5 text-[var(--se-text-primary)]">Create Student or Faculty Account</h1>
              <p className="body-6 mt-4 text-[var(--se-text-secondary)]">
                Register your account. An administrator will review and accept your registration.
              </p>
            </div>

            <div className="space-y-12">
              <div>
                <label className="body-5 mb-6 block text-[var(--se-text-primary)]">
                  Full Name
                </label>
                <Input
                  required
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  placeholder="e.g. Tariq Ahmed"
                />
              </div>

              <div>
                <label className="body-5 mb-6 block text-[var(--se-text-primary)]">
                  University Email
                </label>
                <Input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="e.g. name@university.edu"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="body-5 mb-6 block text-[var(--se-text-primary)]">
                    Role
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as 'student' | 'faculty')}
                    className="w-full rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-10 text-xs text-[var(--se-text-primary)] focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                  </select>
                </div>
                <div>
                  <label className="body-5 mb-6 block text-[var(--se-text-primary)]">
                    Department
                  </label>
                  <select
                    value={signupDept}
                    onChange={(e) => setSignupDept(e.target.value)}
                    className="w-full rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-10 text-xs text-[var(--se-text-primary)] focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="CSE">CSE</option>
                    <option value="EEE">EEE</option>
                    <option value="BBA">BBA</option>
                    <option value="ARCH">Architecture</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="body-5 mb-6 block text-[var(--se-text-primary)]">
                  Password
                </label>
                <Input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create a strong password (min 8 chars)"
                />
              </div>

              <div>
                <label className="body-5 mb-6 block text-[var(--se-text-primary)]">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Submitting Registration...' : 'Submit for Administrator Approval'}
            </Button>

            <div className="flex items-center justify-between text-xs pt-4 border-t border-[var(--se-border)]">
              <span className="text-[var(--se-text-secondary)]">Already have an account?</span>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-medium text-teal-400 hover:text-teal-300 hover:underline"
              >
                Sign in instead →
              </button>
            </div>
          </form>
        )}
      </Card>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--se-bg-canvas)] text-xs text-[var(--se-text-muted)]">
          Loading sign in...
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
