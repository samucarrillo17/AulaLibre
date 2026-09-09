import { IsDate, IsNumber, IsPositive, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateCommentDto {
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    professorName!: string;

    @IsNumber()
    @IsPositive()
    @Min(1)
    @Max(5)
    rating!: number;


    @IsString()
    @MinLength(1)
    @MaxLength(200)
    reason!: string;

    

}
