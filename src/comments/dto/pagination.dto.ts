import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Max, Min } from "class-validator";

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;
}