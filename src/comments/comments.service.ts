import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CoursesService } from 'src/courses/courses.service';
import { createHash } from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PaginationDto } from 'src/utilities/dto/pagination.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    private readonly courseService: CoursesService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
    idCourse: string,
  ) {
    const key = `comment:${idCourse}`;

    const existingCourse = await this.courseService.findOne(idCourse);

    if (!existingCourse) {
      throw new NotFoundException('Course not found');
    }

    const hashAutor = this.createAutorHash(userId, idCourse);

    const userCommentCount = await this.commentRepository.count({
      where: {
        course: { id: idCourse },
        authorHash: hashAutor,
      },
    });

    if (userCommentCount >= 2) {
      throw new BadRequestException('You can only have 2 comments per course');
    }

    const commentPreload = this.commentRepository.create({
      ...createCommentDto,
      authorHash: hashAutor,
      course: { id: idCourse },
    });

    const commentBD = await this.commentRepository.save(commentPreload);

    await this.cacheManager.del(key);

    return commentBD;
  }

  async findAllComments(idCourse: string, paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;
    const offset = (page - 1) * limit;

    const key = `comment:${idCourse}`;
    const redisConsult = await this.cacheManager.get(key);

    if (redisConsult) {
      return redisConsult;
    }

    const existingCourse = await this.courseService.findOne(idCourse);

    if (!existingCourse) {
      throw new NotFoundException('Course not found');
    }

    const [data, total] = await this.commentRepository.findAndCount({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
      where: { course: { id: idCourse } },
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

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
    idCourse: string,
  ) {
    const existingComment = await this.commentRepository.findOneBy({ id: id });

    if (!existingComment) {
      throw new NotFoundException('Comment not found');
    }
    console.log(idCourse);
    const hashAutor = this.createAutorHash(userId, idCourse);

    if (existingComment.authorHash !== hashAutor) {
      throw new UnauthorizedException(
        `The user is not the author of this comment`,
      );
    }
    const commentToUpdate = await this.commentRepository.preload({
      id,
      ...updateCommentDto,
    });

    if (!commentToUpdate) {
      throw new NotFoundException('Comment not found');
    }

    return await this.commentRepository.save(commentToUpdate);
  }

  async remove(idComment: string, userId: string, idCourse: string) {
    const key = 'comments';

    const existingComment = await this.commentRepository.findOneBy({
      id: idComment,
    });

    if (!existingComment) {
      throw new NotFoundException('Comment not found');
    }

    const hashAutor = this.createAutorHash(userId, idCourse);

    if (existingComment.authorHash !== hashAutor) {
      throw new UnauthorizedException(
        `The user is not the author of this comment`,
      );
    }

    await this.cacheManager.del(key);
    return await this.commentRepository.delete(idComment);
  }

  private createAutorHash(userId: string, courseId: string): string {
    const secret = this.configService.get<string>('SECRET_HASH');
    return createHash('sha256')
      .update(`${userId}-${courseId}-${secret}`)
      .digest('hex');
  }
}
