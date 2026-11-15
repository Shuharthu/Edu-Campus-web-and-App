const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. In Institution, add gradeScales GradeScale[]
if (!schema.includes('gradeScales')) {
  schema = schema.replace(
    '  timetableSlots  TimetableSlot[]\n}',
    '  timetableSlots  TimetableSlot[]\n  gradeScales     GradeScale[]\n}',
  );
}

// 2. In User, add requestedCorrections, approvedCorrections, submittedModerations, approvedModerations
if (!schema.includes('attendanceCorrectionsRequested')) {
  schema = schema.replace(
    '  coordinatedOfferings  CourseOffering[]           @relation("CourseCoordinator")\n',
    '  coordinatedOfferings  CourseOffering[]           @relation("CourseCoordinator")\n  attendanceCorrectionsRequested AttendanceCorrection[] @relation("CorrectionRequestedBy")\n  attendanceCorrectionsApproved  AttendanceCorrection[] @relation("CorrectionApprovedBy")\n  gradeModerationsSubmitted      GradeModeration[]      @relation("ModerationSubmittedBy")\n  gradeModerationsApproved       GradeModeration[]      @relation("ModerationApprovedBy")\n',
  );
}

// 3. In Semester, add gradeModerations, semesterResults, exams
if (!schema.includes('gradeModerations     GradeModeration[]')) {
  schema = schema.replace(
    '  enrollments     Enrollment[]\n\n  @@unique([campusId, code])',
    '  enrollments     Enrollment[]\n  gradeModerations GradeModeration[]\n  semesterResults SemesterResult[]\n  exams           Exam[]\n\n  @@unique([campusId, code])',
  );
}

// 4. In Course, add courseMaterials, exams
if (!schema.includes('courseMaterials CourseMaterial[]')) {
  schema = schema.replace(
    '  offerings   CourseOffering[]\n\n  @@unique([departmentId, code])',
    '  offerings       CourseOffering[]\n  courseMaterials CourseMaterial[]\n  exams           Exam[]\n\n  @@unique([departmentId, code])',
  );
}

// 5. In Section, add attendanceSessions, courseMaterials, assignments, assessments, gradeModerations
if (!schema.includes('attendanceSessions AttendanceSession[]')) {
  schema = schema.replace(
    '  timetableSlots TimetableSlot[]\n\n  @@unique([courseOfferingId, sectionCode])',
    '  timetableSlots     TimetableSlot[]\n  attendanceSessions AttendanceSession[]\n  courseMaterials    CourseMaterial[]\n  assignments        Assignment[]\n  assessments        Assessment[]\n  gradeModerations   GradeModeration[]\n\n  @@unique([courseOfferingId, sectionCode])',
  );
}

// 6. In Room, add exams
if (!schema.includes('exams          Exam[]')) {
  schema = schema.replace(
    '  timetableSlots TimetableSlot[]\n\n  @@unique([campusId, building, roomNumber])',
    '  timetableSlots TimetableSlot[]\n  exams          Exam[]\n\n  @@unique([campusId, building, roomNumber])',
  );
}

// 7. In Student, add attendanceRecords, submissions, assessmentScores, semesterResults, examSeats
if (!schema.includes('attendanceRecords AttendanceRecord[]')) {
  schema = schema.replace(
    '  enrollments Enrollment[]\n\n  @@index([institutionId])',
    '  enrollments        Enrollment[]\n  attendanceRecords  AttendanceRecord[]\n  submissions        Submission[]\n  assessmentScores   StudentAssessmentScore[]\n  semesterResults    SemesterResult[]\n  examSeats          ExamSeat[]\n\n  @@index([institutionId])',
  );
}

// 8. In FacultyMember, add attendanceSessions, gradedSubmissions, enteredScores
if (!schema.includes('gradedSubmissions Submission[]')) {
  schema = schema.replace(
    '  timetableSlots  TimetableSlot[]\n\n  @@index([institutionId])',
    '  timetableSlots     TimetableSlot[]\n  attendanceSessions AttendanceSession[]\n  gradedSubmissions  Submission[]\n  enteredScores      StudentAssessmentScore[]\n\n  @@index([institutionId])',
  );
}

// 9. In TimetableSlot, add attendanceSessions
if (!schema.includes('attendanceSessions AttendanceSession[]\n\n  @@index([institutionId])\n  @@index([campusId])\n  @@index([sectionId])\n  @@index([roomId])\n  @@index([facultyMemberId])\n  @@index([dayOfWeek, startTime, endTime])')) {
  schema = schema.replace(
    '  facultyMember FacultyMember @relation(fields: [facultyMemberId], references: [id], onDelete: Restrict)\n\n  @@index([institutionId])',
    '  facultyMember      FacultyMember       @relation(fields: [facultyMemberId], references: [id], onDelete: Restrict)\n  attendanceSessions AttendanceSession[]\n\n  @@index([institutionId])',
  );
}

