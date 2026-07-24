import { Injectable } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from './entities/faculty.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultiesRepository: Repository<Faculty>,
  ) {}
  create(createFacultyDto: CreateFacultyDto) {
    const facultyPreload = this.facultiesRepository.create(createFacultyDto);
    return this.facultiesRepository.save(facultyPreload);
  }

  findAll() {
    return this.facultiesRepository.find();
  }

  findOne(id: string) {
    return this.facultiesRepository.findOneBy({ id });
  }

  update(id: string, updateFacultyDto: UpdateFacultyDto) {
    return this.facultiesRepository.update(id, updateFacultyDto);
  }

  remove(id: string) {
    return this.facultiesRepository.softDelete(id);
  }
}
