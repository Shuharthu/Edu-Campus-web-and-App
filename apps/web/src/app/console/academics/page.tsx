'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Books,
  Buildings,
  Calendar,
  CaretRight,
  CheckCircle,
  Door,
  GraduationCap,
} from '@phosphor-icons/react';
import { Badge, Card } from '@/components/ui/primitives';

export default function AcademicSetupPage() {
  const [activeTab, setActiveTab] = useState<'faculties' | 'programs' | 'courses' | 'rooms'>('faculties');

  const faculties = [
    {
      code: 'FEPS',
      name: 'School of Engineering & Physical Sciences',
      dean: 'Dr. Anisur Rahman',
      departments: ['Computer Science & Engineering (CSE)', 'Electrical & Electronic Engineering (EEE)'],
      programsCount: 7,
      facultyCount: 25,
    },
    {
      code: 'SBE',
      name: 'School of Business & Economics',
      dean: 'Prof. Monir Hossain',
      departments: ['Business Administration (BBA)'],
      programsCount: 3,
      facultyCount: 8,
    },
    {
      code: 'SHSS',
      name: 'School of Humanities & Social Sciences',
      dean: 'Dr. Shirin Akter',
      departments: ['Department of Law (LAW)'],
      programsCount: 2,
      facultyCount: 7,
    },
  ];

  const programs = [
    { code: 'CSE-BSC', name: 'B.Sc. in Computer Science & Engineering', dept: 'CSE', degree: 'Undergraduate', credits: 136, sems: 8 },
    { code: 'CSE-MSC', name: 'M.Sc. in Computer Science & Engineering', dept: 'CSE', degree: 'Graduate', credits: 36, sems: 4 },
    { code: 'CSE-DS', name: 'B.Sc. in Data Science', dept: 'CSE', degree: 'Undergraduate', credits: 136, sems: 8 },
    { code: 'CSE-CS', name: 'B.Sc. in Cybersecurity', dept: 'CSE', degree: 'Undergraduate', credits: 136, sems: 8 },
    { code: 'CSE-SE', name: 'B.Sc. in Software Engineering', dept: 'CSE', degree: 'Undergraduate', credits: 136, sems: 8 },
    { code: 'EEE-BSC', name: 'B.Sc. in Electrical & Electronic Engineering', dept: 'EEE', degree: 'Undergraduate', credits: 138, sems: 8 },
    { code: 'EEE-MSC', name: 'M.Sc. in Electrical & Electronic Engineering', dept: 'EEE', degree: 'Graduate', credits: 36, sems: 4 },
    { code: 'BBA-GEN', name: 'Bachelor of Business Administration', dept: 'BBA', degree: 'Undergraduate', credits: 124, sems: 8 },
    { code: 'BBA-MKT', name: 'BBA in Marketing & Digital Commerce', dept: 'BBA', degree: 'Undergraduate', credits: 124, sems: 8 },
    { code: 'BBA-MBA', name: 'Executive Master of Business Administration', dept: 'BBA', degree: 'Graduate', credits: 48, sems: 4 },
    { code: 'LAW-LLB', name: 'Bachelor of Laws (LL.B. Hons)', dept: 'LAW', degree: 'Undergraduate', credits: 130, sems: 8 },
    { code: 'LAW-LLM', name: 'Master of Laws (LL.M.)', dept: 'LAW', degree: 'Graduate', credits: 36, sems: 2 },
  ];

  const rooms = [
    { number: 'Room 4B', building: 'Building B', type: 'Lecture Hall', capacity: 45, equipment: ['Projector', 'Air conditioning', 'Smart Board'] },
    { number: 'Room 5C', building: 'Building B', type: 'Lecture Hall', capacity: 50, equipment: ['Projector', 'Audio System'] },
    { number: 'Room 3C', building: 'Building A', type: 'Lecture Hall', capacity: 40, equipment: ['Projector'] },
    { number: 'Lab 1', building: 'Engineering Complex', type: 'Computer Lab', capacity: 35, equipment: ['35 High-spec Workstations', 'GPU Cluster'] },
    { number: 'Lab 2', building: 'Engineering Complex', type: 'Circuits Lab', capacity: 35, equipment: ['Oscilloscopes', 'Signal Generators'] },
    { number: 'Hall C', building: 'Central Auditorium', type: 'Auditorium', capacity: 150, equipment: ['Theater Stage', 'Acoustic Sound'] },
    { number: 'Room 2A', building: 'Business School', type: 'Lecture Hall', capacity: 45, equipment: ['Projector', 'Case Study Pods'] },
    { number: 'Moot Court', building: 'Law Building', type: 'Seminar Room', capacity: 60, equipment: ['Bench', 'Bar Table', 'Gallery Seating'] },
  ];

  return (
    <div className="space-y-24">
      {/* Header */}
      <div className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-8 text-[13px] text-[var(--se-text-secondary)]">
            <span>Console</span>
            <span>/</span>
            <span>Academics</span>
            <span>/</span>
            <span className="text-[var(--se-text-primary)]">Academic setup</span>
          </div>
          <h1 className="heading-1 mt-4 text-[24px] font-semibold text-[var(--se-text-primary)]">
            Academic Setup & Structure
          </h1>
          <p className="caption-1 mt-2 text-[var(--se-text-secondary)]">
            Configure faculties, academic departments, degree programs, course offerings, and campus rooms.
          </p>
        </div>

        <div className="flex items-center gap-12">
          <Link href="/console/academics/timetable">
            <button
              type="button"
              className="inline-flex items-center gap-8 rounded-lg bg-[#1855e2] px-16 py-8 text-[13px] font-semibold text-white shadow-xs transition hover:bg-[#1548be]"
            >
              <Calendar size={16} />
              Open Timetable builder
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 gap-16 sm:grid-cols-4">
        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="caption-2 text-[var(--se-text-secondary)]">Faculties</span>
            <Buildings size={20} className="text-brand-teal" />
          </div>
          <p className="mt-8 font-mono text-[24px] font-bold text-[var(--se-text-primary)]">3</p>
          <span className="caption-3 text-[var(--se-text-secondary)]">Academic schools</span>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="caption-2 text-[var(--se-text-secondary)]">Departments</span>
            <GraduationCap size={20} className="text-brand-teal" />
          </div>
          <p className="mt-8 font-mono text-[24px] font-bold text-[var(--se-text-primary)]">4</p>
          <span className="caption-3 text-[var(--se-text-secondary)]">CSE, EEE, BBA, LAW</span>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="caption-2 text-[var(--se-text-secondary)]">Programs</span>
            <Books size={20} className="text-brand-teal" />
          </div>
          <p className="mt-8 font-mono text-[24px] font-bold text-[var(--se-text-primary)]">12</p>
          <span className="caption-3 text-[var(--se-text-secondary)]">Undergraduate & Graduate</span>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="caption-2 text-[var(--se-text-secondary)]">Rooms & Labs</span>
            <Door size={20} className="text-brand-teal" />
          </div>
          <p className="mt-8 font-mono text-[24px] font-bold text-[var(--se-text-primary)]">8</p>
          <span className="caption-3 text-[var(--se-text-secondary)]">Active learning spaces</span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--se-border)]">
        {[
          { id: 'faculties', label: 'Faculties & Departments' },
          { id: 'programs', label: 'Degree Programs (12)' },
          { id: 'rooms', label: 'Rooms & Labs (8)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as 'faculties' | 'programs' | 'rooms')}
            className={`border-b-2 py-12 px-16 text-[13px] font-medium transition ${
              activeTab === tab.id
                ? 'border-[#1855e2] text-[#1855e2]'
                : 'border-transparent text-[var(--se-text-secondary)] hover:text-[var(--se-text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Faculties */}
      {activeTab === 'faculties' && (
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          {faculties.map((f) => (
            <Card key={f.code} className="p-20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <Badge tone="info">{f.code}</Badge>
                  <span className="text-[11px] text-[var(--se-text-secondary)]">
                    {f.facultyCount} Faculty
                  </span>
                </div>
                <h3 className="heading-2 mt-12 text-[16px] font-semibold text-[var(--se-text-primary)]">
                  {f.name}
                </h3>
                <p className="mt-4 text-[12px] text-[var(--se-text-secondary)]">
                  Dean: <span className="font-medium text-[var(--se-text-primary)]">{f.dean}</span>
                </p>

                <div className="mt-16 space-y-6">
                  <span className="caption-3 font-semibold uppercase tracking-wider text-[var(--se-text-secondary)]">
                    Housed Departments
                  </span>
                  {f.departments.map((d) => (
                    <div
                      key={d}
                      className="rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-elevated)]/50 p-8 text-[12px] font-medium text-[var(--se-text-primary)]"
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-20 border-t border-[var(--se-border)] pt-12 flex items-center justify-between text-[12px] text-[var(--se-text-secondary)]">
                <span>{f.programsCount} Programs offered</span>
                <CaretRight size={14} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Programs */}
      {activeTab === 'programs' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--se-border)] bg-[var(--se-bg-elevated)]/50 text-[12px] font-semibold text-[var(--se-text-secondary)]">
                <th className="py-12 px-16">Program Code</th>
                <th className="py-12 px-16">Program Name</th>
                <th className="py-12 px-16">Department</th>
                <th className="py-12 px-16">Degree Level</th>
                <th className="py-12 px-16">Total Credits</th>
                <th className="py-12 px-16">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--se-border)]">
              {programs.map((p) => (
                <tr key={p.code} className="hover:bg-[var(--se-bg-elevated)]/30 transition">
                  <td className="py-12 px-16 font-mono font-semibold text-[var(--se-text-primary)]">
                    {p.code}
                  </td>
                  <td className="py-12 px-16 font-medium text-[var(--se-text-primary)]">
                    {p.name}
                  </td>
                  <td className="py-12 px-16">
                    <Badge tone="neutral">{p.dept}</Badge>
                  </td>
                  <td className="py-12 px-16 text-[var(--se-text-secondary)]">{p.degree}</td>
                  <td className="py-12 px-16 font-mono text-[var(--se-text-primary)]">{p.credits} cr</td>
                  <td className="py-12 px-16 text-[var(--se-text-secondary)]">{p.sems} semesters</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Tab 3: Rooms */}
      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4">
          {rooms.map((r) => (
            <Card key={r.number} className="p-16 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <Badge tone={r.type.includes('Lab') ? 'warning' : 'info'}>{r.type}</Badge>
                  <span className="font-mono text-[12px] font-semibold text-[var(--se-text-primary)]">
                    {r.capacity} seats
                  </span>
                </div>
                <h3 className="heading-2 mt-12 text-[16px] font-semibold text-[var(--se-text-primary)]">
                  {r.number}
                </h3>
                <p className="mt-2 text-[12px] text-[var(--se-text-secondary)]">{r.building}</p>

                <div className="mt-12 flex flex-wrap gap-4">
                  {r.equipment.map((eq) => (
                    <span
                      key={eq}
                      className="rounded bg-[var(--se-bg-elevated)] px-6 py-2 text-[10px] text-[var(--se-text-secondary)]"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-16 border-t border-[var(--se-border)] pt-8 text-[11px] text-emerald-600 flex items-center gap-4">
                <CheckCircle size={14} weight="fill" />
                <span>Available for scheduling</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
