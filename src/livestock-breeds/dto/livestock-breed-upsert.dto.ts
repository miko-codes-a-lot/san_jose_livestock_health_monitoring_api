import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class LivestockBreedUpsertDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsMongoId()
  @IsNotEmpty()
  readonly classification: string;
}
