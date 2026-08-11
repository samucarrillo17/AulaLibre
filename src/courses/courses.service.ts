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
    });
    try {
      const course = await this.courseRepository.save(coursePreload);
      this.clearCoursesCache();
      return course;
    } catch (error) {
      handleDBException(error);
    }
  }

  async findAll(paginationCourseDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationCourseDto;
    const offset = (page - 1) * limit;
    const key = `courses:page:${page}:limit:${limit}`;

    const redisConsult = await this.cacheManager.get(key);

    if (redisConsult) {
      return redisConsult;
    }

    const [data, total] = await this.courseRepository.findAndCount({
      take: limit,
      skip: offset,
    });

    const lastPage: number = Math.ceil(total / limit);

    const responsePayload = {
      total,
      page,
      limit,
      lastPage,
      data,
    };

    await this.cacheManager.set(key, responsePayload, 1000 * 60 * 10);

    return responsePayload;
  }

  async findOne(term: string) {
  
    const key = `course:term:${term}`;

  
    const cachedCourse = await this.cacheManager.get<Course>(key);
    if (cachedCourse) {
      return cachedCourse;
    }


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

  
    await this.cacheManager.set(key, course, 1000 * 60 * 15);

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

        this.clearCoursesCache();
        await this.cacheManager.del(`course:term:${id}`);

        return await manager.save(Course, course);
      });
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
      this.clearCoursesCache();
      await this.cacheManager.del(`course:term:${id}`);
      return true;
      
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      handleDBException(error);
    }
  }

  async clearCoursesCache() {
    const store = (this.cacheManager as any).store;

    if (store && typeof store.keys === 'function') {
      const keys: string[] = await store.keys('courses:*');

      if (keys.length > 0) {
        await Promise.all(keys.map((key) => this.cacheManager.del(key)));
      }
    }
  }
}
