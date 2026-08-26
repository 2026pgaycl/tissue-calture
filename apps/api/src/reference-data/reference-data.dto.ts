import { IsEnum, IsOptional, IsString } from "class-validator";
import { LocationType } from "@prisma/client";

export class CreatePlantSpeciesDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  scientificName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateLocationDto {
  @IsString()
  name!: string;

  @IsEnum(LocationType)
  type!: LocationType;
}
