'use client';

import React, { useState } from 'react';
import {
  Armchair,
  Calendar,
  Clock,
  DownloadSimple,
  IdentificationBadge,
  MapPin,
  Plus,
  X,
} from '@phosphor-icons/react';
import { Badge, Button, Card } from '@/components/ui/primitives';

interface ExamItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  name: string;
  examDate: string;
  time: string;
  duration: string;
  roomVenue: string;
  totalSeats: number;
  allocatedSeats: number;
  barredDefaulters: number;
  status: 'SCHEDULED' | 'SEATS_ALLOCATED' | 'COMPLETED';
}

interface SeatTile {
  seatNumber: string;
  studentName?: string;
  studentNumber?: string;
  isOccupied: boolean;
  isAdmitted: boolean;
  attendancePct?: number;
}

export default function ExamSchedulerPage() {
  const [exams] = useState<ExamItem[]>([
    {
      id: 'ex-1',
      courseCode: 'CSE204',
      courseTitle: 'Data Structures & Algorithms',
      name: 'Midterm Examination',
      examDate: 'Nov 25, 2026',
      time: '09:00 AM – 11:00 AM',
      duration: '120 mins',
      roomVenue: 'Hall C (Building 2)',
      totalSeats: 50,
      allocatedSeats: 48,
      barredDefaulters: 2,
      status: 'SEATS_ALLOCATED',
    },
    {
      id: 'ex-2',
      courseCode: 'EEE201',
      courseTitle: 'Circuit Analysis',
      name: 'Midterm Examination',
      examDate: 'Nov 27, 2026',
      time: '02:00 PM – 04:00 PM',
      duration: '120 mins',
      roomVenue: 'Hall A (Building 1)',
      totalSeats: 45,
      allocatedSeats: 0,
      barredDefaulters: 0,
      status: 'SCHEDULED',
    },
    {
      id: 'ex-3',
      courseCode: 'BUS101',
      courseTitle: 'Principles of Management',
      name: 'Midterm Examination',
      examDate: 'Nov 30, 2026',
      time: '10:00 AM – 12:00 PM',
      duration: '120 mins',
      roomVenue: 'Auditorium West',
      totalSeats: 60,
      allocatedSeats: 0,
      barredDefaulters: 0,
      status: 'SCHEDULED',
    },
  ]);

  const [selectedExamId, setSelectedExamId] = useState('ex-1');
  const [selectedSeat, setSelectedSeat] = useState<SeatTile | null>(null);

  // 50 Seats Matrix for Hall C
  const seats: SeatTile[] = Array.from({ length: 50 }, (_, i) => {
    const seatNum = `Seat ${(i + 1).toString().padStart(2, '0')}`;
    if (i === 41) {
      // Seat 42: Rafiq Hasan
      return {
        seatNumber: 'Seat 42',
        studentName: 'Rafiq Hasan',
        studentNumber: '2024-CSE-0042',
        isOccupied: true,
        isAdmitted: true,
        attendancePct: 83.3,
      };
    }
    if (i === 11) {
      // Farhan Kabir - Defaulter (55.6%) Barred
      return {
        seatNumber: 'Seat 12',
        studentName: 'Farhan Kabir',
        studentNumber: '2024-CSE-0012',
        isOccupied: true,
        isAdmitted: false,
        attendancePct: 55.6,
      };
    }
    if (i < 48) {
      return {
        seatNumber: seatNum,
        studentName: `Student ${i + 1}`,
        studentNumber: `2024-CSE-00${(i + 1).toString().padStart(2, '0')}`,
        isOccupied: true,
        isAdmitted: true,
        attendancePct: 80 + (i % 15),
      };
    }
    return {
      seatNumber: seatNum,
      isOccupied: false,
      isAdmitted: false,
    };
  });

  const activeExam = exams.find((e) => e.id === selectedExamId) ?? exams[0];
  if (!activeExam) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Exam Schedule &amp; Seating Operations
            </h1>
            <Badge tone="neutral" className="text-xs font-mono">
              Fall 2026 Midterms
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Automated hall capacity allocation, defaulter attendance barring, and digital admit card issuance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <DownloadSimple size={16} />
            Batch Admit Cards (PDF)
          </Button>

          <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus size={16} />
            Schedule New Exam
          </Button>
        </div>
      </div>

      {/* Upcoming Exams Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exams.map((ex) => {
          const isSelected = ex.id === selectedExamId;
          return (
            <Card
              key={ex.id}
              onClick={() => setSelectedExamId(ex.id)}
              className={`p-4 cursor-pointer transition-all border ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-950/40'
                  : 'hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-neutral-500">{ex.courseCode}</span>
                {ex.status === 'SEATS_ALLOCATED' ? (
                  <Badge tone="success" className="text-[10px]">
                    Allocated
                  </Badge>
                ) : (
                  <Badge tone="neutral" className="text-[10px]">
                    Scheduled
                  </Badge>
                )}
              </div>

              <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100 mt-1">
                {ex.name}
              </div>
              <div className="text-xs text-neutral-400 truncate">{ex.courseTitle}</div>

              <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1 text-xs text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-neutral-400" /> {ex.examDate}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-neutral-400" /> {ex.time} ({ex.duration})
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-neutral-400" /> {ex.roomVenue}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Seating Arrangement Matrix for Selected Exam */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 gap-4">
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-neutral-400">
              Exam Venue Arrangement
            </div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
              {activeExam.roomVenue} • {activeExam.courseCode} ({activeExam.name})
            </h2>
            <div className="text-xs text-neutral-500 mt-1">
              Date: {activeExam.examDate} • Window: {activeExam.time}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block" />
              <span>Admitted ({activeExam.allocatedSeats - activeExam.barredDefaulters})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-red-500 inline-block" />
              <span>Barred Defaulter ({activeExam.barredDefaulters})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-neutral-200 dark:bg-neutral-700 inline-block" />
              <span>Vacant ({activeExam.totalSeats - activeExam.allocatedSeats})</span>
            </div>
          </div>
        </div>

        {/* Hall Front Projector / Blackboard */}
        <div className="w-full py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-center text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest border border-dashed border-neutral-300 dark:border-neutral-700">
          FRONT / INVIGILATOR DESK &amp; BLACKBOARD
        </div>

        {/* 5x10 Seating Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 pt-2">
          {seats.map((seat) => {
            const isHighlight = seat.studentNumber === '2024-CSE-0042'; // Rafiq Hasan

            return (
              <button
                key={seat.seatNumber}
                onClick={() => setSelectedSeat(seat)}
                className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center justify-between min-h-[68px] ${
                  isHighlight
                    ? 'border-indigo-600 ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                    : !seat.isOccupied
                    ? 'border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/20 text-neutral-400'
                    : !seat.isAdmitted
                    ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300'
                    : 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 hover:border-emerald-500'
                }`}
              >
                <span className="text-[10px] font-mono font-bold tracking-tight">
                  {seat.seatNumber}
                </span>

                <Armchair
                  size={20}
                  weight={seat.isOccupied ? 'fill' : 'regular'}
                  className={
                    isHighlight
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : !seat.isOccupied
                      ? 'text-neutral-300 dark:text-neutral-600'
                      : !seat.isAdmitted
                      ? 'text-red-500'
                      : 'text-emerald-500'
                  }
                />

                <span className="text-[9px] font-mono truncate max-w-full">
                  {seat.studentNumber ? seat.studentNumber.slice(-4) : 'VAC'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-neutral-400 text-center">
          Click any seat tile to inspect student attendance compliance and anti-fraud digital admit card token.
        </div>
      </Card>

      {/* Seat Details Modal */}
      {selectedSeat && selectedSeat.isOccupied && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <IdentificationBadge size={20} className="text-indigo-600" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Admit Card Details • {selectedSeat.seatNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSeat(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Student Name:</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {selectedSeat.studentName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Student ID:</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-100">
                  {selectedSeat.studentNumber}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Course:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {activeExam.courseCode} ({activeExam.courseTitle})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Venue &amp; Time:</span>
                <span className="text-neutral-900 dark:text-neutral-100">
                  {activeExam.roomVenue}, {activeExam.time}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Semester Attendance:</span>
                <span
                  className={`font-mono font-bold ${
                    (selectedSeat.attendancePct || 0) < 75 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {selectedSeat.attendancePct}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500">Eligibility Status:</span>
                <span>
                  {selectedSeat.isAdmitted ? (
                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px]">
                      Eligible &amp; Admitted
                    </Badge>
                  ) : (
                    <Badge className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-[10px]">
                      Barred (&lt;75% Attendance)
                    </Badge>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">Admit Token:</span>
                <span className="font-mono text-[10px] text-neutral-400">
                  smartedu_admit_7f8a92...
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
              <Button size="sm" onClick={() => setSelectedSeat(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
