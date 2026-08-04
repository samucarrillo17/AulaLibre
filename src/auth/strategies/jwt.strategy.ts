import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtPayload } from '../interfaces/jwt.interface';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { handleDBException } from 'src/utilities/helpers/handleDbException';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private usuarioRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET')!,
    });
  }

  async validate(payload: any | JwtPayload) {
    
      const { id } = payload;
      const user = await this.usuarioRepository.findOne({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Token no valido');
      }

      //  if(user?.isActive === false){
      //    throw new UnauthorizedException('Usuario no activo');
      //  }

      //  if (!user || tokenVersion !== user?.tokenVersion) {
      //    throw new UnauthorizedException('Token not valid');
      //  }
      
      return user;
    
  }
}
