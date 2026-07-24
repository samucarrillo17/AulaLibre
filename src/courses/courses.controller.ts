import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';

@Controller('course')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post(':idFaculty')
  @Auth(ValidRoles.ADMIN)
  create(
    @Body() createCourseDto: CreateCourseDto,
    @Param('idFaculty') idFaculty: string,
  ) {
    return this.coursesService.createCourse(createCourseDto, idFaculty);
  }

  @Get()
  @Auth()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string) {
    return this.coursesService.findOne(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.ADMIN)
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMIN)
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
