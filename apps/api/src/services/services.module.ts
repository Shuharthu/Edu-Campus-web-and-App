import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UniversityServicesController } from './services.controller';
import { UniversityServicesService } from './services.service';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [UniversityServicesController],
  providers: [UniversityServicesService],
  exports: [UniversityServicesService],
})
export class UniversityServicesModule {}
