import { Type } from "class-transformer";
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { VesselType } from "@prisma/client";

export class CreateWorkstationDto {
  @IsString()
  name!: string;

  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsString()
  hoodType?: string;
}

export class StartSessionDto {
  @IsUUID()
  workstationId!: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  inputVesselIds!: string[];
}

class OutputVesselInput {
  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsEnum(VesselType)
  vesselType?: VesselType;
}

export class CompleteSessionDto {
  @IsString()
  splitRatio!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutputVesselInput)
  outputs!: OutputVesselInput[];

  @IsOptional()
  @IsUUID()
  mediaBatchId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
