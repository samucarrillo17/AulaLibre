import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

import { LoginUserDto } from './dto/login-user.dto';
import { registerUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() registerDto: registerUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }

}
