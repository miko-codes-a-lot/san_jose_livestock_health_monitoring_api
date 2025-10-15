import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

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

  @IsMobilePhone('en-PH', { strictMode: true })
  @IsNotEmpty()
  mobileNumber: string;

  @ValidateNested()
  @Type(() => AddressUpsertDto)
  address: AddressUpsertDto;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsIn(['farmer', 'technician', 'admin'])
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  rsbsaNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
