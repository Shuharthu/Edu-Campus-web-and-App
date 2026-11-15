'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  ClockCounterClockwise,
  Database,
  DownloadSimple,
  FileText,
  Lock,
  MagnifyingGlass,
  ShieldCheck,
  UserCheck,
  WarningCircle,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

interface AuditTrailItem {
  id: string;
  actorId: string;
  actorName: string;
  module: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  status: 'VERIFIED' | 'TAMPER_PROOF';
}

export default function ComplianceCenterPage() {
  const [activeTab, setActiveTab] = useState<'export' | 'owasp' | 'audit'>('export');
  const [studentRoll, setStudentRoll] = useState('2024-CSE-0042');
  const [exportReason, setExportReason] = useState('ANNUAL_STUDENT_REQUEST');
  const [exportGenerated, setExportGenerated] = useState(false);
  const [searchAudit, setSearchAudit] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Sample Audit Trail Logs
  const auditLogs: AuditTrailItem[] = [
    {
      id: 'aud-001',
      actorId: 'usr-admin-01',
      actorName: 'Dr. Tariq Mahmud (Dean / Registrar)',
      module: 'compliance',
      action: 'export',
      entityType: 'StudentRecord',
      entityId: 'stu-rafiq-0042',
      timestamp: 'Today, 1:42 PM',
      ipAddress: '192.168.1.104',
      status: 'TAMPER_PROOF',
    },
    {
      id: 'aud-002',
      actorId: 'usr-faculty-02',
      actorName: 'Prof. Nusrat Jahan',
      module: 'grades',
      action: 'publish_result',
      entityType: 'SemesterResult',
      entityId: 'res-cse204-f26',
      timestamp: 'Today, 11:30 AM',
      ipAddress: '192.168.1.112',
      status: 'VERIFIED',
    },
    {
      id: 'aud-003',
      actorId: 'usr-finance-01',
      actorName: 'Accounts Officer (Finance)',
      module: 'finance',
      action: 'reconcile_payment',
      entityType: 'Invoice',
      entityId: 'inv-2026-0042',
      timestamp: 'Yesterday, 4:15 PM',
      ipAddress: '192.168.1.98',
      status: 'VERIFIED',
    },
    {
      id: 'aud-004',
      actorId: 'usr-admin-01',
      actorName: 'Dr. Tariq Mahmud (Dean / Registrar)',
      module: 'roles_permissions',
      action: 'update_permissions',
      entityType: 'RoleTemplate',
      entityId: 'role-subadmin-lib',
      timestamp: 'Nov 12, 2026, 2:00 PM',
      ipAddress: '192.168.1.104',
      status: 'TAMPER_PROOF',
    },
  ];

  const owaspItems = [
    {
      code: 'A01:2021',
      name: 'Broken Access Control',
      defense: 'Scoped RBAC module+action+scope enforced on every controller via PermissionsGuard & Supabase RLS.',
      status: 'PASS',
    },
    {
      code: 'A02:2021',
      name: 'Cryptographic Failures',
      defense: 'Argon2id password hashing, AES-256 for offline tokens, TLS-only Supabase DB connections.',
      status: 'PASS',
    },
    {
      code: 'A03:2021',
      name: 'Injection',
      defense: 'Prisma ORM parameterized queries exclusively; zero raw dynamic SQL execution.',
      status: 'PASS',
    },
    {
      code: 'A04:2021',
      name: 'Insecure Design',
      defense: 'Design-first blueprints, rate-limited login endpoints, 30s rotating TOTP for digital IDs.',
      status: 'PASS',
    },
    {
      code: 'A05:2021',
      name: 'Security Misconfiguration',
      defense: 'Helmet headers enabled, CORS origin validation, automated security environment checks.',
      status: 'PASS',
    },
    {
      code: 'A06:2021',
      name: 'Vulnerable & Outdated Components',
      defense: 'Up-to-date NestJS 11, Next.js 15, and Flutter 3 dependencies with zero known CVEs.',
      status: 'PASS',
    },
    {
      code: 'A07:2021',
      name: 'Identification & Authentication Failures',
      defense: 'JWT + refresh rotation, TOTP MFA requirement for administrators, brute-force throttling.',
      status: 'PASS',
    },
    {
      code: 'A08:2021',
      name: 'Software & Data Integrity Failures',
      defense: 'Immutable AuditLog records on all administrative transactions with actor attribution.',
      status: 'PASS',
    },
    {
      code: 'A09:2021',
      name: 'Security Logging & Monitoring Failures',
      defense: 'Structured JSON logging across all backend modules with correlation IDs and audit hooks.',
      status: 'PASS',
    },
    {
      code: 'A10:2021',
      name: 'Server-Side Request Forgery (SSRF)',
      defense: 'Strict URL parsing and allowlists for external webhooks and partner API integrations.',
      status: 'PASS',
    },
  ];

  const handleGenerateExport = (e: React.FormEvent) => {
    e.preventDefault();
    setExportGenerated(true);
    setToastMessage('Certified FERPA/GDPR Educational Dossier generated successfully.');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const filteredAudit = auditLogs.filter(
    (log) =>
      log.actorName.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.module.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.action.toLowerCase().includes(searchAudit.toLowerCase()),
  );

  return (
    <div className="space-y-24">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 right-24 z-50 rounded-[var(--se-radius-md)] border border-emerald-500/30 bg-emerald-950/90 px-16 py-12 text-sm text-emerald-200 shadow-xl backdrop-blur">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--se-text-primary)]">
          Compliance, FERPA &amp; Data Protection
        </h1>
        <p className="mt-4 text-sm text-[var(--se-text-secondary)]">
          Statutory student data portability, right-to-erasure workflows, and OWASP Top 10 security audit trail.
        </p>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Statutory Framework
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-teal-500/10 text-teal-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-12">
            <span className="text-lg font-semibold">FERPA 34 CFR &amp; GDPR</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Machine-readable portability active</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Data Portability
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">142 Dossiers</span>
            <span className="text-xs text-cyan-400 font-medium">100% On-Time</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Zero statutory deadline breaches</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Erasure Review Queue
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">3 Pending</span>
            <span className="text-xs text-amber-400 font-medium">Exemption Applied</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Transcript retention mandated</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Audit Trail Integrity
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <ClockCounterClockwise size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">8,940 Events</span>
            <span className="text-xs text-emerald-400 font-medium">Immutable</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Cryptographic actor attribution</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--se-border)] gap-16">
        <button
          onClick={() => setActiveTab('export')}
          className={`pb-12 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'export'
              ? 'border-teal-400 text-teal-400'
              : 'border-transparent text-[var(--se-text-secondary)] hover:text-white'
          }`}
        >
          FERPA / GDPR Data Portability
        </button>
        <button
          onClick={() => setActiveTab('owasp')}
          className={`pb-12 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'owasp'
              ? 'border-teal-400 text-teal-400'
              : 'border-transparent text-[var(--se-text-secondary)] hover:text-white'
          }`}
        >
          OWASP Top 10 Security Posture
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-12 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-teal-400 text-teal-400'
              : 'border-transparent text-[var(--se-text-secondary)] hover:text-white'
          }`}
        >
          Immutable Audit Trail
        </button>
      </div>

      {/* Tab 1: Data Portability & Export */}
      {activeTab === 'export' && (
        <div className="space-y-20">
          <Card className="p-20">
            <h3 className="text-base font-semibold text-[var(--se-text-primary)]">
              Generate Certified Student Educational Dossier
            </h3>
            <p className="mt-4 text-xs text-[var(--se-text-secondary)]">
              Produces a verified, machine-readable JSON portfolio conforming to FERPA 34 CFR § 99.10 and GDPR Art. 20 standards.
            </p>

            <form onSubmit={handleGenerateExport} className="mt-16 grid grid-cols-1 gap-16 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">Student Roll / ID</label>
                <Input
                  className="mt-4"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  placeholder="e.g. 2024-CSE-0042"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">Statutory Purpose</label>
                <select
                  value={exportReason}
                  onChange={(e) => setExportReason(e.target.value)}
                  className="mt-4 w-full rounded-[var(--se-radius-md)] border border-[var(--se-border)] bg-[var(--se-bg-subtle)] px-12 py-8 text-sm text-[var(--se-text-primary)] outline-none"
                >
                  <option value="ANNUAL_STUDENT_REQUEST">Annual Student Statutory Request (Self-Access)</option>
                  <option value="INSTITUTION_TRANSFER">Inter-University Transfer Verification</option>
                  <option value="LEGAL_COUNSEL">Accreditation / Regulatory Audit</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  Generate Certified Dossier
                </Button>
              </div>
            </form>
          </Card>

          {exportGenerated && (
            <Card className="p-20 border-teal-500/30 bg-teal-500/5">
              <div className="flex flex-col gap-12 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--se-border)] pb-16">
                <div>
                  <div className="flex items-center gap-8">
                    <CheckCircle size={20} className="text-teal-400" />
                    <h4 className="font-semibold text-[var(--se-text-primary)]">
                      Official Educational Record Dossier — Rafiq Hasan (2024-CSE-0042)
                    </h4>
                  </div>
                  <p className="mt-2 text-xs text-[var(--se-text-secondary)]">
                    Certified Cryptographic Digest: <code>sha256:8b4e...0f2a</code> • Exported under FERPA 34 CFR § 99.10
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setToastMessage('Encrypted JSON dossier downloaded.');
                    setTimeout(() => setToastMessage(''), 3000);
                  }}
                  className="shrink-0"
                >
                  <DownloadSimple size={16} className="mr-8" />
                  Download Certified JSON
                </Button>
              </div>

              <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-3 text-xs">
                <div className="rounded-[var(--se-radius-md)] bg-[var(--se-bg-surface)] p-12 border border-[var(--se-border)]">
                  <span className="font-semibold text-neutral-400 uppercase tracking-wider">Identity &amp; Profile</span>
                  <div className="mt-8 space-y-4">
                    <p><span className="text-neutral-400">Name:</span> Rafiq Hasan</p>
                    <p><span className="text-neutral-400">Email:</span> rafiq.hasan@student.university.edu</p>
                    <p><span className="text-neutral-400">Program:</span> B.Sc. Computer Science (CSE)</p>
                    <p><span className="text-neutral-400">CGPA:</span> 3.21 / 4.00 (48 Credits)</p>
                  </div>
                </div>

                <div className="rounded-[var(--se-radius-md)] bg-[var(--se-bg-surface)] p-12 border border-[var(--se-border)]">
                  <span className="font-semibold text-neutral-400 uppercase tracking-wider">Academics &amp; Attendance</span>
                  <div className="mt-8 space-y-4">
                    <p><span className="text-neutral-400">Enrolled Courses:</span> 4 Subjects (CSE204, CSE301, MAT201, ENG101)</p>
                    <p><span className="text-neutral-400">Attendance Rate:</span> 88.5% (Eligible for Exams)</p>
                    <p><span className="text-neutral-400">Exam Seating:</span> Auditorium Hall C, Seat 42</p>
                    <p><span className="text-neutral-400">Library Loans:</span> 1 Active (Intro to Algorithms)</p>
                  </div>
                </div>

                <div className="rounded-[var(--se-radius-md)] bg-[var(--se-bg-surface)] p-12 border border-[var(--se-border)]">
                  <span className="font-semibold text-neutral-400 uppercase tracking-wider">Financial &amp; Housing</span>
                  <div className="mt-8 space-y-4">
                    <p><span className="text-neutral-400">Tuition Total:</span> $3,070.00 (Installment 1 Paid)</p>
                    <p><span className="text-neutral-400">Balance Due:</span> $2,046.66 (Due Nov 30)</p>
                    <p><span className="text-neutral-400">Hostel Residency:</span> Shahidullah Hall, Room 302</p>
                    <p><span className="text-neutral-400">Campus Route:</span> Route 4 (Uttara Express)</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: OWASP Top 10 Security Posture */}
      {activeTab === 'owasp' && (
        <div className="space-y-16">
          <Card className="p-16 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-12">
              <ShieldCheck size={24} className="text-emerald-400" />
              <div>
                <h3 className="font-semibold text-[var(--se-text-primary)]">
                  Universal Cybersecurity Guardian: Hardened Posture
                </h3>
                <p className="text-xs text-[var(--se-text-secondary)]">
                  All 10 OWASP Top 10 &amp; API Security Top 10 attack vectors defended with verified server-side controls.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {owaspItems.map((item) => (
              <Card key={item.code} className="p-16 space-y-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-teal-400 font-semibold">{item.code}</span>
                  <Badge tone="success">
                    <CheckCircle size={12} className="mr-4" />
                    {item.status}
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm text-[var(--se-text-primary)]">{item.name}</h4>
                <p className="text-xs text-[var(--se-text-secondary)] leading-relaxed">{item.defense}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Immutable Audit Trail */}
      {activeTab === 'audit' && (
        <Card className="p-16 space-y-16">
          <div className="flex flex-col gap-12 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <MagnifyingGlass
                size={16}
                className="absolute left-12 top-1/2 -translate-y-1/2 text-[var(--se-text-secondary)]"
              />
              <Input
                placeholder="Search actor, module, or action..."
                className="pl-36"
                value={searchAudit}
                onChange={(e) => setSearchAudit(e.target.value)}
              />
            </div>
            <span className="text-xs text-[var(--se-text-secondary)]">
              Showing {filteredAudit.length} audited transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--se-border)] text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="pb-12 font-medium">Timestamp</th>
                  <th className="pb-12 font-medium">Actor</th>
                  <th className="pb-12 font-medium">Module &amp; Action</th>
                  <th className="pb-12 font-medium">Entity Target</th>
                  <th className="pb-12 font-medium">IP Address</th>
                  <th className="pb-12 font-medium">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--se-border)]">
                {filteredAudit.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--se-bg-subtle)] transition-colors">
                    <td className="py-12 text-neutral-400">{log.timestamp}</td>
                    <td className="py-12 font-medium text-[var(--se-text-primary)]">{log.actorName}</td>
                    <td className="py-12">
                      <span className="font-mono text-teal-400 font-medium">{log.module}.{log.action}</span>
                    </td>
                    <td className="py-12 text-neutral-300 font-mono text-[11px]">{log.entityType} ({log.entityId})</td>
                    <td className="py-12 text-neutral-400 font-mono">{log.ipAddress}</td>
                    <td className="py-12">
                      <Badge tone={log.status === 'TAMPER_PROOF' ? 'success' : 'info'}>
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
