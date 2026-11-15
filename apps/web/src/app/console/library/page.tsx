'use client';

import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Bookmarks,
  CheckCircle,
  DownloadSimple,
  MagnifyingGlass,
  Plus,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

interface CatalogBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  coverUrl?: string;
  ebookUrl?: string;
  borrowerCount: number;
}

export default function CentralLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<CatalogBook | null>(null);
  const [studentIdInput, setStudentIdInput] = useState('2024-CSE-0042');
  const [loanDays, setLoanDays] = useState(14);
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [books, setBooks] = useState<CatalogBook[]>([
    {
      id: '00000000-0000-0000-0007-000000000001',
      isbn: '978-0262046305',
      title: 'Introduction to Algorithms, 4th Edition',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
      category: 'COMPUTER_SCIENCE',
      shelfLocation: 'CS-B4-S2',
      totalCopies: 12,
      availableCopies: 11,
      coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=400&q=80',
      borrowerCount: 1,
    },
    {
      id: '00000000-0000-0000-0007-000000000002',
      isbn: '978-0128182000',
      title: 'Computer Networks: A Systems Approach',
      author: 'Larry L. Peterson, Bruce S. Davie',
      category: 'NETWORKING',
      shelfLocation: 'CS-B2-S1',
      totalCopies: 8,
      availableCopies: 7,
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      borrowerCount: 1,
    },
    {
      id: '00000000-0000-0000-0007-000000000003',
      isbn: '978-0134494166',
      title: 'Clean Architecture: A Craftsman Guide to Software Structure and Design',
      author: 'Robert C. Martin',
      category: 'SOFTWARE_ENGINEERING',
      shelfLocation: 'CS-B5-S4',
      totalCopies: 15,
      availableCopies: 14,
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
      borrowerCount: 1,
    },
    {
      id: '00000000-0000-0000-0007-000000000004',
      isbn: '978-0262035613',
      title: 'Deep Learning (Adaptive Computation and Machine Learning)',
      author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
      category: 'ARTIFICIAL_INTELLIGENCE',
      shelfLocation: 'AI-B1-S3',
      totalCopies: 6,
      availableCopies: 6,
      coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80',
      borrowerCount: 0,
    },
    {
      id: '00000000-0000-0000-0007-000000000005',
      isbn: '978-0078022159',
      title: 'Database System Concepts, 7th Edition [Digital E-Book]',
      author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
      category: 'DATABASE',
      shelfLocation: 'DIGITAL-REPOSITORY',
      totalCopies: 999,
      availableCopies: 999,
      ebookUrl: 'https://library.smartedu.edu/ebooks/db-concepts-7e.pdf',
      borrowerCount: 42,
    },
  ]);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
      const matchSearch =
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [books, selectedCategory, searchQuery]);

  const handleIssueBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === selectedBook.id
            ? {
                ...b,
                availableCopies: Math.max(0, b.availableCopies - 1),
                borrowerCount: b.borrowerCount + 1,
              }
            : b,
        ),
      );
      setIsSubmitting(false);
      setIssueModalOpen(false);
      setToastMessage(
        `Issued "${selectedBook.title}" to student ${studentIdInput} (Due in ${loanDays} days)`,
      );
      setTimeout(() => setToastMessage(''), 5000);
    }, 600);
  };

  const handleReturnQuick = (book: CatalogBook) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === book.id
          ? {
              ...b,
              availableCopies: Math.min(b.totalCopies, b.availableCopies + 1),
              borrowerCount: Math.max(0, b.borrowerCount - 1),
            }
          : b,
      ),
    );
    setToastMessage(`Returned volume for "${book.title}". Available copies incremented.`);
    setTimeout(() => setToastMessage(''), 5000);
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
            <h1 className="text-2xl font-semibold tracking-tight">Central Library & Circulation</h1>
            <Badge tone="info" className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              SCR-WEB-701
            </Badge>
          </div>
          <p className="mt-4 text-sm text-[var(--se-text-secondary)]">
            Manage university catalog inventory, circulation desk loans, overdue fines, and e-book repositories.
          </p>
        </div>
        <div className="flex items-center gap-12">
          <Button
            onClick={() => {
              if (filteredBooks.length > 0) {
                setSelectedBook(filteredBooks[0] ?? null);
                setIssueModalOpen(true);
              }
            }}
            className="flex items-center gap-8"
          >
            <Plus size={16} weight="bold" />
            <span>Quick Issue Book</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Catalog Volumes
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">14,250</span>
            <span className="text-xs text-cyan-400 font-medium">99.4% RFID Tagged</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">5 major academic classifications</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Active Loans
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
              <Bookmarks size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">1,840</span>
            <span className="text-xs text-blue-400 font-medium">14-Day Cycle</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Borrowed by faculty & students</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Overdue Items
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <WarningCircle size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">42</span>
            <span className="text-xs text-amber-400 font-medium">$210 Fines Assessed</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">$0.50 daily rate past maturity</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Digital E-Books
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <DownloadSimple size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">3,200</span>
            <span className="text-xs text-emerald-400 font-medium">Zero-Wait Access</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Synced to university CDN</p>
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
              placeholder="Search ISBN, title, author, shelf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-36"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-8">
            {[
              { id: 'ALL', label: 'All Catalog' },
              { id: 'COMPUTER_SCIENCE', label: 'Computer Science' },
              { id: 'NETWORKING', label: 'Networking' },
              { id: 'SOFTWARE_ENGINEERING', label: 'Software Eng' },
              { id: 'ARTIFICIAL_INTELLIGENCE', label: 'AI & Data' },
              { id: 'DATABASE', label: 'Databases' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-[var(--se-radius-md)] px-12 py-6 text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-[var(--se-text-secondary)] hover:text-white bg-[var(--se-bg-subtle)] border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Catalog Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--se-border)] bg-[var(--se-bg-subtle)] text-xs text-[var(--se-text-secondary)]">
              <tr>
                <th className="py-12 px-16">Book Details</th>
                <th className="py-12 px-16">ISBN</th>
                <th className="py-12 px-16">Category</th>
                <th className="py-12 px-16">Shelf / Repository</th>
                <th className="py-12 px-16">Availability</th>
                <th className="py-12 px-16 text-right">Circulation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--se-border)]">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-[var(--se-bg-subtle)]/50 transition-colors">
                  <td className="py-14 px-16">
                    <div className="flex items-center gap-12">
                      <div className="h-44 w-32 shrink-0 overflow-hidden rounded-[var(--se-radius-sm)] border border-[var(--se-border)] bg-neutral-800">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-500">
                            <BookOpen size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--se-text-primary)]">
                          {book.title}
                        </div>
                        <div className="text-xs text-[var(--se-text-secondary)]">{book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-14 px-16 font-mono text-xs text-[var(--se-text-secondary)]">
                    {book.isbn}
                  </td>
                  <td className="py-14 px-16">
                    <Badge tone="neutral" className="border border-neutral-700 text-xs">
                      {book.category.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="py-14 px-16 font-mono text-xs text-cyan-400">
                    {book.shelfLocation}
                  </td>
                  <td className="py-14 px-16">
                    <div className="flex items-center gap-8">
                      <span className="font-semibold text-[var(--se-text-primary)]">
                        {book.availableCopies}
                      </span>
                      <span className="text-xs text-[var(--se-text-secondary)]">
                        / {book.totalCopies} copies
                      </span>
                      {book.availableCopies > 0 ? (
                        <span className="inline-block h-6 w-6 rounded-full bg-emerald-400" />
                      ) : (
                        <span className="inline-block h-6 w-6 rounded-full bg-rose-400" />
                      )}
                    </div>
                  </td>
                  <td className="py-14 px-16 text-right">
                    <div className="flex items-center justify-end gap-8">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={book.availableCopies <= 0}
                        onClick={() => {
                          setSelectedBook(book);
                          setIssueModalOpen(true);
                        }}
                      >
                        Issue
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReturnQuick(book)}
                        title="Return volume"
                      >
                        Return
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Circulation Issue Modal */}
      {issueModalOpen && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-16 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[var(--se-radius-lg)] border border-[var(--se-border)] bg-[var(--se-bg-surface)] p-24 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--se-border)] pb-16">
              <div>
                <h3 className="font-semibold text-lg text-[var(--se-text-primary)]">
                  Issue Library Volume
                </h3>
                <p className="text-xs text-[var(--se-text-secondary)] mt-2">
                  Verify student credential and allocate 14-day loan window
                </p>
              </div>
              <button
                onClick={() => setIssueModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleIssueBook} className="mt-16 space-y-16">
              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                  Target Book
                </label>
                <div className="mt-4 rounded-[var(--se-radius-md)] border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-12 text-sm font-medium">
                  {selectedBook.title}
                  <div className="text-xs text-neutral-400 font-mono mt-2">
                    ISBN: {selectedBook.isbn} • Shelf: {selectedBook.shelfLocation}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                  Student University ID
                </label>
                <Input
                  type="text"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="e.g. 2024-CSE-0042"
                  required
                  className="mt-4"
                />
                <span className="text-[11px] text-emerald-400 mt-2 block">
                  ✓ Verified: Rafiq Hasan (CSE, Batch 2024, Status: Active)
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                  Borrowing Period (Days)
                </label>
                <div className="mt-4 flex gap-8">
                  {[7, 14, 21].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setLoanDays(days)}
                      className={`flex-1 rounded-[var(--se-radius-md)] border py-8 text-xs font-medium transition-colors ${
                        loanDays === days
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                          : 'border-[var(--se-border)] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[var(--se-radius-md)] border border-amber-500/20 bg-amber-500/5 p-12 text-xs text-amber-300">
                Overdue policy: Standard $0.50 assessed per overdue day past return deadline.
              </div>

              <div className="flex items-center justify-end gap-12 pt-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIssueModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Issuing...' : 'Confirm Loan Issue'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
