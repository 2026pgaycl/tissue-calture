import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { BatchStage, ContaminationAction, ContaminationType, DiscardReason } from "@prisma/client";

export class CreateContaminationEventDto {
  @IsUUID()
  vesselId!: string;

  @IsEnum(ContaminationType)
  contaminationType!: ContaminationType;

  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsUUID()
  mediaBatchId?: string;

  @IsOptional()
  @IsUUID()
  workstationId?: string;

  @IsEnum(ContaminationAction)
  actionTaken!: ContaminationAction;

  @IsOptional()
  @IsString()
  rootCauseNotes?: string;
}

export class CreateDiscardLogDto {
  @IsUUID()
  vesselId!: string;

  @IsEnum(DiscardReason)
  reason!: DiscardReason;

  @IsEnum(BatchStage)
  stageAtDiscard!: BatchStage;
}
