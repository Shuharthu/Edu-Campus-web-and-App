import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CourseworkController } from './coursework.controller';
import { CourseworkService } from './coursework.service';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [CourseworkController],
  providers: [CourseworkService],
  exports: [CourseworkService],
})
export class CourseworkModule {}
