import { IsBoolean, IsIn } from 'class-validator';

export class UpdateTestSettingsDto {
  @IsIn(['E', 'I'])
  tieEI!: 'E' | 'I';

  @IsIn(['S', 'N'])
  tieSN!: 'S' | 'N';

  @IsIn(['T', 'F'])
  tieTF!: 'T' | 'F';

  @IsIn(['J', 'P'])
  tieJP!: 'J' | 'P';

  @IsBoolean()
  shareEnabled!: boolean;
}
