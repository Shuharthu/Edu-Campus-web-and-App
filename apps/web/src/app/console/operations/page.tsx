'use client';

import React, { useState } from 'react';
import {
  Buildings,
  Bus,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Plus,
  User,
  Wrench,
  X,
} from '@phosphor-icons/react';
import { Badge, Button, Card, Input } from '@/components/ui/primitives';

export default function CampusOperationsPage() {
  const [activeTab, setActiveTab] = useState<'HOSTEL' | 'TRANSIT' | 'MAINTENANCE'>('HOSTEL');
  const [toastMessage, setToastMessage] = useState('');

  // Maintenance ticket form
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState('HVAC');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('HIGH');

  // Sample data synced with seeded DB
  const [hostelRooms] = useState([
    {
      id: '00000000-0000-0000-0007-000000000021',
      buildingName: 'Shahidullah Hall (Boys)',
      roomNumber: '302',
      capacity: 3,
      occupied: 2,
      feePerSemester: 450,
      residents: [
        { name: 'Rafiq Hasan', id: '2024-CSE-0042', bed: 'Bed A' },
        { name: 'Tanvir Ahmed', id: '2024-CSE-0019', bed: 'Bed B' },
      ],
    },
    {
      id: '00000000-0000-0000-0007-000000000022',
      buildingName: 'Begum Rokeya Hall (Girls)',
      roomNumber: '204',
      capacity: 2,
      occupied: 1,
      feePerSemester: 500,
      residents: [{ name: 'Nusrat Jahan', id: '2024-EEE-0012', bed: 'Bed A' }],
    },
    {
      id: '00000000-0000-0000-0007-000000000023',
      buildingName: 'Shahidullah Hall (Boys)',
      roomNumber: '303',
      capacity: 3,
      occupied: 3,
      feePerSemester: 450,
      residents: [
        { name: 'Sabbir Rahman', id: '2023-CSE-0081', bed: 'Bed A' },
        { name: 'Kazi Mahbub', id: '2023-CSE-0082', bed: 'Bed B' },
        { name: 'Zubair Hossain', id: '2023-ME-0011', bed: 'Bed C' },
      ],
    },
  ]);

  const [transportRoutes] = useState([
    {
      id: '00000000-0000-0000-0007-000000000041',
      routeName: 'Uttara - Campus Express',
      routeNumber: 'R-01',
      departureTime: '07:30 AM',
      vehicleNumber: 'DHK-METRO-BA-11-2345',
      driverName: 'Kabir Hossain',
      driverPhone: '+8801711223344',
      currentStop: 'Farmgate Junction (In Transit)',
      activeStatus: 'ON_SCHEDULE',
      stops: ['Uttara Sector 7', 'Airport', 'Mohakhali', 'Farmgate', 'Main Campus'],
    },
    {
      id: '00000000-0000-0000-0007-000000000042',
      routeName: 'Dhanmondi - Campus Shuttle',
      routeNumber: 'R-02',
      departureTime: '08:00 AM',
      vehicleNumber: 'DHK-METRO-BA-11-5678',
      driverName: 'Monirul Islam',
      driverPhone: '+8801811334455',
      currentStop: 'Dhanmondi 27 (Boarding)',
      activeStatus: 'ON_SCHEDULE',
      stops: ['Dhanmondi 27', 'Kalabagan', 'Science Lab', 'Shahbag', 'Main Campus'],
    },
    {
      id: '00000000-0000-0000-0007-000000000043',
      routeName: 'Mirpur - Campus Rapid',
      routeNumber: 'R-03',
      departureTime: '07:45 AM',
      vehicleNumber: 'DHK-METRO-BA-11-9012',
      driverName: 'Abdul Gafur',
      driverPhone: '+8801911445566',
      currentStop: 'Mirpur 10 (Departed)',
      activeStatus: 'DELAYED',
      stops: ['Mirpur 12', 'Mirpur 10', 'Kazipara', 'Agargaon', 'Main Campus'],
    },
  ]);

  const [tickets, setTickets] = useState([
    {
      id: '00000000-0000-0000-0007-000000000051',
      location: 'Hardware Lab 4B',
      category: 'HVAC',
      description: 'Central AC unit is blowing ambient air; ambient temperature exceeds 31C affecting GPU workstations.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'Kamal Uddin (Senior HVAC Tech)',
      createdAt: '2 hours ago',
    },
    {
      id: '00000000-0000-0000-0007-000000000052',
      location: 'Auditorium Hall C',
      category: 'AV_SYSTEM',
      description: 'Main laser projector lamp flickering intermittently during CSE departmental seminars.',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedTo: 'Unassigned',
      createdAt: '4 hours ago',
    },
    {
      id: '00000000-0000-0000-0007-000000000053',
      location: 'Shahidullah Hall Room 302',
      category: 'PLUMBING',
      description: 'Washroom faucet cartridge leak repaired and sealed with high-pressure Teflon valve.',
      priority: 'LOW',
      status: 'RESOLVED',
      assignedTo: 'Babul Mia (Plumber)',
      createdAt: 'Yesterday',
    },
  ]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newT = {
      id: `ticket-${Date.now()}`,
      location: newLocation,
      category: newCategory,
      description: newDescription,
      priority: newPriority,
      status: 'OPEN',
      assignedTo: 'Unassigned',
      createdAt: 'Just now',
    };
    setTickets([newT, ...tickets]);
    setTicketModalOpen(false);
    setToastMessage(`Created maintenance ticket for ${newLocation}`);
    setTimeout(() => setToastMessage(''), 5000);
    setNewLocation('');
    setNewDescription('');
  };

  const handleResolveTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'RESOLVED', assignedTo: 'Kamal Uddin (Completed)' } : t,
      ),
    );
    setToastMessage('Ticket resolved and audit entry recorded.');
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
            <h1 className="text-2xl font-semibold tracking-tight">Campus Operations & Facilities</h1>
            <Badge tone="warning" className="border border-amber-500/30 bg-amber-500/10 text-amber-400">
              SCR-WEB-702
            </Badge>
          </div>
          <p className="mt-4 text-sm text-[var(--se-text-secondary)]">
            Manage student dormitory allocations, transit route telemetry, and campus facility maintenance.
          </p>
        </div>
        <div className="flex items-center gap-12">
          <Button
            onClick={() => setTicketModalOpen(true)}
            className="flex items-center gap-8"
          >
            <Plus size={16} weight="bold" />
            <span>Create Maintenance Ticket</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Hostel Occupancy
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
              <Buildings size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">75.0%</span>
            <span className="text-xs text-blue-400 font-medium">6 / 8 Beds</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">2 Residence Halls (Boys & Girls)</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Transit Routes
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <Bus size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">3 Active</span>
            <span className="text-xs text-emerald-400 font-medium">2 On Schedule</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">152 Total Seated Capacity</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Open Maintenance
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <Wrench size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">2 Tickets</span>
            <span className="text-xs text-amber-400 font-medium">1 High Priority</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Avg resolution: 4.2 hours</p>
        </Card>

        <Card className="p-16">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
              Facility Health
            </span>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="mt-12 flex items-baseline gap-8">
            <span className="text-2xl font-semibold">98.2%</span>
            <span className="text-xs text-cyan-400 font-medium">Optimal</span>
          </div>
          <p className="mt-4 text-xs text-[var(--se-text-secondary)]">Power & HVAC automated telemetry</p>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[var(--se-border)]">
        <button
          onClick={() => setActiveTab('HOSTEL')}
          className={`flex items-center gap-8 border-b-2 px-16 py-12 text-sm font-medium transition-colors ${
            activeTab === 'HOSTEL'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-[var(--se-text-secondary)] hover:text-white'
          }`}
        >
          <Buildings size={18} />
          <span>Hostel Allocations</span>
        </button>
        <button
          onClick={() => setActiveTab('TRANSIT')}
          className={`flex items-center gap-8 border-b-2 px-16 py-12 text-sm font-medium transition-colors ${
            activeTab === 'TRANSIT'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-[var(--se-text-secondary)] hover:text-white'
          }`}
        >
          <Bus size={18} />
          <span>Transit Fleet Tracker</span>
        </button>
        <button
          onClick={() => setActiveTab('MAINTENANCE')}
          className={`flex items-center gap-8 border-b-2 px-16 py-12 text-sm font-medium transition-colors ${
            activeTab === 'MAINTENANCE'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-[var(--se-text-secondary)] hover:text-white'
          }`}
        >
          <Wrench size={18} />
          <span>Maintenance Queue</span>
        </button>
      </div>

      {/* Tab 1: Hostel Allocations */}
      {activeTab === 'HOSTEL' && (
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3">
          {hostelRooms.map((room) => (
            <Card key={room.id} className="p-20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <Badge tone="neutral" className="border border-neutral-700 text-xs">
                    {room.buildingName}
                  </Badge>
                  <span className="font-mono text-sm font-semibold text-cyan-400">
                    Room {room.roomNumber}
                  </span>
                </div>

                <div className="mt-16 flex items-center justify-between text-xs text-[var(--se-text-secondary)]">
                  <span>Occupancy</span>
                  <span className="font-medium text-[var(--se-text-primary)]">
                    {room.occupied} / {room.capacity} Beds
                  </span>
                </div>
                <div className="mt-6 h-6 w-full rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      room.occupied >= room.capacity ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                  />
                </div>

                <div className="mt-16 space-y-8">
                  <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider">
                    Current Residents
                  </span>
                  {room.residents.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-[var(--se-radius-sm)] border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-8 text-xs"
                    >
                      <div className="flex items-center gap-8">
                        <User size={14} className="text-neutral-400" />
                        <span className="font-medium">{r.name}</span>
                        <span className="font-mono text-neutral-500">({r.id})</span>
                      </div>
                      <Badge tone="neutral" className="border border-neutral-700 text-[10px]">
                        {r.bed}
                      </Badge>
                    </div>
                  ))}
                  {room.capacity > room.occupied && (
                    <div className="rounded-[var(--se-radius-sm)] border border-dashed border-emerald-500/30 bg-emerald-500/5 p-8 text-xs text-emerald-400 text-center">
                      + 1 Bed Available for Allocation
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-20 flex items-center justify-between border-t border-[var(--se-border)] pt-12 text-xs">
                <span className="text-[var(--se-text-secondary)]">Semester Fee</span>
                <span className="font-semibold text-[var(--se-text-primary)]">
                  ${room.feePerSemester}.00
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Transit Fleet Tracker */}
      {activeTab === 'TRANSIT' && (
        <div className="space-y-16">
          {transportRoutes.map((route) => (
            <Card key={route.id} className="p-20">
              <div className="flex flex-col justify-between gap-16 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-8">
                    <span className="font-mono text-sm font-semibold text-cyan-400">
                      {route.routeNumber}
                    </span>
                    <h3 className="font-semibold text-base text-[var(--se-text-primary)]">
                      {route.routeName}
                    </h3>
                    <Badge
                      tone={route.activeStatus === 'ON_SCHEDULE' ? 'success' : 'warning'}
                      className="text-xs"
                    >
                      {route.activeStatus.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center gap-16 text-xs text-[var(--se-text-secondary)]">
                    <span className="flex items-center gap-4">
                      <Clock size={14} /> Departure: {route.departureTime}
                    </span>
                    <span className="font-mono">Vehicle: {route.vehicleNumber}</span>
                    <span className="flex items-center gap-4">
                      <User size={14} /> Driver: {route.driverName}
                    </span>
                    <span className="flex items-center gap-4 text-neutral-400">
                      <Phone size={14} /> {route.driverPhone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-8 rounded-[var(--se-radius-md)] border border-cyan-500/20 bg-cyan-500/5 px-16 py-8">
                  <MapPin size={18} className="text-cyan-400 animate-pulse" />
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase tracking-wider">
                      Current Telemetry
                    </span>
                    <span className="text-xs font-semibold text-cyan-300">
                      {route.currentStop}
                    </span>
                  </div>
                </div>
              </div>

              {/* Route stop progression */}
              <div className="mt-20 border-t border-[var(--se-border)] pt-16">
                <span className="text-xs font-medium text-[var(--se-text-secondary)] uppercase tracking-wider block mb-12">
                  Waypoints & Stops
                </span>
                <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
                  {route.stops.map((stop, i) => (
                    <div key={i} className="flex items-center gap-8 shrink-0">
                      <div className="flex items-center gap-6">
                        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-mono font-semibold text-cyan-400">
                          {i + 1}
                        </span>
                        <span className="text-xs text-[var(--se-text-primary)] font-medium">
                          {stop}
                        </span>
                      </div>
                      {i < route.stops.length - 1 && (
                        <div className="h-1 w-24 bg-neutral-800" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 3: Maintenance Tickets */}
      {activeTab === 'MAINTENANCE' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--se-border)] bg-[var(--se-bg-subtle)] text-xs text-[var(--se-text-secondary)]">
                <tr>
                  <th className="py-12 px-16">Location & Category</th>
                  <th className="py-12 px-16">Description</th>
                  <th className="py-12 px-16">Priority</th>
                  <th className="py-12 px-16">Assigned Technician</th>
                  <th className="py-12 px-16">Status</th>
                  <th className="py-12 px-16 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--se-border)]">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-[var(--se-bg-subtle)]/50 transition-colors">
                    <td className="py-14 px-16">
                      <div className="font-medium text-[var(--se-text-primary)]">{t.location}</div>
                      <div className="text-xs text-[var(--se-text-secondary)]">{t.category}</div>
                    </td>
                    <td className="py-14 px-16 max-w-md text-xs text-[var(--se-text-secondary)]">
                      {t.description}
                    </td>
                    <td className="py-14 px-16">
                      <Badge
                        tone={
                          t.priority === 'HIGH'
                            ? 'danger'
                            : t.priority === 'MEDIUM'
                            ? 'warning'
                            : 'neutral'
                        }
                        className="text-xs"
                      >
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="py-14 px-16 text-xs font-medium text-[var(--se-text-primary)]">
                      {t.assignedTo}
                    </td>
                    <td className="py-14 px-16">
                      <Badge
                        tone={
                          t.status === 'RESOLVED'
                            ? 'success'
                            : t.status === 'IN_PROGRESS'
                            ? 'info'
                            : 'warning'
                        }
                        className="text-xs"
                      >
                        {t.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-14 px-16 text-right">
                      {t.status !== 'RESOLVED' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleResolveTicket(t.id)}
                        >
                          Resolve
                        </Button>
                      ) : (
                        <span className="text-xs text-neutral-500">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Ticket Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-16 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[var(--se-radius-lg)] border border-[var(--se-border)] bg-[var(--se-bg-surface)] p-24 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--se-border)] pb-16">
              <div>
                <h3 className="font-semibold text-lg text-[var(--se-text-primary)]">
                  Report Facility Issue
                </h3>
                <p className="text-xs text-[var(--se-text-secondary)] mt-2">
                  Dispatch ticket to university maintenance operations
                </p>
              </div>
              <button
                onClick={() => setTicketModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-16 space-y-16">
              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                  Campus Location
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Software Engineering Lab 2"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  required
                  className="mt-4"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-4 w-full rounded-[var(--se-radius-md)] border border-[var(--se-border)] bg-[var(--se-bg-subtle)] px-12 py-8 text-sm text-[var(--se-text-primary)] outline-none"
                >
                  <option value="HVAC">HVAC & Air Conditioning</option>
                  <option value="ELECTRICAL">Electrical & Lighting</option>
                  <option value="AV_SYSTEM">Audio-Visual Systems</option>
                  <option value="PLUMBING">Plumbing & Water</option>
                  <option value="NETWORK">Network Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                  Description of Issue
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe failure symptoms and affected equipment..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                  className="mt-4 w-full rounded-[var(--se-radius-md)] border border-[var(--se-border)] bg-[var(--se-bg-subtle)] p-12 text-sm text-[var(--se-text-primary)] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--se-text-secondary)]">
                  Priority Level
                </label>
                <div className="mt-4 flex gap-8">
                  {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 rounded-[var(--se-radius-md)] border py-8 text-xs font-medium transition-colors ${
                        newPriority === p
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-[var(--se-border)] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-12 pt-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setTicketModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Ticket</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
