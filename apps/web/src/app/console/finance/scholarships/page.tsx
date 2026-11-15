'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  CurrencyDollar,
  Plus,
  SealCheck,
  Sparkle,
  Users,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

interface ScholarshipScheme {
  id: string;
  name: string;
  code: string;
  discountPct: number;
  criteria: string;
  recipientCount: number;
  totalDisbursed: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface StudentAward {
  id: string;
  studentNumber: string;
  studentName: string;
  program: string;
  scholarshipCode: string;
  scholarshipName: string;
  discountPct: number;
  amountSaved: number;
  semester: string;
  cgpa: number;
  status: 'APPROVED' | 'PENDING' | 'REVOKED';
  approvedAt: string;
}

export default function ScholarshipsPage() {
  const [awardModalOpen, setAwardModalOpen] = useState(false);
  const [newAwardStudent, setNewAwardStudent] = useState('2024-CSE-0042');
  const [newAwardScheme, setNewAwardScheme] = useState('DEAN-MERIT');
  const [successToast, setSuccessToast] = useState('');

  const [schemes] = useState<ScholarshipScheme[]>([
    {
      id: 'sch-1',
      name: "Dean's Merit Scholarship",
      code: 'DEAN-MERIT',
      discountPct: 25.0,
      criteria: 'Semester GPA >= 3.75 and Attendance >= 80%',
      recipientCount: 28,
      totalDisbursed: 42000.0,
      status: 'ACTIVE',
    },
    {
      id: 'sch-2',
      name: "Vice Chancellor's Full Honor",
      code: 'VC-HONOR',
      discountPct: 100.0,
      criteria: 'Semester GPA >= 3.95 and top 1% of cohort',
      recipientCount: 6,
      totalDisbursed: 54000.0,
      status: 'ACTIVE',
    },
    {
      id: 'sch-3',
      name: 'Need-Based Financial Assistance',
      code: 'NEED-BASED',
      discountPct: 50.0,
      criteria: 'Demonstrated financial hardship with Dean approval',
      recipientCount: 14,
      totalDisbursed: 46500.0,
      status: 'ACTIVE',
    },
  ]);

  const [awards, setAwards] = useState<StudentAward[]>([
    {
      id: 'aw-1',
      studentNumber: '2024-CSE-0042',
      studentName: 'Rafiq Hasan',
      program: 'B.Sc. in Computer Science & Engineering',
      scholarshipCode: 'DEAN-MERIT',
      scholarshipName: "Dean's Merit Scholarship (25%)",
      discountPct: 25.0,
      amountSaved: 980.0,
      semester: 'Fall 2026',
      cgpa: 3.82,
      status: 'APPROVED',
      approvedAt: '2026-08-20',
    },
    {
      id: 'aw-2',
      studentNumber: '2024-CSE-0015',
      studentName: 'Anika Rahman',
      program: 'B.Sc. in Computer Science & Engineering',
      scholarshipCode: 'VC-HONOR',
      scholarshipName: "Vice Chancellor's Full Honor (100%)",
      discountPct: 100.0,
      amountSaved: 3000.0,
      semester: 'Fall 2026',
      cgpa: 3.98,
      status: 'APPROVED',
      approvedAt: '2026-08-15',
    },
    {
      id: 'aw-3',
      studentNumber: '2023-EEE-0012',
      studentName: 'Farhan Kabir',
      program: 'B.Sc. in Electrical Engineering',
      scholarshipCode: 'NEED-BASED',
      scholarshipName: 'Need-Based Financial Assistance (50%)',
      discountPct: 50.0,
      amountSaved: 1600.0,
      semester: 'Fall 2026',
      cgpa: 3.45,
      status: 'APPROVED',
      approvedAt: '2026-08-22',
    },
  ]);

  const handleGrantAward = () => {
    const scheme = schemes.find((s) => s.code === newAwardScheme);
    if (!scheme) return;

    const newAward: StudentAward = {
      id: `aw-${Date.now()}`,
      studentNumber: newAwardStudent,
      studentName: newAwardStudent === '2024-CSE-0042' ? 'Rafiq Hasan' : `Student ${newAwardStudent}`,
      program: 'B.Sc. in Computer Science & Engineering',
      scholarshipCode: scheme.code,
      scholarshipName: `${scheme.name} (${scheme.discountPct}%)`,
      discountPct: scheme.discountPct,
      amountSaved: Math.round((3000 * scheme.discountPct) / 100),
      semester: 'Fall 2026',
      cgpa: 3.85,
      status: 'APPROVED',
      approvedAt: new Date().toISOString().split('T')[0] || '2026-11-14',
    };

    setAwards([newAward, ...awards]);
    setAwardModalOpen(false);
    setSuccessToast(`Awarded ${scheme.name} to ${newAward.studentName} successfully!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  return (
    <div className="space-y-24 p-24 max-w-[1400px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <Link
            href="/console/finance"
            className="inline-flex items-center gap-6 caption-2 text-[var(--se-text-secondary)] hover:text-brand-teal transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Finance Ledger
          </Link>
          <div className="flex items-center gap-8">
            <span className="flex h-32 w-32 items-center justify-center rounded-lg bg-[var(--se-brand-teal-light,rgba(13,148,136,0.1))] text-brand-teal">
              <SealCheck size={20} weight="bold" />
            </span>
            <h1 className="heading-2">Scholarships & Financial Aid Desk</h1>
          </div>
          <p className="body-5 text-[var(--se-text-secondary)]">
            Manage institutional scholarship schemes, merit waivers, quota allowances, and individual student awards.
          </p>
        </div>

        <div className="flex items-center gap-12">
          <Button variant="primary" size="sm" onClick={() => setAwardModalOpen(true)}>
            <Plus size={16} className="mr-8" />
            Award Student Waiver
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="p-16 rounded-xl bg-[var(--se-success-bg)] text-[var(--se-success-text)] flex items-center gap-8 caption-1 font-semibold animate-fade-in">
          <CheckCircle size={20} weight="bold" />
          {successToast}
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Total Waivers Awarded</span>
            <CurrencyDollar size={18} className="text-brand-teal" />
          </div>
          <div className="heading-1 mt-12">$142,500</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">Fall 2026 Academic Term</div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Students Aided</span>
            <Users size={18} className="text-[var(--se-success-text)]" />
          </div>
          <div className="heading-1 mt-12 text-[var(--se-success-text)]">48 Scholars</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">12.4% of total student body</div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Active Schemes</span>
            <SealCheck size={18} className="text-brand-teal" />
          </div>
          <div className="heading-1 mt-12">3 Active</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">Merit, Honor & Need-based</div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Avg. Award Amount</span>
            <Sparkle size={18} className="text-[var(--se-warning-text)]" />
          </div>
          <div className="heading-1 mt-12">$2,968</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">Deducted from semester tuition</div>
        </Card>
      </div>

      {/* Scholarship Schemes Overview */}
      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <h2 className="heading-3">Approved Scholarship Schemes</h2>
          <span className="caption-3 text-[var(--se-text-muted)]">3 schemes configured for 2026-2027</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {schemes.map((sch) => (
            <Card key={sch.id} className="p-20 flex flex-col justify-between hover:border-brand-teal transition-all">
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <Badge tone="success">{sch.discountPct}% Tuition Waiver</Badge>
                  <span className="font-mono caption-3 font-semibold text-[var(--se-text-muted)]">{sch.code}</span>
                </div>
                <h3 className="heading-4">{sch.name}</h3>
                <p className="caption-2 text-[var(--se-text-secondary)] bg-[var(--se-bg-elevated)] p-12 rounded-lg">
                  <span className="font-semibold text-[var(--se-text-primary)]">Eligibility: </span>
                  {sch.criteria}
                </p>
              </div>

              <div className="pt-16 mt-16 border-t border-[var(--se-border)] flex items-center justify-between">
                <div>
                  <div className="caption-3 text-[var(--se-text-muted)]">Recipients</div>
                  <div className="font-semibold body-4">{sch.recipientCount} Students</div>
                </div>
                <div className="text-right">
                  <div className="caption-3 text-[var(--se-text-muted)]">Disbursed</div>
                  <div className="font-mono font-semibold body-4 text-brand-teal">
                    ${sch.totalDisbursed.toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recipient Roster */}
      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <h2 className="heading-3">Current Semester Scholarship Recipients</h2>
          <span className="caption-3 text-[var(--se-text-muted)]">Displaying active student awards</span>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--se-border)] bg-[var(--se-bg-elevated)]">
                  <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Student</th>
                  <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Scholarship Scheme</th>
                  <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">CGPA</th>
                  <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Waiver %</th>
                  <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Tuition Saved</th>
                  <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Status</th>
                  <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Approved Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--se-border)]">
                {awards.map((aw) => (
                  <tr key={aw.id} className="hover:bg-[var(--se-bg-hover)] transition-colors">
                    <td className="py-16 px-16">
                      <div className="font-semibold">{aw.studentName}</div>
                      <div className="caption-3 font-mono text-[var(--se-text-muted)]">{aw.studentNumber}</div>
                    </td>
                    <td className="py-16 px-16">
                      <div className="body-6">{aw.scholarshipName}</div>
                      <div className="caption-3 text-[var(--se-text-secondary)]">{aw.program}</div>
                    </td>
                    <td className="py-16 px-16">
                      <span className="font-mono font-semibold text-brand-teal">{aw.cgpa.toFixed(2)}</span>
                    </td>
                    <td className="py-16 px-16">
                      <Badge tone="info">{aw.discountPct}%</Badge>
                    </td>
                    <td className="py-16 px-16 font-mono font-semibold text-[var(--se-success-text)]">
                      -${aw.amountSaved.toFixed(2)}
                    </td>
                    <td className="py-16 px-16">
                      <Badge tone="success">
                        <SealCheck size={14} className="mr-4 inline" />
                        {aw.status}
                      </Badge>
                    </td>
                    <td className="py-16 px-16 caption-3 text-[var(--se-text-muted)]">
                      {aw.approvedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Award Modal */}
      {awardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-16">
          <Card className="w-full max-w-lg p-24 space-y-20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--se-border)] pb-12">
              <h3 className="heading-3">Award Student Scholarship</h3>
              <button
                onClick={() => setAwardModalOpen(false)}
                className="text-[var(--se-text-muted)] hover:text-[var(--se-text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-16">
              <div>
                <label className="caption-2 font-semibold text-[var(--se-text-secondary)] block mb-6">
                  Student ID or Roll
                </label>
                <Input
                  value={newAwardStudent}
                  onChange={(e) => setNewAwardStudent(e.target.value)}
                  placeholder="e.g. 2024-CSE-0042"
                />
              </div>

              <div>
                <label className="caption-2 font-semibold text-[var(--se-text-secondary)] block mb-6">
                  Select Scholarship Tier
                </label>
                <select
                  value={newAwardScheme}
                  onChange={(e) => setNewAwardScheme(e.target.value)}
                  className="w-full rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-12 text-sm text-[var(--se-text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-teal"
                >
                  {schemes.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.discountPct}% waiver)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-12 rounded-lg bg-[var(--se-bg-elevated)] caption-3 text-[var(--se-text-secondary)] space-y-4">
                <span className="font-semibold text-[var(--se-text-primary)]">Automatic Verification: </span>
                Verifies student is in good standing with CGPA threshold and zero outstanding disciplinary holds before granting.
              </div>
            </div>

            <div className="flex items-center justify-end gap-12 pt-12 border-t border-[var(--se-border)]">
              <Button variant="secondary" size="sm" onClick={() => setAwardModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleGrantAward}>
                Grant Scholarship Waiver
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
