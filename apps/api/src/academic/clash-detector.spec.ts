import { detectTimetableClashes, RawSlotWithRelations } from './clash-detector';

describe('Timetable Clash Detector', () => {
  it('should detect faculty conflict when same teacher is in two rooms at the same time', () => {
    const slots: RawSlotWithRelations[] = [
      {
        id: 'slot-1',
        dayOfWeek: 1,
        startTime: '10:45',
        endTime: '12:15',
        roomId: 'room-4b',
        facultyMemberId: 'fac-tariq',
        room: { roomNumber: 'Room 4B', capacity: 45 },
        facultyMember: { user: { fullName: 'Dr. Tariq Mahmud' } },
        section: {
          id: 'sec-1',
          sectionCode: 'Sec A',
          courseOffering: { course: { code: 'CSE204', title: 'Data Structures' } },
        },
      },
      {
        id: 'slot-2',
        dayOfWeek: 1,
        startTime: '10:45',
        endTime: '12:15',
        roomId: 'room-5c',
        facultyMemberId: 'fac-tariq',
        room: { roomNumber: 'Room 5C', capacity: 50 },
        facultyMember: { user: { fullName: 'Dr. Tariq Mahmud' } },
        section: {
          id: 'sec-2',
          sectionCode: 'Sec B',
          courseOffering: { course: { code: 'CSE201', title: 'Discrete Math' } },
        },
      },
    ];

    const clashes = detectTimetableClashes(slots);
    expect(clashes.some((c) => c.type === 'FACULTY_CONFLICT')).toBe(true);
    const facultyClash = clashes.find((c) => c.type === 'FACULTY_CONFLICT');
    expect(facultyClash?.details.facultyName).toBe('Dr. Tariq Mahmud');
  });

  it('should detect room conflict when same room is double booked', () => {
    const slots: RawSlotWithRelations[] = [
      {
        id: 'slot-1',
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '10:30',
        roomId: 'room-4b',
        facultyMemberId: 'fac-1',
        room: { roomNumber: 'Room 4B', capacity: 45 },
        section: {
          id: 'sec-1',
          sectionCode: 'Sec A',
          courseOffering: { course: { code: 'CSE204', title: 'Data Structures' } },
        },
      },
      {
        id: 'slot-2',
        dayOfWeek: 2,
        startTime: '09:30',
        endTime: '11:00',
        roomId: 'room-4b',
        facultyMemberId: 'fac-2',
        room: { roomNumber: 'Room 4B', capacity: 45 },
        section: {
          id: 'sec-2',
          sectionCode: 'Sec A',
          courseOffering: { course: { code: 'MAT201', title: 'Calculus 2' } },
        },
      },
    ];

    const clashes = detectTimetableClashes(slots);
    expect(clashes.some((c) => c.type === 'ROOM_CONFLICT')).toBe(true);
  });

  it('should detect student group conflict when same batch is scheduled for two courses simultaneously', () => {
    const slots: RawSlotWithRelations[] = [
      {
        id: 'slot-1',
        dayOfWeek: 3,
        startTime: '10:45',
        endTime: '12:15',
        roomId: 'room-4b',
        facultyMemberId: 'fac-1',
        room: { roomNumber: 'Room 4B', capacity: 45 },
        section: {
          id: 'sec-1',
          sectionCode: 'Sec A',
          batchId: 'batch-2024',
          batch: { code: '2024' },
          courseOffering: { course: { code: 'CSE204', title: 'Data Structures' } },
        },
      },
      {
        id: 'slot-2',
        dayOfWeek: 3,
        startTime: '10:45',
        endTime: '12:15',
        roomId: 'room-5c',
        facultyMemberId: 'fac-2',
        room: { roomNumber: 'Room 5C', capacity: 50 },
        section: {
          id: 'sec-2',
          sectionCode: 'Sec A',
          batchId: 'batch-2024',
          batch: { code: '2024' },
          courseOffering: { course: { code: 'MAT201', title: 'Calculus 2' } },
        },
      },
    ];

    const clashes = detectTimetableClashes(slots);
    expect(clashes.some((c) => c.type === 'STUDENT_GROUP_CONFLICT')).toBe(true);
  });

  it('should detect room capacity exceeded when enrollment exceeds room capacity', () => {
    const slots: RawSlotWithRelations[] = [
      {
        id: 'slot-1',
        dayOfWeek: 4,
        startTime: '13:00',
        endTime: '14:30',
        roomId: 'room-3c',
        facultyMemberId: 'fac-1',
        room: { roomNumber: 'Room 3C', capacity: 40 },
        section: {
          id: 'sec-1',
          sectionCode: 'Sec A',
          courseOffering: { course: { code: 'CSE204', title: 'Data Structures' } },
          _count: { enrollments: 52 },
        },
      },
    ];

    const clashes = detectTimetableClashes(slots);
    expect(clashes.some((c) => c.type === 'ROOM_CAPACITY_EXCEEDED')).toBe(true);
  });

  it('should report zero clashes for non-overlapping valid schedules', () => {
    const slots: RawSlotWithRelations[] = [
      {
        id: 'slot-1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:30',
        roomId: 'room-4b',
        facultyMemberId: 'fac-1',
        room: { roomNumber: 'Room 4B', capacity: 45 },
        section: {
          id: 'sec-1',
          sectionCode: 'Sec A',
          batchId: 'batch-2024',
          courseOffering: { course: { code: 'MAT201', title: 'Calculus' } },
          _count: { enrollments: 30 },
        },
      },
      {
        id: 'slot-2',
        dayOfWeek: 1,
        startTime: '10:45',
        endTime: '12:15',
        roomId: 'room-4b',
        facultyMemberId: 'fac-1',
        room: { roomNumber: 'Room 4B', capacity: 45 },
        section: {
          id: 'sec-2',
          sectionCode: 'Sec A',
          batchId: 'batch-2024',
          courseOffering: { course: { code: 'CSE204', title: 'Data Structures' } },
          _count: { enrollments: 35 },
        },
      },
    ];

    const clashes = detectTimetableClashes(slots);
    expect(clashes.length).toBe(0);
  });
});
