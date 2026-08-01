import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

import { LoginUserDto } from './dto/login-user.dto';
import { registerUserDto } from './dto/register-user.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 120 } })
  @Post('register')
  create(@Body() registerDto: registerUserDto) {
    return this.authService.register(registerDto);
  }
  @Throttle({ default: { limit: 3, ttl: 60 } })
  @Post('login')
  login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }
}
