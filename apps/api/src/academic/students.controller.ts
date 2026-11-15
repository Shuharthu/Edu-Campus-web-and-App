import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth, RequirePermission } from '../common/decorators';
import { BulkImportStudentsDto, QueryStudentsDto } from './dto/student.dto';
import { StudentsService } from './students.service';

@ApiTags('Student Records & Admissions')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @RequirePermission('student_records', 'view')
  @ApiOperation({ summary: 'List student records with status metric filters and pagination' })
  listStudents(@CurrentAuth() auth: AuthContext, @Query() query: QueryStudentsDto) {
    const campusId = auth.campusId;
    if (!campusId) throw new Error('Campus ID required');
    return this.studentsService.listStudents(campusId, query);
  }

  @Get(':id')
  @RequirePermission('student_records', 'view')
  @ApiOperation({ summary: 'Get single student 4-tab profile drawer details' })
  getStudentProfile(@Param('id') studentId: string) {
    return this.studentsService.getStudentProfile(studentId);
  }

  @Post('bulk-import')
  @RequirePermission('student_records', 'create')
  @ApiOperation({ summary: 'Bulk import student records from CSV or JSON dataset' })
  bulkImport(@CurrentAuth() auth: AuthContext, @Body() dto: BulkImportStudentsDto) {
    const campusId = auth.campusId;
    if (!campusId) throw new Error('Campus ID required');
    return this.studentsService.bulkImport(campusId, dto);
  }
}
