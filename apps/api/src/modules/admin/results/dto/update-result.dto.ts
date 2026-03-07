import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class UpdateResultDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  summary?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  strengths?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  cautions?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  shareTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  shareDescription?: string;

  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}
