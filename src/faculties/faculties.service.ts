import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from './entities/faculty.entity';
import { Repository } from 'typeorm';
import { handleDBException } from 'src/utilities/helpers/handleDbException';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultiesRepository: Repository<Faculty>,
  ) {}
  create(createFacultyDto: CreateFacultyDto) {
    try {
      const facultyPreload = this.facultiesRepository.create(createFacultyDto);
      return this.facultiesRepository.save(facultyPreload);
    } catch (error) {
      handleDBException(error);
    }
  }

  findAll() {
    return this.facultiesRepository.find();
  }

  findOne(id: string) {
    return this.facultiesRepository.findOneBy({ id });
  }

  update(id: string, updateFacultyDto: UpdateFacultyDto) {
   try {
       return this.facultiesRepository.update(id, updateFacultyDto);
   } catch (error) {
       if (error instanceof NotFoundException) throw error
       handleDBException(error);
   }
  }

  remove(id: string) {
    return this.facultiesRepository.softDelete(id);
  }
}
