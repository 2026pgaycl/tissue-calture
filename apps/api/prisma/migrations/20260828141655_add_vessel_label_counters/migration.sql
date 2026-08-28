-- CreateTable
CREATE TABLE "vessel_label_counters" (
    "organization_id" UUID NOT NULL,
    "vessel_type" "VesselType" NOT NULL,
    "next_number" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "vessel_label_counters_pkey" PRIMARY KEY ("organization_id","vessel_type")
);

-- AddForeignKey
ALTER TABLE "vessel_label_counters" ADD CONSTRAINT "vessel_label_counters_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
