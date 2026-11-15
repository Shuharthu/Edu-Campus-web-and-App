'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CurrencyDollar,
  GraduationCap,
  TrendUp,
  UserList,
  Users,
  WarningCircle,
} from '@phosphor-icons/react';
import { Badge, Button, Card } from '@/components/ui/primitives';

export default function ExecutiveAnalyticsPage() {
  const [selectedDept, setSelectedDept] = useState('ALL');

  // 14-Week Attendance Telemetry
  const attendanceWeeks = [
    { week: 'W1', cse: 94, eee: 92, bba: 91 },
    { week: 'W2', cse: 93, eee: 91, bba: 90 },
    { week: 'W3', cse: 92, eee: 89, bba: 88 },
    { week: 'W4', cse: 91, eee: 88, bba: 87 },
    { week: 'W5', cse: 90, eee: 87, bba: 86 },
    { week: 'W6', cse: 88, eee: 85, bba: 84 },
    { week: 'W7', cse: 87, eee: 84, bba: 83 },
    { week: 'W8', cse: 89, eee: 86, bba: 85 },
    { week: 'W9', cse: 90, eee: 88, bba: 87 },
    { week: 'W10', cse: 88, eee: 85, bba: 84 },
    { week: 'W11', cse: 86, eee: 83, bba: 82 },
    { week: 'W12', cse: 85, eee: 82, bba: 81 },
    { week: 'W13', cse: 87, eee: 84, bba: 83 },
    { week: 'W14', cse: 88, eee: 86, bba: 85 },
  ];

  // Grade Distribution Histogram
  const gradeBands = [
    { grade: 'A / A+', pct: 28, count: 168, tone: 'success' },
    { grade: 'A- / B+', pct: 36, count: 216, tone: 'info' },
    { grade: 'B / B-', pct: 22, count: 132, tone: 'neutral' },
    { grade: 'C / D', pct: 11, count: 66, tone: 'warning' },
    { grade: 'F / Debarred', pct: 3, count: 18, tone: 'danger' },
  ];

  return (
    <div className="space-y-24">
      {/* Header */}
      <div className="flex flex-col justify-between gap-16 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              Executive Analytics & Institutional KPIs
            </h1>
            <Badge tone="info" className="border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
              SCR-WEB-801
            </Badge>
          </div>
          <p className="mt-4 text-sm text-[var(--se-text-secondary)]">
            Holistic institutional health tracking across retention, attendance velocity, grade distribution, and revenue realization.
          </p>
        </div>

        <div className="flex items-center gap-12">
          <Link href="/console/analytics/at-risk">
            <Button variant="secondary" className="flex items-center gap-8">
              <WarningCircle size={16} className="text-amber-400" />
              <span>At-Risk Warning Desk</span>
            </Button>
          </Link>
          <Link href="/console/analytics/surveys">
            <Button variant="secondary" className="flex items-center gap-8">
              <UserList size={16} className="text-cyan-400" />
              <span>Course Evaluations</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Retention Velocity
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <TrendUp size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">94.8%</span>
            <span className="text-xs text-emerald-400 font-medium">+1.2% YoY</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Undergraduate 4-year cohort persistence</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Attendance Health
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">88.4%</span>
            <span className="text-xs text-cyan-400 font-medium">600 Active Students</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">18 defaulters below 75% threshold</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Semester Mean CGPA
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">3.24</span>
            <span className="text-xs text-indigo-400 font-medium">Standard Bell Curve</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Fall 2026 post-moderation score</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Revenue Realization
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <CurrencyDollar size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">76.0%</span>
            <span className="text-xs text-amber-400 font-medium">$1,085k / $1,428k</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Installment 2 due in 16 days</p>
        </Card>
      </div>

      {/* Visual Analytics 2-Column Section */}
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {/* Chart 1: Attendance Trajectory */}
        <Card className="p-20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base text-[var(--se-text-primary)]">
                14-Week Attendance Trajectory
              </h3>
              <p className="text-xs text-[var(--se-text-secondary)] mt-2">
                Weekly lecture & lab attendance presence rate across faculties
              </p>
            </div>
            <div className="flex gap-4">
              {['ALL', 'CSE', 'EEE', 'BBA'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`rounded-[var(--se-radius-sm)] px-8 py-4 text-xs font-medium transition-colors ${
                    selectedDept === dept
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-neutral-400 hover:text-white bg-[var(--se-bg-subtle)]'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Bar visualization */}
          <div className="mt-24 space-y-12">
            <div className="flex h-44 items-end gap-6 pt-12">
              {attendanceWeeks.map((item) => {
                const val =
                  selectedDept === 'CSE'
                    ? item.cse
                    : selectedDept === 'EEE'
                    ? item.eee
                    : selectedDept === 'BBA'
                    ? item.bba
                    : Math.round((item.cse + item.eee + item.bba) / 3);

                const isWarning = val < 85;

                return (
                  <div key={item.week} className="flex-1 flex flex-col items-center gap-4 group">
                    <div
                      className={`w-full rounded-t-[var(--se-radius-xs)] transition-all ${
                        isWarning ? 'bg-amber-400/80' : 'bg-cyan-500/80 group-hover:bg-cyan-400'
                      }`}
                      style={{ height: `${(val / 100) * 120}px` }}
                      title={`${item.week}: ${val}% Attendance`}
                    />
                    <span className="text-[10px] text-neutral-400 font-mono">{item.week}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--se-text-secondary)] border-t border-[var(--se-border)] pt-12">
              <span className="flex items-center gap-6">
                <span className="h-8 w-8 rounded-full bg-cyan-500" /> Normal Pace (&gt;=85%)
              </span>
              <span className="flex items-center gap-6">
                <span className="h-8 w-8 rounded-full bg-amber-400" /> Midterm Dip (&lt;85%)
              </span>
              <span className="font-mono text-neutral-400">Mean: 88.4%</span>
            </div>
          </div>
        </Card>

        {/* Chart 2: Grade Distribution Histogram */}
        <Card className="p-20">
          <div>
            <h3 className="font-semibold text-base text-[var(--se-text-primary)]">
              Grade Distribution Bell Curve
            </h3>
            <p className="text-xs text-[var(--se-text-secondary)] mt-2">
              Fall 2026 cohort distribution across standardized letter grade tiers
            </p>
          </div>

          <div className="mt-24 space-y-16">
            {gradeBands.map((band) => (
              <div key={band.grade} className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--se-text-primary)]">
                    {band.grade}
                  </span>
                  <div className="flex items-center gap-8">
                    <span className="text-neutral-400">{band.count} students</span>
                    <strong className="text-[var(--se-text-primary)]">{band.pct}%</strong>
                  </div>
                </div>
                <div className="h-8 w-full rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      band.tone === 'success'
                        ? 'bg-emerald-400'
                        : band.tone === 'info'
                        ? 'bg-cyan-400'
                        : band.tone === 'warning'
                        ? 'bg-amber-400'
                        : band.tone === 'danger'
                        ? 'bg-rose-400'
                        : 'bg-neutral-400'
                    }`}
                    style={{ width: `${band.pct * 2.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 border-t border-[var(--se-border)] pt-12 flex items-center justify-between text-xs text-[var(--se-text-secondary)]">
            <span>Dean&apos;s Honor Threshold: CGPA &gt;= 3.75 (14% of Cohort)</span>
            <span className="text-emerald-400 font-medium">Skew: +0.08 (Normal)</span>
          </div>
        </Card>
      </div>

      {/* Navigation Quick Banners */}
      <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
        <Link href="/console/analytics/at-risk" className="block group">
          <Card className="p-20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-12">
                <div className="flex h-40 w-40 items-center justify-center rounded-[var(--se-radius-md)] bg-amber-500/10 text-amber-400">
                  <WarningCircle size={22} />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-[var(--se-text-primary)] group-hover:text-amber-400 transition-colors">
                    Explainable At-Risk Student Warning Desk
                  </h4>
                  <p className="text-xs text-[var(--se-text-secondary)] mt-2">
                    Review attendance debarment risks, CGPA drift, and initiate advisor counseling.
                  </p>
                </div>
              </div>
              <ArrowRight size={20} className="text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-4 transition-all" />
            </div>
          </Card>
        </Link>

        <Link href="/console/analytics/surveys" className="block group">
          <Card className="p-20 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-12">
                <div className="flex h-40 w-40 items-center justify-center rounded-[var(--se-radius-md)] bg-cyan-500/10 text-cyan-400">
                  <UserList size={22} />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-[var(--se-text-primary)] group-hover:text-cyan-400 transition-colors">
                    Course Evaluation & Student Sentiment
                  </h4>
                  <p className="text-xs text-[var(--se-text-secondary)] mt-2">
                    Inspect end-of-term student feedback, pedagogical ratings, and departmental surveys.
                  </p>
                </div>
              </div>
              <ArrowRight size={20} className="text-neutral-500 group-hover:text-cyan-400 group-hover:translate-x-4 transition-all" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
