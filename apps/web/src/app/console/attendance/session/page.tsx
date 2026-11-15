'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowsClockwise,
  CheckCircle,
  Copy,
  DeviceMobile,
  Lock,
  MapPin,
  QrCode,
  ShieldCheck,
  Timer,
} from '@phosphor-icons/react';
import { Badge, Button, Card } from '@/components/ui/primitives';

interface Attendee {
  id: string;
  name: string;
  studentNumber: string;
  time: string;
  method: 'QR_SCAN' | 'SHORT_CODE';
  distanceMeters: number;
}

export default function LiveAttendanceSessionPage() {
  const [countdown, setCountdown] = useState(24);
  const [shortCode] = useState('849 201');
  const [copied, setCopied] = useState(false);
  const [isSessionClosed, setIsSessionClosed] = useState(false);

  const [attendees] = useState<Attendee[]>([
    {
      id: 'att-1',
      name: 'Rafiq Hasan',
      studentNumber: '2024-CSE-0042',
      time: '09:04:12 AM',
      method: 'QR_SCAN',
      distanceMeters: 8,
    },
    {
      id: 'att-2',
      name: 'Anika Rahman',
      studentNumber: '2024-CSE-0015',
      time: '09:04:30 AM',
      method: 'QR_SCAN',
      distanceMeters: 14,
    },
    {
      id: 'att-3',
      name: 'Samiul Haque',
      studentNumber: '2024-CSE-0021',
      time: '09:05:01 AM',
      method: 'SHORT_CODE',
      distanceMeters: 22,
    },
    {
      id: 'att-4',
      name: 'Tasnim Ferdous',
      studentNumber: '2024-CSE-0033',
      time: '09:05:45 AM',
      method: 'QR_SCAN',
      distanceMeters: 11,
    },
    {
      id: 'att-5',
      name: 'Zubair Hossain',
      studentNumber: '2024-CSE-0004',
      time: '09:06:18 AM',
      method: 'QR_SCAN',
      distanceMeters: 5,
    },
  ]);

  const totalEnrolled = 50;
  const presentCount = attendees.length;
  const attendanceRate = Math.round((presentCount / totalEnrolled) * 1000) / 10;

  // Countdown timer for rotating QR
  useEffect(() => {
    if (isSessionClosed) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSessionClosed]);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(shortCode.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseSession = () => {
    if (confirm('End and lock this attendance session? All unverified students will be marked Absent.')) {
      setIsSessionClosed(true);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button & session status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/console/attendance"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft size={16} />
          Return to Defaulters Desk
        </Link>

        <div className="flex items-center gap-3">
          {!isSessionClosed ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE ATTENDANCE SESSION IN PROGRESS</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <Lock size={14} />
              <span>SESSION CLOSED & LOCKED</span>
            </div>
          )}
        </div>
      </div>

      {/* Class Meta Card */}
      <Card className="p-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white border-none shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono">
                Class Section CSE204-A
              </span>
              <Badge className="bg-indigo-500/30 text-indigo-300 border-indigo-400/30 text-[11px]">
                Lecture 18
              </Badge>
            </div>
            <h2 className="text-xl font-bold mt-1">Data Structures &amp; Algorithms</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-neutral-300">
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-indigo-400" /> Room 301, Engineering Bldg
              </span>
              <span className="flex items-center gap-1">
                <Timer size={14} className="text-indigo-400" /> 09:00 AM – 10:30 AM
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-400" /> Geofence Radius: 50m
              </span>
            </div>
          </div>

          {!isSessionClosed && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleCloseSession}
              className="self-start sm:self-center gap-1.5"
            >
              <Lock size={16} />
              End &amp; Lock Session
            </Button>
          )}
        </div>
      </Card>

      {/* Two Column Layout: Projector View + Live Attendee List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Code Projector & PIN */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 text-center flex flex-col items-center justify-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden">
            {!isSessionClosed ? (
              <>
                <div className="flex items-center justify-between w-full mb-4 px-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Projector View • Scan with Smart EDU App
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                    <ArrowsClockwise size={14} className="animate-spin" />
                    <span>Rotates in {countdown}s</span>
                  </div>
                </div>

                {/* Simulated High-Res QR Code */}
                <div className="p-4 bg-white rounded-2xl shadow-inner border-2 border-dashed border-indigo-200 dark:border-neutral-700 flex flex-col items-center">
                  <div className="w-56 h-56 bg-neutral-950 p-2 rounded-xl flex items-center justify-center relative">
                    {/* SVG representation of rotating secure dynamic QR */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                      <rect x="5" y="5" width="28" height="28" rx="2" fill="white" />
                      <rect x="9" y="9" width="20" height="20" rx="1" fill="black" />
                      <rect x="13" y="13" width="12" height="12" rx="1" fill="white" />

                      <rect x="67" y="5" width="28" height="28" rx="2" fill="white" />
                      <rect x="71" y="9" width="20" height="20" rx="1" fill="black" />
                      <rect x="75" y="13" width="12" height="12" rx="1" fill="white" />

                      <rect x="5" y="67" width="28" height="28" rx="2" fill="white" />
                      <rect x="9" y="71" width="20" height="20" rx="1" fill="black" />
                      <rect x="13" y="75" width="12" height="12" rx="1" fill="white" />

                      {/* Random data pattern */}
                      <circle cx="45" cy="15" r="3" fill="white" />
                      <circle cx="55" cy="22" r="3" fill="white" />
                      <circle cx="48" cy="35" r="3.5" fill="white" />
                      <circle cx="20" cy="45" r="3" fill="white" />
                      <circle cx="35" cy="50" r="3" fill="white" />
                      <circle cx="50" cy="50" r="4" fill="white" />
                      <circle cx="65" cy="48" r="3" fill="white" />
                      <circle cx="80" cy="45" r="3" fill="white" />
                      <circle cx="45" cy="65" r="3" fill="white" />
                      <circle cx="55" cy="78" r="3.5" fill="white" />
                      <circle cx="75" cy="70" r="3" fill="white" />
                      <circle cx="85" cy="85" r="3" fill="white" />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                        <QrCode size={22} weight="bold" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar countdown */}
                <div className="w-64 bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${(countdown / 30) * 100}%` }}
                  />
                </div>

                {/* Fallback 6-digit PIN */}
                <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 w-full flex flex-col items-center">
                  <span className="text-xs text-neutral-500 uppercase font-semibold tracking-wider">
                    Manual 6-Digit Backup PIN
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="font-mono text-3xl font-extrabold tracking-widest text-neutral-900 dark:text-neutral-100">
                      {shortCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                      title="Copy code"
                    >
                      {copied ? <CheckCircle size={18} className="text-emerald-500" /> : <Copy size={18} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    For students with camera or connectivity issues in Hall 301
                  </p>
                </div>
              </>
            ) : (
              <div className="py-16 space-y-3">
                <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                  <Lock size={28} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Attendance Session Finalized
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  {presentCount} students marked present. {totalEnrolled - presentCount} absent students recorded in
                  the official academic register.
                </p>
                <Link href="/console/attendance">
                  <Button size="sm" className="mt-4">
                    Back to Defaulters Desk
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Live Attendee Counter & Realtime Feed */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tally Card */}
          <Card className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase text-indigo-700 dark:text-indigo-400">
                  Live Attendance Tally
                </span>
                <div className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {presentCount} <span className="text-sm font-normal text-neutral-500">/ {totalEnrolled} Enrolled</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-neutral-500">Turnout</span>
                <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {attendanceRate}%
                </div>
              </div>
            </div>

            <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </Card>

          {/* Attendee Live Stream */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Verified Check-Ins
              </span>
              <Badge tone="neutral" className="text-[10px] font-mono">
                {attendees.length} verified
              </Badge>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {attendees.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/50 text-xs"
                >
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {a.name}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      {a.studentNumber} • {a.time}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        a.method === 'QR_SCAN'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {a.method === 'QR_SCAN' ? <QrCode size={11} /> : <DeviceMobile size={11} />}
                      {a.method === 'QR_SCAN' ? 'QR Scanned' : 'PIN Entered'}
                    </span>
                    <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                      <MapPin size={10} /> {a.distanceMeters}m away
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
