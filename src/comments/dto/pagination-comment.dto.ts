import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Max, Min } from "class-validator";

export class PaginationCommentDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(50)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;
}