'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Export,
  MagnifyingGlass,
  QrCode,
  User,
  Warning,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

interface DefaulterRow {
  id: string;
  studentNumber: string;
  fullName: string;
  email: string;
  programCode: string;
  batchCode: string;
  courseCode: string;
  courseTitle: string;
  sectionCode: string;
  attended: number;
  totalHeld: number;
  attendancePct: number;
  shortfallPct: number;
  isCritical: boolean; // < 65%
  lastAbsence: string;
}

export default function AttendanceDefaultersPage() {
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  // Manual Adjustment Drawer State
  const [selectedStudent, setSelectedStudent] = useState<DefaulterRow | null>(null);
  const [adjustmentStatus, setAdjustmentStatus] = useState<'PRESENT' | 'EXCUSED' | 'ABSENT'>('EXCUSED');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Initial seed defaulters matching Supabase database
  const [defaulters, setDefaulters] = useState<DefaulterRow[]>([
    {
      id: 'def-1',
      studentNumber: '2024-CSE-0012',
      fullName: 'Farhan Kabir',
      email: 'farhan.kabir@university.edu',
      programCode: 'BS-CSE',
      batchCode: '2024-SP',
      courseCode: 'CSE204',
      courseTitle: 'Data Structures & Algorithms',
      sectionCode: 'CSE204-A',
      attended: 10,
      totalHeld: 18,
      attendancePct: 55.6,
      shortfallPct: 19.4,
      isCritical: true,
      lastAbsence: 'Nov 12, 2026',
    },
    {
      id: 'def-2',
      studentNumber: '2024-CSE-0018',
      fullName: 'Nusrat Jahan',
      email: 'nusrat.jahan@university.edu',
      programCode: 'BS-CSE',
      batchCode: '2024-SP',
      courseCode: 'CSE204',
      courseTitle: 'Data Structures & Algorithms',
      sectionCode: 'CSE204-A',
      attended: 11,
      totalHeld: 18,
      attendancePct: 61.1,
      shortfallPct: 13.9,
      isCritical: true,
      lastAbsence: 'Nov 10, 2026',
    },
    {
      id: 'def-3',
      studentNumber: '2024-CSE-0029',
      fullName: 'Abrar Chowdhury',
      email: 'abrar.chowdhury@university.edu',
      programCode: 'BS-CSE',
      batchCode: '2024-SP',
      courseCode: 'CSE204',
      courseTitle: 'Data Structures & Algorithms',
      sectionCode: 'CSE204-A',
      attended: 12,
      totalHeld: 18,
      attendancePct: 66.7,
      shortfallPct: 8.3,
      isCritical: false,
      lastAbsence: 'Nov 08, 2026',
    },
    {
      id: 'def-4',
      studentNumber: '2024-CSE-0035',
      fullName: 'Tanvir Ahmed',
      email: 'tanvir.ahmed@university.edu',
      programCode: 'BS-CSE',
      batchCode: '2024-SP',
      courseCode: 'CSE204',
      courseTitle: 'Data Structures & Algorithms',
      sectionCode: 'CSE204-A',
      attended: 13,
      totalHeld: 18,
      attendancePct: 72.2,
      shortfallPct: 2.8,
      isCritical: false,
      lastAbsence: 'Nov 05, 2026',
    },
    {
      id: 'def-5',
      studentNumber: '2024-EEE-0008',
      fullName: 'Shadman Shakib',
      email: 'shadman.shakib@university.edu',
      programCode: 'BS-EEE',
      batchCode: '2024-SP',
      courseCode: 'EEE201',
      courseTitle: 'Circuit Analysis',
      sectionCode: 'EEE201-A',
      attended: 9,
      totalHeld: 16,
      attendancePct: 56.3,
      shortfallPct: 18.7,
      isCritical: true,
      lastAbsence: 'Nov 11, 2026',
    },
    {
      id: 'def-6',
      studentNumber: '2024-BBA-0015',
      fullName: 'Mehnaz Tabassum',
      email: 'mehnaz.tabassum@university.edu',
      programCode: 'BBA',
      batchCode: '2024-FA',
      courseCode: 'BUS101',
      courseTitle: 'Principles of Management',
      sectionCode: 'BUS101-A',
      attended: 10,
      totalHeld: 15,
      attendancePct: 66.7,
      shortfallPct: 8.3,
      isCritical: false,
      lastAbsence: 'Nov 09, 2026',
    },
  ]);

  const filteredDefaulters = useMemo(() => {
    return defaulters.filter((d) => {
      if (filterMode === 'CRITICAL' && !d.isCritical) return false;
      if (filterMode === 'WARNING' && (d.isCritical || d.attendancePct >= 75)) return false;
      if (selectedCourse !== 'ALL' && d.courseCode !== selectedCourse) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.fullName.toLowerCase().includes(q) ||
          d.studentNumber.toLowerCase().includes(q) ||
          d.courseCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [defaulters, filterMode, selectedCourse, searchQuery]);

  const stats = useMemo(() => {
    const criticalCount = defaulters.filter((d) => d.isCritical).length;
    const warningCount = defaulters.filter((d) => !d.isCritical && d.attendancePct < 75).length;
    return {
      totalEnrolled: 680,
      criticalCount,
      warningCount,
      overallPct: 88.4,
    };
  }, [defaulters]);

  const handleOpenAdjustment = (student: DefaulterRow) => {
    setSelectedStudent(student);
    setAdjustmentStatus('EXCUSED');
    setAdjustmentReason('');
    setSubmitSuccess(false);
  };

  const handleSubmitCorrection = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      // Simulate/call API
      await new Promise((r) => setTimeout(r, 600));

      // Update student row in local state
      setDefaulters((prev) =>
        prev.map((item) => {
          if (item.id === selectedStudent.id) {
            const newAttended = adjustmentStatus === 'ABSENT' ? item.attended : item.attended + 1;
            const newPct = Math.round((newAttended / item.totalHeld) * 1000) / 10;
            return {
              ...item,
              attended: newAttended,
              attendancePct: newPct,
              shortfallPct: Math.max(0, Math.round((75 - newPct) * 10) / 10),
              isCritical: newPct < 65,
            };
          }
          return item;
        }),
      );

      setSubmitSuccess(true);
      setTimeout(() => {
        setSelectedStudent(null);
        setSubmitSuccess(false);
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Attendance Defaulters Desk
            </h1>
            <Badge tone="neutral" className="text-xs font-mono">
              75% Compliance Rule
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Real-time shortfall monitoring, live session verification, and official medical adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Export size={16} />
            Export Defaulters
          </Button>

          <Link href="/console/attendance/session">
            <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <QrCode size={18} />
              Launch Live QR Session
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
            <span>Total Enrolled Students</span>
            <User size={16} className="text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {stats.totalEnrolled}
          </div>
          <div className="text-xs text-neutral-500">
            Active across 28 course sections
          </div>
        </Card>

        <Card className="p-4 space-y-2 border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10">
          <div className="flex items-center justify-between text-xs font-medium text-red-600 dark:text-red-400">
            <span>Critical Shortfall (&lt;65%)</span>
            <WarningCircle size={16} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            {stats.criticalCount} students
          </div>
          <div className="text-xs text-red-600/80 dark:text-red-400/80">
            Barred from final exams unless excused
          </div>
        </Card>

        <Card className="p-4 space-y-2 border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10">
          <div className="flex items-center justify-between text-xs font-medium text-amber-600 dark:text-amber-400">
            <span>Warning Band (65%–74.9%)</span>
            <Warning size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {stats.warningCount} students
          </div>
          <div className="text-xs text-amber-600/80 dark:text-amber-400/80">
            Within 1-2 absences of exam debarment
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
            <span>Campus Overall Attendance</span>
            <CheckCircle size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.overallPct}%
          </div>
          <div className="text-xs text-neutral-500">
            +1.2% compared to previous term
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider mr-1">Filter:</span>
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterMode === 'ALL'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              All Defaulters ({defaulters.length})
            </button>
            <button
              onClick={() => setFilterMode('CRITICAL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterMode === 'CRITICAL'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300'
              }`}
            >
              Critical (&lt;65%)
            </button>
            <button
              onClick={() => setFilterMode('WARNING')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterMode === 'WARNING'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              Warning (65%–74%)
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full sm:w-auto text-xs bg-neutral-100 dark:bg-neutral-800 border-none rounded-lg px-3 py-2 text-neutral-700 dark:text-neutral-300 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Courses</option>
              <option value="CSE204">CSE204: Data Structures</option>
              <option value="EEE201">EEE201: Circuit Analysis</option>
              <option value="BUS101">BUS101: Principles of Mgmt</option>
            </select>

            <div className="relative w-full sm:w-64">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <Input
                placeholder="Search student or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Defaulters Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Course & Section</th>
                <th className="px-4 py-3 text-center">Held / Attended</th>
                <th className="px-4 py-3">Attendance %</th>
                <th className="px-4 py-3">Shortfall to 75%</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredDefaulters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    No defaulter records match the active criteria.
                  </td>
                </tr>
              ) : (
                filteredDefaulters.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {row.fullName}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {row.studentNumber} • {row.programCode}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {row.courseCode} ({row.sectionCode})
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate max-w-[200px]">
                        {row.courseTitle}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center font-mono">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{row.attended}</span>
                      <span className="text-neutral-400"> / {row.totalHeld}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.isCritical ? 'bg-red-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, row.attendancePct)}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                          {row.attendancePct}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-neutral-600 dark:text-neutral-300">
                      -{row.shortfallPct}%
                    </td>

                    <td className="px-4 py-3.5">
                      {row.isCritical ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                          <WarningCircle size={12} weight="fill" />
                          Critical &lt;65%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          <Warning size={12} weight="fill" />
                          Warning &lt;75%
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenAdjustment(row)}
                        className="text-xs h-7 px-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Adjustment Slide-over Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col justify-between border-l border-neutral-200 dark:border-neutral-800 p-6 overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Attendance Adjustment
                  </h2>
                  <p className="text-xs text-neutral-500">Official adjustment desk for verified leaves</p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Student Summary */}
              <div className="mt-4 p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-1.5">
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {selectedStudent.fullName}
                </div>
                <div className="text-xs text-neutral-500 font-mono">
                  {selectedStudent.studentNumber} • {selectedStudent.programCode}
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/40 flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Current Standing:</span>
                  <span className="font-mono font-bold text-red-600 dark:text-red-400">
                    {selectedStudent.attended} / {selectedStudent.totalHeld} ({selectedStudent.attendancePct}%)
                  </span>
                </div>
              </div>

              {/* Form Controls */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider">
                    Adjustment Status
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustmentStatus('PRESENT')}
                      className={`p-2.5 text-xs font-medium rounded-lg border text-center transition-all ${
                        adjustmentStatus === 'PRESENT'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentStatus('EXCUSED')}
                      className={`p-2.5 text-xs font-medium rounded-lg border text-center transition-all ${
                        adjustmentStatus === 'EXCUSED'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      Excused (Leave)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentStatus('ABSENT')}
                      className={`p-2.5 text-xs font-medium rounded-lg border text-center transition-all ${
                        adjustmentStatus === 'ABSENT'
                          ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      Keep Absent
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider">
                    Official Reason / Reference
                  </label>
                  <textarea
                    rows={4}
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="Enter justification (e.g. Approved medical certificate #MED-9402, Inter-university sports representation)..."
                    className="mt-2 w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {submitSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Adjustment saved and student attendance recalculated successfully.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedStudent(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitCorrection}
                disabled={isSubmitting || !adjustmentReason.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
              >
                {isSubmitting ? 'Saving...' : 'Submit Correction'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
