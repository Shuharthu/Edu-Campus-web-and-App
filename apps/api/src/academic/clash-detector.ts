import { ClashType, isTimeOverlapping, TimetableClash } from './academic.types';

export interface RawSlotWithRelations {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomId: string;
  facultyMemberId: string;
  room?: {
    roomNumber: string;
    capacity: number;
  };
  facultyMember?: {
    user: {
      fullName: string;
    };
  };
  section?: {
    id: string;
    sectionCode: string;
    batchId?: string | null;
    batch?: {
      code: string;
      program?: {
        code: string;
      };
    } | null;
    courseOffering?: {
      course: {
        code: string;
        title: string;
      };
    };
    _count?: {
      enrollments: number;
    };
    enrollments?: Array<{ studentId: string }>;
  };
}

export function detectTimetableClashes(slots: RawSlotWithRelations[]): TimetableClash[] {
  const clashes: TimetableClash[] = [];

  // Group slots by dayOfWeek for efficient O(N^2 per day) comparison
  const byDay = new Map<number, RawSlotWithRelations[]>();
  for (const s of slots) {
    const list = byDay.get(s.dayOfWeek) ?? [];
    list.push(s);
    byDay.set(s.dayOfWeek, list);
  }

  // Check 1: Room Capacity Checks (per slot)
  for (const s of slots) {
    const roomCap = s.room?.capacity;
    const enrolled = s.section?._count?.enrollments ?? s.section?.enrollments?.length ?? 0;
    if (roomCap && enrolled > roomCap) {
      clashes.push({
        id: `cap-${s.id}`,
        type: 'ROOM_CAPACITY_EXCEEDED',
        severity: 'WARNING',
        message: `Section ${s.section?.courseOffering?.course?.code ?? ''} (${s.section?.sectionCode ?? ''}) has ${enrolled} enrolled students exceeding ${s.room?.roomNumber} capacity (${roomCap}).`,
        slotIds: [s.id],
        dayOfWeek: s.dayOfWeek,
        timeRange: `${s.startTime} - ${s.endTime}`,
        details: {
          roomNumber: s.room?.roomNumber,
          capacity: roomCap,
          enrolledCount: enrolled,
          courseCodes: [s.section?.courseOffering?.course?.code ?? ''],
        },
      });
    }
  }

  // Check 2, 3, 4: Overlapping slots on same day
  for (const [day, daySlots] of byDay.entries()) {
    for (let i = 0; i < daySlots.length; i++) {
      const a = daySlots[i];
      if (!a) continue;

      for (let j = i + 1; j < daySlots.length; j++) {
        const b = daySlots[j];
        if (!b) continue;

        if (!isTimeOverlapping(a.startTime, a.endTime, b.startTime, b.endTime)) {
          continue;
        }

        const timeRange = `${Math.min(parseInt(a.startTime), parseInt(b.startTime)) > 0 ? a.startTime : b.startTime} overlap`;

        // Check 2: Faculty Conflict (same teacher in 2 rooms)
        if (a.facultyMemberId && a.facultyMemberId === b.facultyMemberId) {
          const facultyName = a.facultyMember?.user?.fullName ?? b.facultyMember?.user?.fullName ?? 'Faculty member';
          clashes.push({
            id: `fac-${a.id}-${b.id}`,
            type: 'FACULTY_CONFLICT',
            severity: 'CRITICAL',
            message: `${facultyName} is scheduled in both ${a.room?.roomNumber ?? 'Room A'} and ${b.room?.roomNumber ?? 'Room B'} simultaneously.`,
            slotIds: [a.id, b.id],
            dayOfWeek: day,
            timeRange: `${a.startTime} - ${a.endTime} / ${b.startTime} - ${b.endTime}`,
            details: {
              facultyName,
              courseCodes: [
                a.section?.courseOffering?.course?.code ?? '',
                b.section?.courseOffering?.course?.code ?? '',
              ].filter(Boolean),
            },
          });
        }

        // Check 3: Room Conflict (same room booked for 2 classes)
        if (a.roomId && a.roomId === b.roomId) {
          const roomNumber = a.room?.roomNumber ?? 'Room';
          clashes.push({
            id: `room-${a.id}-${b.id}`,
            type: 'ROOM_CONFLICT',
            severity: 'CRITICAL',
            message: `${roomNumber} is double booked for ${a.section?.courseOffering?.course?.code ?? 'Class 1'} and ${b.section?.courseOffering?.course?.code ?? 'Class 2'}.`,
            slotIds: [a.id, b.id],
            dayOfWeek: day,
            timeRange: `${a.startTime} - ${a.endTime} / ${b.startTime} - ${b.endTime}`,
            details: {
              roomNumber,
              courseCodes: [
                a.section?.courseOffering?.course?.code ?? '',
                b.section?.courseOffering?.course?.code ?? '',
              ].filter(Boolean),
            },
          });
        }

        // Check 4: Student Group Conflict (same batch or student overlap)
        const batchA = a.section?.batchId;
        const batchB = b.section?.batchId;
        if (batchA && batchB && batchA === batchB) {
          const batchCode = a.section?.batch?.code ?? 'Batch';
          clashes.push({
            id: `batch-${a.id}-${b.id}`,
            type: 'STUDENT_GROUP_CONFLICT',
            severity: 'CRITICAL',
            message: `Batch ${batchCode} has conflicting classes: ${a.section?.courseOffering?.course?.code ?? 'Class 1'} and ${b.section?.courseOffering?.course?.code ?? 'Class 2'}.`,
            slotIds: [a.id, b.id],
            dayOfWeek: day,
            timeRange: `${a.startTime} - ${a.endTime} / ${b.startTime} - ${b.endTime}`,
            details: {
              batchCode,
              courseCodes: [
                a.section?.courseOffering?.course?.code ?? '',
                b.section?.courseOffering?.course?.code ?? '',
              ].filter(Boolean),
            },
          });
        }
      }
    }
  }

  return clashes;
}
