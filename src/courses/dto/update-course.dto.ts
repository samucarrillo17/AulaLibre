import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @IsOptional()
  @IsUUID()
  facultyId?: string;
}
