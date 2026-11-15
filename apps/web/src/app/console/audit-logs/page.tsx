'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClockCounterClockwise, DownloadSimple, MagnifyingGlass } from '@phosphor-icons/react';
import { Badge, Button, Card, EmptyState, Input, Skeleton } from '@/components/ui/primitives';
import { useAuth, getApiBaseUrl } from '@/lib/auth-context';

interface AuditItem {
  id: string;
  roleSlug: string;
  scopeUsed: string;
  module: string;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeJson: unknown;
  afterJson: unknown;
  ipAddress: string | null;
  createdAt: string;
  actor: { id: string; fullName: string; email: string } | null;
}

interface AuditResponse {
  items: AuditItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export default function AuditLogsPage() {
  const { api, token } = useAuth();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, q],
    queryFn: () =>
      api.auditList<AuditResponse>({
        page,
        limit: 15,
        q: q || undefined,
      }),
  });

  async function handleExportCsv() {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/audit-logs/export.csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const csv = await res.text();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smart-edu-audit-logs.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-24">
      <div className="flex flex-wrap items-start justify-between gap-16">
        <div>
          <h1 className="heading-4 text-[var(--se-text-primary)]">Audit log</h1>
          <p className="body-6 mt-4 text-[var(--se-text-secondary)]">
            Immutable record of sign ins, role switches, approvals and configuration changes.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={handleExportCsv}>
          <DownloadSimple size={16} />
          Export CSV
        </Button>
      </div>

      <Card className="p-16">
        <div className="flex flex-wrap items-center gap-12">
          <div className="relative flex-1 min-w-[220px]">
            <MagnifyingGlass
              size={16}
              className="absolute left-12 top-1/2 -translate-y-1/2 text-[var(--se-text-muted)]"
            />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by actor, role, module or entity"
              className="pl-32"
            />
          </div>
          <span className="caption-4 tabular-mono text-[var(--se-text-muted)]">
            {data?.meta.total ?? 0} records
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        <Card className="overflow-x-auto lg:col-span-8">
          {isLoading ? (
            <div className="space-y-8">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (data?.items.length ?? 0) === 0 ? (
            <EmptyState
              icon={<ClockCounterClockwise size={22} />}
              title="No matching audit entries"
              description="Try clearing your search filter to view all security events."
            />
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="caption-4 border-b border-[var(--se-border)] text-[var(--se-text-muted)]">
                  <th className="pb-12 pr-12">Time</th>
                  <th className="pb-12 pr-12">Actor</th>
                  <th className="pb-12 pr-12">Role</th>
                  <th className="pb-12 pr-12">Action</th>
                  <th className="pb-12">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--se-border)]">
                {data?.items.map((item) => {
                  const active = selected?.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className={`cursor-pointer transition-colors duration-300 ${
                        active ? 'bg-[var(--se-bg-elevated)]' : 'hover:bg-[var(--se-bg-hover)]'
                      }`}
                    >
                      <td className="tabular-mono py-12 pr-12 text-xs text-[var(--se-text-secondary)]">
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="body-5 py-12 pr-12 text-[var(--se-text-primary)]">
                        {item.actor?.fullName ?? 'System'}
                      </td>
                      <td className="py-12 pr-12">
                        <Badge tone="neutral">{item.roleSlug}</Badge>
                      </td>
                      <td className="body-6 py-12 pr-12 text-brand-bright-teal">
                        {item.module}.{item.action}
                      </td>
                      <td className="caption-4 py-12 text-[var(--se-text-secondary)]">
                        {item.entityType}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {data && data.meta.totalPages > 1 ? (
            <div className="mt-16 flex items-center justify-between border-t border-[var(--se-border)] pt-12">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="caption-4 tabular-mono text-[var(--se-text-muted)]">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </Card>

        <Card className="space-y-12 lg:col-span-4">
          <h2 className="title-3 text-[var(--se-text-primary)]">Event payload diff</h2>
          {selected ? (
            <div className="space-y-12">
              <div className="rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-12">
                <p className="caption-4 text-[var(--se-text-muted)]">Scope and origin</p>
                <p className="body-5 mt-4 text-[var(--se-text-primary)]">
                  {selected.roleSlug} · {selected.scopeUsed}
                </p>
                <p className="caption-5 tabular-mono mt-4 text-[var(--se-text-muted)]">
                  ID: {selected.id}
                </p>
              </div>
              <div>
                <p className="caption-4 mb-4 text-[var(--se-text-muted)]">Before</p>
                <pre className="tabular-mono overflow-x-auto rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-12 text-xs text-[var(--se-text-secondary)]">
                  {JSON.stringify(selected.beforeJson ?? null, null, 2)}
                </pre>
              </div>
              <div>
                <p className="caption-4 mb-4 text-[var(--se-text-muted)]">After</p>
                <pre className="tabular-mono overflow-x-auto rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-12 text-xs text-brand-bright-teal">
                  {JSON.stringify(selected.afterJson ?? null, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="body-6 text-[var(--se-text-muted)]">
              Select a row from the table to inspect before and after values.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
