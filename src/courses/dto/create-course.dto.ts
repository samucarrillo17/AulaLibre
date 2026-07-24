import { IsArray, IsOptional, IsString, MinLength } from "class-validator";

export class CreateCourseDto {

  @IsString()
  @MinLength(2)
  name!: string;


}
