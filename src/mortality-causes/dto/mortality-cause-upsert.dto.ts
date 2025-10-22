import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for the nested MortalityCauseItem
 */
export class MortalityCauseItemDto {
  @IsString()
  @IsNotEmpty()
  readonly label: string;

  @IsString()
  @IsNotEmpty()
  readonly value: string;
}

/**
 * DTO for creating or updating a MortalityCause
 */
export class MortalityCauseUpsertDto {
  @IsString()
  @IsNotEmpty()
  readonly label: string;

  @IsString()
  @IsNotEmpty()
  readonly value: string;

  @IsArray()
  @ValidateNested({ each: true }) // Validates each item in the array
  @Type(() => MortalityCauseItemDto) // Transforms plain object to class instance
  @IsOptional()
  readonly items: MortalityCauseItemDto[];
}
