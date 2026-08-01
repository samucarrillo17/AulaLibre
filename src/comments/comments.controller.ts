import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { PaginationCommentDto } from './dto/pagination-comment.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('comment')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':idCourse')
  @Throttle({ default: { limit: 2, ttl: 60 } })
  @Auth()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser('id') userId: string,
    @Param('idCourse',ParseUUIDPipe) idCourse: string,
  ) {
    return this.commentsService.create(createCommentDto, userId, idCourse);
  }

  @Get(':id')
  @Auth()
  findAllCommentsToCourse(
    @Param('id',ParseUUIDPipe) idCourse: string,
    @Query() paginationDto: PaginationCommentDto,
  ) {
    return this.commentsService.findAllComments(idCourse, paginationDto);
  }

  @Patch(':idComment')
  @Auth()
  updateComment(
    @Param('idComment',ParseUUIDPipe) idComment: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser('id') userId: string,
    @Query('course',ParseUUIDPipe) idCourse: string,
  ) {
    return this.commentsService.update(
      idComment,
      updateCommentDto,
      userId,
      idCourse,
    );
  }

  @Delete(':idComment')
  @Auth()
  remove(
    @Param('idComment',ParseUUIDPipe) idComment: string,
    @GetUser('id') userId: string,
    @Query('course',ParseUUIDPipe) idCourse: string,
  ) {
    return this.commentsService.remove(idComment, userId, idCourse);
  }
}
