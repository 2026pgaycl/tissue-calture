import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateVesselDto, UpdateVesselStatusDto } from "./batches.dto";
import { generateBarcode } from "../common/utils/barcode.util";

@Injectable()
export class VesselsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const vessel = await this.prisma.vessel.findUnique({ where: { id } });
    if (!vessel) throw new NotFoundException("Vessel not found");
    return vessel;
  }

  async findByBarcode(barcode: string) {
    const vessel = await this.prisma.vessel.findUnique({ where: { barcode } });
    if (!vessel) throw new NotFoundException("No vessel matches that barcode");
    return vessel;
  }

  create(dto: CreateVesselDto) {
    return this.prisma.vessel.create({
      data: {
        barcode: generateBarcode("VSL"),
        batchId: dto.batchId,
        vesselType: dto.vesselType,
        locationId: dto.locationId,
        mediaBatchId: dto.mediaBatchId,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateVesselStatusDto) {
    await this.findOne(id);
    return this.prisma.vessel.update({ where: { id }, data: { status: dto.status } });
  }

  /** Everything logged against a vessel: subculture participation, contamination, discard, dispatch. */
  async history(id: string) {
    await this.findOne(id);
    const [sessionVessels, contaminationEvents, discardLogs, fulfillments] = await Promise.all([
      this.prisma.subcultureSessionVessel.findMany({
        where: { vesselId: id },
        include: { session: true },
      }),
      this.prisma.contaminationEvent.findMany({ where: { vesselId: id } }),
      this.prisma.discardLog.findMany({ where: { vesselId: id } }),
      this.prisma.orderFulfillment.findMany({ where: { vesselId: id } }),
    ]);
    return { sessionVessels, contaminationEvents, discardLogs, fulfillments };
  }
}
