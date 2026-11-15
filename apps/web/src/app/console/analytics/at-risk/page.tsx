'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  GraduationCap,
  MagnifyingGlass,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

interface AtRiskStudent {
  id: string;
  studentNumber: string;
  fullName: string;
  email: string;
  program: string;
  attendanceRate: number;
  cgpa: number;
  riskScore: number;
  riskTier: 'HIGH_RISK' | 'MODERATE_RISK' | 'WATCHLIST';
  riskFactors: string[];
}

export default function AtRiskReviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<AtRiskStudent | null>(null);
  const [counselingDrawerOpen, setCounselingDrawerOpen] = useState(false);
  const [advisorNote, setAdvisorNote] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [students, setStudents] = useState<AtRiskStudent[]>([
    {
      id: 's-001',
      studentNumber: '2024-CSE-0089',
      fullName: 'Mehedi Hasan',
      email: 'mehedi.hasan@university.edu',
      program: 'CSE',
      attendanceRate: 64.2,
      cgpa: 2.18,
      riskScore: 85,
      riskTier: 'HIGH_RISK',
      riskFactors: [
        'Critical attendance deficit (64.2% < 75% exam debarment threshold)',
        'Academic standing alert: Term GPA (2.18) below 2.50 minimum',
        'Overdue tuition installment past 30 days',
      ],
    },
    {
      id: 's-002',
      studentNumber: '2024-EEE-0045',
      fullName: 'Anika Tabassum',
      email: 'anika.tabassum@university.edu',
      program: 'EEE',
      attendanceRate: 71.0,
      cgpa: 2.42,
      riskScore: 70,
      riskTier: 'HIGH_RISK',
      riskFactors: [
        'Attendance below minimum (71.0% < 75%)',
        'Consecutive missing lab submissions in EEE201',
      ],
    },
    {
      id: 's-003',
      studentNumber: '2024-CSE-0042',
      fullName: 'Rafiq Hasan',
      email: 'rafiq.hasan@university.edu',
      program: 'CSE',
      attendanceRate: 88.5,
      cgpa: 3.21,
      riskScore: 20,
      riskTier: 'WATCHLIST',
      riskFactors: [
        'Tuition installment 2 pending (Due in 16 days)',
        'Attendance optimal (88.5%), CGPA in good standing (3.21)',
      ],
    },
    {
      id: 's-004',
      studentNumber: '2023-BBA-0012',
      fullName: 'Kamrul Islam',
      email: 'kamrul.islam@university.edu',
      program: 'BBA',
      attendanceRate: 78.4,
      cgpa: 2.35,
      riskScore: 50,
      riskTier: 'MODERATE_RISK',
      riskFactors: [
        'Term GPA decline from 2.85 to 2.35 (-0.50 drift)',
        'Borderline attendance in Financial Accounting (76.0%)',
      ],
    },
  ]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchTier = selectedTier === 'ALL' || s.riskTier === selectedTier;
      const matchSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.program.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTier && matchSearch;
    });
  }, [students, selectedTier, searchQuery]);

  const handleLogCounseling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              riskFactors: [...s.riskFactors, `Intervention logged: ${advisorNote.slice(0, 40)}...`],
            }
          : s,
      ),
    );

    setToastMessage(
      `Logged counseling intervention note for ${selectedStudent.fullName}. Faculty advisor notified.`,
    );
    setTimeout(() => setToastMessage(''), 5000);
    setCounselingDrawerOpen(false);
    setAdvisorNote('');
  };

  return (
    <div className="space-y-24">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 right-24 z-50 flex items-center gap-12 rounded-[var(--se-radius-md)] border border-emerald-500/20 bg-emerald-500/10 px-16 py-12 text-sm text-emerald-400 shadow-xl backdrop-blur-md">
          <CheckCircle size={20} weight="fill" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage('')}
            className="ml-8 text-neutral-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Back Link & Header */}
      <div>
        <Link
          href="/console/analytics"
          className="inline-flex items-center gap-6 text-xs text-[var(--se-text-secondary)] hover:text-white transition-colors mb-12"
        >
          <ArrowLeft size={14} />
          <span>Back to Institutional Analytics</span>
        </Link>
        <div className="flex flex-col justify-between gap-16 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-semibold tracking-tight">
                Explainable At-Risk Student Early Warning Desk
              </h1>
              <Badge tone="warning" className="border border-amber-500/30 bg-amber-500/10 text-amber-400">
                SCR-WEB-802
              </Badge>
            </div>
            <p className="mt-4 text-sm text-[var(--se-text-secondary)]">
              Proactive heuristic scoring identifying academic, attendance, and financial distress before midterm exams.
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Flagged for Review
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
              <WarningCircle size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">18 Students</span>
            <span className="text-xs text-rose-400 font-medium">3.0% of Cohort</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Exceeding 35-point risk score</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Debarment Threat
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">8 Students</span>
            <span className="text-xs text-amber-400 font-medium">&lt; 75% Attendance</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Midterm seating hold pending</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Academic Probation
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">6 Students</span>
            <span className="text-xs text-cyan-400 font-medium">CGPA &lt; 2.50</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Assigned peer tutoring mentors</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Counseling Active
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">14 Sessions</span>
            <span className="text-xs text-emerald-400 font-medium">Resolved This Month</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">82% retention improvement</p>
        </Card>
      </div>

      {/* Controls & Filter Bar */}
      <Card className="p-16">
        <div className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <MagnifyingGlass
              size={18}
              className="absolute left-12 top-1/2 -translate-y-1/2 text-[var(--se-text-secondary)]"
            />
            <Input
              type="text"
              placeholder="Search student name, roll number, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-36"
            />
          </div>

          <div className="flex gap-8">
            {['ALL', 'HIGH_RISK', 'MODERATE_RISK', 'WATCHLIST'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`rounded-[var(--se-radius-md)] px-12 py-6 text-xs font-medium transition-colors ${
                  selectedTier === tier
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-[var(--se-text-secondary)] hover:text-white bg-[var(--se-bg-subtle)] border border-transparent'
                }`}
              >
                {tier === 'ALL' ? 'All Risk Levels' : tier.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--se-border)] bg-[var(--se-bg-subtle)] text-xs text-[var(--se-text-secondary)]">
              <tr>
                <th className="py-12 px-16">Student Profile</th>
                <th className="py-12 px-16">Department</th>
                <th className="py-12 px-16">Attendance</th>
                <th className="py-12 px-16">CGPA</th>
                <th className="py-12 px-16">Risk Score</th>
                <th className="py-12 px-16">Primary Factor</th>
                <th className="py-12 px-16 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--se-border)]">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--se-bg-subtle)]/50 transition-colors">
                  <td className="py-14 px-16">
                    <div className="flex items-center gap-12">
                      <div className="flex h-36 w-36 items-center justify-center rounded-full bg-neutral-800 font-medium text-xs text-white">
                        {s.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--se-text-primary)]">
                          {s.fullName}
                        </div>
                        <div className="text-xs font-mono text-neutral-400">{s.studentNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-14 px-16 font-mono text-xs text-neutral-300">{s.program}</td>
                  <td className="py-14 px-16">
                    <span
                      className={`font-semibold ${
                        s.attendanceRate < 75 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {s.attendanceRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-14 px-16 font-semibold text-[var(--se-text-primary)]">
                    {s.cgpa.toFixed(2)}
                  </td>
                  <td className="py-14 px-16">
                    <Badge
                      tone={
                        s.riskTier === 'HIGH_RISK'
                          ? 'danger'
                          : s.riskTier === 'MODERATE_RISK'
                          ? 'warning'
                          : 'info'
                      }
                      className="text-xs font-mono"
                    >
                      {s.riskScore} / 100 • {s.riskTier.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="py-14 px-16 max-w-xs text-xs text-[var(--se-text-secondary)] truncate">
                    {s.riskFactors[0]}
                  </td>
                  <td className="py-14 px-16 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedStudent(s);
                        setCounselingDrawerOpen(true);
                      }}
                    >
                      Review Risk
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Slide-over Risk Drawer */}
      {counselingDrawerOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="h-full w-full max-w-lg border-l border-[var(--se-border)] bg-[var(--se-bg-surface)] p-24 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-20">
              <div className="flex items-center justify-between border-b border-[var(--se-border)] pb-16">
                <div>
                  <h3 className="font-semibold text-lg text-[var(--se-text-primary)]">
                    Explainable Risk Analysis
                  </h3>
                  <p className="text-xs text-[var(--se-text-secondary)] mt-2">
                    {selectedStudent.fullName} • {selectedStudent.studentNumber}
                  </p>
                </div>
                <button
                  onClick={() => setCounselingDrawerOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Score Hero */}
              <div className="rounded-[var(--se-radius-md)] border border-amber-500/20 bg-amber-500/5 p-16">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                    Calculated Risk Index
                  </span>
                  <Badge tone={selectedStudent.riskTier === 'HIGH_RISK' ? 'danger' : 'warning'}>
                    {selectedStudent.riskTier.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="mt-8 flex items-baseline gap-8">
                  <span className="text-3xl font-semibold">{selectedStudent.riskScore}</span>
                  <span className="text-xs text-neutral-400">/ 100 points</span>
                </div>
              </div>

              {/* Factor Breakdown */}
              <div className="space-y-12">
                <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--se-text-secondary)]">
                  Identified Contributing Factors
                </h4>
                {selectedStudent.riskFactors.map((factor, i) => (
                  <div
                    key={i}
                    className="rounded-[var(--se-radius-md)] border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-12 text-xs flex items-start gap-8"
                  >
                    <WarningCircle size={16} className="text-amber-400 shrink-0 mt-2" />
                    <span className="text-[var(--se-text-primary)]">{factor}</span>
                  </div>
                ))}
              </div>

              {/* Advisor Note Form */}
              <form onSubmit={handleLogCounseling} className="space-y-12 pt-8 border-t border-[var(--se-border)]">
                <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--se-text-secondary)]">
                  Log Academic Counseling & Intervention
                </h4>
                <textarea
                  rows={4}
                  placeholder="Record intervention discussion, study contract, or Dean waiver notes..."
                  value={advisorNote}
                  onChange={(e) => setAdvisorNote(e.target.value)}
                  required
                  className="w-full rounded-[var(--se-radius-md)] border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-12 text-sm text-[var(--se-text-primary)] outline-none"
                />
                <Button type="submit" className="w-full">
                  Record Intervention & Notify Advisor
                </Button>
              </form>
            </div>

            <div className="border-t border-[var(--se-border)] pt-16 flex justify-end">
              <Button variant="ghost" onClick={() => setCounselingDrawerOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
