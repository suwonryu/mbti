import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  questionText?: string;

  @IsOptional()
  @IsIn(['EI', 'SN', 'TF', 'JP'])
  dimension?: 'EI' | 'SN' | 'TF' | 'JP';

  @IsOptional()
  @IsIn(['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'])
  positiveTrait?: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
