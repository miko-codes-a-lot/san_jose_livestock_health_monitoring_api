import { PartialType } from '@nestjs/mapped-types';
import { CreateLivestockBreedDto } from './create-livestock-breed.dto';

export class UpdateLivestockBreedDto extends PartialType(CreateLivestockBreedDto) {}
