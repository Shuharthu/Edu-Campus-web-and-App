'use client';

import React, { useMemo, useState } from 'react';
import {
  CaretRight,
  CheckCircle,
  Export,
  LockKey,
  ShieldCheck,
  Warning,
} from '@phosphor-icons/react';
import { Badge, Button, Card } from '@/components/ui/primitives';

interface StudentGradeRow {
  id: string;
  studentNumber: string;
  fullName: string;
  attendancePct: number;
  quiz1: number; // Max 100, weight 15%
  quiz2: number; // Max 100, weight 15%
  assignment: number; // Max 100, weight 10%
  midterm: number; // Max 100, weight 25%
  finalExam: number; // Max 100, weight 35%
  hasRiskReview?: boolean;
  riskNote?: string;
}

export default function GradeModerationPage() {
  const [moderationStep, setModerationStep] = useState<
    'DRAFT' | 'SUBMITTED_TO_HEAD' | 'APPROVED_BY_DEAN' | 'PUBLISHED'
  >('SUBMITTED_TO_HEAD');

  const [students] = useState<StudentGradeRow[]>([
    {
      id: 'st-1',
      studentNumber: '2024-CSE-0042',
      fullName: 'Rafiq Hasan',
      attendancePct: 83.3,
      quiz1: 85,
      quiz2: 78,
      assignment: 95,
      midterm: 58, // Risk Review: Midterm < 60%
      finalExam: 82,
      hasRiskReview: true,
      riskNote: 'Risk Review: Midterm 58%',
    },
    {
      id: 'st-2',
      studentNumber: '2024-CSE-0015',
      fullName: 'Anika Rahman',
      attendancePct: 94.4,
      quiz1: 92,
      quiz2: 90,
      assignment: 98,
      midterm: 88,
      finalExam: 94,
    },
    {
      id: 'st-3',
      studentNumber: '2024-CSE-0021',
      fullName: 'Samiul Haque',
      attendancePct: 88.9,
      quiz1: 74,
      quiz2: 80,
      assignment: 85,
      midterm: 72,
      finalExam: 76,
    },
    {
      id: 'st-4',
      studentNumber: '2024-CSE-0033',
      fullName: 'Tasnim Ferdous',
      attendancePct: 91.7,
      quiz1: 88,
      quiz2: 85,
      assignment: 90,
      midterm: 84,
      finalExam: 89,
    },
    {
      id: 'st-5',
      studentNumber: '2024-CSE-0004',
      fullName: 'Zubair Hossain',
      attendancePct: 77.8,
      quiz1: 65,
      quiz2: 70,
      assignment: 80,
      midterm: 68,
      finalExam: 72,
    },
    {
      id: 'st-6',
      studentNumber: '2024-CSE-0012',
      fullName: 'Farhan Kabir',
      attendancePct: 55.6,
      quiz1: 60,
      quiz2: 62,
      assignment: 70,
      midterm: 52,
      finalExam: 55,
      hasRiskReview: true,
      riskNote: 'Risk Review: Attendance 55.6% & Midterm 52%',
    },
  ]);

  // Pure weighted percentage calculation: Quiz1(15%) + Quiz2(15%) + Assign(10%) + Midterm(25%) + Final(35%)
  const computedStudents = useMemo(() => {
    return students.map((s) => {
      const totalWeighted = Math.round(
        (s.quiz1 * 0.15 + s.quiz2 * 0.15 + s.assignment * 0.1 + s.midterm * 0.25 + s.finalExam * 0.35) * 10,
      ) / 10;

      let letter = 'F';
      let gpa = 0.0;
      if (totalWeighted >= 90) {
        letter = 'A+';
        gpa = 4.0;
      } else if (totalWeighted >= 85) {
        letter = 'A';
        gpa = 3.75;
      } else if (totalWeighted >= 80) {
        letter = 'A-';
        gpa = 3.5;
      } else if (totalWeighted >= 75) {
        letter = 'B+';
        gpa = 3.25;
      } else if (totalWeighted >= 70) {
        letter = 'B';
        gpa = 3.0;
      } else if (totalWeighted >= 65) {
        letter = 'B-';
        gpa = 2.75;
      } else if (totalWeighted >= 60) {
        letter = 'C+';
        gpa = 2.5;
      } else if (totalWeighted >= 55) {
        letter = 'C';
        gpa = 2.25;
      } else if (totalWeighted >= 50) {
        letter = 'D';
        gpa = 2.0;
      } else {
        letter = 'F';
        gpa = 0.0;
      }

      return {
        ...s,
        totalWeighted,
        letter,
        gpa,
      };
    });
  }, [students]);

  const stats = useMemo(() => {
    if (computedStudents.length === 0) return { avg: 0, high: 0, low: 0, dist: {} };
    const sum = computedStudents.reduce((acc, s) => acc + s.totalWeighted, 0);
    const avg = Math.round((sum / computedStudents.length) * 10) / 10;
    const high = Math.max(...computedStudents.map((s) => s.totalWeighted));
    const low = Math.min(...computedStudents.map((s) => s.totalWeighted));

    const dist: Record<string, number> = {
      'A+': 0,
      A: 0,
      'A-': 0,
      'B+': 0,
      B: 0,
      'B-': 0,
      'C+': 0,
      C: 0,
      D: 0,
      F: 0,
    };
    computedStudents.forEach((s) => {
      dist[s.letter] = (dist[s.letter] || 0) + 1;
    });

    return { avg, high, low, dist };
  }, [computedStudents]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Grade Moderation &amp; Approval Board
            </h1>
            <Badge tone="neutral" className="text-xs font-mono">
              Fall 2026
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Three-tier departmental grading review, distribution curve inspection, and publish locking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Export size={16} />
            Export Grade Sheet
          </Button>

          {moderationStep === 'SUBMITTED_TO_HEAD' && (
            <Button
              size="sm"
              onClick={() => setModerationStep('APPROVED_BY_DEAN')}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <ShieldCheck size={18} />
              Approve (Head/Dean)
            </Button>
          )}

          {moderationStep === 'APPROVED_BY_DEAN' && (
            <Button
              size="sm"
              onClick={() => setModerationStep('PUBLISHED')}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <LockKey size={18} />
              Publish Final Grades
            </Button>
          )}

          {moderationStep === 'PUBLISHED' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle size={16} />
              Grades Published &amp; Locked
            </div>
          )}
        </div>
      </div>

      {/* 4-Step Moderation Workflow Stepper */}
      <Card className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Step 1 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              ✓
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                1. Faculty Entry
              </div>
              <div className="text-[11px] text-neutral-400">Dr. Tariq Mahmud</div>
            </div>
          </div>

          <CaretRight size={18} className="hidden md:block text-neutral-300 dark:text-neutral-700" />

          {/* Step 2 */}
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                moderationStep === 'SUBMITTED_TO_HEAD'
                  ? 'bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-100 dark:ring-indigo-950/50'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}
            >
              {moderationStep === 'SUBMITTED_TO_HEAD' ? '2' : '✓'}
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                2. Head Moderation
              </div>
              <div className="text-[11px] text-neutral-400">
                {moderationStep === 'SUBMITTED_TO_HEAD' ? 'Under Review' : 'Verified'}
              </div>
            </div>
          </div>

          <CaretRight size={18} className="hidden md:block text-neutral-300 dark:text-neutral-700" />

          {/* Step 3 */}
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                moderationStep === 'APPROVED_BY_DEAN'
                  ? 'bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-100 dark:ring-indigo-950/50'
                  : moderationStep === 'PUBLISHED'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
              }`}
            >
              {moderationStep === 'PUBLISHED' ? '✓' : '3'}
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                3. Dean Approval
              </div>
              <div className="text-[11px] text-neutral-400">
                {moderationStep === 'APPROVED_BY_DEAN' ? 'Ready to Publish' : 'Pending'}
              </div>
            </div>
          </div>

          <CaretRight size={18} className="hidden md:block text-neutral-300 dark:text-neutral-700" />

          {/* Step 4 */}
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                moderationStep === 'PUBLISHED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
              }`}
            >
              4
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                4. Final Publish
              </div>
              <div className="text-[11px] text-neutral-400">
                {moderationStep === 'PUBLISHED' ? 'Visible to Students' : 'Locked'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Course Section Selector & Grade Statistics Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Course Info Card */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="text-xs uppercase font-mono tracking-wider text-neutral-400">
              Selected Section
            </div>
            <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              CSE204-A: Data Structures
            </div>
            <div className="text-xs text-neutral-500 space-y-1">
              <div>Faculty: Dr. Tariq Mahmud</div>
              <div>Department: Computer Science &amp; Eng.</div>
              <div>Credits: 4.0 US Credits</div>
              <div>Enrolled Students: 50</div>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Class Average:</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">{stats.avg}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Highest Score:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.high}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">Lowest Score:</span>
                <span className="font-bold text-red-600 dark:text-red-400">{stats.low}%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Grade Distribution Histogram */}
        <div className="lg:col-span-8">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Grade Distribution Histogram
              </span>
              <span className="text-[11px] text-neutral-400">Standard 4.0 Cutoff</span>
            </div>

            {/* Distribution bars */}
            <div className="grid grid-cols-10 gap-2 items-end h-28 pt-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'].map((grade) => {
                const count = stats.dist[grade] || 0;
                const maxCount = Math.max(...Object.values(stats.dist), 1);
                const heightPct = Math.round((count / maxCount) * 100);

                return (
                  <div key={grade} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono text-neutral-400">{count}</span>
                    <div
                      className={`w-full rounded-t transition-all ${
                        grade.startsWith('A')
                          ? 'bg-emerald-500'
                          : grade.startsWith('B')
                          ? 'bg-indigo-500'
                          : grade.startsWith('C')
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ height: `${Math.max(6, heightPct)}%` }}
                    />
                    <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                      {grade}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-neutral-400 flex items-center justify-between">
              <span>Weights: Quiz 1 (15%) • Quiz 2 (15%) • Assign (10%) • Midterm (25%) • Final (35%)</span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">Total: 100%</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Grade Sheet Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-3 py-3 text-center">Attd %</th>
                <th className="px-3 py-3 text-center">Quiz 1 (15%)</th>
                <th className="px-3 py-3 text-center">Quiz 2 (15%)</th>
                <th className="px-3 py-3 text-center">Assign (10%)</th>
                <th className="px-3 py-3 text-center">Midterm (25%)</th>
                <th className="px-3 py-3 text-center">Final (35%)</th>
                <th className="px-3 py-3 text-center font-bold">Total (100%)</th>
                <th className="px-3 py-3 text-center font-bold">Grade</th>
                <th className="px-4 py-3">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {computedStudents.map((st) => (
                <tr
                  key={st.id}
                  className={`hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors ${
                    st.hasRiskReview ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {st.fullName}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      {st.studentNumber}
                    </div>
                  </td>

                  <td className="px-3 py-3.5 text-center font-mono">
                    <span
                      className={
                        st.attendancePct < 75
                          ? 'text-red-600 font-bold'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }
                    >
                      {st.attendancePct}%
                    </span>
                  </td>

                  <td className="px-3 py-3.5 text-center font-mono">{st.quiz1}</td>
                  <td className="px-3 py-3.5 text-center font-mono">{st.quiz2}</td>
                  <td className="px-3 py-3.5 text-center font-mono">{st.assignment}</td>

                  {/* Midterm Cell with Alert Indicator if < 60 */}
                  <td className="px-3 py-3.5 text-center font-mono">
                    <span
                      className={
                        st.midterm < 60
                          ? 'px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold'
                          : ''
                      }
                    >
                      {st.midterm}
                    </span>
                  </td>

                  <td className="px-3 py-3.5 text-center font-mono">{st.finalExam}</td>

                  <td className="px-3 py-3.5 text-center font-mono font-bold text-neutral-900 dark:text-neutral-100">
                    {st.totalWeighted}%
                  </td>

                  <td className="px-3 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-md font-bold font-mono text-xs ${
                        st.letter.startsWith('A')
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : st.letter.startsWith('B')
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : st.letter.startsWith('C')
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                      }`}
                    >
                      {st.letter}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    {st.hasRiskReview ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        <Warning size={13} weight="fill" />
                        {st.riskNote}
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={13} />
                        Clear
                      </span>
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
