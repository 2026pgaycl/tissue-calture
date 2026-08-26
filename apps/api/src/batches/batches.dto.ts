import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { BatchStage, SourceType, VesselStatus, VesselType } from "@prisma/client";

export class CreateBatchDto {
  @IsUUID()
  speciesId!: string;

  @IsEnum(BatchStage)
  stage!: BatchStage;

  @IsOptional()
  @IsUUID()
  parentBatchId?: string;

  @IsOptional()
  @IsEnum(SourceType)
  sourceType?: SourceType;
}

export class CreateVesselDto {
  @IsUUID()
  batchId!: string;

  @IsEnum(VesselType)
  vesselType!: VesselType;

  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsUUID()
  mediaBatchId?: string;
}

export class UpdateVesselStatusDto {
  @IsEnum(VesselStatus)
  status!: VesselStatus;
}
