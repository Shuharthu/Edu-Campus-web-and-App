'use client';

import React, { useMemo, useState } from 'react';
import {
  Briefcase,
  Buildings,
  CheckCircle,
  GraduationCap,
  MagnifyingGlass,
  Plus,
  TrendUp,
  User,
  X,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

interface JobPostingItem {
  id: string;
  companyName: string;
  companyLogoUrl?: string;
  roleTitle: string;
  jobType: 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME';
  stipendSalary: string;
  location: string;
  minCgpa: number;
  applicationDeadline: string;
  requirements: string;
  applicantCount: number;
  applicants: {
    id: string;
    studentName: string;
    studentNumber: string;
    cgpa: number;
    department: string;
    status: 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED';
    appliedAt: string;
  }[];
}

export default function CareerHubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedPosting, setSelectedPosting] = useState<JobPostingItem | null>(null);
  const [applicantDrawerOpen, setApplicantDrawerOpen] = useState(false);
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // New posting form state
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newType, setNewType] = useState<'INTERNSHIP' | 'FULL_TIME'>('INTERNSHIP');
  const [newSalary, setNewSalary] = useState('');
  const [newLocation, setNewLocation] = useState('Dhaka (Hybrid)');
  const [newMinCgpa, setNewMinCgpa] = useState(3.0);
  const [newDeadline, setNewDeadline] = useState('2026-12-15');
  const [newRequirements, setNewRequirements] = useState('');

  const [postings, setPostings] = useState<JobPostingItem[]>([
    {
      id: '00000000-0000-0000-0007-000000000061',
      companyName: 'bKash Limited',
      companyLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      roleTitle: 'Software Engineer Intern (Backend / Cloud)',
      jobType: 'INTERNSHIP',
      stipendSalary: '$400 / month',
      location: 'Dhaka (Hybrid)',
      minCgpa: 3.2,
      applicationDeadline: 'Dec 15, 2026',
      requirements: 'Proficiency in TypeScript, Node.js / NestJS, PostgreSQL, Docker, and RESTful API architecture.',
      applicantCount: 28,
      applicants: [
        {
          id: 'app-001',
          studentName: 'Rafiq Hasan',
          studentNumber: '2024-CSE-0042',
          cgpa: 3.21,
          department: 'CSE',
          status: 'SHORTLISTED',
          appliedAt: '3 days ago',
        },
        {
          id: 'app-002',
          studentName: 'Tasnim Ferdous',
          studentNumber: '2024-CSE-0011',
          cgpa: 3.85,
          department: 'CSE',
          status: 'INTERVIEW_SCHEDULED',
          appliedAt: '4 days ago',
        },
        {
          id: 'app-003',
          studentName: 'Arman Hossain',
          studentNumber: '2024-CSE-0033',
          cgpa: 3.42,
          department: 'CSE',
          status: 'REVIEWING',
          appliedAt: '5 days ago',
        },
      ],
    },
    {
      id: '00000000-0000-0000-0007-000000000062',
      companyName: 'Brain Station 23',
      companyLogoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&q=80',
      roleTitle: 'Junior Full-Stack Developer',
      jobType: 'FULL_TIME',
      stipendSalary: '$650 / month',
      location: 'Dhaka / Remote',
      minCgpa: 3.0,
      applicationDeadline: 'Dec 05, 2026',
      requirements: 'React/Next.js frontend, NestJS backend, Git workflow, CI/CD experience with modern cloud tooling.',
      applicantCount: 45,
      applicants: [
        {
          id: 'app-004',
          studentName: 'Sayed Mahmud',
          studentNumber: '2023-CSE-0005',
          cgpa: 3.65,
          department: 'CSE',
          status: 'OFFERED',
          appliedAt: '1 week ago',
        },
      ],
    },
    {
      id: '00000000-0000-0000-0007-000000000063',
      companyName: 'Optimizely',
      companyLogoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=120&q=80',
      roleTitle: 'Associate QA Automation Engineer',
      jobType: 'FULL_TIME',
      stipendSalary: '$600 / month',
      location: 'Dhaka (Gulshan)',
      minCgpa: 3.0,
      applicationDeadline: 'Dec 10, 2026',
      requirements: 'Playwright/Cypress automation, API test frameworks, postman automation, performance profiling.',
      applicantCount: 19,
      applicants: [],
    },
  ]);

  const filteredPostings = useMemo(() => {
    return postings.filter((p) => {
      const matchType = selectedType === 'ALL' || p.jobType === selectedType;
      const matchSearch =
        p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [postings, selectedType, searchQuery]);

  const handleUpdateStatus = (
    appId: string,
    newStatus: 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED',
  ) => {
    if (!selectedPosting) return;

    setPostings((prev) =>
      prev.map((p) =>
        p.id === selectedPosting.id
          ? {
              ...p,
              applicants: p.applicants.map((a) =>
                a.id === appId ? { ...a, status: newStatus } : a,
              ),
            }
          : p,
      ),
    );

    setSelectedPosting((prev) =>
      prev
        ? {
            ...prev,
            applicants: prev.applicants.map((a) =>
              a.id === appId ? { ...a, status: newStatus } : a,
            ),
          }
        : null,
    );

    setToastMessage(`Updated applicant stage to ${newStatus}`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const newPosting: JobPostingItem = {
      id: `job-${Date.now()}`,
      companyName: newCompany,
      roleTitle: newRole,
      jobType: newType,
      stipendSalary: newSalary,
      location: newLocation,
      minCgpa: Number(newMinCgpa),
      applicationDeadline: newDeadline,
      requirements: newRequirements,
      applicantCount: 0,
      applicants: [],
    };

    setPostings([newPosting, ...postings]);
    setNewJobModalOpen(false);
    setToastMessage(`Published career opening: ${newRole} at ${newCompany}`);
    setTimeout(() => setToastMessage(''), 5000);

    setNewCompany('');
    setNewRole('');
    setNewSalary('');
    setNewRequirements('');
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

      {/* Header */}
      <div className="flex flex-col justify-between gap-16 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-semibold tracking-tight">Career Hub & Placement Board</h1>
            <Badge tone="info" className="border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
              SCR-WEB-703
            </Badge>
          </div>
          <p className="mt-4 text-sm text-[var(--se-text-secondary)]">
            Manage corporate recruitment drives, internships, full-time openings, and student placement pipelines.
          </p>
        </div>
        <div className="flex items-center gap-12">
          <Button
            onClick={() => setNewJobModalOpen(true)}
            className="flex items-center gap-8"
          >
            <Plus size={16} weight="bold" />
            <span>Post New Opportunity</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Corporate Partners
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
              <Buildings size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">34</span>
            <span className="text-xs text-indigo-400 font-medium">+6 This Quarter</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Tech, Fintech, Telecom & Research</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Open Positions
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
              <Briefcase size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">18</span>
            <span className="text-xs text-blue-400 font-medium">12 Internships</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Actively accepting student CVs</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Total Applications
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <User size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">248</span>
            <span className="text-xs text-emerald-400 font-medium">42 Shortlisted</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Automated CGPA verification</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Placement Rate
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <TrendUp size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">84.2%</span>
            <span className="text-xs text-amber-400 font-medium">Class of 2026</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Highest avg package: $14.5k / yr</p>
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
              placeholder="Search companies, role title, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-36"
            />
          </div>

          <div className="flex gap-8">
            {['ALL', 'INTERNSHIP', 'FULL_TIME'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-[var(--se-radius-md)] px-12 py-6 text-xs font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-[var(--se-text-secondary)] hover:text-white bg-[var(--se-bg-subtle)] border border-transparent'
                }`}
              >
                {type === 'ALL' ? 'All Roles' : type.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Postings Grid */}
      <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3">
        {filteredPostings.map((job) => (
          <Card key={job.id} className="p-20 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-12">
                  <div className="h-40 w-40 shrink-0 overflow-hidden rounded-[var(--se-radius-md)] border border-[var(--se-border)] bg-neutral-800">
                    {job.companyLogoUrl ? (
                      <img
                        src={job.companyLogoUrl}
                        alt={job.companyName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-500">
                        <Buildings size={18} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-[var(--se-text-primary)]">
                      {job.roleTitle}
                    </h3>
                    <div className="text-xs text-[var(--se-text-secondary)]">{job.companyName}</div>
                  </div>
                </div>
                <Badge
                  tone={job.jobType === 'INTERNSHIP' ? 'info' : 'success'}
                  className="text-xs"
                >
                  {job.jobType.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="mt-16 flex flex-wrap items-center gap-12 text-xs text-[var(--se-text-secondary)]">
                <span className="font-medium text-emerald-400">{job.stipendSalary}</span>
                <span>•</span>
                <span>{job.location}</span>
                <span>•</span>
                <span>Min CGPA: {job.minCgpa.toFixed(2)}</span>
              </div>

              <p className="mt-12 text-xs text-[var(--se-text-secondary)] line-clamp-2">
                {job.requirements}
              </p>
            </div>

            <div className="mt-20 border-t border-[var(--se-border)] pt-14">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[var(--se-text-secondary)]">
                  Deadline: <span className="font-medium text-[var(--se-text-primary)]">{job.applicationDeadline}</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSelectedPosting(job);
                    setApplicantDrawerOpen(true);
                  }}
                  className="flex items-center gap-6"
                >
                  <User size={14} />
                  <span>{job.applicantCount} Applicants</span>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Applicant Review Slide-Over Drawer */}
      {applicantDrawerOpen && selectedPosting && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="h-full w-full max-w-lg border-l border-[var(--se-border)] bg-[var(--se-bg-surface)] p-24 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--se-border)] pb-16">
                <div>
                  <h3 className="font-semibold text-lg text-[var(--se-text-primary)]">
                    Applicant Review Desk
                  </h3>
                  <p className="text-xs text-[var(--se-text-secondary)] mt-2">
                    {selectedPosting.roleTitle} • {selectedPosting.companyName}
                  </p>
                </div>
                <button
                  onClick={() => setApplicantDrawerOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-20 space-y-16 overflow-y-auto max-h-[70vh] pr-4">
                {selectedPosting.applicants.length === 0 ? (
                  <div className="py-40 text-center text-xs text-neutral-500">
                    No active student submissions in pipeline yet.
                  </div>
                ) : (
                  selectedPosting.applicants.map((app) => (
                    <Card key={app.id} className="p-16 space-y-12">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm text-[var(--se-text-primary)]">
                            {app.studentName}
                          </div>
                          <div className="text-xs font-mono text-neutral-400">
                            {app.studentNumber} • {app.department}
                          </div>
                        </div>
                        <Badge
                          tone={
                            app.status === 'SHORTLISTED' || app.status === 'OFFERED'
                              ? 'success'
                              : app.status === 'INTERVIEW_SCHEDULED'
                              ? 'info'
                              : 'neutral'
                          }
                          className="text-xs"
                        >
                          {app.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[var(--se-text-secondary)]">
                        <span className="flex items-center gap-4">
                          <GraduationCap size={14} className="text-cyan-400" />
                          CGPA: <strong className="text-white">{app.cgpa.toFixed(2)}</strong> (Verified)
                        </span>
                        <span>Applied {app.appliedAt}</span>
                      </div>

                      {/* Stage Transitions */}
                      <div className="border-t border-[var(--se-border)] pt-8 flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400">Change Status:</span>
                        <div className="flex gap-4">
                          {(['REVIEWING', 'SHORTLISTED', 'OFFERED'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleUpdateStatus(app.id, st)}
                              className={`rounded-[var(--se-radius-sm)] px-8 py-4 text-[10px] font-medium transition-colors ${
                                app.status === st
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-[var(--se-border)] pt-16 flex justify-end">
              <Button onClick={() => setApplicantDrawerOpen(false)}>Done Reviewing</Button>
            </div>
          </div>
        </div>
      )}

      {/* Post New Job Modal */}
      {newJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-16 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[var(--se-radius-lg)] border border-[var(--se-border)] bg-[var(--se-bg-surface)] p-24 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--se-border)] pb-16">
              <div>
                <h3 className="font-semibold text-lg text-[var(--se-text-primary)]">
                  Create Corporate Job Opening
                </h3>
                <p className="text-xs text-[var(--se-text-secondary)] mt-2">
                  Publish opportunity to university placement portal
                </p>
              </div>
              <button
                onClick={() => setNewJobModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="mt-16 space-y-16">
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                    Company Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Google, bKash"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    required
                    className="mt-4"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                    Role Title
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    required
                    className="mt-4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12">
                <div>
                  <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                    Opportunity Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'INTERNSHIP' | 'FULL_TIME')}
                    className="mt-4 w-full rounded-[var(--se-radius-md)] border border-[var(--se-border)] bg-[var(--se-bg-subtle)] px-12 py-8 text-sm text-[var(--se-text-primary)] outline-none"
                  >
                    <option value="INTERNSHIP">Internship</option>
                    <option value="FULL_TIME">Full-Time Graduate</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                    Location
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Dhaka (Hybrid)"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    required
                    className="mt-4"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                  Compensation / Stipend
                </label>
                <Input
                  type="text"
                  placeholder="e.g. $450 / month"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  required
                  className="mt-4"
                />
              </div>

              <div className="grid grid-cols-2 gap-12">
                <div>
                  <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                    Minimum CGPA Requirement
                  </label>
                  <Input
                    type="number"
                    step="0.05"
                    min="2.00"
                    max="4.00"
                    value={newMinCgpa}
                    onChange={(e) => setNewMinCgpa(parseFloat(e.target.value))}
                    required
                    className="mt-4"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                    Application Deadline
                  </label>
                  <Input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    required
                    className="mt-4"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                  Key Skills & Qualifications
                </label>
                <textarea
                  rows={3}
                  placeholder="Required stacks, core fundamentals, portfolio links..."
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  required
                  className="mt-4 w-full rounded-[var(--se-radius-md)] border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-12 text-sm text-[var(--se-text-primary)] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-12 pt-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setNewJobModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Publish Job Opportunity</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
