import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  //TODO : realizar creacion de comentarios y enlazarlos a un course, tener en cuenta el hash del autor, que contiene user.id + course.id + SECRET_HASH
  create(createCommentDto: CreateCommentDto) {
    return 'This action adds a new comment';
  }
  //TODO : realizar metodo de encontrar todos los comentarios, SOLO de los comentarios de un curso en especifico
  findAllComments() {
    return `This action returns all comments`;
  }

  //TODO : realizar metodo de actualizar un comentario, teniendo en cuenta el hash del autor, esto es para evitar que se puedan actualizar comentarios de otros usuarios y seguir manteniendo el anonimato, comparar hash del autor que esta en BD con el hash que armamos aca
  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }
  //TODO : Misma situacion que en el metodo de actualizar, tener en cuenta el hash del autor, esto es para evitar que se puedan actualizar comentarios de otros usuarios y seguir manteniendo el anonimato, comparar hash del autor que esta en BD con el hash que armamos aca
  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
