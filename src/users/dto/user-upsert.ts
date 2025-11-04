import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Gender } from '../entities/user.entity';

export class AddressUpsertDto {
  @IsString()
  @IsNotEmpty()
  barangay: string;

  @IsString()
  @IsNotEmpty()
  municipality: string;

  @IsString()
  @IsNotEmpty()
  province: string;
}

export class UserUpsertDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  emailAddress: string;

  @IsNotEmpty()
  mobileNumber: string;

  @ValidateNested()
  @Type(() => AddressUpsertDto)
  address: AddressUpsertDto;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsIn(['farmer', 'technician', 'admin'])
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsString()
  rsbsaNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
