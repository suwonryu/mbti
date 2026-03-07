import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsString, Max, Min, ValidateNested } from 'class-validator';

export class UpdateAnswerScaleItemDto {
  @IsInt()
  @Min(1)
  @Max(5)
  value!: number;

  @IsString()
  label!: string;
}

export class UpdateAnswerScaleDto {
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerScaleItemDto)
  scales!: UpdateAnswerScaleItemDto[];
}
