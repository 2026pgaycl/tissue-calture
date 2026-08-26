import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { AutoclaveResult, ChemicalCategory } from "@prisma/client";

export class CreateChemicalDto {
  @IsString()
  name!: string;

  @IsEnum(ChemicalCategory)
  category!: ChemicalCategory;

  @IsNumber()
  @IsPositive()
  stockConcentration!: number;

  @IsString()
  unit!: string;

  @IsNumber()
  @Min(0)
  reorderThreshold!: number;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStockQty?: number;
}

export class AdjustStockDto {
  /** Positive = receipt, negative = correction/write-off. */
  @IsNumber()
  quantity!: number;
}

class RecipeComponentInput {
  @IsUUID()
  chemicalId!: string;

  @IsNumber()
  @IsPositive()
  concentration!: number;

  @IsString()
  unit!: string;
}

export class CreateRecipeDto {
  @IsString()
  name!: string;

  @IsString()
  basalMediaType!: string;

  @IsNumber()
  targetPh!: number;

  @IsOptional()
  @IsUUID()
  gellingAgentId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeComponentInput)
  components!: RecipeComponentInput[];
}

export class CalculateRecipeDto {
  @IsNumber()
  @IsPositive()
  targetVolumeL!: number;
}

export class CreateMediaBatchDto {
  @IsUUID()
  recipeId!: string;

  @IsNumber()
  @IsPositive()
  targetVolumeL!: number;

  @IsDateString()
  expirationDate!: string;
}

export class AutoclaveLogDto {
  @IsDateString()
  cycleDate!: string;

  @IsNumber()
  temperatureC!: number;

  @IsNumber()
  pressureKpa!: number;

  @IsNumber()
  @IsPositive()
  durationMin!: number;

  @IsEnum(AutoclaveResult)
  result!: AutoclaveResult;
}