// 10. Append Phase 4 models
const phase4Models = `
// ============================================================================
// PHASE 4: ATTENDANCE & GRADES MODELS
// ============================================================================

model AttendanceSession {
  id                   String    @id @default(uuid()) @db.Uuid
  sectionId            String    @db.Uuid
  facultyId            String    @db.Uuid
  slotId               String?   @db.Uuid
  sessionDate          DateTime  @default(now())
  token                String
  shortCode            String    @db.VarChar(10)
  status               String    @default("OPEN")
  geofenceLat          Float?
  geofenceLng          Float?
  geofenceRadiusMeters Int?      @default(50)
  bleUuid              String?
  startedAt            DateTime  @default(now())
  closedAt             DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  deletedAt            DateTime?

  section Section            @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  faculty FacultyMember      @relation(fields: [facultyId], references: [id], onDelete: Cascade)
  slot    TimetableSlot?     @relation(fields: [slotId], references: [id], onDelete: SetNull)
  records AttendanceRecord[]

  @@index([sectionId])
  @@index([facultyId])
  @@index([slotId])
  @@index([status])
}

model AttendanceRecord {
  id          String    @id @default(uuid()) @db.Uuid
  sessionId   String    @db.Uuid
  studentId   String    @db.Uuid
  status      String    @default("PRESENT")
  verifiedVia String    @default("QR_ROTATING")
  verifiedAt  DateTime  @default(now())
  latitude    Float?
  longitude   Float?
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  session     AttendanceSession      @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  student     Student                @relation(fields: [studentId], references: [id], onDelete: Cascade)
  corrections AttendanceCorrection[]

  @@unique([sessionId, studentId])
  @@index([sessionId])
  @@index([studentId])
  @@index([status])
}

model AttendanceCorrection {
  id             String   @id @default(uuid()) @db.Uuid
  recordId       String   @db.Uuid
  previousStatus String
  newStatus      String
  reason         String
  requestedById  String   @db.Uuid
  approvedById   String?  @db.Uuid
  status         String   @default("PENDING")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  record      AttendanceRecord @relation(fields: [recordId], references: [id], onDelete: Cascade)
  requestedBy User             @relation("CorrectionRequestedBy", fields: [requestedById], references: [id], onDelete: Cascade)
  approvedBy  User?            @relation("CorrectionApprovedBy", fields: [approvedById], references: [id], onDelete: SetNull)

  @@index([recordId])
  @@index([requestedById])
  @@index([approvedById])
}

model CourseMaterial {
  id            String    @id @default(uuid()) @db.Uuid
  courseId      String    @db.Uuid
  sectionId     String?   @db.Uuid
  title         String
  description   String?
  fileUrl       String
  fileSizeBytes BigInt?
  mimeType      String?
  weekNumber    Int?
  isPublished   Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  course  Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  section Section? @relation(fields: [sectionId], references: [id], onDelete: SetNull)

  @@index([courseId])
  @@index([sectionId])
}

model Assignment {
  id                  String       @id @default(uuid()) @db.Uuid
  sectionId           String       @db.Uuid
  title               String
  description         String?
  dueAt               DateTime
  maxPoints           Float        @default(100)
  weightagePct        Float        @default(10)
  latePolicy          String       @default("REJECT")
  lateDeductionPerDay Float?       @default(0)
  isPublished         Boolean      @default(true)
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
  deletedAt           DateTime?

  section     Section      @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  submissions Submission[]

  @@index([sectionId])
}

model Submission {
  id           String         @id @default(uuid()) @db.Uuid
  assignmentId String         @db.Uuid
  studentId    String         @db.Uuid
  fileUrl      String?
  content      String?
  submittedAt  DateTime       @default(now())
  isLate       Boolean        @default(false)
  score        Float?
  feedback     String?
  gradedById   String?        @db.Uuid
  gradedAt     DateTime?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  deletedAt    DateTime?

  assignment   Assignment     @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  student      Student        @relation(fields: [studentId], references: [id], onDelete: Cascade)
  gradedBy     FacultyMember? @relation(fields: [gradedById], references: [id], onDelete: SetNull)

  @@unique([assignmentId, studentId])
  @@index([assignmentId])
  @@index([studentId])
  @@index([gradedById])
}

model GradeScale {
  id            String           @id @default(uuid()) @db.Uuid
  institutionId String           @db.Uuid
  name          String
  scaleType     String           @default("FOUR_POINT_US")
  isDefault     Boolean          @default(true)
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  institution   Institution      @relation(fields: [institutionId], references: [id], onDelete: Cascade)
  items         GradeScaleItem[]

  @@index([institutionId])
}

model GradeScaleItem {
  id           String     @id @default(uuid()) @db.Uuid
  gradeScaleId String     @db.Uuid
  letter       String     @db.VarChar(5)
  minPercent   Float
  maxPercent   Float
  gradePoint   Float
  description  String?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  gradeScale   GradeScale @relation(fields: [gradeScaleId], references: [id], onDelete: Cascade)

  @@index([gradeScaleId])
}

model Assessment {
  id           String                   @id @default(uuid()) @db.Uuid
  sectionId    String                   @db.Uuid
  name         String
  type         String                   @default("QUIZ")
  maxScore     Float                    @default(100)
  weightagePct Float                    @default(15)
  createdAt    DateTime                 @default(now())
  updatedAt    DateTime                 @updatedAt
  deletedAt    DateTime?

  section      Section                  @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  scores       StudentAssessmentScore[]

  @@index([sectionId])
}

model StudentAssessmentScore {
  id           String         @id @default(uuid()) @db.Uuid
  assessmentId String         @db.Uuid
  studentId    String         @db.Uuid
  score        Float
  isAbsent     Boolean        @default(false)
  remarks      String?
  enteredById  String?        @db.Uuid
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  assessment   Assessment     @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  student      Student        @relation(fields: [studentId], references: [id], onDelete: Cascade)
  enteredBy    FacultyMember? @relation(fields: [enteredById], references: [id], onDelete: SetNull)

  @@unique([assessmentId, studentId])
  @@index([assessmentId])
  @@index([studentId])
  @@index([enteredById])
}

model GradeModeration {
  id            String    @id @default(uuid()) @db.Uuid
  sectionId     String    @db.Uuid
  semesterId    String    @db.Uuid
  status        String    @default("DRAFT")
  submittedById String?   @db.Uuid
  approvedById  String?   @db.Uuid
  publishedAt   DateTime?
  comments      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  section       Section   @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  semester      Semester  @relation(fields: [semesterId], references: [id], onDelete: Cascade)
  submittedBy   User?     @relation("ModerationSubmittedBy", fields: [submittedById], references: [id], onDelete: SetNull)
  approvedBy    User?     @relation("ModerationApprovedBy", fields: [approvedById], references: [id], onDelete: SetNull)

  @@unique([sectionId, semesterId])
  @@index([sectionId])
  @@index([semesterId])
}

model SemesterResult {
  id                 String    @id @default(uuid()) @db.Uuid
  studentId          String    @db.Uuid
  semesterId         String    @db.Uuid
  termGpa            Float     @default(0)
  cgpa               Float     @default(0)
  totalCreditsEarned Float     @default(0)
  termCredits        Float     @default(0)
  status             String    @default("PROVISIONAL")
  publishedAt        DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  student            Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  semester           Semester  @relation(fields: [semesterId], references: [id], onDelete: Cascade)

  @@unique([studentId, semesterId])
  @@index([studentId])
  @@index([semesterId])
}

model Exam {
  id              String     @id @default(uuid()) @db.Uuid
  semesterId      String     @db.Uuid
  courseId        String     @db.Uuid
  name            String
  examDate        DateTime
  startTime       String     @db.VarChar(10)
  endTime         String     @db.VarChar(10)
  durationMinutes Int        @default(120)
  roomId          String?    @db.Uuid
  totalSeats      Int        @default(50)
  status          String     @default("SCHEDULED")
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  deletedAt       DateTime?

  semester        Semester   @relation(fields: [semesterId], references: [id], onDelete: Cascade)
  course          Course     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  room            Room?      @relation(fields: [roomId], references: [id], onDelete: SetNull)
  seats           ExamSeat[]

  @@index([semesterId])
  @@index([courseId])
  @@index([roomId])
}

model ExamSeat {
  id               String    @id @default(uuid()) @db.Uuid
  examId           String    @db.Uuid
  studentId        String    @db.Uuid
  seatNumber       String    @db.VarChar(20)
  admitCardQrToken String
  isAdmitted       Boolean   @default(true)
  checkedInAt      DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  exam             Exam      @relation(fields: [examId], references: [id], onDelete: Cascade)
  student          Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([examId, studentId])
  @@index([examId])
  @@index([studentId])
}
`;

if (!schema.includes('model AttendanceSession')) {
  schema += '\n' + phase4Models;
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Successfully updated schema.prisma for Phase 4!');
