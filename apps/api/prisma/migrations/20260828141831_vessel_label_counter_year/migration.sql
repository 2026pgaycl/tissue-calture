/*
  Warnings:

  - The primary key for the `vessel_label_counters` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `year` to the `vessel_label_counters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vessel_label_counters" DROP CONSTRAINT "vessel_label_counters_pkey",
ADD COLUMN     "year" INTEGER NOT NULL,
ADD CONSTRAINT "vessel_label_counters_pkey" PRIMARY KEY ("organization_id", "vessel_type", "year");
