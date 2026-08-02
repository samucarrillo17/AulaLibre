import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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

  async update(id: string, updateUsuarioDto: UpdateUserDto) {
    try {
  
      const user = await this.userRepository.preload({
        id,
        ...updateUsuarioDto,
      });
      
      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      const usuarioBDUpdated = await this.userRepository.save(user);

      return usuarioBDUpdated;
      
    } catch (err) {
      this.handleDBException(err);
    }
  }

  private handleDBException(err: any):never {
    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }
    console.log(err)
    throw new InternalServerErrorException(
      'Error inesperado,revisar logs'
    );
  }
}
