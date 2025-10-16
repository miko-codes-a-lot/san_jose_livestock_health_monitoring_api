import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { Gender } from 'src/users/entities/user.entity'; // Adjust path if necessary

export class LivestockUpsertDto {
  @IsString()
  @IsNotEmpty()
  readonly tagNumber: string;

  @IsString()
  @IsNotEmpty()
  readonly species: string;

  @IsString()
  @IsNotEmpty()
  readonly breed: string;

  @IsNumber()
  @IsPositive()
  readonly age: number;

  @IsEnum(Gender)
  @IsNotEmpty()
  readonly sex: Gender;

  @IsDateString()
  @IsNotEmpty()
  readonly dateOfPurchase: string;

  @IsBoolean()
  readonly isInsured: boolean;

  @IsBoolean()
  readonly isDeceased: boolean;

  @IsMongoId()
  @IsNotEmpty()
  readonly farmer: string;

  @IsMongoId()
  @IsNotEmpty()
  readonly livestockGroup: string;
}
