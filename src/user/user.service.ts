import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUsuarioDto: CreateUserDto) {
    try {
      const hashpassword = await bcrypt.hash(createUsuarioDto.password, 10);
      const usuarioInstancia = this.userRepository.create({
        ...createUsuarioDto,
        password: hashpassword,
      });
      const usuarioBD = await this.userRepository.save(usuarioInstancia);
      const { password, ...rest } = usuarioBD;

      return rest;
    } catch (err) {
      this.handleDBException(err);
      throw err;
    }
  }

  async findByEmail(email: string) {
    const userExists = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .select([
        'user.id',
        'user.email',
        'user.name',
        'user.lastName',
        'user.password',
      ])
      .getOne();

    return userExists;
  }

  private handleDBException(err: any) {
    if (err.code === '23505') {
      throw new Error('Usuario ya existe');
    }
    this.logger.error(err.message);
    throw new InternalServerErrorException(
      'Error inesperado, revisar logs'
    );
  }
}
