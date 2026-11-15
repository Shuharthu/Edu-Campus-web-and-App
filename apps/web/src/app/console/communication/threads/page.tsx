'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChatCircleText,
  Hash,
  LockKey,
  LockKeyOpen,
  Paperclip,
  PaperPlaneTilt,
  PushPin,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

interface Message {
  id: string;
  senderName: string;
  senderRole: 'FACULTY' | 'STUDENT' | 'ADMIN';
  avatarInitials: string;
  content: string;
  timestamp: string;
  isPinned?: boolean;
}

interface ThreadChannel {
  id: string;
  title: string;
  code: string;
  type: string;
  unreadCount: number;
  isLocked: boolean;
  participantCount: number;
}

export default function CommunicationThreadsPage() {
  const [activeChannelId, setActiveChannelId] = useState('ch-1');
  const [inputMessage, setInputMessage] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const [channels] = useState<ThreadChannel[]>([
    {
      id: 'ch-1',
      title: 'CSE204-A: Data Structures Discussion',
      code: 'CSE204-A',
      type: 'Course Channel',
      unreadCount: 0,
      isLocked: false,
      participantCount: 38,
    },
    {
      id: 'ch-2',
      title: 'CSE204-A: Lab & Coding Helpdesk',
      code: 'CSE204-LAB',
      type: 'Lab Channel',
      unreadCount: 2,
      isLocked: false,
      participantCount: 38,
    },
    {
      id: 'ch-3',
      title: 'CSE Department General Bulletin',
      code: 'CSE-DEPT',
      type: 'Department',
      unreadCount: 0,
      isLocked: true,
      participantCount: 164,
    },
    {
      id: 'ch-4',
      title: 'Faculty Executive Committee',
      code: 'FACULTY-EXEC',
      type: 'Private Channel',
      unreadCount: 0,
      isLocked: false,
      participantCount: 12,
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      senderName: 'Dr. Tariq Mahmud',
      senderRole: 'FACULTY',
      avatarInitials: 'TM',
      content:
        'Welcome to the CSE204 Section A channel. Please post questions about Assignment 2 (Red-Black Trees & AVL Balance) here. TAs will also hold office hours tomorrow.',
      timestamp: 'Nov 10, 10:00 AM',
      isPinned: true,
    },
    {
      id: 'msg-2',
      senderName: 'Rafiq Hasan',
      senderRole: 'STUDENT',
      avatarInitials: 'RH',
      content:
        'Sir, for problem 3 in Assignment 2, should we recolor before or after performing the rotation?',
      timestamp: 'Nov 10, 10:15 AM',
    },
    {
      id: 'msg-3',
      senderName: 'Dr. Tariq Mahmud',
      senderRole: 'FACULTY',
      avatarInitials: 'TM',
      content:
        'Good question Rafiq. Check case 1 vs case 2: recolor if the uncle node is red, rotate if the uncle is black. Re-verify the invariant balance property.',
      timestamp: 'Nov 10, 10:20 AM',
    },
    {
      id: 'msg-4',
      senderName: 'Anika Rahman',
      senderRole: 'STUDENT',
      avatarInitials: 'AR',
      content:
        'Understood! And is the simulator test suite available on the coursework tab now?',
      timestamp: 'Nov 10, 10:25 AM',
    },
    {
      id: 'msg-5',
      senderName: 'Dr. Tariq Mahmud',
      senderRole: 'FACULTY',
      avatarInitials: 'TM',
      content:
        'Yes Anika, the test cases are published in the course materials repository under /assignments/hw2.',
      timestamp: 'Nov 10, 10:28 AM',
    },
  ]);

  const activeChannel = channels.find((c) => c.id === activeChannelId) ?? channels[0]!;

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLocked) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderName: 'Dr. Tariq Mahmud',
      senderRole: 'FACULTY',
      avatarInitials: 'TM',
      content: inputMessage.trim(),
      timestamp: 'Just now',
    };

    setMessages([...messages, newMsg]);
    setInputMessage('');
  };

  return (
    <div className="space-y-16 p-24 max-w-[1400px] mx-auto h-[calc(100vh-64px)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between shrink-0">
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
              <ChatCircleText size={20} weight="bold" />
            </span>
            <h1 className="heading-2">Course Threads & Real-Time Chat</h1>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <span className="flex items-center gap-6 caption-2 font-mono text-[var(--se-success-text)] bg-[var(--se-success-bg)] px-10 py-6 rounded-lg">
            <span className="h-8 w-8 rounded-full bg-[var(--se-success-text)] animate-ping" />
            WebSocket Live Gateway
          </span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 flex-1 min-h-0">
        {/* Left Channel Sidebar */}
        <Card className="p-16 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <span className="caption-2 font-semibold text-[var(--se-text-secondary)]">
                Discussion Channels
              </span>
              <Badge tone="info">{channels.length} Active</Badge>
            </div>

            <div className="space-y-4">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`w-full text-left p-12 rounded-xl transition-all flex items-center justify-between ${
                    activeChannelId === ch.id
                      ? 'bg-brand-teal text-brand-ink font-semibold'
                      : 'hover:bg-[var(--se-bg-hover)] text-[var(--se-text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-8 truncate">
                    <Hash size={16} className={activeChannelId === ch.id ? 'text-brand-ink' : 'text-brand-teal'} />
                    <span className="caption-2 truncate">{ch.code}</span>
                  </div>
                  {ch.isLocked && <LockKey size={14} className="text-[var(--se-text-muted)] shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-16 border-t border-[var(--se-border)] mt-16">
            <div className="caption-3 text-[var(--se-text-muted)]">Active Role</div>
            <div className="font-semibold caption-2 mt-2">Dr. Tariq Mahmud (Instructor)</div>
          </div>
        </Card>

        {/* Right Chat Canvas */}
        <Card className="md:col-span-3 p-0 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-16 border-b border-[var(--se-border)] flex items-center justify-between bg-[var(--se-bg-elevated)] shrink-0">
            <div>
              <div className="flex items-center gap-8">
                <h3 className="heading-4">{activeChannel.title}</h3>
                <Badge tone={isLocked ? 'danger' : 'success'}>
                  {isLocked ? 'Locked' : 'Open for Discussion'}
                </Badge>
              </div>
              <div className="caption-3 text-[var(--se-text-muted)] mt-2">
                {activeChannel.participantCount} enrolled students & teaching assistants
              </div>
            </div>

            <div className="flex items-center gap-8">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsLocked(!isLocked)}
              >
                {isLocked ? (
                  <>
                    <LockKeyOpen size={16} className="mr-6 text-brand-teal" />
                    Unlock Channel
                  </>
                ) : (
                  <>
                    <LockKey size={16} className="mr-6 text-[var(--se-danger-text)]" />
                    Lock Thread
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Pinned Announcement Bar */}
          <div className="px-16 py-8 bg-[var(--se-bg-elevated)] border-b border-[var(--se-border)] flex items-center justify-between caption-3">
            <div className="flex items-center gap-6 text-[var(--se-text-secondary)]">
              <PushPin size={14} weight="fill" className="text-brand-teal" />
              <span>
                <strong className="text-[var(--se-text-primary)]">Pinned Notice: </strong>
                Assignment 2 submission deadline extended to Nov 18, 11:59 PM.
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-16 space-y-16">
            {messages.map((m) => {
              const isFaculty = m.senderRole === 'FACULTY';
              return (
                <div key={m.id} className="flex items-start gap-12">
                  <div
                    className={`flex h-36 w-36 shrink-0 items-center justify-center rounded-full font-semibold text-xs font-mono ${
                      isFaculty
                        ? 'bg-brand-ink text-brand-teal border border-brand-teal'
                        : 'bg-[var(--se-bg-elevated)] text-[var(--se-text-primary)]'
                    }`}
                  >
                    {m.avatarInitials}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-8">
                      <span className="font-semibold caption-1">{m.senderName}</span>
                      <Badge tone={isFaculty ? 'info' : 'neutral'}>
                        {m.senderRole}
                      </Badge>
                      <span className="caption-3 text-[var(--se-text-muted)] font-mono">
                        {m.timestamp}
                      </span>
                    </div>

                    <div className="p-12 rounded-xl bg-[var(--se-bg-elevated)] text-sm max-w-2xl leading-relaxed">
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Box */}
          <div className="p-16 border-t border-[var(--se-border)] bg-[var(--se-bg-card)] shrink-0">
            {isLocked ? (
              <div className="p-12 text-center caption-2 text-[var(--se-danger-text)] bg-[var(--se-danger-bg)] rounded-xl">
                This discussion channel is locked by faculty. No new replies can be posted.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-12"
              >
                <button
                  type="button"
                  className="rounded-lg p-8 text-[var(--se-text-muted)] hover:bg-[var(--se-bg-hover)]"
                  title="Attach file"
                >
                  <Paperclip size={20} />
                </button>

                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${activeChannel.code}...`}
                  className="flex-1"
                />

                <Button type="submit" variant="primary" size="md">
                  <PaperPlaneTilt size={18} className="mr-6" />
                  Send
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
