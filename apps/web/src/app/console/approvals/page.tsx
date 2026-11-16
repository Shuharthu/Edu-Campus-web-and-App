'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Check,
  X,
  UserCheck,
  Clock,
  Envelope,
} from '@phosphor-icons/react';
import { Badge, Button, Card } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth-context';

interface PendingRegistration {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  roleName: string;
  roleSlug: string;
  departmentCode: string | null;
  status: string;
  submittedAt: string;
}

export default function UserApprovalsPage() {
  const { api } = useAuth();
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.request<PendingRegistration[]>('GET', '/auth/pending-registrations');
      setRegistrations(data || []);
    } catch {
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  async function handleApprove(id: string, name: string) {
    setProcessingId(id);
    setActionSuccess(null);
    setActionError(null);
    try {
      await api.request('POST', `/auth/approve-registration/${id}`);
      setActionSuccess(`Account for ${name} has been approved and activated. They can now log in.`);
      await loadPending();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve registration.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string, name: string) {
    setProcessingId(id);
    setActionSuccess(null);
    setActionError(null);
    try {
      await api.request('POST', `/auth/reject-registration/${id}`);
      setActionSuccess(`Registration for ${name} has been rejected.`);
      await loadPending();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reject registration.');
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-24">
        {/* Header */}
        <div className="flex flex-col gap-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="heading-4 text-[var(--se-text-primary)]">User Registration Approvals</h1>
            <p className="body-6 text-[var(--se-text-secondary)]">
              Review and accept pending student and faculty registrations before they are granted workspace access.
            </p>
          </div>
          <Button variant="secondary" onClick={loadPending} className="self-start">
            Refresh Pending List
          </Button>
        </div>

        {/* Notifications */}
        {actionSuccess && (
          <div className="rounded-lg border border-teal-500/40 bg-teal-950/20 p-12 text-xs text-teal-300 flex items-center gap-8">
            <Check size={16} weight="bold" />
            {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="rounded-lg border border-red-500/40 bg-red-950/20 p-12 text-xs text-red-300 flex items-center gap-8">
            <X size={16} weight="bold" />
            {actionError}
          </div>
        )}

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-3">
          <Card className="p-16">
            <span className="caption-5 text-[var(--se-text-muted)]">Pending Review</span>
            <p className="heading-4 mt-4 text-amber-400">{registrations.length}</p>
          </Card>
          <Card className="p-16">
            <span className="caption-5 text-[var(--se-text-muted)]">Approval Policy</span>
            <p className="heading-6 mt-4 text-[var(--se-text-primary)]">Admin Verification Required</p>
          </Card>
          <Card className="p-16">
            <span className="caption-5 text-[var(--se-text-muted)]">Multi-Tenant Sync</span>
            <p className="heading-6 mt-4 text-teal-400">PostgreSQL Live Audit Active</p>
          </Card>
        </div>

        {/* Pending Requests Table */}
        <Card className="overflow-hidden">
          <div className="border-b border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-16">
            <h2 className="heading-6 text-[var(--se-text-primary)]">
              Pending Registrations ({registrations.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-32 text-center text-xs text-[var(--se-text-muted)]">
              Loading pending account registrations...
            </div>
          ) : registrations.length === 0 ? (
            <div className="p-40 text-center space-y-8">
              <UserCheck size={36} className="mx-auto text-teal-400 opacity-60" />
              <p className="body-5 text-[var(--se-text-primary)]">All registrations are up to date</p>
              <p className="caption-5 text-[var(--se-text-muted)]">
                When new users sign up on the web or mobile app, their accounts will appear here for admin acceptance.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--se-border)]">
              {registrations.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-12 p-16 sm:flex-row sm:items-center sm:justify-between hover:bg-[var(--se-bg-hover)] transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-8">
                      <span className="font-semibold text-sm text-[var(--se-text-primary)]">
                        {item.fullName}
                      </span>
                      <Badge tone="neutral">{item.roleName}</Badge>
                      {item.departmentCode && (
                        <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-6 py-2 rounded">
                          {item.departmentCode}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-12 text-xs text-[var(--se-text-muted)]">
                      <span className="flex items-center gap-4">
                        <Envelope size={12} /> {item.email}
                      </span>
                      <span className="flex items-center gap-4">
                        <Clock size={12} /> Submitted {new Date(item.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 self-end sm:self-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={processingId === item.id}
                      onClick={() => handleReject(item.id, item.fullName)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={14} className="mr-4" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={processingId === item.id}
                      onClick={() => handleApprove(item.id, item.fullName)}
                      className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold"
                    >
                      <Check size={14} weight="bold" className="mr-4" />
                      {processingId === item.id ? 'Approving...' : 'Accept Account'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
  );
}
