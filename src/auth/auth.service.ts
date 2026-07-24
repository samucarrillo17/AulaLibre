import { BadRequestException, Injectable } from '@nestjs/common';
import { registerUserDto } from './dto/register-user.dto';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from './interfaces/jwt.interface';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UserService,
    private readonly jwtService: JwtService,
  ) {}


  async register(registerDto: registerUserDto) {
    const nuevoUsuario = await this.usuarioService.create(registerDto);
    const { id, email,role,createdAt,isActive, ...rest } = nuevoUsuario;
    
    const token = this.getJwtToken({ id, email, role, isActive });

    return {
      ...rest,
      token,
    };
  }

  async login(loginDto: LoginUserDto) {
    const { email, password } = loginDto;
    const usuario =  await this.usuarioService.findByEmail(email);

    if (!usuario || !bcrypt.compareSync(password, usuario.password)) {
      throw new BadRequestException('Usuario o contraseña incorrectos');
    }
    
    const { password: _, ...rest } = usuario;

    const token = this.getJwtToken(
      {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        isActive: usuario.isActive,
      }
    );

    return {
      ...rest,
      token
    }
    
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
