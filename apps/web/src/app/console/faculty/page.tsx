'use client';

import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Envelope,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

interface FacultyItem {
  id: string;
  name: string;
  email: string;
  designation: string;
  departmentCode: string;
  departmentName: string;
  office: string;
  maxWeeklyHours: number;
  sectionsCount: number;
  specialization: string;
}

export default function FacultyDirectoryPage() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const facultyMembers: FacultyItem[] = useMemo(() => {
    return [
      {
        id: 'f-1',
        name: 'Dr. Anisur Rahman',
        email: 'dr.rahman@university.edu',
        designation: 'Professor & Department Head',
        departmentCode: 'CSE',
        departmentName: 'Computer Science & Engineering',
        office: 'Room 4B-101',
        maxWeeklyHours: 12,
        sectionsCount: 3,
        specialization: 'Distributed Systems & Compilers',
      },
      {
        id: 'f-2',
        name: 'Dr. Tariq Mahmud',
        email: 'tariq.mahmud@university.edu',
        designation: 'Associate Professor',
        departmentCode: 'CSE',
        departmentName: 'Computer Science & Engineering',
        office: 'Room 4B-102',
        maxWeeklyHours: 18,
        sectionsCount: 4,
        specialization: 'Algorithms & Computational Complexity',
      },
      {
        id: 'f-3',
        name: 'Dr. Sadia Haque',
        email: 'sadia.haque@university.edu',
        designation: 'Assistant Professor',
        departmentCode: 'CSE',
        departmentName: 'Computer Science & Engineering',
        office: 'Room 4B-103',
        maxWeeklyHours: 18,
        sectionsCount: 3,
        specialization: 'Machine Learning & Computer Vision',
      },
      {
        id: 'f-4',
        name: 'Dr. Farhana Islam',
        email: 'farhana.islam@university.edu',
        designation: 'Associate Professor',
        departmentCode: 'EEE',
        departmentName: 'Electrical & Electronic Engineering',
        office: 'Office-EEE-201',
        maxWeeklyHours: 18,
        sectionsCount: 3,
        specialization: 'Power Systems & Smart Grids',
      },
      {
        id: 'f-5',
        name: 'Prof. Monir Hossain',
        email: 'monir.hossain@university.edu',
        designation: 'Professor',
        departmentCode: 'BBA',
        departmentName: 'Business Administration',
        office: 'Office-BBA-301',
        maxWeeklyHours: 12,
        sectionsCount: 2,
        specialization: 'Corporate Finance & Valuation',
      },
      {
        id: 'f-6',
        name: 'Dr. Shirin Akter',
        email: 'shirin.akter@university.edu',
        designation: 'Professor',
        departmentCode: 'LAW',
        departmentName: 'Department of Law',
        office: 'Office-LAW-101',
        maxWeeklyHours: 12,
        sectionsCount: 2,
        specialization: 'Constitutional Law & Jurisprudence',
      },
    ];
  }, []);

  const filtered = useMemo(() => {
    return facultyMembers.filter((f) => {
      if (deptFilter !== 'ALL' && f.departmentCode !== deptFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q) ||
          f.departmentCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [facultyMembers, deptFilter, search]);

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
            <span className="text-[var(--se-text-primary)]">Faculty directory</span>
          </div>
          <h1 className="heading-1 mt-4 text-[24px] font-semibold text-[var(--se-text-primary)]">
            Faculty Directory
          </h1>
          <p className="caption-1 mt-2 text-[var(--se-text-secondary)]">
            University teaching staff, departmental assignments, teaching load, and office hours.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col gap-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <MagnifyingGlass
            size={16}
            className="absolute left-12 top-1/2 -translate-y-1/2 text-[var(--se-text-secondary)]"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name, department, or email..."
            className="pl-36"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-card)] px-12 py-8 text-[13px] font-medium text-[var(--se-text-primary)] shadow-xs focus:outline-none"
        >
          <option value="ALL">All departments (40 faculty)</option>
          <option value="CSE">CSE (15)</option>
          <option value="EEE">EEE (10)</option>
          <option value="BBA">BBA (8)</option>
          <option value="LAW">LAW (7)</option>
        </select>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((f) => (
          <Card key={f.id} className="p-20 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-12">
                  <div className="flex h-44 w-44 items-center justify-center rounded-full bg-brand-ink text-white font-bold text-[14px]">
                    {f.name.replace('Dr. ', '').replace('Prof. ', '').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="heading-2 text-[15px] font-semibold text-[var(--se-text-primary)]">
                      {f.name}
                    </h3>
                    <p className="caption-3 text-[var(--se-text-secondary)]">{f.designation}</p>
                  </div>
                </div>
                <Badge tone="neutral">{f.departmentCode}</Badge>
              </div>

              <div className="mt-16 space-y-6 text-[12px] text-[var(--se-text-secondary)]">
                <div className="flex items-center gap-6">
                  <Envelope size={14} />
                  <span>{f.email}</span>
                </div>
                <div>
                  <span className="font-medium text-[var(--se-text-primary)]">Specialization:</span>{' '}
                  {f.specialization}
                </div>
                <div>
                  <span className="font-medium text-[var(--se-text-primary)]">Office:</span> {f.office}
                </div>
              </div>
            </div>

            <div className="mt-16 border-t border-[var(--se-border)] pt-12 flex items-center justify-between text-[12px]">
              <div>
                <span className="font-mono font-semibold text-[var(--se-text-primary)]">
                  {f.sectionsCount} sections
                </span>
                <span className="text-[11px] text-[var(--se-text-secondary)]"> / {f.maxWeeklyHours}h max</span>
              </div>
              <Button variant="ghost" size="xsm" className="gap-4">
                <Calendar size={14} />
                View schedule
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
