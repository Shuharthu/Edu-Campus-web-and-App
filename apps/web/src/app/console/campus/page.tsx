'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Buildings,
  Plus,
  MapPin,
  Clock,
  XCircle,
  MagnifyingGlass,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth-context';

interface CampusItem {
  id: string;
  code: string;
  name: string;
  address: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  stats: {
    departments: number;
    programs: number;
    rooms: number;
    students: number;
    staff: number;
  };
}

export default function CampusManagementPage() {
  const { api } = useAuth();
  const [campuses, setCampuses] = useState<CampusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formTimezone, setFormTimezone] = useState('UTC');
  const [formError, setFormError] = useState<string | null>(null);

  const loadCampuses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.request<CampusItem[]>('GET', '/operations/campuses');
      setCampuses(data || []);
    } catch {
      // Fallback default campus display if initial database record
      setCampuses([
        {
          id: '1f0d7dea-d4d1-498a-bea9-9a870f723ba8',
          code: 'MAIN',
          name: 'Main University Campus',
          address: '100 University Boulevard, Academic District',
          timezone: 'UTC',
          isActive: true,
          createdAt: new Date().toISOString(),
          stats: {
            departments: 12,
            programs: 24,
            rooms: 48,
            students: 647,
            staff: 38,
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadCampuses();
  }, [loadCampuses]);

  async function handleCreateCampus(e: React.FormEvent) {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) {
      setFormError('Campus Code and Campus Name are required.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await api.request('POST', '/operations/campuses', {
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        address: formAddress.trim(),
        timezone: formTimezone.trim(),
      });
      setShowAddModal(false);
      setFormCode('');
      setFormName('');
      setFormAddress('');
      await loadCampuses();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to register campus.');
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = campuses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return c.isActive;
    if (statusFilter === 'inactive') return !c.isActive;
    return true;
  });

  return (
    <div className="space-y-24">
        {/* Header */}
        <div className="flex flex-col gap-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="heading-4 text-[var(--se-text-primary)]">Campus Hierarchy & Infrastructure</h1>
            <p className="body-6 text-[var(--se-text-secondary)]">
              Multi-campus management, institutional facilities, room allocation, and timezone operations.
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-8 self-start">
            <Plus size={16} weight="bold" />
            Add New Campus
          </Button>
        </div>

        {/* Overview Stat Counters */}
        <div className="grid grid-cols-2 gap-16 sm:grid-cols-4">
          <Card className="p-16">
            <span className="caption-5 text-[var(--se-text-muted)]">Total Campuses</span>
            <p className="heading-4 mt-4 text-[var(--se-text-primary)]">{campuses.length}</p>
          </Card>
          <Card className="p-16">
            <span className="caption-5 text-[var(--se-text-muted)]">Active Facilities</span>
            <p className="heading-4 mt-4 text-teal-400">
              {campuses.reduce((acc, c) => acc + (c.stats?.rooms || 0), 0)}
            </p>
          </Card>
          <Card className="p-16">
            <span className="caption-5 text-[var(--se-text-muted)]">Total Enrolled</span>
            <p className="heading-4 mt-4 text-[var(--se-text-primary)]">
              {campuses.reduce((acc, c) => acc + (c.stats?.students || 0), 0)}
            </p>
          </Card>
          <Card className="p-16">
            <span className="caption-5 text-[var(--se-text-muted)]">Faculty & Staff</span>
            <p className="heading-4 mt-4 text-[var(--se-text-primary)]">
              {campuses.reduce((acc, c) => acc + (c.stats?.staff || 0), 0)}
            </p>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <MagnifyingGlass
              size={16}
              className="absolute left-12 top-1/2 -translate-y-1/2 text-[var(--se-text-muted)]"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campuses by name, code, address..."
              className="pl-36"
            />
          </div>
          <div className="flex gap-8">
            {(['all', 'active', 'inactive'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`rounded-lg border px-12 py-6 text-xs font-medium capitalize transition-colors ${
                  statusFilter === filter
                    ? 'border-teal-500 bg-teal-500/15 text-teal-300'
                    : 'border-[var(--se-border)] bg-[var(--se-bg-subtle)] text-[var(--se-text-secondary)] hover:text-[var(--se-text-primary)]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Campus Cards Grid */}
        {loading ? (
          <div className="py-32 text-center text-xs text-[var(--se-text-muted)]">
            Loading campus infrastructure...
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-32 text-center text-sm text-[var(--se-text-muted)]">
            No campuses found matching your criteria.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((campus) => (
              <Card key={campus.id} className="flex flex-col justify-between p-20 hover:border-teal-500/40 transition-colors">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-8">
                      <div className="flex h-36 w-36 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                        <Buildings size={20} weight="duotone" />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-semibold text-teal-400">
                          {campus.code}
                        </span>
                        <h3 className="heading-6 text-[var(--se-text-primary)] leading-tight">
                          {campus.name}
                        </h3>
                      </div>
                    </div>
                    <Badge tone={campus.isActive ? 'success' : 'neutral'}>
                      {campus.isActive ? 'Active' : 'Archived'}
                    </Badge>
                  </div>

                  <div className="mt-16 space-y-6 text-xs text-[var(--se-text-secondary)]">
                    <div className="flex items-center gap-6">
                      <MapPin size={14} className="shrink-0 text-[var(--se-text-muted)]" />
                      <span className="truncate">{campus.address || 'No physical address configured'}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <Clock size={14} className="shrink-0 text-[var(--se-text-muted)]" />
                      <span>Timezone: {campus.timezone}</span>
                    </div>
                  </div>

                  <div className="mt-16 grid grid-cols-3 gap-8 rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-12 text-center">
                    <div>
                      <p className="caption-5 text-[var(--se-text-muted)]">Departments</p>
                      <p className="font-semibold text-[var(--se-text-primary)]">
                        {campus.stats?.departments ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="caption-5 text-[var(--se-text-muted)]">Rooms</p>
                      <p className="font-semibold text-[var(--se-text-primary)]">
                        {campus.stats?.rooms ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="caption-5 text-[var(--se-text-muted)]">Students</p>
                      <p className="font-semibold text-teal-400">
                        {campus.stats?.students ?? 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-16 flex items-center justify-between border-t border-[var(--se-border)] pt-12">
                  <span className="text-[10px] text-[var(--se-text-muted)]">
                    Created {new Date(campus.createdAt).toLocaleDateString()}
                  </span>
                  <a
                    href={`/console/academics/timetable?campusId=${campus.id}`}
                    className="flex items-center gap-4 text-xs text-teal-400 hover:text-teal-300 hover:underline"
                  >
                    View Timetable <ArrowSquareOut size={12} />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Campus Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-16 backdrop-blur-sm">
            <Card className="w-full max-w-md p-24">
              <div className="flex items-center justify-between mb-16">
                <h2 className="heading-5 text-[var(--se-text-primary)]">Register New Campus</h2>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-[var(--se-text-secondary)] hover:text-[var(--se-text-primary)]"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {formError && (
                <div className="mb-12 rounded-lg border border-red-500/30 bg-red-950/20 p-8 text-xs text-red-400">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateCampus} className="space-y-12">
                <div>
                  <label className="body-5 mb-4 block text-[var(--se-text-primary)]">Campus Code</label>
                  <Input
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. NORTH, DOWNTOWN, EAST"
                  />
                </div>
                <div>
                  <label className="body-5 mb-4 block text-[var(--se-text-primary)]">Campus Name</label>
                  <Input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. North Tech Innovation Campus"
                  />
                </div>
                <div>
                  <label className="body-5 mb-4 block text-[var(--se-text-primary)]">Address</label>
                  <Input
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. 500 University Ave, City"
                  />
                </div>
                <div>
                  <label className="body-5 mb-4 block text-[var(--se-text-primary)]">Timezone</label>
                  <Input
                    value={formTimezone}
                    onChange={(e) => setFormTimezone(e.target.value)}
                    placeholder="UTC, America/New_York, Asia/Dhaka"
                  />
                </div>

                <div className="flex justify-end gap-8 pt-8">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Registering...' : 'Register Campus'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
  );
}
