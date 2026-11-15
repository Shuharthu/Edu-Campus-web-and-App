'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  CreditCard,
  CurrencyDollar,
  DownloadSimple,
  Eye,
  FileText,
  MagnifyingGlass,
  Receipt,
  SealCheck,
  Warning,
  X,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

interface InstallmentRow {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidAt?: string;
  transactionRef?: string;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  department: string;
  program: string;
  semester: string;
  grossAmount: number;
  scholarshipName?: string;
  scholarshipDeduction: number;
  netPayable: number;
  paidAmount: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  dueDate: string;
  installments: InstallmentRow[];
}

export default function FinanceInvoicingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  // Institutional Invoices Data matching live Supabase seed
  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2026-0042',
      studentId: 'st-042',
      studentNumber: '2024-CSE-0042',
      studentName: 'Rafiq Hasan',
      department: 'Computer Science & Engineering',
      program: 'B.Sc. in Computer Science & Engineering',
      semester: 'Fall 2026',
      grossAmount: 4050.0,
      scholarshipName: "Dean's Merit (25% Tuition Waiver)",
      scholarshipDeduction: 980.0,
      netPayable: 3070.0,
      paidAmount: 1023.34,
      status: 'PARTIAL',
      dueDate: '2027-01-15',
      installments: [
        {
          installmentNumber: 1,
          amount: 1023.34,
          dueDate: '2026-09-04',
          status: 'PAID',
          paidAt: '2026-09-04T14:32:00Z',
          transactionRef: 'ch_3MtwBwLkdIwHu7ix0B391z_test',
        },
        {
          installmentNumber: 2,
          amount: 1023.33,
          dueDate: '2026-11-15',
          status: 'PENDING',
        },
        {
          installmentNumber: 3,
          amount: 1023.33,
          dueDate: '2027-01-15',
          status: 'PENDING',
        },
      ],
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2026-0015',
      studentId: 'st-015',
      studentNumber: '2024-CSE-0015',
      studentName: 'Anika Rahman',
      department: 'Computer Science & Engineering',
      program: 'B.Sc. in Computer Science & Engineering',
      semester: 'Fall 2026',
      grossAmount: 4050.0,
      scholarshipName: "Vice Chancellor's Full Honor (100% Waiver)",
      scholarshipDeduction: 3000.0,
      netPayable: 1050.0,
      paidAmount: 1050.0,
      status: 'PAID',
      dueDate: '2027-01-15',
      installments: [
        {
          installmentNumber: 1,
          amount: 1050.0,
          dueDate: '2026-09-01',
          status: 'PAID',
          paidAt: '2026-09-01T10:15:00Z',
          transactionRef: 'ch_3N8xKaLkdIwHu7ix1C492y_test',
        },
      ],
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-2026-0021',
      studentId: 'st-021',
      studentNumber: '2024-CSE-0021',
      studentName: 'Samiul Haque',
      department: 'Computer Science & Engineering',
      program: 'B.Sc. in Computer Science & Engineering',
      semester: 'Fall 2026',
      grossAmount: 4050.0,
      scholarshipDeduction: 0,
      netPayable: 4050.0,
      paidAmount: 1350.0,
      status: 'PARTIAL',
      dueDate: '2027-01-15',
      installments: [
        {
          installmentNumber: 1,
          amount: 1350.0,
          dueDate: '2026-09-05',
          status: 'PAID',
          paidAt: '2026-09-05T16:20:00Z',
          transactionRef: 'ch_3O9yLbLkdIwHu7ix2D593z_test',
        },
        {
          installmentNumber: 2,
          amount: 1350.0,
          dueDate: '2026-11-15',
          status: 'PENDING',
        },
        {
          installmentNumber: 3,
          amount: 1350.0,
          dueDate: '2027-01-15',
          status: 'PENDING',
        },
      ],
    },
    {
      id: 'inv-004',
      invoiceNumber: 'INV-2026-0089',
      studentId: 'st-089',
      studentNumber: '2023-EEE-0012',
      studentName: 'Farhan Kabir',
      department: 'Electrical & Electronic Engineering',
      program: 'B.Sc. in Electrical Engineering',
      semester: 'Fall 2026',
      grossAmount: 4250.0,
      scholarshipDeduction: 0,
      netPayable: 4250.0,
      paidAmount: 0,
      status: 'OVERDUE',
      dueDate: '2026-10-31',
      installments: [
        {
          installmentNumber: 1,
          amount: 2125.0,
          dueDate: '2026-10-31',
          status: 'OVERDUE',
        },
        {
          installmentNumber: 2,
          amount: 2125.0,
          dueDate: '2027-01-15',
          status: 'PENDING',
        },
      ],
    },
  ]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const handleSimulatePayment = (instNumber: number) => {
    if (!selectedInvoice) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      const updatedInstallments = selectedInvoice.installments.map((inst) =>
        inst.installmentNumber === instNumber
          ? {
              ...inst,
              status: 'PAID' as const,
              paidAt: new Date().toISOString(),
              transactionRef: `ch_stripe_${Date.now().toString().slice(-8)}`,
            }
          : inst,
      );

      const newPaidTotal = updatedInstallments
        .filter((i) => i.status === 'PAID')
        .reduce((sum, i) => sum + i.amount, 0);

      const newStatus =
        newPaidTotal >= selectedInvoice.netPayable
          ? ('PAID' as const)
          : ('PARTIAL' as const);

      const updatedInvoice: InvoiceItem = {
        ...selectedInvoice,
        installments: updatedInstallments,
        paidAmount: Math.round(newPaidTotal * 100) / 100,
        status: newStatus,
      };

      setSelectedInvoice(updatedInvoice);
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)),
      );
      setPaymentSuccessMsg(`Payment of $${selectedInvoice.installments.find(i => i.installmentNumber === instNumber)?.amount.toFixed(2)} processed via Stripe!`);
      setTimeout(() => setPaymentSuccessMsg(''), 4000);
    }, 700);
  };

  return (
    <div className="space-y-24 p-24 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-8">
            <span className="flex h-32 w-32 items-center justify-center rounded-lg bg-[var(--se-brand-teal-light,rgba(13,148,136,0.1))] text-brand-teal">
              <CurrencyDollar size={20} weight="bold" />
            </span>
            <h1 className="heading-2">Institutional Finance & Invoicing</h1>
          </div>
          <p className="body-5 text-[var(--se-text-secondary)] mt-4">
            Manage semester tuition schedules, multi-tier installment plans, Stripe collections, and aging receivables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-12">
          <Link href="/console/finance/scholarships">
            <Button variant="secondary" size="sm">
              <SealCheck size={16} className="mr-8" />
              Scholarships & Waivers
            </Button>
          </Link>
          <Button variant="primary" size="sm">
            <DownloadSimple size={16} className="mr-8" />
            Export Ledger CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Total Billed (Fall 2026)</span>
            <span className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--se-bg-elevated)] text-[var(--se-text-secondary)]">
              <Receipt size={16} />
            </span>
          </div>
          <div className="heading-1 mt-12">$1,428,250</div>
          <div className="flex items-center gap-6 mt-8">
            <Badge tone="info">386 Students</Badge>
            <span className="caption-3 text-[var(--se-text-muted)]">Across 4 departments</span>
          </div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Total Collected</span>
            <span className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--se-success-bg)] text-[var(--se-success-text)]">
              <CheckCircle size={16} />
            </span>
          </div>
          <div className="heading-1 mt-12 text-[var(--se-success-text)]">$1,085,470</div>
          <div className="flex items-center gap-6 mt-8">
            <Badge tone="success">76.0% Rate</Badge>
            <span className="caption-3 text-[var(--se-text-muted)]">Target: 75% by Midterm</span>
          </div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Outstanding Receivables</span>
            <span className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--se-warning-bg)] text-[var(--se-warning-text)]">
              <Clock size={16} />
            </span>
          </div>
          <div className="heading-1 mt-12">$342,780</div>
          <div className="flex items-center gap-6 mt-8">
            <Badge tone="warning">94 Active Plans</Badge>
            <span className="caption-3 text-[var(--se-text-muted)]">Installment 2 & 3</span>
          </div>
        </Card>

        <Card className="p-20">
          <div className="flex items-center justify-between">
            <span className="caption-3 text-[var(--se-text-secondary)]">Aging Distribution</span>
            <span className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--se-danger-bg)] text-[var(--se-danger-text)]">
              <Warning size={16} />
            </span>
          </div>
          <div className="space-y-6 mt-12">
            <div className="flex items-center justify-between caption-3">
              <span className="text-[var(--se-text-secondary)]">&lt; 30 Days (Current):</span>
              <span className="font-semibold">$222,800</span>
            </div>
            <div className="flex items-center justify-between caption-3">
              <span className="text-[var(--se-warning-text)]">31-60 Days (Warning):</span>
              <span className="font-semibold text-[var(--se-warning-text)]">$85,680</span>
            </div>
            <div className="flex items-center justify-between caption-3">
              <span className="text-[var(--se-danger-text)]">&gt; 60 Days (Overdue):</span>
              <span className="font-semibold text-[var(--se-danger-text)]">$34,300</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-16">
        <div className="flex flex-col gap-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass
              size={18}
              className="absolute left-12 top-1/2 -translate-y-1/2 text-[var(--se-text-muted)]"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, ID (e.g. 2024-CSE-0042) or invoice #..."
              className="pl-40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-8">
            {(['ALL', 'PARTIAL', 'PAID', 'OVERDUE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`caption-2 px-12 py-6 rounded-lg transition-colors duration-200 ${
                  statusFilter === st
                    ? 'bg-brand-teal text-brand-ink font-semibold'
                    : 'bg-[var(--se-bg-elevated)] text-[var(--se-text-secondary)] hover:bg-[var(--se-bg-hover)]'
                }`}
              >
                {st === 'ALL' ? 'All Invoices' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--se-border)] bg-[var(--se-bg-elevated)]">
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Invoice #</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Student</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Program & Semester</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Net Payable</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Paid Amount</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Outstanding</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)]">Status</th>
                <th className="py-12 px-16 caption-2 font-semibold text-[var(--se-text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--se-border)]">
              {filteredInvoices.map((inv) => {
                const balanceDue = inv.netPayable - inv.paidAmount;
                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-[var(--se-bg-hover)] transition-colors duration-150 cursor-pointer"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td className="py-16 px-16">
                      <span className="font-mono font-semibold text-brand-teal">{inv.invoiceNumber}</span>
                      <div className="caption-3 text-[var(--se-text-muted)]">Due {inv.dueDate}</div>
                    </td>
                    <td className="py-16 px-16">
                      <div className="font-semibold">{inv.studentName}</div>
                      <div className="caption-3 font-mono text-[var(--se-text-muted)]">{inv.studentNumber}</div>
                    </td>
                    <td className="py-16 px-16">
                      <div className="body-6">{inv.department}</div>
                      <div className="caption-3 text-[var(--se-text-secondary)]">{inv.semester}</div>
                    </td>
                    <td className="py-16 px-16">
                      <div className="font-semibold">${inv.netPayable.toFixed(2)}</div>
                      {inv.scholarshipDeduction > 0 && (
                        <div className="caption-3 text-[var(--se-success-text)]">
                          -${inv.scholarshipDeduction.toFixed(2)} waiver
                        </div>
                      )}
                    </td>
                    <td className="py-16 px-16">
                      <div className="text-[var(--se-success-text)] font-semibold">${inv.paidAmount.toFixed(2)}</div>
                      <div className="caption-3 text-[var(--se-text-muted)]">
                        {Math.round((inv.paidAmount / inv.netPayable) * 100)}% cleared
                      </div>
                    </td>
                    <td className="py-16 px-16">
                      <div className={`font-semibold ${balanceDue > 0 ? 'text-[var(--se-warning-text)]' : 'text-[var(--se-text-muted)]'}`}>
                        ${balanceDue.toFixed(2)}
                      </div>
                      <div className="caption-3 text-[var(--se-text-muted)]">
                        {inv.installments.filter((i) => i.status !== 'PAID').length} due
                      </div>
                    </td>
                    <td className="py-16 px-16">
                      <Badge
                        tone={
                          inv.status === 'PAID'
                            ? 'success'
                            : inv.status === 'PARTIAL'
                            ? 'info'
                            : inv.status === 'OVERDUE'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-16 px-16 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvoice(inv);
                        }}
                      >
                        <Eye size={16} className="mr-6" />
                        Inspect Schedule
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Slide-Over Breakdown Drawer */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl bg-[var(--se-bg-card)] border-l border-[var(--se-border)] h-full overflow-y-auto p-24 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-24">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[var(--se-border)] pb-16">
                <div>
                  <div className="flex items-center gap-8">
                    <span className="font-mono text-brand-teal heading-3">{selectedInvoice.invoiceNumber}</span>
                    <Badge
                      tone={
                        selectedInvoice.status === 'PAID'
                          ? 'success'
                          : selectedInvoice.status === 'PARTIAL'
                          ? 'info'
                          : 'warning'
                      }
                    >
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                  <div className="body-6 text-[var(--se-text-secondary)] mt-2">
                    Tuition & Installment Ledger • {selectedInvoice.semester}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="rounded-lg p-8 text-[var(--se-text-muted)] hover:bg-[var(--se-bg-hover)]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Toast Message */}
              {paymentSuccessMsg && (
                <div className="p-12 rounded-lg bg-[var(--se-success-bg)] text-[var(--se-success-text)] caption-2 flex items-center gap-8">
                  <CheckCircle size={18} weight="bold" />
                  {paymentSuccessMsg}
                </div>
              )}

              {/* Student Information */}
              <Card className="p-16 bg-[var(--se-bg-elevated)] border-none">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold body-4">{selectedInvoice.studentName}</div>
                    <div className="font-mono caption-3 text-[var(--se-text-secondary)]">
                      Student ID: {selectedInvoice.studentNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="caption-3 text-[var(--se-text-secondary)]">Program</div>
                    <div className="caption-2 font-semibold">{selectedInvoice.program}</div>
                  </div>
                </div>
              </Card>

              {/* Tuition & Fee Breakdown */}
              <div className="space-y-12">
                <h3 className="caption-1 font-semibold text-[var(--se-text-primary)]">Itemized Fee Schedule</h3>
                <div className="rounded-xl border border-[var(--se-border)] divide-y divide-[var(--se-border)] overflow-hidden">
                  <div className="flex items-center justify-between p-12 text-sm">
                    <span className="text-[var(--se-text-secondary)]">Tuition (15 Credits @ $200.00 / credit)</span>
                    <span className="font-mono font-semibold">$3,000.00</span>
                  </div>
                  <div className="flex items-center justify-between p-12 text-sm">
                    <span className="text-[var(--se-text-secondary)]">Lab & Computing Facility Fee</span>
                    <span className="font-mono font-semibold">$650.00</span>
                  </div>
                  <div className="flex items-center justify-between p-12 text-sm">
                    <span className="text-[var(--se-text-secondary)]">Library & Digital Resources Fee</span>
                    <span className="font-mono font-semibold">$250.00</span>
                  </div>
                  <div className="flex items-center justify-between p-12 text-sm">
                    <span className="text-[var(--se-text-secondary)]">Student Activity & Sports Fund</span>
                    <span className="font-mono font-semibold">$150.00</span>
                  </div>
                  <div className="flex items-center justify-between p-12 text-sm bg-[var(--se-bg-elevated)]">
                    <span className="font-semibold">Gross Total</span>
                    <span className="font-mono font-semibold">${selectedInvoice.grossAmount.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.scholarshipDeduction > 0 && (
                    <div className="flex items-center justify-between p-12 text-sm bg-[var(--se-success-bg)] text-[var(--se-success-text)]">
                      <span className="font-semibold flex items-center gap-6">
                        <SealCheck size={16} />
                        {selectedInvoice.scholarshipName || 'Scholarship Waiver'}
                      </span>
                      <span className="font-mono font-semibold">-${selectedInvoice.scholarshipDeduction.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-12 text-base font-bold bg-[var(--se-bg-elevated)]">
                    <span>Net Payable Amount</span>
                    <span className="font-mono text-brand-teal">${selectedInvoice.netPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Installment Schedule (3 Installments) */}
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h3 className="caption-1 font-semibold text-[var(--se-text-primary)]">3-Tier Installment Schedule</h3>
                  <span className="caption-3 text-[var(--se-text-muted)]">Automatic 30-day split</span>
                </div>

                <div className="space-y-8">
                  {selectedInvoice.installments.map((inst) => {
                    const isPaid = inst.status === 'PAID';
                    return (
                      <div
                        key={inst.installmentNumber}
                        className={`p-16 rounded-xl border transition-all ${
                          isPaid
                            ? 'border-[var(--se-success-border,rgba(16,185,129,0.3))] bg-[var(--se-success-bg)]'
                            : 'border-[var(--se-border)] bg-[var(--se-bg-card)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-12">
                            <span
                              className={`flex h-28 w-28 items-center justify-center rounded-full font-mono text-xs font-bold ${
                                isPaid
                                  ? 'bg-[var(--se-success-text)] text-white'
                                  : 'bg-[var(--se-bg-elevated)] text-[var(--se-text-secondary)]'
                              }`}
                            >
                              {inst.installmentNumber}
                            </span>
                            <div>
                              <div className="font-semibold body-5">Installment #{inst.installmentNumber}</div>
                              <div className="caption-3 text-[var(--se-text-secondary)]">
                                Due by: {inst.dueDate}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-mono font-bold body-4">${inst.amount.toFixed(2)}</div>
                            <Badge tone={isPaid ? 'success' : inst.status === 'OVERDUE' ? 'danger' : 'warning'}>
                              {inst.status}
                            </Badge>
                          </div>
                        </div>

                        {isPaid && inst.transactionRef && (
                          <div className="mt-8 pt-8 border-t border-[var(--se-success-border,rgba(16,185,129,0.2))] flex items-center justify-between caption-3 text-[var(--se-success-text)]">
                            <span>Paid via Stripe: {inst.transactionRef}</span>
                            <span>{new Date(inst.paidAt || '').toLocaleDateString()}</span>
                          </div>
                        )}

                        {!isPaid && (
                          <div className="mt-12 flex justify-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={isProcessingPayment}
                              onClick={() => handleSimulatePayment(inst.installmentNumber)}
                            >
                              <CreditCard size={16} className="mr-6 text-brand-teal" />
                              {isProcessingPayment ? 'Processing...' : 'Record Stripe Payment'}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-24 border-t border-[var(--se-border)] flex items-center justify-between gap-12 mt-24">
              <Button variant="secondary" size="md" className="flex-1">
                <FileText size={18} className="mr-8" />
                Download PDF Receipt
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => setSelectedInvoice(null)}
              >
                Close Drawer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
