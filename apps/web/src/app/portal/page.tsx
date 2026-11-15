'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, SignOut } from '@phosphor-icons/react';
import { Badge, Button, Card } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth-context';

export default function StudentPortalPage() {
  const router = useRouter();
  const { me, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !me) {
      router.replace('/sign-in');
    }
  }, [isLoading, me, router]);

  if (!me) return null;

  return (
    <main id="main-content" className="min-h-screen bg-[var(--se-bg-canvas)] px-16 py-32">
      <div className="mx-auto max-w-[760px] space-y-24">
        <div className="flex items-center justify-between">
          <img src="/brand/smart-edu-logo-dark.svg" alt="Smart EDU" className="h-32 w-auto" />
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await signOut();
              router.replace('/sign-in');
            }}
          >
            <SignOut size={16} />
            Sign out
          </Button>
        </div>

        <Card featuredDark className="p-24">
          <Badge tone="success">{me.activeContext.roleTier} PORTAL</Badge>
          <h1 className="heading-4 mt-12 text-[#F8FAFC]">Welcome, {me.user.fullName}</h1>
          <p className="body-6 mt-4 text-[#B3B8C2]">
            Student and guardian accounts use the Smart EDU portal and mobile app. Administrative console routes remain isolated.
          </p>
        </Card>

        <Card className="flex items-start gap-16 p-24">
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] text-brand-teal">
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 className="title-3 text-[var(--se-text-primary)]">Academic and fee modules</h2>
            <p className="body-6 mt-4 text-[var(--se-text-secondary)]">
              Timetable, attendance, published grades, invoices and service requests populate in Phases 3 through 5.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
