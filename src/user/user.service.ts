import { BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { handleDBException } from 'src/utilities/helpers/handleDbException';

@Injectable()
export class UserService {
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
      handleDBException(err);
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
      handleDBException(err);
    }
  }
}
