import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { VesselType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVesselDto, UpdateVesselStatusDto } from "./batches.dto";
import { generateBarcode } from "../common/utils/barcode.util";

@Injectable()
export class VesselsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string, organizationId: string) {
    const vessel = await this.prisma.vessel.findFirst({ where: { id, organizationId } });
    if (!vessel) throw new NotFoundException("Vessel not found");
    return vessel;
  }

  async findByBarcode(barcode: string, organizationId: string) {
    const vessel = await this.prisma.vessel.findFirst({ where: { barcode, organizationId } });
    if (!vessel) throw new NotFoundException("No vessel matches that barcode");
    return vessel;
  }

  async create(dto: CreateVesselDto, organizationId: string) {
    const batch = await this.prisma.batch.findFirst({ where: { id: dto.batchId, organizationId } });
    if (!batch) throw new BadRequestException("Batch not found");

    const location = await this.prisma.location.findFirst({
      where: { id: dto.locationId, organizationId },
    });
    if (!location) throw new BadRequestException("Location not found");

    if (dto.mediaBatchId) {
      const mediaBatch = await this.prisma.mediaBatch.findFirst({
        where: { id: dto.mediaBatchId, organizationId },
      });
      if (!mediaBatch) throw new BadRequestException("Media batch not found");
    }

    return this.prisma.vessel.create({
      data: {
        organizationId,
        barcode: generateBarcode("VSL"),
        batchId: dto.batchId,
        vesselType: dto.vesselType,
        locationId: dto.locationId,
        mediaBatchId: dto.mediaBatchId,
      },
    });
  }

  /**
   * Mints a fresh, guaranteed-unique barcode for a pre-printed label — no vessel record is
   * created. Numbering is per (organization, vesselType, year) — the counter resets each year —
   * backed by an atomic upsert against VesselLabelCounter so concurrent requests can never hand
   * out the same number.
   */
  async generateLabel(vesselType: VesselType, organizationId: string) {
    const year = new Date().getFullYear();
    const rows = await this.prisma.$queryRaw<{ issued: number }[]>`
      INSERT INTO vessel_label_counters (organization_id, vessel_type, year, next_number)
      VALUES (${organizationId}::uuid, ${vesselType}::"VesselType", ${year}, 2)
      ON CONFLICT (organization_id, vessel_type, year)
      DO UPDATE SET next_number = vessel_label_counters.next_number + 1
      RETURNING next_number - 1 AS issued
    `;
    const sequenceNumber = rows[0].issued;
    const barcode = `VSL-${vesselType}-${year}-${String(sequenceNumber).padStart(8, "0")}`;
    return { barcode, vesselType, year, sequenceNumber };
  }

  async updateStatus(id: string, dto: UpdateVesselStatusDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.vessel.update({ where: { id }, data: { status: dto.status } });
  }

  /** Everything logged against a vessel: subculture participation, contamination, discard, dispatch. */
  async history(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    const [sessionVessels, contaminationEvents, discardLogs, fulfillments] = await Promise.all([
      this.prisma.subcultureSessionVessel.findMany({
        where: { vesselId: id, organizationId },
        include: { session: true },
      }),
      this.prisma.contaminationEvent.findMany({ where: { vesselId: id, organizationId } }),
      this.prisma.discardLog.findMany({ where: { vesselId: id, organizationId } }),
      this.prisma.orderFulfillment.findMany({ where: { vesselId: id, organizationId } }),
    ]);
    return { sessionVessels, contaminationEvents, discardLogs, fulfillments };
  }
}
