import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class LivestockGroupUpsertDto {
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @IsMongoId()
  farmer: string;
}
