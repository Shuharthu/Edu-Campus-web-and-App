export type ClashType =
  | 'FACULTY_CONFLICT'
  | 'ROOM_CONFLICT'
  | 'STUDENT_GROUP_CONFLICT'
  | 'ROOM_CAPACITY_EXCEEDED';

export interface TimetableClash {
  id: string;
  type: ClashType;
  severity: 'CRITICAL' | 'WARNING';
  message: string;
  slotIds: string[];
  dayOfWeek: number;
  timeRange: string;
  details: {
    facultyName?: string;
    roomNumber?: string;
    batchCode?: string;
    courseCodes?: string[];
    capacity?: number;
    enrolledCount?: number;
  };
}

export interface TimetableSlotPayload {
  id?: string;
  campusId: string;
  sectionId: string;
  roomId: string;
  facultyMemberId: string;
  dayOfWeek: number;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  slotStatus?: string;
}

export function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && startB < endA;
}
