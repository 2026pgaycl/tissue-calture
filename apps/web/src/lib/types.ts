// Mirrors the enums/models in apps/api/prisma/schema.prisma. Keep in sync.

export type Role = "ADMIN" | "LAB_MANAGER" | "LAB_TECHNICIAN" | "MEDIA_PREP_STAFF";
export type BatchStage = "I_INITIATION" | "II_MULTIPLICATION" | "III_ROOTING" | "IV_ACCLIMATIZATION";
export type SourceType = "SEED" | "EXPLANT" | "TISSUE";
export type BatchStatus = "ACTIVE" | "COMPLETED" | "DISCARDED";
export type VesselType = "JAR" | "TRAY" | "TUBE" | "BAG";
export type VesselStatus = "ACTIVE" | "CONTAMINATED" | "DISCARDED" | "TRANSFERRED_GREENHOUSE";
export type ChemicalCategory =
  | "MACRO_SALT"
  | "MICRO_SALT"
  | "VITAMIN"
  | "PGR"
  | "GELLING_AGENT"
  | "SUGAR"
  | "OTHER";
export type MediaBatchStatus = "AVAILABLE" | "DEPLETED" | "EXPIRED" | "FAILED_AUTOCLAVE";
export type AutoclaveResult = "PASS" | "FAIL";
export type ContaminationType = "BACTERIAL" | "FUNGAL" | "VIRAL" | "UNKNOWN" | "MIXED";
export type ContaminationAction = "ISOLATED" | "DISCARDED" | "TREATED";
export type DiscardReason = "CONTAMINATION" | "MORTALITY" | "QUALITY" | "END_OF_LIFE";
export type LocationType = "CLEANROOM" | "GROWTH_ROOM" | "GREENHOUSE" | "STORAGE";

export interface PaginatedResult<T> {
  data: T[];
  meta: { total: number; page: number; pageSize: number };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface PlantSpecies {
  id: string;
  name: string;
  scientificName: string | null;
  notes: string | null;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
}

export interface Batch {
  id: string;
  parentBatchId: string | null;
  speciesId: string;
  stage: BatchStage;
  sourceType: SourceType | null;
  status: BatchStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vessel {
  id: string;
  barcode: string;
  batchId: string;
  parentVesselId: string | null;
  mediaBatchId: string | null;
  locationId: string;
  vesselType: VesselType;
  status: VesselStatus;
  createdAt: string;
}

export interface VesselHistory {
  sessionVessels: Array<{ sessionId: string; vesselId: string; direction: "INPUT" | "OUTPUT" }>;
  contaminationEvents: ContaminationEvent[];
  discardLogs: DiscardLog[];
  fulfillments: Array<{ id: string; shippedAt: string | null; trackingReference: string | null }>;
}

export interface Chemical {
  id: string;
  name: string;
  category: ChemicalCategory;
  stockConcentration: number;
  unit: string;
  currentStockQty: number;
  reorderThreshold: number;
  supplier: string | null;
}

export interface RecipeComponent {
  id: string;
  recipeId: string;
  chemicalId: string;
  concentration: number;
  unit: string;
  chemical: Chemical;
}

export interface MediaRecipe {
  id: string;
  name: string;
  basalMediaType: string;
  targetPh: number;
  gellingAgentId: string | null;
  createdById: string;
  components: RecipeComponent[];
}

export interface MediaBatch {
  id: string;
  barcode: string;
  recipeId: string;
  targetVolumeL: number;
  finalPh: number | null;
  preparedById: string;
  preparedAt: string;
  expirationDate: string;
  status: MediaBatchStatus;
}

export interface Workstation {
  id: string;
  name: string;
  locationId: string;
  hoodType: string | null;
}

export interface SubcultureSession {
  id: string;
  workstationId: string;
  operatorId: string;
  startedAt: string;
  endedAt: string | null;
  splitRatio: string | null;
  notes: string | null;
}

export interface ContaminationEvent {
  id: string;
  vesselId: string;
  contaminationType: ContaminationType;
  mediaBatchId: string | null;
  workstationId: string | null;
  locationId: string;
  detectedById: string;
  detectedAt: string;
  rootCauseNotes: string | null;
  actionTaken: ContaminationAction;
}

export interface DiscardLog {
  id: string;
  vesselId: string;
  reason: DiscardReason;
  stageAtDiscard: BatchStage;
  discardedById: string;
  discardedAt: string;
}
