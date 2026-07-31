import { IsDate, IsString, Max, Min } from "class-validator";

export class CreateCommentDto {

    @IsString()
    @Min(1)
    @Max(200)
    description!: string;

    

}
