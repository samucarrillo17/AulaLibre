import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), ConfigModule,AuthModule,CoursesModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [TypeOrmModule],
})
export class CommentsModule {}
