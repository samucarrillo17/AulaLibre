import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {

  @IsString()
  name!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password!: string;
}
