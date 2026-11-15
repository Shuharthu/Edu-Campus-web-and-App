'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Broadcast,
  ChatCircleText,
  CheckCircle,
  Clock,
  Envelope,
  Eye,
  MagnifyingGlass,
  PaperPlaneTilt,
  PushPin,
  X,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  targetScope: string;
  authorName: string;
  authorEmail: string;
  sendPush: boolean;
  sendEmail: boolean;
  sendSms: boolean;
  isPinned: boolean;
  publishedAt: string;
  statsDeliveryCount: number;
  statsReadCount: number;
}

export default function CommunicationCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'NORMAL' | 'URGENT' | 'EMERGENCY'>('ALL');
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Composer form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState<'NORMAL' | 'URGENT' | 'EMERGENCY'>('NORMAL');
  const [newScope, setNewScope] = useState('ALL');
  const [newSendPush, setNewSendPush] = useState(true);
  const [newSendEmail, setNewSendEmail] = useState(true);
  const [newSendSms, setNewSendSms] = useState(false);
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([
    {
      id: 'ann-001',
      title: 'Fall 2026 Midterm Examination Seating Matrix & Admit Cards Published',
      content:
        'Dear Students & Faculty,\n\nThe Fall 2026 Midterm Examination Seating Matrix has been published. All eligible students must generate their digital admit cards with anti-fraud QR code prior to entering the exam venue. Defaulters below 75% attendance should report to the department coordinator immediately.\n\nExam venues open at 08:30 AM.',
      priority: 'URGENT',
      targetScope: 'All Campus',
      authorName: 'Dr. Tariq Mahmud',
      authorEmail: 'tariq.mahmud@university.edu',
      sendPush: true,
      sendEmail: true,
      sendSms: false,
      isPinned: true,
      publishedAt: 'Nov 12, 2026 • 09:00 AM',
      statsDeliveryCount: 386,
      statsReadCount: 312,
    },
    {
      id: 'ann-002',
      title: 'CSE Department Hackathon & Robotics Showcase Registration Open',
      content:
        'Registration is now open for the annual CSE Autumn Hackathon. Teams of 3-4 students may submit their project proposals to the department office by November 20, 2026.',
      priority: 'NORMAL',
      targetScope: 'Computer Science (All Batches)',
      authorName: 'Dr. Tariq Mahmud',
      authorEmail: 'tariq.mahmud@university.edu',
      sendPush: true,
      sendEmail: true,
      sendSms: false,
      isPinned: false,
      publishedAt: 'Nov 13, 2026 • 11:30 AM',
      statsDeliveryCount: 164,
      statsReadCount: 142,
    },
    {
      id: 'ann-003',
      title: 'Emergency Advisory: Heavy Rainstorm Protocol & Transit Shuttle Updates',
      content:
        'Campus transit shuttles from Uttara and Dhanmondi are operating on a 15-minute headway. In case of waterlogging, evening lab sessions will transition online.',
      priority: 'EMERGENCY',
      targetScope: 'All Campus & Faculty',
      authorName: 'Registrar Office',
      authorEmail: 'registrar@university.edu',
      sendPush: true,
      sendEmail: true,
      sendSms: true,
      isPinned: true,
      publishedAt: 'Nov 14, 2026 • 07:15 AM',
      statsDeliveryCount: 420,
      statsReadCount: 398,
    },
  ]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.targetScope.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'ALL' || a.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [announcements, searchQuery, priorityFilter]);

  const handlePublish = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      const newAnn: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        title: newTitle.trim(),
        content: newContent.trim(),
        priority: newPriority,
        targetScope: newScope === 'ALL' ? 'All Campus' : `${newScope} Department`,
        authorName: 'Dr. Tariq Mahmud',
        authorEmail: 'tariq.mahmud@university.edu',
        sendPush: newSendPush,
        sendEmail: newSendEmail,
        sendSms: newSendSms,
        isPinned: newIsPinned,
        publishedAt: 'Just now',
        statsDeliveryCount: 386,
        statsReadCount: 1,
      };

      setAnnouncements([newAnn, ...announcements]);
      setComposerOpen(false);
      setNewTitle('');
      setNewContent('');
      setToastMessage(`Announcement "${newAnn.title}" published and dispatched across channels!`);
      setTimeout(() => setToastMessage(''), 4500);
    }, 600);
  };

  return (
    <div className="space-y-24 p-24 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-8">
            <span className="flex h-32 w-32 items-center justify-center rounded-lg bg-[var(--se-brand-teal-light,rgba(13,148,136,0.1))] text-brand-teal">
              <Broadcast size={20} weight="bold" />
            </span>
            <h1 className="heading-2">Multi-Channel Communication Center</h1>
          </div>
          <p className="body-5 text-[var(--se-text-secondary)] mt-4">
            Broadcast emergency alerts, campus notices, and academic bulletins across Push, Email, SMS, and in-app feeds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-12">
          <Link href="/console/communication/threads">
            <Button variant="secondary" size="sm">
              <ChatCircleText size={16} className="mr-8" />
              Course Threads & Chat
            </Button>
          </Link>
          <Link href="/console/communication/logs">
            <Button variant="secondary" size="sm">
              <Clock size={16} className="mr-8" />
              Dispatch Logs & Queues
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={() => setComposerOpen(true)}>
            <PaperPlaneTilt size={16} className="mr-8" />
            New Broadcast
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-16 rounded-xl bg-[var(--se-success-bg)] text-[var(--se-success-text)] flex items-center gap-8 caption-1 font-semibold animate-fade-in">
          <CheckCircle size={20} weight="bold" />
          {toastMessage}
        </div>
      )}

      {/* KPI Metric Overview */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Active Announcements</span>
            <Broadcast size={18} className="text-brand-teal" />
          </div>
          <div className="heading-1 mt-12">{announcements.length} Published</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">2 Pinned to top of feed</div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Overall Delivery Rate</span>
            <CheckCircle size={18} className="text-[var(--se-success-text)]" />
          </div>
          <div className="heading-1 mt-12 text-[var(--se-success-text)]">98.6%</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">Across 2,450 total dispatches</div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Average Read Rate</span>
            <Eye size={18} className="text-brand-teal" />
          </div>
          <div className="heading-1 mt-12">86.4%</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">Read within 2 hours of broadcast</div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">SMS & Email Credits</span>
            <Envelope size={18} className="text-[var(--se-warning-text)]" />
          </div>
          <div className="heading-1 mt-12">4,250 Rem.</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">Monthly limit: 10,000 dispatches</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-16">
        <div className="flex flex-col gap-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass
              size={18}
              className="absolute left-12 top-1/2 -translate-y-1/2 text-[var(--se-text-muted)]"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements, tags, departments..."
              className="pl-40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-8">
            {(['ALL', 'EMERGENCY', 'URGENT', 'NORMAL'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`caption-2 px-12 py-6 rounded-lg transition-colors ${
                  priorityFilter === p
                    ? 'bg-brand-teal text-brand-ink font-semibold'
                    : 'bg-[var(--se-bg-elevated)] text-[var(--se-text-secondary)] hover:bg-[var(--se-bg-hover)]'
                }`}
              >
                {p === 'ALL' ? 'All Priority' : p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Announcements Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--se-border)] bg-[var(--se-bg-elevated)]">
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Title & Content Excerpt</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Priority</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Target Audience</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Channels</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Published</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Read Rate</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--se-border)]">
              {filteredAnnouncements.map((a) => {
                const readPct =
                  a.statsDeliveryCount > 0
                    ? Math.round((a.statsReadCount / a.statsDeliveryCount) * 100)
                    : 0;

                return (
                  <tr
                    key={a.id}
                    className="hover:bg-[var(--se-bg-hover)] transition-colors cursor-pointer"
                    onClick={() => setSelectedAnnouncement(a)}
                  >
                    <td className="py-16 px-16 max-w-md">
                      <div className="flex items-center gap-6">
                        {a.isPinned && (
                          <PushPin size={16} weight="fill" className="text-brand-teal shrink-0" />
                        )}
                        <span className="font-semibold body-4 truncate">{a.title}</span>
                      </div>
                      <p className="caption-3 text-[var(--se-text-muted)] line-clamp-1 mt-2">
                        {a.content}
                      </p>
                    </td>
                    <td className="py-16 px-16">
                      <Badge
                        tone={
                          a.priority === 'EMERGENCY'
                            ? 'danger'
                            : a.priority === 'URGENT'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {a.priority}
                      </Badge>
                    </td>
                    <td className="py-16 px-16">
                      <div className="body-6">{a.targetScope}</div>
                      <div className="caption-3 text-[var(--se-text-muted)]">By {a.authorName}</div>
                    </td>
                    <td className="py-16 px-16">
                      <div className="flex items-center gap-6 text-[var(--se-text-secondary)]">
                        {a.sendPush && (
                          <span title="Push Notification">
                            <Bell size={16} />
                          </span>
                        )}
                        {a.sendEmail && (
                          <span title="Email Digest">
                            <Envelope size={16} />
                          </span>
                        )}
                        {a.sendSms && (
                          <span title="SMS Gateway">
                            <ChatCircleText size={16} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-16 px-16 caption-3 text-[var(--se-text-muted)]">
                      {a.publishedAt}
                    </td>
                    <td className="py-16 px-16">
                      <div className="flex items-center gap-6">
                        <span className="font-mono font-semibold caption-2">{readPct}%</span>
                        <span className="caption-3 text-[var(--se-text-muted)]">
                          ({a.statsReadCount}/{a.statsDeliveryCount})
                        </span>
                      </div>
                    </td>
                    <td className="py-16 px-16 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAnnouncement(a);
                        }}
                      >
                        <Eye size={16} className="mr-6" />
                        Inspect
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Composer Modal */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-16">
          <Card className="w-full max-w-2xl p-24 space-y-20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--se-border)] pb-12">
              <div className="flex items-center gap-8">
                <PaperPlaneTilt size={20} className="text-brand-teal" />
                <h3 className="heading-3">New Multi-Channel Broadcast</h3>
              </div>
              <button
                onClick={() => setComposerOpen(false)}
                className="text-[var(--se-text-muted)] hover:text-[var(--se-text-primary)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-16">
              <div>
                <label className="caption-2 font-semibold text-[var(--se-text-secondary)] block mb-6">
                  Announcement Headline
                </label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Midterm Seating Arrangement Published"
                />
              </div>

              <div>
                <label className="caption-2 font-semibold text-[var(--se-text-secondary)] block mb-6">
                  Broadcast Body (Markdown Supported)
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                  placeholder="Enter full notice content, instructions, and deadlines..."
                  className="w-full rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-12 text-sm text-[var(--se-text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-teal resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
                <div>
                  <label className="caption-2 font-semibold text-[var(--se-text-secondary)] block mb-6">
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'NORMAL' | 'URGENT' | 'EMERGENCY')}
                    className="w-full rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-12 text-sm text-[var(--se-text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  >
                    <option value="NORMAL">Normal (Standard Bulletin)</option>
                    <option value="URGENT">Urgent (Immediate Student Action)</option>
                    <option value="EMERGENCY">Emergency (Campus Weather / Safety)</option>
                  </select>
                </div>

                <div>
                  <label className="caption-2 font-semibold text-[var(--se-text-secondary)] block mb-6">
                    Target Cohort / Scope
                  </label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    className="w-full rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-12 text-sm text-[var(--se-text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  >
                    <option value="ALL">Entire Campus (All Students & Faculty)</option>
                    <option value="CSE">Computer Science & Engineering</option>
                    <option value="EEE">Electrical Engineering</option>
                    <option value="BBA">Business Administration</option>
                  </select>
                </div>
              </div>

              <div className="p-16 rounded-xl bg-[var(--se-bg-elevated)] space-y-12">
                <span className="caption-2 font-semibold text-[var(--se-text-primary)] block">
                  Delivery Channels
                </span>
                <div className="flex flex-wrap items-center gap-16">
                  <label className="flex items-center gap-8 caption-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSendPush}
                      onChange={(e) => setNewSendPush(e.target.checked)}
                      className="rounded text-brand-teal focus:ring-brand-teal"
                    />
                    Push Notification
                  </label>
                  <label className="flex items-center gap-8 caption-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSendEmail}
                      onChange={(e) => setNewSendEmail(e.target.checked)}
                      className="rounded text-brand-teal focus:ring-brand-teal"
                    />
                    Email Digest
                  </label>
                  <label className="flex items-center gap-8 caption-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSendSms}
                      onChange={(e) => setNewSendSms(e.target.checked)}
                      className="rounded text-brand-teal focus:ring-brand-teal"
                    />
                    SMS Alert (High Priority)
                  </label>
                  <label className="flex items-center gap-8 caption-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsPinned}
                      onChange={(e) => setNewIsPinned(e.target.checked)}
                      className="rounded text-brand-teal focus:ring-brand-teal"
                    />
                    Pin to Top of Portal
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-12 pt-16 border-t border-[var(--se-border)]">
              <Button variant="secondary" size="sm" onClick={() => setComposerOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" disabled={isPublishing} onClick={handlePublish}>
                <PaperPlaneTilt size={16} className="mr-6" />
                {isPublishing ? 'Broadcasting...' : 'Publish Broadcast'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Detail Slide-Over / Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-16">
          <Card className="w-full max-w-xl p-24 space-y-20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--se-border)] pb-12">
              <div className="flex items-center gap-8">
                <Badge
                  tone={
                    selectedAnnouncement.priority === 'EMERGENCY'
                      ? 'danger'
                      : selectedAnnouncement.priority === 'URGENT'
                      ? 'warning'
                      : 'neutral'
                  }
                >
                  {selectedAnnouncement.priority}
                </Badge>
                <span className="caption-3 text-[var(--se-text-muted)]">
                  {selectedAnnouncement.publishedAt}
                </span>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-[var(--se-text-muted)] hover:text-[var(--se-text-primary)]"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <h3 className="heading-3">{selectedAnnouncement.title}</h3>
              <div className="caption-2 text-[var(--se-text-secondary)] mt-4">
                Target: {selectedAnnouncement.targetScope} • By {selectedAnnouncement.authorName} ({selectedAnnouncement.authorEmail})
              </div>
            </div>

            <div className="p-16 rounded-xl bg-[var(--se-bg-elevated)] whitespace-pre-wrap text-sm leading-relaxed">
              {selectedAnnouncement.content}
            </div>

            <div className="grid grid-cols-2 gap-12 p-12 rounded-xl border border-[var(--se-border)]">
              <div>
                <span className="caption-3 text-[var(--se-text-muted)] block">Dispatched Tokens</span>
                <span className="font-mono font-semibold body-4">
                  {selectedAnnouncement.statsDeliveryCount} Recipients
                </span>
              </div>
              <div>
                <span className="caption-3 text-[var(--se-text-muted)] block">Verified Reads</span>
                <span className="font-mono font-semibold body-4 text-brand-teal">
                  {selectedAnnouncement.statsReadCount} Reads ({Math.round((selectedAnnouncement.statsReadCount / selectedAnnouncement.statsDeliveryCount) * 100)}%)
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-12 border-t border-[var(--se-border)]">
              <Button variant="secondary" size="sm" onClick={() => setSelectedAnnouncement(null)}>
                Close Preview
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
