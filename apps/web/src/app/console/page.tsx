'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, ShieldCheck, WarningCircle } from '@phosphor-icons/react';
import { Badge, Button, Card, Skeleton } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth-context';

interface DashboardSummary {
  roleTier: string;
  roleSlug: string;
  scopeType: string;
  realtimeClients: number;
  kpis: {
    campuses: number;
    usersCount: number;
    pendingApprovals: number;
    enabledFeatures: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    roleSlug: string;
    module: string;
    createdAt: string;
  }>;
}

const DEPT_ATTENDANCE_PREVIEW = [
  { dept: 'CSE', pct: 92 },
  { dept: 'EEE', pct: 88 },
  { dept: 'BBA', pct: 85 },
  { dept: 'ENG', pct: 90 },
  { dept: 'LAW', pct: 83 },
  { dept: 'ARC', pct: 94 },
];

export default function ConsoleOverviewPage() {
  const { api, me } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary', me?.activeContext.assignmentId, me?.activeContext.roleSlug],
    queryFn: () => api.adminGetDashboardSummary<DashboardSummary>(),
    enabled: Boolean(me),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-24">
        <Skeleton className="h-48 w-[320px]" />
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  const firstName = me?.user.fullName.split(' ')[0] ?? 'User';
  const roleLabel = data.roleSlug.replace(/_/g, ' ');

  return (
    <div className="space-y-24">
      <div className="flex flex-wrap items-start justify-between gap-16">
        <div>
          <h1 className="heading-4 text-[var(--se-text-primary)]">Good morning, {firstName}</h1>
          <p className="body-6 mt-4 text-[var(--se-text-secondary)]">
            Active workspace: {roleLabel} at {data.scopeType} scope. Institution: {me?.institution.name}.
          </p>
        </div>

        <div className="flex flex-wrap gap-8">
          <Link href="/console/audit-logs">
            <Button variant="secondary" size="sm">
              Audit log
            </Button>
          </Link>
          <Link href="/console/roles">
            <Button size="sm">
              Manage access
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Role-aware KPI Row */}
      <section aria-label="Workspace metrics" className="grid grid-cols-1 gap-16 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="caption-2 text-[var(--se-text-secondary)]">Campuses active</p>
          <p className="heading-4 tabular-mono mt-8 text-[var(--se-text-primary)]">
            {data.kpis.campuses}
          </p>
          <p className="caption-5 mt-4 text-[var(--se-success-text)]">Multi campus tenancy active</p>
        </Card>

        <Card>
          <p className="caption-2 text-[var(--se-text-secondary)]">Directory accounts</p>
          <p className="heading-4 tabular-mono mt-8 text-[var(--se-text-primary)]">
            {data.kpis.usersCount}
          </p>
          <p className="caption-5 mt-4 text-[var(--se-text-muted)]">Staff MFA enforced</p>
        </Card>

        <Card>
          <p className="caption-2 text-[var(--se-text-secondary)]">Pending approvals</p>
          <p className="heading-4 tabular-mono mt-8 text-[var(--se-text-primary)]">
            {data.kpis.pendingApprovals}
          </p>
          <p className="caption-5 mt-4 text-[var(--se-warning-text)]">
            {data.kpis.pendingApprovals > 0 ? 'Awaiting workflow sign off' : 'Queue clear'}
          </p>
        </Card>

        <Card>
          <p className="caption-2 text-[var(--se-text-secondary)]">Enabled flags</p>
          <p className="heading-4 tabular-mono mt-8 text-[var(--se-text-primary)]">
            {data.kpis.enabledFeatures}
          </p>
          <p className="caption-5 mt-4 text-[var(--se-success-text)]">
            {data.realtimeClients} live sockets connected
          </p>
        </Card>
      </section>

      {/* Role-specific workspace notice + preview visual matching Overview */}
      <section className="grid grid-cols-1 gap-16 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-16 flex items-center justify-between">
            <div>
              <h2 className="title-2 text-[var(--se-text-primary)]">
                {data.roleTier === 'FACULTY'
                  ? 'Faculty section readiness'
                  : 'Department attendance baseline'}
              </h2>
              <p className="caption-5 text-[var(--se-text-muted)]">
                Phase 2 foundation preview · live academic records populate in Phase 3
              </p>
            </div>
            <Badge tone="info">{data.roleTier}</Badge>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_ATTENDANCE_PREVIEW}>
                <XAxis dataKey="dept" stroke="#8B929E" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[70, 100]} stroke="#8B929E" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F1F1F',
                    borderColor: '#313131',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {DEPT_ATTENDANCE_PREVIEW.map((entry) => (
                    <Cell
                      key={entry.dept}
                      fill={entry.pct < 85 ? '#F59E0B' : '#2DD4BF'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-16 flex items-center justify-between">
            <h2 className="title-2 text-[var(--se-text-primary)]">Live audit feed</h2>
            <ShieldCheck size={18} className="text-brand-bright-teal" />
          </div>

          {data.recentActivity.length === 0 ? (
            <div className="flex items-center gap-8 text-[var(--se-text-muted)]">
              <WarningCircle size={16} />
              <span className="body-6">No recent audit activity recorded yet.</span>
            </div>
          ) : (
            <div className="space-y-12">
              {data.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-12"
                >
                  <p className="body-5 text-[var(--se-text-primary)]">{item.title}</p>
                  <p className="caption-5 tabular-mono mt-4 text-[var(--se-text-muted)]">
                    {item.roleSlug} · {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
