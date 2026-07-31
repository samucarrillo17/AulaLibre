import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { PaginationDto } from './dto/pagination.dto';

@Controller('comment')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':idCourse')
  @Auth()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser('id') userId: string,
    @Param('idCourse') idCourse: string,
  ) {
    return this.commentsService.create(createCommentDto, userId, idCourse);
  }

  @Get(':id')
  @Auth()
  findAllCommentsToCourse(
    @Param('id') idCourse: string,
    @Query() paginationDto: PaginationDto)
  {
    return this.commentsService.findAllComments(idCourse, paginationDto);
  }

  @Patch(':idComment')
  @Auth()
  updateComment(
    @Param('idComment') idComment: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser('id') userId: string,
    @Query('course') idCourse: string,
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
  remove(@Param('idComment') idComment: string, @GetUser('id') userId: string, @Query('course') idCourse: string) {
    return this.commentsService.remove(idComment, userId, idCourse);
  }
}
