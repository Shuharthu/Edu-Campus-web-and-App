'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowClockwise,
  ArrowLeft,
  CheckCircle,
  Clock,
  Cpu,
  Queue,
  Warning,
} from '@phosphor-icons/react';
import { Badge, Button, Card } from '@/components/ui/primitives';

interface LogItem {
  id: string;
  channel: 'PUSH' | 'EMAIL' | 'SMS' | 'WEBSOCKET';
  recipient: string;
  status: 'DELIVERED' | 'FAILED' | 'RETRYING';
  latencyMs: number;
  timestamp: string;
  errorDetail?: string;
}

export default function CommunicationLogsPage() {
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'PUSH' | 'EMAIL' | 'SMS'>('ALL');
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const [logs, setLogs] = useState<LogItem[]>([
    {
      id: 'job-push-001',
      channel: 'PUSH',
      recipient: 'Cohort Fall 2026 (386 tokens)',
      status: 'DELIVERED',
      latencyMs: 142,
      timestamp: 'Nov 12, 09:00:02 AM',
    },
    {
      id: 'job-email-001',
      channel: 'EMAIL',
      recipient: 'tariq.mahmud@university.edu',
      status: 'DELIVERED',
      latencyMs: 310,
      timestamp: 'Nov 12, 09:00:05 AM',
    },
    {
      id: 'job-email-002',
      channel: 'EMAIL',
      recipient: 'rafiq.hasan@university.edu',
      status: 'DELIVERED',
      latencyMs: 295,
      timestamp: 'Nov 12, 09:00:06 AM',
    },
    {
      id: 'job-sms-001',
      channel: 'SMS',
      recipient: '+880 1711-234567 (Rafiq Hasan)',
      status: 'DELIVERED',
      latencyMs: 512,
      timestamp: 'Nov 12, 09:01:00 AM',
    },
    {
      id: 'job-push-002',
      channel: 'PUSH',
      recipient: 'CSE Dept Students (164 tokens)',
      status: 'DELIVERED',
      latencyMs: 128,
      timestamp: 'Nov 13, 11:30:02 AM',
    },
    {
      id: 'job-email-003',
      channel: 'EMAIL',
      recipient: 'invalid.bounce@alumni.edu',
      status: 'FAILED',
      latencyMs: 1850,
      timestamp: 'Nov 13, 11:30:15 AM',
      errorDetail: 'SMTP 550: 5.1.1 User unknown or mailbox does not exist',
    },
  ]);

  const filteredLogs = logs.filter(
    (l) => channelFilter === 'ALL' || l.channel === channelFilter,
  );

  const handleRetry = (id: string) => {
    setRetryingId(id);
    setTimeout(() => {
      setRetryingId(null);
      setLogs((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, status: 'DELIVERED' as const, latencyMs: 280, errorDetail: undefined }
            : l,
        ),
      );
      setToastMessage(`Job ${id} re-queued and delivered successfully!`);
      setTimeout(() => setToastMessage(''), 4000);
    }, 700);
  };

  return (
    <div className="space-y-24 p-24 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <Link
            href="/console/communication"
            className="inline-flex items-center gap-6 caption-2 text-[var(--se-text-secondary)] hover:text-brand-teal transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Communication Center
          </Link>
          <div className="flex items-center gap-8">
            <span className="flex h-32 w-32 items-center justify-center rounded-lg bg-[var(--se-brand-teal-light,rgba(13,148,136,0.1))] text-brand-teal">
              <Queue size={20} weight="bold" />
            </span>
            <h1 className="heading-2">Notification Dispatch & Queue Telemetry</h1>
          </div>
          <p className="body-5 text-[var(--se-text-secondary)]">
            Monitor real-time worker queues, message delivery latencies, and retry dead-letter dispatches.
          </p>
        </div>

        <div className="flex items-center gap-8">
          <span className="flex items-center gap-6 caption-2 font-mono text-[var(--se-success-text)] bg-[var(--se-success-bg)] px-10 py-6 rounded-lg">
            <Cpu size={16} />
            4 Active BullMQ Workers
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-16 rounded-xl bg-[var(--se-success-bg)] text-[var(--se-success-text)] flex items-center gap-8 caption-1 font-semibold animate-fade-in">
          <CheckCircle size={20} weight="bold" />
          {toastMessage}
        </div>
      )}

      {/* Telemetry Overview Cards */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Queued Jobs</span>
            <Clock size={18} className="text-brand-teal" />
          </div>
          <div className="heading-1 mt-12 text-brand-teal">0 Pending</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">All queues cleared</div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Processed Today</span>
            <CheckCircle size={18} className="text-[var(--se-success-text)]" />
          </div>
          <div className="heading-1 mt-12 text-[var(--se-success-text)]">2,450 Jobs</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">Across Push, Email & SMS</div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Average Latency</span>
            <Cpu size={18} className="text-[var(--se-info-text)]" />
          </div>
          <div className="heading-1 mt-12 font-mono">218 ms</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">Worker throughput: 450 msg/s</div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Failed / Dead-Letter</span>
            <Warning size={18} className="text-[var(--se-danger-text)]" />
          </div>
          <div className="heading-1 mt-12 text-[var(--se-danger-text)]">1 Failed</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">SMTP invalid mailbox address</div>
        </Card>
      </div>

      {/* Channel Filter */}
      <div className="flex items-center gap-8">
        {(['ALL', 'PUSH', 'EMAIL', 'SMS'] as const).map((ch) => (
          <button
            key={ch}
            onClick={() => setChannelFilter(ch)}
            className={`caption-2 px-12 py-6 rounded-lg transition-colors ${
              channelFilter === ch
                ? 'bg-brand-teal text-brand-ink font-semibold'
                : 'bg-[var(--se-bg-elevated)] text-[var(--se-text-secondary)] hover:bg-[var(--se-bg-hover)]'
            }`}
          >
            {ch === 'ALL' ? 'All Channels' : ch}
          </button>
        ))}
      </div>

      {/* Dispatch Logs Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--se-border)] bg-[var(--se-bg-elevated)]">
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Job ID</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Channel</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Recipient</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Latency</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Dispatched At</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Status</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--se-border)]">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-[var(--se-bg-hover)] transition-colors">
                  <td className="py-16 px-16 font-mono text-xs text-brand-teal">
                    {l.id}
                  </td>
                  <td className="py-16 px-16">
                    <Badge tone="neutral">{l.channel}</Badge>
                  </td>
                  <td className="py-16 px-16">
                    <div className="font-semibold body-5">{l.recipient}</div>
                    {l.errorDetail && (
                      <div className="caption-3 text-[var(--se-danger-text)] mt-2">
                        {l.errorDetail}
                      </div>
                    )}
                  </td>
                  <td className="py-16 px-16 font-mono text-xs">
                    {l.latencyMs} ms
                  </td>
                  <td className="py-16 px-16 caption-3 text-[var(--se-text-muted)]">
                    {l.timestamp}
                  </td>
                  <td className="py-16 px-16">
                    <Badge tone={l.status === 'DELIVERED' ? 'success' : 'danger'}>
                      {l.status}
                    </Badge>
                  </td>
                  <td className="py-16 px-16 text-right">
                    {l.status === 'FAILED' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={retryingId === l.id}
                        onClick={() => handleRetry(l.id)}
                      >
                        <ArrowClockwise size={16} className={`mr-6 ${retryingId === l.id ? 'animate-spin' : ''}`} />
                        Retry Job
                      </Button>
                    ) : (
                      <span className="caption-3 text-[var(--se-text-muted)]">Dispatched</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
