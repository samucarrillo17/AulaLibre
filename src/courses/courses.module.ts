import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from 'src/comments/comments.module';
import { AuthModule } from 'src/auth/auth.module';
import { FacultiesModule } from 'src/faculties/faculties.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course]),AuthModule,FacultiesModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService,TypeOrmModule],
})
export class CoursesModule {}
