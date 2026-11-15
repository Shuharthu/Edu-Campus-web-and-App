import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { AcademicController } from './academic.controller';
import { AcademicService } from './academic.service';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [PrismaModule, RealtimeModule],
  controllers: [AcademicController, StudentsController, FacultyController],
  providers: [AcademicService, StudentsService, FacultyService],
  exports: [AcademicService, StudentsService, FacultyService],
})
export class AcademicModule {}
