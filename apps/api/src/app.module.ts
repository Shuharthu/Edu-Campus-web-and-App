import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AcademicModule } from './academic/academic.module';
import { AdminModule } from './admin/admin.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { CourseworkModule } from './coursework/coursework.module';
import { CommunicationModule } from './communication/communication.module';
import { LibraryModule } from './library/library.module';
import { OperationsModule } from './operations/operations.module';
import { CareerModule } from './career/career.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AssistantModule } from './assistant/assistant.module';
import { ComplianceModule } from './compliance/compliance.module';
import { ExamsModule } from './exams/exams.module';
import { FinanceModule } from './finance/finance.module';
import { GradesModule } from './grades/grades.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { RbacModule } from './rbac/rbac.module';
import { RealtimeModule } from './realtime/realtime.module';
import { UniversityServicesModule } from './services/services.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    JwtModule.register({}),
    PrismaModule,
    RealtimeModule,
    AuditModule,
    AuthModule,
    RbacModule,
    AdminModule,
    AcademicModule,
    AttendanceModule,
    GradesModule,
    CourseworkModule,
    ExamsModule,
    FinanceModule,
    UniversityServicesModule,
    CommunicationModule,
    LibraryModule,
    OperationsModule,
    CareerModule,
    AnalyticsModule,
    AssistantModule,
    ComplianceModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
