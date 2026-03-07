import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, Max, Min, ValidateNested } from 'class-validator';

class SubmitAnswerItemDto {
  @IsInt()
  @Min(1)
  questionId!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  answer!: number;
}

export class SubmitAnswersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerItemDto)
  answers!: SubmitAnswerItemDto[];
}
