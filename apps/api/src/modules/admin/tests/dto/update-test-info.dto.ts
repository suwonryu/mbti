import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class UpdateTestInfoDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsString()
  introText?: string;

  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  thumbnailUrl?: string | null;
}
