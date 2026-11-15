'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConsoleShell } from '@/components/console-shell';
import { Skeleton } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth-context';

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { me, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!me) {
      router.replace('/sign-in');
      return;
    }
    if (me.activeContext.roleTier === 'STUDENT' || me.activeContext.roleTier === 'PARENT') {
      router.replace('/portal');
    }
  }, [isLoading, me, router]);

  if (isLoading || !me) {
    return (
      <div className="min-h-screen bg-[var(--se-bg-canvas)] p-24">
        <div className="mx-auto max-w-[1200px] space-y-16">
          <Skeleton className="h-40 w-1/3" />
          <div className="grid grid-cols-1 gap-16 md:grid-cols-4">
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return <ConsoleShell>{children}</ConsoleShell>;
}
