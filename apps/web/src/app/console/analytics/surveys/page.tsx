'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  ChatCircleText,
  Plus,
  Star,
  UserList,
  Users,
  X,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

interface SurveyItem {
  id: string;
  title: string;
  description: string;
  surveyType: 'COURSE_EVALUATION' | 'CAMPUS_SATISFACTION';
  courseCode?: string;
  facultyName?: string;
  responseCount: number;
  avgClarity: number;
  avgEngagement: number;
  avgFairness: number;
  avgOverall: number;
  status: 'ACTIVE' | 'CLOSED';
}

export default function SurveysDeskPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<'COURSE_EVALUATION' | 'CAMPUS_SATISFACTION'>('COURSE_EVALUATION');
  const [newDeadline, setNewDeadline] = useState('2026-12-20');

  const [surveys, setSurveys] = useState<SurveyItem[]>([
    {
      id: '00000000-0000-0000-0008-000000000001',
      title: 'Fall 2026 Course Evaluation: CSE204 Data Structures & Algorithms',
      description: 'End-of-term academic feedback on pedagogical clarity, syllabus pacing, assignment fairness, and lab engagement.',
      surveyType: 'COURSE_EVALUATION',
      courseCode: 'CSE204',
      facultyName: 'Dr. Tariq Mahmud',
      responseCount: 42,
      avgClarity: 4.8,
      avgEngagement: 4.6,
      avgFairness: 4.7,
      avgOverall: 4.7,
      status: 'ACTIVE',
    },
    {
      id: '00000000-0000-0000-0008-000000000002',
      title: 'Fall 2026 Campus Life, Facilities & Dining Quality Survey',
      description: 'University-wide student satisfaction survey covering library hours, transit shuttles, cafeteria nutrition, and high-speed Wi-Fi.',
      surveyType: 'CAMPUS_SATISFACTION',
      responseCount: 215,
      avgClarity: 4.2,
      avgEngagement: 4.1,
      avgFairness: 4.3,
      avgOverall: 4.2,
      status: 'ACTIVE',
    },
    {
      id: '00000000-0000-0000-0008-000000000003',
      title: 'Fall 2026 Faculty Evaluation: MAT201 Linear Algebra & Calculus 2',
      description: 'Course feedback on theoretical mathematical proofs and weekly problem set grading.',
      surveyType: 'COURSE_EVALUATION',
      courseCode: 'MAT201',
      facultyName: 'Prof. Anisul Haque',
      responseCount: 38,
      avgClarity: 4.4,
      avgEngagement: 4.3,
      avgFairness: 4.5,
      avgOverall: 4.4,
      status: 'ACTIVE',
    },
  ]);

  const handleCreateSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    const newS: SurveyItem = {
      id: `survey-${Date.now()}`,
      title: newTitle,
      description: newDescription,
      surveyType: newType,
      responseCount: 0,
      avgClarity: 0,
      avgEngagement: 0,
      avgFairness: 0,
      avgOverall: 0,
      status: 'ACTIVE',
    };

    setSurveys([newS, ...surveys]);
    setCreateModalOpen(false);
    setToastMessage(`Published survey: "${newTitle}"`);
    setTimeout(() => setToastMessage(''), 5000);
    setNewTitle('');
    setNewDescription('');
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
                Course Evaluation & Institutional Surveys Desk
              </h1>
              <Badge tone="info" className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                SCR-WEB-803
              </Badge>
            </div>
            <p className="mt-4 text-sm text-[var(--se-text-secondary)]">
              Evaluate instructional quality, pedagogical clarity, campus facilities sentiment, and aggregate student feedback.
            </p>
          </div>

          <Button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-8"
          >
            <Plus size={16} weight="bold" />
            <span>Launch Evaluation Survey</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Active Evaluations
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
              <UserList size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">3 Active</span>
            <span className="text-xs text-cyan-400 font-medium">Fall 2026 Term</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">2 Course, 1 Institutional</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Response Rate
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">78.5%</span>
            <span className="text-xs text-emerald-400 font-medium">295 Submissions</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Completely anonymous responses</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Faculty Mean Score
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <Star size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">4.6 / 5.0</span>
            <span className="text-xs text-amber-400 font-medium">Very High</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Clarity, engagement & pacing</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Campus Satisfaction
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
              <ChatCircleText size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">86.2%</span>
            <span className="text-xs text-indigo-400 font-medium">Net Positive</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Library, transit & cafeteria</p>
        </Card>
      </div>

      {/* Surveys List */}
      <div className="space-y-16">
        {surveys.map((survey) => (
          <Card key={survey.id} className="p-20">
            <div className="flex flex-col justify-between gap-16 md:flex-row md:items-start">
              <div className="space-y-6">
                <div className="flex items-center gap-8">
                  <Badge
                    tone={survey.surveyType === 'COURSE_EVALUATION' ? 'info' : 'success'}
                    className="text-xs"
                  >
                    {survey.surveyType.replace(/_/g, ' ')}
                  </Badge>
                  {survey.courseCode && (
                    <span className="font-mono text-xs text-cyan-400 font-semibold">
                      {survey.courseCode}
                    </span>
                  )}
                  {survey.facultyName && (
                    <span className="text-xs text-neutral-400">
                      • Instructor: {survey.facultyName}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-[var(--se-text-primary)]">
                  {survey.title}
                </h3>
                <p className="text-xs text-[var(--se-text-secondary)] max-w-2xl">
                  {survey.description}
                </p>
              </div>

              <div className="flex items-center gap-16 rounded-[var(--se-radius-md)] border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-12 text-center">
                <div>
                  <span className="text-xs text-neutral-400 block">Overall Score</span>
                  <span className="text-xl font-semibold text-amber-400">
                    {survey.avgOverall.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">/ 5.0</span>
                </div>
                <div className="h-24 w-1 bg-neutral-800" />
                <div>
                  <span className="text-xs text-neutral-400 block">Responses</span>
                  <span className="text-xl font-semibold text-[var(--se-text-primary)]">
                    {survey.responseCount}
                  </span>
                  <span className="text-[10px] text-emerald-400 block">Completed</span>
                </div>
              </div>
            </div>

            {/* Ratings Breakdown Grid */}
            <div className="mt-20 border-t border-[var(--se-border)] pt-16 grid grid-cols-2 gap-12 sm:grid-cols-4">
              <div className="rounded-[var(--se-radius-sm)] border border-[var(--se-border)] bg-[var(--se-bg-surface)] p-12 text-center">
                <span className="text-[11px] text-[var(--se-text-secondary)] block">Clarity</span>
                <span className="font-semibold text-base text-[var(--se-text-primary)]">
                  {survey.avgClarity.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="rounded-[var(--se-radius-sm)] border border-[var(--se-border)] bg-[var(--se-bg-surface)] p-12 text-center">
                <span className="text-[11px] text-[var(--se-text-secondary)] block">Engagement</span>
                <span className="font-semibold text-base text-[var(--se-text-primary)]">
                  {survey.avgEngagement.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="rounded-[var(--se-radius-sm)] border border-[var(--se-border)] bg-[var(--se-bg-surface)] p-12 text-center">
                <span className="text-[11px] text-[var(--se-text-secondary)] block">Fairness</span>
                <span className="font-semibold text-base text-[var(--se-text-primary)]">
                  {survey.avgFairness.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="rounded-[var(--se-radius-sm)] border border-[var(--se-border)] bg-[var(--se-bg-surface)] p-12 text-center">
                <span className="text-[11px] text-[var(--se-text-secondary)] block">Status</span>
                <span className="font-semibold text-base text-emerald-400">
                  {survey.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-16 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[var(--se-radius-lg)] border border-[var(--se-border)] bg-[var(--se-bg-surface)] p-24 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--se-border)] pb-16">
              <div>
                <h3 className="font-semibold text-lg text-[var(--se-text-primary)]">
                  Launch Student Evaluation
                </h3>
                <p className="text-xs text-[var(--se-text-secondary)] mt-2">
                  Broadcast end-of-term feedback survey to enrolled students
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSurvey} className="mt-16 space-y-16">
              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                  Survey Title
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Fall 2026 Faculty Evaluation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="mt-4"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                  Survey Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'COURSE_EVALUATION' | 'CAMPUS_SATISFACTION')}
                  className="mt-4 w-full rounded-[var(--se-radius-md)] border border-[var(--se-border)] bg-[var(--se-bg-subtle)] px-12 py-8 text-sm text-[var(--se-text-primary)] outline-none"
                >
                  <option value="COURSE_EVALUATION">Course & Faculty Evaluation</option>
                  <option value="CAMPUS_SATISFACTION">Campus Life & Facilities</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Guidance text shown to students..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                  className="mt-4 w-full rounded-[var(--se-radius-md)] border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-12 text-sm text-[var(--se-text-primary)] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                  Submission Deadline
                </label>
                <Input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  required
                  className="mt-4"
                />
              </div>

              <div className="flex items-center justify-end gap-12 pt-8">
                <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Launch Survey</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
