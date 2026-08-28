import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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
