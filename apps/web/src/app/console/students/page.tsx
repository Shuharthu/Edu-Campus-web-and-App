'use client';

import React, { useMemo, useState } from 'react';
import {
  Calendar,
  ChatCircleText,
  DotsThreeVertical,
  DownloadSimple,
  IdentificationCard,
  MagnifyingGlass,
  Plus,
  UploadSimple,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

interface StudentRecord {
  id: string;
  studentNumber: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  departmentCode: string;
  programCode: string;
  programName: string;
  batchCode: string;
  semesterName: string;
  attendancePct: number;
  cgpa: number;
  creditsCompleted: number;
  totalCredits: number;
  outstandingFee: number;
  status: 'ACTIVE' | 'AT_RISK' | 'PROBATION' | 'FEE_DUE';
  riskNotes?: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  bloodGroup: string;
  enrolledCourses: Array<{
    code: string;
    title: string;
    section: string;
    faculty: string;
    attendancePct: number;
    grade: string;
  }>;
}

export default function StudentsDirectoryPage() {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'AT_RISK' | 'FEE_DUE' | 'PROBATION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'academics' | 'fees' | 'activity'>('overview');
  const [advisorMessageSent, setAdvisorMessageSent] = useState(false);

  // 12 representative students matching the seed data and exact mockups
  const [studentsList] = useState<StudentRecord[]>([
    {
      id: 's-1',
      studentNumber: '2024-360-117',
      fullName: 'Rafiq Hasan',
      email: 'rafiq.hasan@university.edu',
      departmentCode: 'CSE',
      programCode: 'B.Sc. CSE',
      programName: 'Computer Science & Engineering',
      batchCode: 'Batch 2024',
      semesterName: 'Semester 4',
      attendancePct: 83.3,
      cgpa: 3.21,
      creditsCompleted: 54,
      totalCredits: 136,
      outstandingFee: 420.0,
      status: 'AT_RISK',
      riskNotes:
        'Risk Review: Attendance dropped below 85% in 2 courses (CSE204, MAT201) and mid-term score is 58%. Fee installment 2 is pending.',
      phone: '+880 1712 345678',
      guardianName: 'Kamal Hasan (Father)',
      guardianPhone: '+880 1711 000000',
      bloodGroup: 'B+',
      enrolledCourses: [
        { code: 'CSE204', title: 'Data structures & Algorithms', section: 'Sec A', faculty: 'Dr. Tariq Mahmud', attendancePct: 82.5, grade: 'B' },
        { code: 'MAT201', title: 'Calculus & Linear Algebra 2', section: 'Sec A', faculty: 'Dr. Tariq Mahmud', attendancePct: 84.0, grade: 'B-' },
        { code: 'EEE201', title: 'Circuit Analysis', section: 'Sec A', faculty: 'Dr. Anisur Rahman', attendancePct: 91.0, grade: 'A-' },
        { code: 'CSE205', title: 'Data Structures Lab', section: 'Lab 1', faculty: 'Dr. Tariq Mahmud', attendancePct: 95.0, grade: 'A' },
      ],
    },
    {
      id: 's-2',
      studentNumber: '2024-360-118',
      fullName: 'Tania Akter',
      email: 'tania.akter@university.edu',
      departmentCode: 'CSE',
      programCode: 'B.Sc. CSE',
      programName: 'Computer Science & Engineering',
      batchCode: 'Batch 2024',
      semesterName: 'Semester 4',
      attendancePct: 94.1,
      cgpa: 3.85,
      creditsCompleted: 58,
      totalCredits: 136,
      outstandingFee: 0,
      status: 'ACTIVE',
      phone: '+880 1712 998877',
      guardianName: 'Md. Shahidul Islam',
      guardianPhone: '+880 1711 112233',
      bloodGroup: 'A+',
      enrolledCourses: [
        { code: 'CSE204', title: 'Data structures & Algorithms', section: 'Sec A', faculty: 'Dr. Tariq Mahmud', attendancePct: 96.0, grade: 'A' },
        { code: 'MAT201', title: 'Calculus & Linear Algebra 2', section: 'Sec A', faculty: 'Dr. Tariq Mahmud', attendancePct: 92.0, grade: 'A' },
      ],
    },
    {
      id: 's-3',
      studentNumber: '2024-360-119',
      fullName: 'Imran Chowdhury',
      email: 'imran.chowdhury@university.edu',
      departmentCode: 'CSE',
      programCode: 'B.Sc. CSE',
      programName: 'Computer Science & Engineering',
      batchCode: 'Batch 2024',
      semesterName: 'Semester 4',
      attendancePct: 76.5,
      cgpa: 2.45,
      creditsCompleted: 42,
      totalCredits: 136,
      outstandingFee: 840.0,
      status: 'PROBATION',
      riskNotes: 'Academic probation: CGPA below 2.50 threshold across consecutive terms.',
      phone: '+880 1712 554433',
      guardianName: 'Kabir Chowdhury',
      guardianPhone: '+880 1711 445566',
      bloodGroup: 'O+',
      enrolledCourses: [
        { code: 'CSE204', title: 'Data structures & Algorithms', section: 'Sec B', faculty: 'Dr. Anisur Rahman', attendancePct: 74.0, grade: 'C' },
      ],
    },
    {
      id: 's-4',
      studentNumber: '2023-360-045',
      fullName: 'Sadia Rahman',
      email: 'sadia.rahman@university.edu',
      departmentCode: 'EEE',
      programCode: 'B.Sc. EEE',
      programName: 'Electrical Engineering',
      batchCode: 'Batch 2023',
      semesterName: 'Semester 6',
      attendancePct: 92.4,
      cgpa: 3.65,
      creditsCompleted: 88,
      totalCredits: 138,
      outstandingFee: 0,
      status: 'ACTIVE',
      phone: '+880 1712 113355',
      guardianName: 'Abdur Rahman',
      guardianPhone: '+880 1711 778899',
      bloodGroup: 'AB+',
      enrolledCourses: [
        { code: 'EEE201', title: 'Circuit Analysis', section: 'Sec A', faculty: 'Dr. Anisur Rahman', attendancePct: 92.0, grade: 'A' },
      ],
    },
    {
      id: 's-5',
      studentNumber: '2024-210-089',
      fullName: 'Tanvir Ahmed',
      email: 'tanvir.ahmed@university.edu',
      departmentCode: 'BBA',
      programCode: 'BBA Gen',
      programName: 'Business Administration',
      batchCode: 'Batch 2024',
      semesterName: 'Semester 4',
      attendancePct: 88.0,
      cgpa: 3.10,
      creditsCompleted: 50,
      totalCredits: 124,
      outstandingFee: 420.0,
      status: 'FEE_DUE',
      phone: '+880 1712 224466',
      guardianName: 'Jahangir Ahmed',
      guardianPhone: '+880 1711 332211',
      bloodGroup: 'B+',
      enrolledCourses: [
        { code: 'FIN201', title: 'Corporate Finance', section: 'Sec A', faculty: 'Prof. Monir Hossain', attendancePct: 88.0, grade: 'B+' },
      ],
    },
    {
      id: 's-6',
      studentNumber: '2024-510-032',
      fullName: 'Farzana Haque',
      email: 'farzana.haque@university.edu',
      departmentCode: 'LAW',
      programCode: 'LL.B. Hons',
      programName: 'Bachelor of Laws',
      batchCode: 'Batch 2024',
      semesterName: 'Semester 4',
      attendancePct: 95.0,
      cgpa: 3.72,
      creditsCompleted: 52,
      totalCredits: 130,
      outstandingFee: 0,
      status: 'ACTIVE',
      phone: '+880 1712 887766',
      guardianName: 'Enamul Haque',
      guardianPhone: '+880 1711 665544',
      bloodGroup: 'O+',
      enrolledCourses: [
        { code: 'LAW101', title: 'Constitutional Law', section: 'Sec A', faculty: 'Dr. Shirin Akter', attendancePct: 95.0, grade: 'A' },
      ],
    },
  ]);

  // Metric counts matching the mockup
  const counts = {
    all: 4827,
    atRisk: 138,
    feeDue: 412,
    probation: 17,
  };

  const filteredStudents = useMemo(() => {
    return studentsList.filter((s) => {
      if (activeFilter === 'AT_RISK' && s.status !== 'AT_RISK') return false;
      if (activeFilter === 'FEE_DUE' && s.outstandingFee <= 0) return false;
      if (activeFilter === 'PROBATION' && s.status !== 'PROBATION') return false;

      if (selectedDept !== 'ALL' && s.departmentCode !== selectedDept) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.fullName.toLowerCase().includes(q) ||
          s.studentNumber.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [studentsList, activeFilter, selectedDept, searchQuery]);

  return (
    <div className="space-y-24">
      {/* Top Header */}
      <div className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-8 text-[13px] text-[var(--se-text-secondary)]">
            <span>Console</span>
            <span>/</span>
            <span>Students</span>
            <span>/</span>
            <span className="text-[var(--se-text-primary)]">All students</span>
          </div>
          <h1 className="heading-1 mt-4 text-[24px] font-semibold text-[var(--se-text-primary)]">
            All Students
          </h1>
          <p className="caption-1 mt-2 text-[var(--se-text-secondary)]">
            University student directory, admissions records, academic risk monitoring, and advising.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-12">
          <Button variant="secondary" size="md" className="gap-8">
            <DownloadSimple size={16} />
            Export CSV
          </Button>
          <Button variant="secondary" size="md" className="gap-8">
            <UploadSimple size={16} />
            Bulk import
          </Button>
          <button
            type="button"
            className="inline-flex items-center gap-8 rounded-lg bg-[#1855e2] px-16 py-8 text-[13px] font-semibold text-white shadow-xs transition hover:bg-[#1548be]"
          >
            <Plus size={16} />
            Add student
          </button>
        </div>
      </div>

      {/* Metric Filter Pills (Matching Mockup exactly) */}
      <div className="flex flex-wrap items-center gap-12 border-b border-[var(--se-border)] pb-16">
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          className={`flex items-center gap-8 rounded-full px-16 py-6 text-[13px] font-medium transition ${
            activeFilter === 'ALL'
              ? 'bg-[var(--se-text-primary)] text-[var(--se-bg-canvas)] shadow-xs'
              : 'bg-[var(--se-bg-elevated)] text-[var(--se-text-secondary)] hover:text-[var(--se-text-primary)]'
          }`}
        >
          <span>All</span>
          <span className="font-mono text-[12px] opacity-80">{counts.all.toLocaleString()}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('AT_RISK')}
          className={`flex items-center gap-8 rounded-full px-16 py-6 text-[13px] font-medium transition ${
            activeFilter === 'AT_RISK'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
          }`}
        >
          <span className="h-6 w-6 rounded-full bg-amber-500" />
          <span>At risk</span>
          <span className="font-mono text-[12px] font-semibold">{counts.atRisk}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('FEE_DUE')}
          className={`flex items-center gap-8 rounded-full px-16 py-6 text-[13px] font-medium transition ${
            activeFilter === 'FEE_DUE'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'border border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200'
          }`}
        >
          <span>Fee due</span>
          <span className="font-mono text-[12px] font-semibold">{counts.feeDue}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('PROBATION')}
          className={`flex items-center gap-8 rounded-full px-16 py-6 text-[13px] font-medium transition ${
            activeFilter === 'PROBATION'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'border border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
          }`}
        >
          <span>On probation</span>
          <span className="font-mono text-[12px] font-semibold">{counts.probation}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <MagnifyingGlass
            size={16}
            className="absolute left-12 top-1/2 -translate-y-1/2 text-[var(--se-text-secondary)]"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, ID (e.g. 2024-360-117), email..."
            className="pl-36"
          />
        </div>

        <div className="flex items-center gap-12">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-card)] px-12 py-8 text-[13px] font-medium text-[var(--se-text-primary)] shadow-xs focus:outline-none"
          >
            <option value="ALL">All departments</option>
            <option value="CSE">CSE</option>
            <option value="EEE">EEE</option>
            <option value="BBA">BBA</option>
            <option value="LAW">LAW</option>
          </select>

          <select className="rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-card)] px-12 py-8 text-[13px] font-medium text-[var(--se-text-primary)] shadow-xs focus:outline-none">
            <option value="ALL">All semesters</option>
            <option value="4">Semester 4 (Fall 2026)</option>
            <option value="6">Semester 6</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--se-border)] bg-[var(--se-bg-elevated)]/50 text-[12px] font-semibold text-[var(--se-text-secondary)]">
              <th className="py-12 px-16 w-32">
                <input type="checkbox" className="rounded border-[var(--se-border)]" />
              </th>
              <th className="py-12 px-16">Student</th>
              <th className="py-12 px-16">Student ID</th>
              <th className="py-12 px-16">Dept & Program</th>
              <th className="py-12 px-16">Batch</th>
              <th className="py-12 px-16">Attendance %</th>
              <th className="py-12 px-16">CGPA</th>
              <th className="py-12 px-16">Status</th>
              <th className="py-12 px-16 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--se-border)] text-[13px]">
            {filteredStudents.map((s) => (
              <tr
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className="group cursor-pointer transition hover:bg-[var(--se-bg-elevated)]/40"
              >
                <td className="py-12 px-16" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded border-[var(--se-border)]" />
                </td>
                <td className="py-12 px-16">
                  <div className="flex items-center gap-12">
                    <div className="flex h-36 w-36 items-center justify-center rounded-full bg-brand-ink text-white text-[12px] font-semibold">
                      {s.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--se-text-primary)] group-hover:text-brand-teal transition">
                        {s.fullName}
                      </span>
                      <p className="text-[11px] text-[var(--se-text-secondary)]">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-12 px-16 font-mono text-[12px] font-medium text-[var(--se-text-primary)]">
                  {s.studentNumber}
                </td>
                <td className="py-12 px-16 text-[var(--se-text-secondary)]">
                  <span className="font-medium text-[var(--se-text-primary)]">{s.departmentCode}</span>
                  <span className="ml-4 text-[11px]">• {s.programCode}</span>
                </td>
                <td className="py-12 px-16 text-[var(--se-text-secondary)]">
                  {s.batchCode}
                </td>
                <td className="py-12 px-16">
                  <div className="flex items-center gap-8">
                    <div className="h-6 w-54 overflow-hidden rounded-full bg-[var(--se-border)]">
                      <div
                        className={`h-full rounded-full ${
                          s.attendancePct < 85 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${s.attendancePct}%` }}
                      />
                    </div>
                    <span
                      className={`font-mono text-[12px] font-medium ${
                        s.attendancePct < 85 ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--se-text-primary)]'
                      }`}
                    >
                      {s.attendancePct}%
                    </span>
                  </div>
                </td>
                <td className="py-12 px-16">
                  <span className="rounded-md border border-[var(--se-border)] bg-[var(--se-bg-elevated)] px-8 py-3 font-mono text-[12px] font-semibold text-[var(--se-text-primary)]">
                    {s.cgpa.toFixed(2)}
                  </span>
                </td>
                <td className="py-12 px-16">
                  {s.status === 'ACTIVE' && (
                    <Badge tone="success">Active</Badge>
                  )}
                  {s.status === 'AT_RISK' && (
                    <Badge tone="warning">At risk</Badge>
                  )}
                  {s.status === 'PROBATION' && (
                    <Badge tone="danger">Probation</Badge>
                  )}
                  {s.status === 'FEE_DUE' && (
                    <Badge tone="info">Fee due</Badge>
                  )}
                </td>
                <td className="py-12 px-16 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(s);
                    }}
                    className="rounded-lg p-6 text-[var(--se-text-secondary)] hover:bg-[var(--se-bg-elevated)] hover:text-[var(--se-text-primary)]"
                  >
                    <DotsThreeVertical size={18} weight="bold" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Slide-over Profile Drawer (Matching Mockup exactly) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div
            className="flex h-full w-full max-w-[540px] flex-col border-l border-[var(--se-border)] bg-[var(--se-bg-card)] shadow-2xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-[var(--se-border)] p-20">
              <div className="flex items-center gap-16">
                <div className="flex h-52 w-52 items-center justify-center rounded-full bg-brand-ink text-[18px] font-bold text-white">
                  {selectedStudent.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-8">
                    <h2 className="text-[18px] font-semibold text-[var(--se-text-primary)]">
                      {selectedStudent.fullName}
                    </h2>
                    {selectedStudent.status === 'AT_RISK' && (
                      <Badge tone="warning">At risk</Badge>
                    )}
                    {selectedStudent.status === 'ACTIVE' && (
                      <Badge tone="success">Active</Badge>
                    )}
                  </div>
                  <p className="font-mono text-[12px] text-[var(--se-text-secondary)]">
                    {selectedStudent.studentNumber} • {selectedStudent.programCode}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-6 text-[var(--se-text-secondary)] hover:bg-[var(--se-bg-elevated)] hover:text-[var(--se-text-primary)]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-8 border-b border-[var(--se-border)] bg-[var(--se-bg-elevated)]/40 px-20 py-10">
              <Button
                variant="secondary"
                size="sm"
                className="gap-6 text-[12px]"
                onClick={() => {
                  setAdvisorMessageSent(true);
                  setTimeout(() => setAdvisorMessageSent(false), 3000);
                }}
              >
                <ChatCircleText size={16} />
                Message advisor
              </Button>
              <Button variant="secondary" size="sm" className="gap-6 text-[12px]">
                <Calendar size={16} />
                Book meeting
              </Button>
              <Button variant="secondary" size="sm" className="gap-6 text-[12px]">
                <IdentificationCard size={16} />
                ID card
              </Button>
            </div>

            {advisorMessageSent && (
              <div className="bg-emerald-50 px-20 py-8 text-[12px] font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                Message thread opened with advisor Dr. Tariq Mahmud.
              </div>
            )}

            {/* 4 Tabs Header */}
            <div className="flex border-b border-[var(--se-border)] px-20">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'academics', label: 'Academics' },
                { id: 'fees', label: 'Fees & dues' },
                { id: 'activity', label: 'Activity' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDrawerTab(t.id as 'overview' | 'academics' | 'fees' | 'activity')}
                  className={`border-b-2 py-12 px-12 text-[13px] font-medium transition ${
                    drawerTab === t.id
                      ? 'border-[#1855e2] text-[#1855e2]'
                      : 'border-transparent text-[var(--se-text-secondary)] hover:text-[var(--se-text-primary)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-20 space-y-20">
              {drawerTab === 'overview' && (
                <>
                  {/* Risk Review Callout Banner (Matching Mockup) */}
                  {selectedStudent.riskNotes && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-16 dark:border-amber-900 dark:bg-amber-950/30">
                      <div className="flex items-center gap-8 text-[13px] font-semibold text-amber-900 dark:text-amber-200">
                        <WarningCircle size={18} weight="fill" className="text-amber-600" />
                        <span>Student Risk Review</span>
                      </div>
                      <p className="mt-6 text-[12px] leading-relaxed text-amber-800 dark:text-amber-300">
                        {selectedStudent.riskNotes}
                      </p>
                      <div className="mt-12 flex items-center gap-8">
                        <Button variant="secondary" size="xsm" className="bg-white dark:bg-amber-900/60">
                          Acknowledge
                        </Button>
                        <Button variant="ghost" size="xsm">
                          Counselor referral
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* 4 Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-12 sm:grid-cols-4">
                    <div className="rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)]/40 p-12 text-center">
                      <span className="text-[11px] text-[var(--se-text-secondary)]">CGPA</span>
                      <p className="mt-2 font-mono text-[20px] font-semibold text-[var(--se-text-primary)]">
                        {selectedStudent.cgpa.toFixed(2)}
                      </p>
                      <span className="text-[10px] text-emerald-600">+0.04 term</span>
                    </div>

                    <div className="rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)]/40 p-12 text-center">
                      <span className="text-[11px] text-[var(--se-text-secondary)]">Attendance</span>
                      <p className="mt-2 font-mono text-[20px] font-semibold text-amber-600">
                        {selectedStudent.attendancePct}%
                      </p>
                      <span className="text-[10px] text-[var(--se-text-secondary)]">Target: 85%</span>
                    </div>

                    <div className="rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)]/40 p-12 text-center">
                      <span className="text-[11px] text-[var(--se-text-secondary)]">Credits</span>
                      <p className="mt-2 font-mono text-[20px] font-semibold text-[var(--se-text-primary)]">
                        {selectedStudent.creditsCompleted}
                      </p>
                      <span className="text-[10px] text-[var(--se-text-secondary)]">of {selectedStudent.totalCredits}</span>
                    </div>

                    <div className="rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)]/40 p-12 text-center">
                      <span className="text-[11px] text-[var(--se-text-secondary)]">Fee Due</span>
                      <p className="mt-2 font-mono text-[20px] font-semibold text-[var(--se-text-primary)]">
                        ${selectedStudent.outstandingFee.toFixed(0)}
                      </p>
                      <span className="text-[10px] text-amber-600">Inst. 2 due</span>
                    </div>
                  </div>

                  {/* Enrolled Courses Table */}
                  <div>
                    <h3 className="caption-2 font-semibold text-[var(--se-text-primary)] mb-8">
                      Enrolled Courses ({selectedStudent.semesterName})
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-card)]">
                      <table className="w-full text-left text-[12px]">
                        <thead>
                          <tr className="border-b border-[var(--se-border)] bg-[var(--se-bg-elevated)]/50 text-[var(--se-text-secondary)]">
                            <th className="py-8 px-12">Course</th>
                            <th className="py-8 px-12">Section & Faculty</th>
                            <th className="py-8 px-12 text-right">Attend %</th>
                            <th className="py-8 px-12 text-right">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--se-border)]">
                          {selectedStudent.enrolledCourses.map((c) => (
                            <tr key={c.code}>
                              <td className="py-8 px-12">
                                <span className="font-mono font-semibold text-[var(--se-text-primary)]">
                                  {c.code}
                                </span>
                                <p className="line-clamp-1 text-[11px] text-[var(--se-text-secondary)]">
                                  {c.title}
                                </p>
                              </td>
                              <td className="py-8 px-12 text-[var(--se-text-secondary)]">
                                <span className="font-medium text-[var(--se-text-primary)]">{c.section}</span>
                                <p className="text-[11px]">{c.faculty}</p>
                              </td>
                              <td className="py-8 px-12 text-right font-mono">
                                <span className={c.attendancePct < 85 ? 'text-amber-600 font-semibold' : 'text-[var(--se-text-primary)]'}>
                                  {c.attendancePct}%
                                </span>
                              </td>
                              <td className="py-8 px-12 text-right">
                                <span className="rounded bg-[var(--se-bg-elevated)] px-6 py-2 font-mono font-semibold text-[var(--se-text-primary)]">
                                  {c.grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Personal Contact Details */}
                  <div className="rounded-xl border border-[var(--se-border)] p-16 space-y-12">
                    <h3 className="caption-2 font-semibold text-[var(--se-text-primary)]">
                      Personal & Guardian Information
                    </h3>
                    <div className="grid grid-cols-2 gap-12 text-[12px]">
                      <div>
                        <span className="text-[var(--se-text-secondary)]">Phone</span>
                        <p className="font-mono text-[var(--se-text-primary)]">{selectedStudent.phone}</p>
                      </div>
                      <div>
                        <span className="text-[var(--se-text-secondary)]">Blood Group</span>
                        <p className="font-mono text-[var(--se-text-primary)]">{selectedStudent.bloodGroup}</p>
                      </div>
                      <div>
                        <span className="text-[var(--se-text-secondary)]">Guardian</span>
                        <p className="text-[var(--se-text-primary)]">{selectedStudent.guardianName}</p>
                      </div>
                      <div>
                        <span className="text-[var(--se-text-secondary)]">Guardian Phone</span>
                        <p className="font-mono text-[var(--se-text-primary)]">{selectedStudent.guardianPhone}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {drawerTab === 'academics' && (
                <div className="space-y-16">
                  <div className="rounded-xl border border-[var(--se-border)] p-16">
                    <h4 className="caption-2 font-semibold text-[var(--se-text-primary)]">
                      Degree Progression Summary
                    </h4>
                    <p className="mt-4 text-[12px] text-[var(--se-text-secondary)]">
                      Total credits completed: {selectedStudent.creditsCompleted} / {selectedStudent.totalCredits} (
                      {Math.round((selectedStudent.creditsCompleted / selectedStudent.totalCredits) * 100)}%)
                    </p>
                    <div className="mt-8 h-8 w-full overflow-hidden rounded-full bg-[var(--se-border)]">
                      <div
                        className="h-full bg-brand-teal"
                        style={{ width: `${(selectedStudent.creditsCompleted / selectedStudent.totalCredits) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-[12px] text-[var(--se-text-secondary)]">
                    Official semester transcripts are verified via digital cryptographic QR signature.
                  </div>
                </div>
              )}

              {drawerTab === 'fees' && (
                <div className="space-y-16">
                  <div className="rounded-xl border border-[var(--se-border)] p-16">
                    <span className="text-[11px] text-[var(--se-text-secondary)]">Outstanding Balance</span>
                    <p className="mt-2 font-mono text-[24px] font-bold text-[var(--se-text-primary)]">
                      ${selectedStudent.outstandingFee.toFixed(2)}
                    </p>
                    <p className="mt-2 text-[12px] text-amber-600">
                      Installment 2 due in 5 days (Nov 19, 2026).
                    </p>
                  </div>
                </div>
              )}

              {drawerTab === 'activity' && (
                <div className="space-y-12">
                  <div className="flex gap-12 text-[12px]">
                    <div className="h-8 w-8 rounded-full bg-brand-teal mt-4" />
                    <div>
                      <p className="font-medium text-[var(--se-text-primary)]">Advising meeting completed</p>
                      <span className="text-[11px] text-[var(--se-text-secondary)]">Nov 10, 2026 with Dr. Tariq Mahmud</span>
                    </div>
                  </div>
                  <div className="flex gap-12 text-[12px]">
                    <div className="h-8 w-8 rounded-full bg-amber-500 mt-4" />
                    <div>
                      <p className="font-medium text-[var(--se-text-primary)]">Attendance warning generated</p>
                      <span className="text-[11px] text-[var(--se-text-secondary)]">Nov 05, 2026 automated scan</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
