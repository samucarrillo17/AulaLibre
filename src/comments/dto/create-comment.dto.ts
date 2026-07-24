import { IsDate, IsString } from "class-validator";

export class CreateCommentDto {

    @IsString()
    id!: string;

    @IsString()
    description!: string;

    @IsDate()
    createdAt!: Date;
}
