import { IsString, IsNotEmpty } from 'class-validator';

export class LivestockClassificationUpsertDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly icon: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;
}
