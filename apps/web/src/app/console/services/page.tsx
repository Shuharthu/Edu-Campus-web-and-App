'use client';

import React, { useState } from 'react';
import {
  Certificate,
  CheckCircle,
  Clock,
  DownloadSimple,
  Eye,
  FileText,
  IdentificationBadge,
  IdentificationCard,
  QrCode,
  SealCheck,
  ShieldCheck,
  Warning,
  X,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

interface ServiceRequestItem {
  id: string;
  trackingNumber: string;
  studentNumber: string;
  studentName: string;
  program: string;
  requestType: 'OFFICIAL_TRANSCRIPT' | 'MIGRATION_CERT' | 'BONAFIDE_LETTER' | 'DEGREE_VERIFICATION';
  requestLabel: string;
  purpose: string;
  submittedAt: string;
  feeAmount: number;
  isFeePaid: boolean;
  status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'REJECTED';
  adminRemarks?: string;
}

interface DigitalIDItem {
  id: string;
  cardUuid: string;
  studentNumber: string;
  studentName: string;
  department: string;
  bloodGroup: string;
  emergencyPhone: string;
  canAccessGate: boolean;
  canAccessLibrary: boolean;
  canAccessLabs: boolean;
  issuedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export default function UniversityServicesPage() {
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'DIGITAL_ID'>('REQUESTS');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestItem | null>(null);
  const [isSealing, setIsSealing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Turnstile test state
  const [testTokenInput, setTestTokenInput] = useState('SMARTEDU-PASS-2024-CSE-0042-LIVE');
  const [scanResult, setScanResult] = useState<{
    valid: boolean;
    studentName: string;
    studentNumber: string;
    checkpoint: string;
    message: string;
  } | null>(null);

  const [serviceRequests, setServiceRequests] = useState<ServiceRequestItem[]>([
    {
      id: 'sr-001',
      trackingNumber: 'SR-2026-8492',
      studentNumber: '2024-CSE-0042',
      studentName: 'Rafiq Hasan',
      program: 'B.Sc. in Computer Science & Engineering',
      requestType: 'OFFICIAL_TRANSCRIPT',
      requestLabel: 'Official Academic Transcript (Sealed)',
      purpose: 'Graduate School Application (WES Evaluation)',
      submittedAt: '2026-11-10',
      feeAmount: 15.0,
      isFeePaid: true,
      status: 'IN_REVIEW',
      adminRemarks: 'Documents verified by department coordinator. Pending registrar seal.',
    },
    {
      id: 'sr-002',
      trackingNumber: 'SR-2026-8490',
      studentNumber: '2024-CSE-0015',
      studentName: 'Anika Rahman',
      program: 'B.Sc. in Computer Science & Engineering',
      requestType: 'BONAFIDE_LETTER',
      requestLabel: 'Bonafide Student Certificate',
      purpose: 'Embassy Student Visa Verification',
      submittedAt: '2026-11-12',
      feeAmount: 10.0,
      isFeePaid: true,
      status: 'COMPLETED',
      adminRemarks: 'Official seal applied and digital copy dispatched via email.',
    },
    {
      id: 'sr-003',
      trackingNumber: 'SR-2026-8488',
      studentNumber: '2023-EEE-0012',
      studentName: 'Farhan Kabir',
      program: 'B.Sc. in Electrical Engineering',
      requestType: 'MIGRATION_CERT',
      requestLabel: 'Migration & Clearance Certificate',
      purpose: 'Inter-university Credit Transfer Clearance',
      submittedAt: '2026-11-13',
      feeAmount: 25.0,
      isFeePaid: true,
      status: 'PENDING',
    },
  ]);

  const [digitalIds] = useState<DigitalIDItem[]>([
    {
      id: 'did-001',
      cardUuid: 'smartedu_id_2024_cse_0042',
      studentNumber: '2024-CSE-0042',
      studentName: 'Rafiq Hasan',
      department: 'Computer Science & Engineering',
      bloodGroup: 'A+',
      emergencyPhone: '+880 1711-234567',
      canAccessGate: true,
      canAccessLibrary: true,
      canAccessLabs: true,
      issuedAt: '2024-09-01',
      expiresAt: '2028-08-31',
      status: 'ACTIVE',
    },
    {
      id: 'did-002',
      cardUuid: 'smartedu_id_2024_cse_0015',
      studentNumber: '2024-CSE-0015',
      studentName: 'Anika Rahman',
      department: 'Computer Science & Engineering',
      bloodGroup: 'B+',
      emergencyPhone: '+880 1712-345678',
      canAccessGate: true,
      canAccessLibrary: true,
      canAccessLabs: true,
      issuedAt: '2024-09-01',
      expiresAt: '2028-08-31',
      status: 'ACTIVE',
    },
    {
      id: 'did-003',
      cardUuid: 'smartedu_id_2024_cse_0021',
      studentNumber: '2024-CSE-0021',
      studentName: 'Samiul Haque',
      department: 'Computer Science & Engineering',
      bloodGroup: 'O+',
      emergencyPhone: '+880 1713-456789',
      canAccessGate: true,
      canAccessLibrary: true,
      canAccessLabs: true,
      issuedAt: '2024-09-01',
      expiresAt: '2028-08-31',
      status: 'ACTIVE',
    },
  ]);

  const handleSealAndApprove = (reqId: string) => {
    setIsSealing(true);
    setTimeout(() => {
      setIsSealing(false);
      setServiceRequests((prev) =>
        prev.map((r) =>
          r.id === reqId
            ? {
                ...r,
                status: 'COMPLETED' as const,
                adminRemarks: 'Digitally verified and registrar cryptographic seal applied. Dispatched.',
              }
            : r,
        ),
      );
      if (selectedRequest && selectedRequest.id === reqId) {
        setSelectedRequest({
          ...selectedRequest,
          status: 'COMPLETED',
          adminRemarks: 'Digitally verified and registrar cryptographic seal applied. Dispatched.',
        });
      }
      setToastMessage('Document successfully sealed with registrar digital signature and marked COMPLETED!');
      setTimeout(() => setToastMessage(''), 4000);
    }, 800);
  };

  const handleTestTurnstile = () => {
    if (testTokenInput.includes('2024-CSE-0042') || testTokenInput.includes('smartedu_id')) {
      setScanResult({
        valid: true,
        studentName: 'Rafiq Hasan',
        studentNumber: '2024-CSE-0042',
        checkpoint: 'Main Campus Turnstile #01 (Gate A)',
        message: 'Access Granted • Dynamic TOTP signature valid • Active student in good standing',
      });
    } else {
      setScanResult({
        valid: false,
        studentName: 'Unknown',
        studentNumber: 'N/A',
        checkpoint: 'Main Campus Turnstile #01',
        message: 'Access Denied • Invalid token signature or expired timestamp',
      });
    }
  };

  return (
    <div className="space-y-24 p-24 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-8">
            <span className="flex h-32 w-32 items-center justify-center rounded-lg bg-[var(--se-brand-teal-light,rgba(13,148,136,0.1))] text-brand-teal">
              <Certificate size={20} weight="bold" />
            </span>
            <h1 className="heading-2">University Service Desk & Digital ID</h1>
          </div>
          <p className="body-5 text-[var(--se-text-secondary)] mt-4">
            Process official student records, transcript sealing, clearance requests, and manage dynamic NFC / QR digital credentials.
          </p>
        </div>

        <div className="flex items-center gap-8 bg-[var(--se-bg-card)] p-4 rounded-xl border border-[var(--se-border)]">
          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`caption-2 px-12 py-8 rounded-lg flex items-center gap-6 transition-colors ${
              activeTab === 'REQUESTS'
                ? 'bg-brand-teal text-brand-ink font-semibold'
                : 'text-[var(--se-text-secondary)] hover:bg-[var(--se-bg-hover)]'
            }`}
          >
            <FileText size={16} />
            Service Requests ({serviceRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('DIGITAL_ID')}
            className={`caption-2 px-12 py-8 rounded-lg flex items-center gap-6 transition-colors ${
              activeTab === 'DIGITAL_ID'
                ? 'bg-brand-teal text-brand-ink font-semibold'
                : 'text-[var(--se-text-secondary)] hover:bg-[var(--se-bg-hover)]'
            }`}
          >
            <IdentificationBadge size={16} />
            Digital ID Registry ({digitalIds.length})
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-16 rounded-xl bg-[var(--se-success-bg)] text-[var(--se-success-text)] flex items-center gap-8 caption-1 font-semibold animate-fade-in">
          <SealCheck size={20} weight="bold" />
          {toastMessage}
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Pending Fulfillment</span>
            <Clock size={18} className="text-[var(--se-warning-text)]" />
          </div>
          <div className="heading-1 mt-12 text-[var(--se-warning-text)]">2 Requests</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">SLA: 48 Hours turnaround</div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Completed This Month</span>
            <CheckCircle size={18} className="text-[var(--se-success-text)]" />
          </div>
          <div className="heading-1 mt-12 text-[var(--se-success-text)]">24 Requests</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">Sealed & Dispatched</div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Active Digital IDs</span>
            <IdentificationCard size={18} className="text-brand-teal" />
          </div>
          <div className="heading-1 mt-12">386 Cards</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">Rolling QR + Turnstile Gate</div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Gate Scans Today</span>
            <QrCode size={18} className="text-brand-teal" />
          </div>
          <div className="heading-1 mt-12">1,248 Scans</div>
          <div className="caption-3 text-[var(--se-text-muted)] mt-6">0 Security Violations</div>
        </Card>
      </div>

      {activeTab === 'REQUESTS' ? (
        /* Service Requests View */
        <div className="space-y-16">
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--se-border)] bg-[var(--se-bg-elevated)]">
                    <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Tracking #</th>
                    <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Student</th>
                    <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Request Type</th>
                    <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Purpose</th>
                    <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Fee Status</th>
                    <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Status</th>
                    <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--se-border)]">
                  {serviceRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-[var(--se-bg-hover)] transition-colors cursor-pointer"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <td className="py-16 px-16">
                        <span className="font-mono font-semibold text-brand-teal">{req.trackingNumber}</span>
                        <div className="caption-3 text-[var(--se-text-muted)]">{req.submittedAt}</div>
                      </td>
                      <td className="py-16 px-16">
                        <div className="font-semibold">{req.studentName}</div>
                        <div className="caption-3 font-mono text-[var(--se-text-muted)]">{req.studentNumber}</div>
                      </td>
                      <td className="py-16 px-16">
                        <div className="body-6">{req.requestLabel}</div>
                        <div className="caption-3 text-[var(--se-text-secondary)]">{req.program}</div>
                      </td>
                      <td className="py-16 px-16 caption-2 text-[var(--se-text-secondary)] max-w-xs truncate">
                        {req.purpose}
                      </td>
                      <td className="py-16 px-16">
                        <Badge tone="success">${req.feeAmount.toFixed(2)} Paid</Badge>
                      </td>
                      <td className="py-16 px-16">
                        <Badge
                          tone={
                            req.status === 'COMPLETED'
                              ? 'success'
                              : req.status === 'IN_REVIEW'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="py-16 px-16 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(req);
                          }}
                        >
                          <Eye size={16} className="mr-6" />
                          Review & Seal
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        /* Digital ID Registry & Turnstile Inspector */
        <div className="space-y-24">
          {/* Turnstile Gate Simulator */}
          <Card className="p-20 bg-[var(--se-bg-card)] border-brand-teal">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-16">
              <div className="space-y-4">
                <div className="flex items-center gap-8">
                  <ShieldCheck size={20} className="text-brand-teal" />
                  <h3 className="heading-3">Campus Turnstile & Gate Scanner Live Check</h3>
                </div>
                <p className="caption-2 text-[var(--se-text-secondary)]">
                  Verifies rolling 30-second cryptographic TOTP signature embedded in student dynamic QR pass.
                </p>
              </div>

              <div className="flex items-center gap-12 w-full md:w-auto">
                <Input
                  value={testTokenInput}
                  onChange={(e) => setTestTokenInput(e.target.value)}
                  placeholder="Paste Dynamic QR Token..."
                  className="w-80 font-mono text-xs"
                />
                <Button variant="primary" size="sm" onClick={handleTestTurnstile}>
                  <QrCode size={16} className="mr-6" />
                  Verify Pass
                </Button>
              </div>
            </div>

            {scanResult && (
              <div
                className={`mt-16 p-16 rounded-xl border flex items-center justify-between gap-16 animate-fade-in ${
                  scanResult.valid
                    ? 'border-[var(--se-success-border,rgba(16,185,129,0.3))] bg-[var(--se-success-bg)] text-[var(--se-success-text)]'
                    : 'border-[var(--se-danger-border,rgba(239,68,68,0.3))] bg-[var(--se-danger-bg)] text-[var(--se-danger-text)]'
                }`}
              >
                <div className="flex items-center gap-12">
                  {scanResult.valid ? <CheckCircle size={28} /> : <Warning size={28} />}
                  <div>
                    <div className="font-bold body-4">
                      {scanResult.valid ? `PASS VERIFIED: ${scanResult.studentName} (${scanResult.studentNumber})` : 'ACCESS REJECTED'}
                    </div>
                    <div className="caption-2 opacity-90">{scanResult.message}</div>
                  </div>
                </div>
                <Badge tone={scanResult.valid ? 'success' : 'danger'}>
                  {scanResult.checkpoint}
                </Badge>
              </div>
            )}
          </Card>

          {/* Digital Credential Registry Table */}
          <div className="space-y-12">
            <h3 className="heading-3">Enrolled Digital Credentials</h3>
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--se-border)] bg-[var(--se-bg-elevated)]">
                      <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Card UUID</th>
                      <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Student</th>
                      <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Department</th>
                      <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Blood Group</th>
                      <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Access Entitlements</th>
                      <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Validity</th>
                      <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--se-border)]">
                    {digitalIds.map((did) => (
                      <tr key={did.id} className="hover:bg-[var(--se-bg-hover)] transition-colors">
                        <td className="py-16 px-16 font-mono text-xs text-brand-teal">
                          {did.cardUuid}
                        </td>
                        <td className="py-16 px-16">
                          <div className="font-semibold">{did.studentName}</div>
                          <div className="caption-3 font-mono text-[var(--se-text-muted)]">{did.studentNumber}</div>
                        </td>
                        <td className="py-16 px-16 body-6">{did.department}</td>
                        <td className="py-16 px-16">
                          <Badge tone="danger">{did.bloodGroup}</Badge>
                        </td>
                        <td className="py-16 px-16">
                          <div className="flex flex-wrap gap-4">
                            {did.canAccessGate && <Badge tone="neutral">Gate</Badge>}
                            {did.canAccessLibrary && <Badge tone="neutral">Library</Badge>}
                            {did.canAccessLabs && <Badge tone="neutral">Labs</Badge>}
                          </div>
                        </td>
                        <td className="py-16 px-16 caption-3 text-[var(--se-text-muted)]">
                          Until {did.expiresAt}
                        </td>
                        <td className="py-16 px-16">
                          <Badge tone="success">{did.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Review & Cryptographic Seal Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-16">
          <Card className="w-full max-w-xl p-24 space-y-20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--se-border)] pb-12">
              <div>
                <span className="font-mono text-brand-teal caption-1 font-semibold">{selectedRequest.trackingNumber}</span>
                <h3 className="heading-3 mt-2">{selectedRequest.requestLabel}</h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-[var(--se-text-muted)] hover:text-[var(--se-text-primary)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-16">
              <div className="p-16 rounded-xl bg-[var(--se-bg-elevated)] space-y-8">
                <div className="flex items-center justify-between">
                  <span className="caption-3 text-[var(--se-text-secondary)]">Applicant:</span>
                  <span className="font-semibold">{selectedRequest.studentName} ({selectedRequest.studentNumber})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="caption-3 text-[var(--se-text-secondary)]">Program:</span>
                  <span>{selectedRequest.program}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="caption-3 text-[var(--se-text-secondary)]">Purpose:</span>
                  <span className="caption-2 font-medium">{selectedRequest.purpose}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="caption-3 text-[var(--se-text-secondary)]">Processing Fee:</span>
                  <Badge tone="success">${selectedRequest.feeAmount.toFixed(2)} Paid</Badge>
                </div>
              </div>

              {selectedRequest.adminRemarks && (
                <div className="p-12 rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-card)]">
                  <span className="caption-3 font-semibold text-[var(--se-text-secondary)] block mb-4">Official Remarks:</span>
                  <p className="caption-2 text-[var(--se-text-primary)]">{selectedRequest.adminRemarks}</p>
                </div>
              )}

              <div className="p-12 rounded-lg bg-[var(--se-bg-elevated)] caption-3 text-[var(--se-text-secondary)] flex items-start gap-8">
                <ShieldCheck size={20} className="text-brand-teal shrink-0 mt-2" />
                <div>
                  <span className="font-semibold text-[var(--se-text-primary)]">Registrar Verification Seal: </span>
                  Approving this request embeds an immutable cryptographic watermark with institution ID and generates a signed PDF copy available in the student portal.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-16 border-t border-[var(--se-border)]">
              <Button variant="secondary" size="sm" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>

              <div className="flex items-center gap-8">
                <Button variant="secondary" size="sm">
                  <DownloadSimple size={16} className="mr-6" />
                  Preview Draft PDF
                </Button>
                {selectedRequest.status !== 'COMPLETED' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isSealing}
                    onClick={() => handleSealAndApprove(selectedRequest.id)}
                  >
                    <SealCheck size={16} className="mr-6" />
                    {isSealing ? 'Sealing...' : 'Apply Seal & Approve'}
                  </Button>
                ) : (
                  <Badge tone="success">
                    <CheckCircle size={14} className="mr-4 inline" />
                    Sealed & Approved
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
