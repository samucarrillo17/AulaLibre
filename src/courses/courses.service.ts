import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { DataSource, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { FacultiesService } from 'src/faculties/faculties.service';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { PaginationDto } from 'src/utilities/dto/pagination.dto';
import { handleDBException } from 'src/utilities/helpers/handleDbException';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly facultiService: FacultiesService,
    private readonly dataSource: DataSource,

  
  ) {}

  async createCourse(createCourseDto: CreateCourseDto, idFaculty: string) {
    const existingFaculty = await this.facultiService.findOne(idFaculty);
    if (!existingFaculty) {
      throw new NotFoundException('Faculty not found');
    }
    const coursePreload = this.courseRepository.create({
      ...createCourseDto,
      faculty: { id: idFaculty },
    });
    try {
      const course = await this.courseRepository.save(coursePreload);
      return course;
    } catch (error) {
      handleDBException(error);
    }
  }

  async findAll(paginationCourseDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationCourseDto;
    const offset = (page - 1) * limit;
  

    const [data, total] = await this.courseRepository.findAndCount({
      take: limit,
      skip: offset,
      order: { name: 'ASC' },
    });

    const lastPage: number = Math.ceil(total / limit);

    const responsePayload = {
      total,
      page,
      limit,
      lastPage,
      data,
    };


    return responsePayload;
  }

  async findOne(term: string) {
   

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.faculty', 'faculty');

    if (isUUID(term)) {
      queryBuilder.where('course.id = :id', { id: term });
    } else {
      queryBuilder.where('LOWER(course.name) LIKE LOWER(:term)', {
        term: `%${term}%`,
      });
    }

    const course = await queryBuilder.getOne();

    if (!course) {
      throw new NotFoundException(`Course with term "${term}" not found`);
    }


    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const { facultyId, ...courseRest } = updateCourseDto;

    try {
      const updatedCourse = await this.dataSource.transaction(
        async (manager) => {
          const course = await manager.preload(Course, { id, ...courseRest });

          if (!course) {
            throw new NotFoundException(`Course with id "${id}" not found`);
          }

          if (facultyId) {
            const existingFaculty = await manager.findOne(Faculty, {
              where: { id: facultyId },
            });

            if (!existingFaculty) {
              throw new NotFoundException(
                `Faculty with id "${facultyId}" not found`,
              );
            }

            course.faculty = existingFaculty;
          }

          return await manager.save(Course, course);
        },
      );


      return updatedCourse;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      handleDBException(err);
    }
  }

  async remove(id: string) {
    try {
      const softDelete = await this.courseRepository.softDelete({ id });
      if (!softDelete.affected) {
        throw new NotFoundException(`Course with id "${id}" not found`);
      }
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDBException(error);
    }
  }

}
