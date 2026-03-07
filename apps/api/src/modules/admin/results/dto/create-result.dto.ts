import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class CreateResultDto {
  @IsIn([
    'ISTJ',
    'ISFJ',
    'INFJ',
    'INTJ',
    'ISTP',
    'ISFP',
    'INFP',
    'INTP',
    'ESTP',
    'ESFP',
    'ENFP',
    'ENTP',
    'ESTJ',
    'ESFJ',
    'ENFJ',
    'ENTJ',
  ])
  mbtiCode!: string;

  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(300)
  summary!: string;

  @IsString()
  description!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Type(() => String)
  strengths!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Type(() => String)
  cautions!: string[];

  @IsString()
  @MaxLength(120)
  shareTitle!: string;

  @IsString()
  @MaxLength(300)
  shareDescription!: string;

  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}
