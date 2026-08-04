import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { DataSource, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { FacultiesService } from 'src/faculties/faculties.service';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type{ Cache } from 'cache-manager';
import { PaginationDto } from 'src/utilities/dto/pagination.dto';
import { handleDBException } from 'src/utilities/helpers/handleDbException';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly facultiService: FacultiesService,
    private readonly dataSource: DataSource,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async createCourse(createCourseDto: CreateCourseDto, idFaculty: string) {
    const existingFaculty = await this.facultiService.findOne(idFaculty);
    if (!existingFaculty) {
      throw new NotFoundException('Faculty not found');
    }
    const coursePreload = this.courseRepository.create({
      ...createCourseDto,
      faculty: { id: idFaculty },
    })
    try {
      const course = await this.courseRepository.save(coursePreload);
      return course;
    } catch (error) {
      handleDBException(error);
    }
  }
 
  async findAll(paginationCourseDto: PaginationDto) {
    const key = 'courses:all';
    const { limit = 10, page = 1 } = paginationCourseDto;
    const offset = (page - 1) * limit;

    const redisConsult = await this.cacheManager.get(key);

    if (redisConsult) {
      return redisConsult;
    }

    const [data, total] = await this.courseRepository.findAndCount({
      take: limit,
      skip: offset,
    });

    await this.cacheManager.set(key, data, 1000 * 60 * 10);

    return {
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
      data,
    };
  }

  async findOne(term: string) {
    let course: Course | null;
    if (isUUID(term)) {
      course = await this.courseRepository
        .createQueryBuilder('course')
        .where('course.id = :id', { id: term })
        .getOne();

        if (!course) {
          throw new NotFoundException(`Course with id "${term}" not found`);
        }
        
    } else {
      course = await this.courseRepository
        .createQueryBuilder('course')
        .where('LOWER(course.name) LIKE LOWER(:term)', { term: `%${term}%` })
        .getOne();

        if (!course) {
          throw new NotFoundException(`Course with name "${term}" not found`);
        }
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const { facultyId, ...courseRest } = updateCourseDto;

    try {
      return await this.dataSource.transaction(async (manager) => {
        const course = await manager.preload(Course, {
          id,
          ...courseRest,
        });

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
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err
      handleDBException(err);
    }
  }

  remove(id: string) {
    return this.courseRepository.softDelete({ id });
  }
}
