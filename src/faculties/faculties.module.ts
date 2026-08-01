import { Module } from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { FacultiesController } from './faculties.controller';
import { Faculty } from './entities/faculty.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Faculty]), AuthModule],
  controllers: [FacultiesController],
  providers: [FacultiesService],
  exports: [FacultiesService]
})
export class FacultiesModule {}
