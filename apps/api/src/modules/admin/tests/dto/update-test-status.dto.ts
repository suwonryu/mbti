import { IsIn } from 'class-validator';

export class UpdateTestStatusDto {
  @IsIn(['draft', 'published'])
  status!: 'draft' | 'published';
}
