import { Controller, Post, Body, Patch} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { GetUser } from 'src/auth/decorator/get-user.decorator';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  
  @Patch()
  @Auth()
  async update(@Body() updateUserDto: CreateUserDto, @GetUser('id') idUser: string) {
    return await this.userService.update(idUser, updateUserDto);
  }
}
