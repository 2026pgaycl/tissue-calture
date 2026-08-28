-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'LAB_MANAGER', 'LAB_TECHNICIAN', 'MEDIA_PREP_STAFF');

-- CreateEnum
CREATE TYPE "BatchStage" AS ENUM ('I_INITIATION', 'II_MULTIPLICATION', 'III_ROOTING', 'IV_ACCLIMATIZATION');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('SEED', 'EXPLANT', 'TISSUE');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "VesselType" AS ENUM ('JAR', 'TRAY', 'TUBE', 'BAG');

-- CreateEnum
CREATE TYPE "VesselStatus" AS ENUM ('ACTIVE', 'CONTAMINATED', 'DISCARDED', 'TRANSFERRED_GREENHOUSE');

-- CreateEnum
CREATE TYPE "SubcultureDirection" AS ENUM ('INPUT', 'OUTPUT');

-- CreateEnum
CREATE TYPE "ChemicalCategory" AS ENUM ('MACRO_SALT', 'MICRO_SALT', 'VITAMIN', 'PGR', 'GELLING_AGENT', 'SUGAR', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaBatchStatus" AS ENUM ('AVAILABLE', 'DEPLETED', 'EXPIRED', 'FAILED_AUTOCLAVE');

-- CreateEnum
CREATE TYPE "AutoclaveResult" AS ENUM ('PASS', 'FAIL');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('DEDUCTION', 'RECEIPT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ContaminationType" AS ENUM ('BACTERIAL', 'FUNGAL', 'VIRAL', 'UNKNOWN', 'MIXED');

-- CreateEnum
CREATE TYPE "ContaminationAction" AS ENUM ('ISOLATED', 'DISCARDED', 'TREATED');

-- CreateEnum
CREATE TYPE "DiscardReason" AS ENUM ('CONTAMINATION', 'MORTALITY', 'QUALITY', 'END_OF_LIFE');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('CLEANROOM', 'GROWTH_ROOM', 'GREENHOUSE', 'STORAGE');

-- CreateEnum
CREATE TYPE "EnvLogSource" AS ENUM ('MANUAL', 'IOT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED');

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_species" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "scientific_name" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plant_species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "parent_batch_id" UUID,
    "species_id" UUID NOT NULL,
    "stage" "BatchStage" NOT NULL,
    "source_type" "SourceType",
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vessels" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "barcode" TEXT NOT NULL,
    "batch_id" UUID NOT NULL,
    "parent_vessel_id" UUID,
    "media_batch_id" UUID,
    "location_id" UUID NOT NULL,
    "vessel_type" "VesselType" NOT NULL,
    "status" "VesselStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vessels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workstations" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "location_id" UUID NOT NULL,
    "hood_type" TEXT,
    "last_certified_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workstations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subculture_sessions" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "workstation_id" UUID NOT NULL,
    "operator_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "split_ratio" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subculture_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subculture_session_vessels" (
    "organization_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "vessel_id" UUID NOT NULL,
    "direction" "SubcultureDirection" NOT NULL,

    CONSTRAINT "subculture_session_vessels_pkey" PRIMARY KEY ("session_id","vessel_id","direction")
);

-- CreateTable
CREATE TABLE "chemicals" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ChemicalCategory" NOT NULL,
    "stock_concentration" DECIMAL(12,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "current_stock_qty" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "reorder_threshold" DECIMAL(12,4) NOT NULL,
    "supplier" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chemicals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_recipes" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "basal_media_type" TEXT NOT NULL,
    "target_ph" DECIMAL(4,2) NOT NULL,
    "gelling_agent_id" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_components" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "recipe_id" UUID NOT NULL,
    "chemical_id" UUID NOT NULL,
    "concentration" DECIMAL(12,4) NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "recipe_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_batches" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "barcode" TEXT NOT NULL,
    "recipe_id" UUID NOT NULL,
    "target_volume_l" DECIMAL(10,3) NOT NULL,
    "final_ph" DECIMAL(4,2),
    "prepared_by" UUID NOT NULL,
    "prepared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiration_date" DATE NOT NULL,
    "status" "MediaBatchStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autoclave_logs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "media_batch_id" UUID NOT NULL,
    "cycle_date" TIMESTAMP(3) NOT NULL,
    "temperature_c" DECIMAL(5,2) NOT NULL,
    "pressure_kpa" DECIMAL(6,2) NOT NULL,
    "duration_min" INTEGER NOT NULL,
    "operator_id" UUID NOT NULL,
    "result" "AutoclaveResult" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "autoclave_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "chemical_id" UUID NOT NULL,
    "transaction_type" "InventoryTransactionType" NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "related_media_batch_id" UUID,
    "operator_id" UUID NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contamination_events" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "vessel_id" UUID NOT NULL,
    "contamination_type" "ContaminationType" NOT NULL,
    "media_batch_id" UUID,
    "workstation_id" UUID,
    "location_id" UUID NOT NULL,
    "detected_by" UUID NOT NULL,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "root_cause_notes" TEXT,
    "action_taken" "ContaminationAction" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contamination_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discard_logs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "vessel_id" UUID NOT NULL,
    "reason" "DiscardReason" NOT NULL,
    "stage_at_discard" "BatchStage" NOT NULL,
    "discarded_by" UUID NOT NULL,
    "discarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discard_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_logs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature_c" DECIMAL(5,2),
    "humidity_pct" DECIMAL(5,2),
    "light_par" DECIMAL(8,2),
    "photoperiod_hours" DECIMAL(4,2),
    "source" "EnvLogSource" NOT NULL DEFAULT 'MANUAL',
    "sensor_id" TEXT,

    CONSTRAINT "environmental_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "requested_ship_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_line_items" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "species_id" UUID NOT NULL,
    "quantity_requested" INTEGER NOT NULL,
    "quantity_fulfilled" INTEGER NOT NULL DEFAULT 0,
    "unit_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_fulfillments" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "order_line_item_id" UUID NOT NULL,
    "vessel_id" UUID NOT NULL,
    "shipped_at" TIMESTAMP(3),
    "tracking_reference" TEXT,

    CONSTRAINT "order_fulfillments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organization_id_idx" ON "users"("organization_id");

-- CreateIndex
CREATE INDEX "plant_species_organization_id_idx" ON "plant_species"("organization_id");

-- CreateIndex
CREATE INDEX "batches_organization_id_idx" ON "batches"("organization_id");

-- CreateIndex
CREATE INDEX "batches_parent_batch_id_idx" ON "batches"("parent_batch_id");

-- CreateIndex
CREATE INDEX "batches_species_id_idx" ON "batches"("species_id");

-- CreateIndex
CREATE INDEX "batches_stage_status_idx" ON "batches"("stage", "status");

-- CreateIndex
CREATE UNIQUE INDEX "vessels_barcode_key" ON "vessels"("barcode");

-- CreateIndex
CREATE INDEX "vessels_organization_id_idx" ON "vessels"("organization_id");

-- CreateIndex
CREATE INDEX "vessels_batch_id_idx" ON "vessels"("batch_id");

-- CreateIndex
CREATE INDEX "vessels_parent_vessel_id_idx" ON "vessels"("parent_vessel_id");

-- CreateIndex
CREATE INDEX "vessels_media_batch_id_idx" ON "vessels"("media_batch_id");

-- CreateIndex
CREATE INDEX "vessels_location_id_idx" ON "vessels"("location_id");

-- CreateIndex
CREATE INDEX "vessels_status_idx" ON "vessels"("status");

-- CreateIndex
CREATE INDEX "workstations_organization_id_idx" ON "workstations"("organization_id");

-- CreateIndex
CREATE INDEX "workstations_location_id_idx" ON "workstations"("location_id");

-- CreateIndex
CREATE INDEX "subculture_sessions_organization_id_idx" ON "subculture_sessions"("organization_id");

-- CreateIndex
CREATE INDEX "subculture_sessions_workstation_id_idx" ON "subculture_sessions"("workstation_id");

-- CreateIndex
CREATE INDEX "subculture_sessions_operator_id_idx" ON "subculture_sessions"("operator_id");

-- CreateIndex
CREATE INDEX "subculture_session_vessels_organization_id_idx" ON "subculture_session_vessels"("organization_id");

-- CreateIndex
CREATE INDEX "subculture_session_vessels_vessel_id_idx" ON "subculture_session_vessels"("vessel_id");

-- CreateIndex
CREATE INDEX "chemicals_organization_id_idx" ON "chemicals"("organization_id");

-- CreateIndex
CREATE INDEX "chemicals_category_idx" ON "chemicals"("category");

-- CreateIndex
CREATE INDEX "media_recipes_organization_id_idx" ON "media_recipes"("organization_id");

-- CreateIndex
CREATE INDEX "media_recipes_created_by_idx" ON "media_recipes"("created_by");

-- CreateIndex
CREATE INDEX "recipe_components_organization_id_idx" ON "recipe_components"("organization_id");

-- CreateIndex
CREATE INDEX "recipe_components_recipe_id_idx" ON "recipe_components"("recipe_id");

-- CreateIndex
CREATE INDEX "recipe_components_chemical_id_idx" ON "recipe_components"("chemical_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_batches_barcode_key" ON "media_batches"("barcode");

-- CreateIndex
CREATE INDEX "media_batches_organization_id_idx" ON "media_batches"("organization_id");

-- CreateIndex
CREATE INDEX "media_batches_recipe_id_idx" ON "media_batches"("recipe_id");

-- CreateIndex
CREATE INDEX "media_batches_status_idx" ON "media_batches"("status");

-- CreateIndex
CREATE INDEX "autoclave_logs_organization_id_idx" ON "autoclave_logs"("organization_id");

-- CreateIndex
CREATE INDEX "autoclave_logs_media_batch_id_idx" ON "autoclave_logs"("media_batch_id");

-- CreateIndex
CREATE INDEX "inventory_transactions_organization_id_idx" ON "inventory_transactions"("organization_id");

-- CreateIndex
CREATE INDEX "inventory_transactions_chemical_id_idx" ON "inventory_transactions"("chemical_id");

-- CreateIndex
CREATE INDEX "inventory_transactions_related_media_batch_id_idx" ON "inventory_transactions"("related_media_batch_id");

-- CreateIndex
CREATE INDEX "contamination_events_organization_id_idx" ON "contamination_events"("organization_id");

-- CreateIndex
CREATE INDEX "contamination_events_vessel_id_idx" ON "contamination_events"("vessel_id");

-- CreateIndex
CREATE INDEX "contamination_events_media_batch_id_idx" ON "contamination_events"("media_batch_id");

-- CreateIndex
CREATE INDEX "contamination_events_workstation_id_idx" ON "contamination_events"("workstation_id");

-- CreateIndex
CREATE INDEX "contamination_events_location_id_idx" ON "contamination_events"("location_id");

-- CreateIndex
CREATE INDEX "contamination_events_contamination_type_idx" ON "contamination_events"("contamination_type");

-- CreateIndex
CREATE INDEX "discard_logs_organization_id_idx" ON "discard_logs"("organization_id");

-- CreateIndex
CREATE INDEX "discard_logs_vessel_id_idx" ON "discard_logs"("vessel_id");

-- CreateIndex
CREATE INDEX "locations_organization_id_idx" ON "locations"("organization_id");

-- CreateIndex
CREATE INDEX "environmental_logs_organization_id_idx" ON "environmental_logs"("organization_id");

-- CreateIndex
CREATE INDEX "environmental_logs_location_id_recorded_at_idx" ON "environmental_logs"("location_id", "recorded_at");

-- CreateIndex
CREATE INDEX "customers_organization_id_idx" ON "customers"("organization_id");

-- CreateIndex
CREATE INDEX "sales_orders_organization_id_idx" ON "sales_orders"("organization_id");

-- CreateIndex
CREATE INDEX "sales_orders_customer_id_idx" ON "sales_orders"("customer_id");

-- CreateIndex
CREATE INDEX "sales_orders_status_idx" ON "sales_orders"("status");

-- CreateIndex
CREATE INDEX "order_line_items_organization_id_idx" ON "order_line_items"("organization_id");

-- CreateIndex
CREATE INDEX "order_line_items_order_id_idx" ON "order_line_items"("order_id");

-- CreateIndex
CREATE INDEX "order_line_items_species_id_idx" ON "order_line_items"("species_id");

-- CreateIndex
CREATE INDEX "order_fulfillments_organization_id_idx" ON "order_fulfillments"("organization_id");

-- CreateIndex
CREATE INDEX "order_fulfillments_order_line_item_id_idx" ON "order_fulfillments"("order_line_item_id");

-- CreateIndex
CREATE INDEX "order_fulfillments_vessel_id_idx" ON "order_fulfillments"("vessel_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_species" ADD CONSTRAINT "plant_species_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_parent_batch_id_fkey" FOREIGN KEY ("parent_batch_id") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "plant_species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_parent_vessel_id_fkey" FOREIGN KEY ("parent_vessel_id") REFERENCES "vessels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_media_batch_id_fkey" FOREIGN KEY ("media_batch_id") REFERENCES "media_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vessels" ADD CONSTRAINT "vessels_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workstations" ADD CONSTRAINT "workstations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workstations" ADD CONSTRAINT "workstations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subculture_sessions" ADD CONSTRAINT "subculture_sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subculture_sessions" ADD CONSTRAINT "subculture_sessions_workstation_id_fkey" FOREIGN KEY ("workstation_id") REFERENCES "workstations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subculture_sessions" ADD CONSTRAINT "subculture_sessions_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subculture_session_vessels" ADD CONSTRAINT "subculture_session_vessels_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subculture_session_vessels" ADD CONSTRAINT "subculture_session_vessels_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "subculture_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subculture_session_vessels" ADD CONSTRAINT "subculture_session_vessels_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "vessels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemicals" ADD CONSTRAINT "chemicals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_recipes" ADD CONSTRAINT "media_recipes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_recipes" ADD CONSTRAINT "media_recipes_gelling_agent_id_fkey" FOREIGN KEY ("gelling_agent_id") REFERENCES "chemicals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_recipes" ADD CONSTRAINT "media_recipes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_components" ADD CONSTRAINT "recipe_components_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_components" ADD CONSTRAINT "recipe_components_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "media_recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_components" ADD CONSTRAINT "recipe_components_chemical_id_fkey" FOREIGN KEY ("chemical_id") REFERENCES "chemicals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_batches" ADD CONSTRAINT "media_batches_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_batches" ADD CONSTRAINT "media_batches_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "media_recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_batches" ADD CONSTRAINT "media_batches_prepared_by_fkey" FOREIGN KEY ("prepared_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autoclave_logs" ADD CONSTRAINT "autoclave_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autoclave_logs" ADD CONSTRAINT "autoclave_logs_media_batch_id_fkey" FOREIGN KEY ("media_batch_id") REFERENCES "media_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autoclave_logs" ADD CONSTRAINT "autoclave_logs_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_chemical_id_fkey" FOREIGN KEY ("chemical_id") REFERENCES "chemicals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_related_media_batch_id_fkey" FOREIGN KEY ("related_media_batch_id") REFERENCES "media_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contamination_events" ADD CONSTRAINT "contamination_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contamination_events" ADD CONSTRAINT "contamination_events_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "vessels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contamination_events" ADD CONSTRAINT "contamination_events_media_batch_id_fkey" FOREIGN KEY ("media_batch_id") REFERENCES "media_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contamination_events" ADD CONSTRAINT "contamination_events_workstation_id_fkey" FOREIGN KEY ("workstation_id") REFERENCES "workstations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contamination_events" ADD CONSTRAINT "contamination_events_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contamination_events" ADD CONSTRAINT "contamination_events_detected_by_fkey" FOREIGN KEY ("detected_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discard_logs" ADD CONSTRAINT "discard_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discard_logs" ADD CONSTRAINT "discard_logs_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "vessels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discard_logs" ADD CONSTRAINT "discard_logs_discarded_by_fkey" FOREIGN KEY ("discarded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_logs" ADD CONSTRAINT "environmental_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_logs" ADD CONSTRAINT "environmental_logs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "plant_species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_fulfillments" ADD CONSTRAINT "order_fulfillments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_fulfillments" ADD CONSTRAINT "order_fulfillments_order_line_item_id_fkey" FOREIGN KEY ("order_line_item_id") REFERENCES "order_line_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_fulfillments" ADD CONSTRAINT "order_fulfillments_vessel_id_fkey" FOREIGN KEY ("vessel_id") REFERENCES "vessels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
