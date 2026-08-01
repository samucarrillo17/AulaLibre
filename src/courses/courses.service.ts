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
import { PaginationCourseDto } from './dto/pagination-course.dto';
import type{ Cache } from 'cache-manager';

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

    const course = await this.courseRepository.save(coursePreload);

    return course;
  }
 
  async findAll(paginationCourseDto: PaginationCourseDto) {
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
    } else {
      course = await this.courseRepository
        .createQueryBuilder('course')
        .where('LOWER(course.name) LIKE LOWER(:term)', { term: `%${term}%` })
        .getOne();
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const { facultyId, ...courseRest } = updateCourseDto;

    return await this.dataSource.transaction(async (manager) => {
      // 1. Cargar el curso existente y fusionar las propiedades del DTO
      const course = await manager.preload(Course, {
        id,
        ...courseRest,
      });

      if (!course) {
        throw new NotFoundException(`Course with id "${id}" not found`);
      }

      // 2. Si se envió una facultad en el DTO, validar que exista
      if (facultyId) {
        const existingFaculty = await manager.findOne(Faculty, {
          where: { id: facultyId },
        });

        if (!existingFaculty) {
          throw new NotFoundException(
            `Faculty with id "${facultyId}" not found`,
          );
        }

        // Asignamos la nueva entidad de facultad al curso
        course.faculty = existingFaculty;
      }

      // 3. Guardar todos los cambios dentro de la transacción
      return await manager.save(Course, course);
    });
  }

  remove(id: string) {
    return this.courseRepository.softDelete({ id });
  }
}
